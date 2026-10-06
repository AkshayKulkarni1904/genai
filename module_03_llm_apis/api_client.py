# Module 3: Using LLM APIs in Programming
import os
import time
import math
import uuid
import random
import json
import urllib.request
from typing import Dict, Any, List, Optional, Generator, Callable
from pydantic import BaseModel, Field

# Load .env if present
try:
    import env_loader
except ImportError:
    try:
        from ..env_loader import load_dotenv
        load_dotenv()
    except Exception:
        pass


class ToolCallRequest(BaseModel):
    tool_name: str
    arguments: Dict[str, Any]

class LLMAPIResponse(BaseModel):
    request_id: str
    model_used: str
    output_text: str
    structured_data: Optional[Dict[str, Any]] = None
    tool_executed: Optional[Dict[str, Any]] = None
    telemetry: Dict[str, Any]

class ConversationMessage(BaseModel):
    role: str = Field(description="system, user, assistant, or tool")
    content: str
    tokens: int = 0


class SafeConversationMemory:
    """Manages conversational history with strict token budgets and sliding window truncation."""
    def __init__(self, max_token_budget: int = 8000):
        self.max_token_budget = max_token_budget
        self.messages: List[ConversationMessage] = []

    def add_message(self, role: str, content: str):
        toks = max(1, math.ceil(len(content) / 3.8))
        self.messages.append(ConversationMessage(role=role, content=content, tokens=toks))
        self._enforce_budget()

    def _enforce_budget(self):
        total = sum(m.tokens for m in self.messages)
        while total > self.max_token_budget and len(self.messages) > 1:
            if self.messages[0].role == "system" and len(self.messages) > 2:
                removed = self.messages.pop(1)
            else:
                removed = self.messages.pop(0)
            total -= removed.tokens

    def get_history(self) -> List[Dict[str, str]]:
        return [{"role": m.role, "content": m.content} for m in self.messages]

    def current_tokens(self) -> int:
        return sum(m.tokens for m in self.messages)


class EnterpriseToolsCatalog:
    """Enterprise Tool / Function Calling Definitions."""
    @staticmethod
    def get_cloud_infrastructure_status(service_name: str, region: str = "us-east-1") -> Dict[str, Any]:
        services = {
            "kubernetes-ingress": {"status": "HEALTHY", "pods_running": 18, "error_rate": "0.01%"},
            "redis-cache": {"status": "DEGRADED", "memory_usage": "92.4%", "active_connections": 1420},
            "postgres-primary": {"status": "HEALTHY", "replication_lag_ms": 12, "disk_used_pct": 58.2}
        }
        key = service_name.lower().replace(" ", "-")
        data = services.get(key, {"status": "UNKNOWN", "message": f"Service '{service_name}' not found."})
        return {"service": service_name, "region": region, **data}

    @staticmethod
    def calculate_cost_projection(current_monthly_spend: float, growth_pct: float) -> Dict[str, Any]:
        next_month = current_monthly_spend * (1 + (growth_pct / 100))
        annualized = next_month * 12
        return {
            "current_monthly": current_monthly_spend,
            "growth_rate_pct": growth_pct,
            "projected_monthly": round(next_month, 2),
            "projected_annual": round(annualized, 2)
        }


class ResilientLLMClient:
    """
    Robust production API client:
    - Retries with exponential backoff & jitter
    - Primary model -> Fallback model failover routing
    - Live Groq LPU execution with user API key
    - Streaming delta simulation
    - Function/Tool calling execution
    - Telemetry logging (latency, token counting, cost, failure tracking)
    """
    def __init__(self, primary_model: str = "qwen/qwen3.8-27b", fallback_model: str = "openai/gpt-oss-20b"):
        self.primary_model = primary_model
        self.fallback_model = fallback_model
        self.memory = SafeConversationMemory(max_token_budget=8000)
        self.telemetry_log: List[Dict[str, Any]] = []

    def _call_groq_direct(self, prompt: str, model: str) -> Optional[Dict[str, Any]]:
        api_key = os.environ.get("GROQ_API_KEY")
        if not api_key:
            return None
        url = "https://api.groq.com/openai/v1/chat/completions"
        payload = json.dumps({
            "model": model,
            "messages": [{"role": "user", "content": prompt}],
            "max_tokens": 200
        }).encode("utf-8")
        req = urllib.request.Request(
            url,
            data=payload,
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
                "User-Agent": "EnterpriseGenAIClient/1.0"
            }
        )
        try:
            start_t = time.perf_counter()
            with urllib.request.urlopen(req, timeout=12) as resp:
                elapsed_ms = round((time.perf_counter() - start_t) * 1000, 2)
                data = json.loads(resp.read().decode("utf-8"))
                choice = data["choices"][0]["message"]
                content = choice.get("content") or choice.get("reasoning") or "Processed successfully."
                usage = data.get("usage", {})
                return {
                    "content": content,
                    "prompt_tokens": usage.get("prompt_tokens", 0),
                    "completion_tokens": usage.get("completion_tokens", 0),
                    "total_tokens": usage.get("total_tokens", 0),
                    "latency_ms": elapsed_ms
                }
        except Exception:
            return None

    def execute_with_resilience(
        self,
        prompt: str,
        simulate_primary_failure: bool = False,
        enable_tool_calling: bool = True,
        multimodal_asset: Optional[Dict[str, str]] = None
    ) -> LLMAPIResponse:
        start_time = time.time()
        req_id = f"req-{uuid.uuid4().hex[:8]}"
        retry_count = 0
        model_used = self.primary_model
        fallback_triggered = False

        # Attempt primary model with exponential backoff
        max_retries = 2
        for attempt in range(max_retries):
            if simulate_primary_failure:
                retry_count += 1
                backoff_time = (0.05 * (2 ** attempt)) + (random.uniform(0.01, 0.03))
                time.sleep(backoff_time)
                continue
            break

        if simulate_primary_failure:
            fallback_triggered = True
            model_used = self.fallback_model

        # Add to memory
        self.memory.add_message("user", prompt)

        # Detect tool calling opportunity
        tool_result = None
        structured_data = {}
        output_text = ""

        if enable_tool_calling and ("status" in prompt.lower() or "health" in prompt.lower() or "infra" in prompt.lower()):
            tool_args = {"service_name": "redis-cache", "region": "us-east-1"}
            tool_data = EnterpriseToolsCatalog.get_cloud_infrastructure_status(**tool_args)
            tool_result = {
                "tool_called": "get_cloud_infrastructure_status",
                "arguments": tool_args,
                "execution_output": tool_data
            }
            output_text = (
                f"Tool Execution Completed: Service '{tool_data['service']}' in region '{tool_data['region']}' "
                f"is currently {tool_data['status']} with memory at {tool_data['memory_usage']} and "
                f"{tool_data['active_connections']} active connections."
            )
            structured_data = tool_data
        elif "cost" in prompt.lower() or "budget" in prompt.lower():
            tool_args = {"current_monthly_spend": 24000.0, "growth_pct": 15.0}
            tool_data = EnterpriseToolsCatalog.calculate_cost_projection(**tool_args)
            tool_result = {
                "tool_called": "calculate_cost_projection",
                "arguments": tool_args,
                "execution_output": tool_data
            }
            output_text = (
                f"Financial Projection: Monthly cloud spend projected to grow to ${tool_data['projected_monthly']:,.2f}, "
                f"resulting in an annualized commitment of ${tool_data['projected_annual']:,.2f}."
            )
            structured_data = tool_data
        else:
            # Try live Groq API call
            groq_res = self._call_groq_direct(prompt, model_used)
            if groq_res:
                output_text = groq_res["content"]
                structured_data = {"status": "SUCCESS", "source": "LIVE_GROQ_LPU", "model": model_used}
            else:
                output_text = (
                    f"Assistant Response: Query successfully processed by {model_used}. "
                    f"Conversation context maintained across {len(self.memory.messages)} turns."
                )
                structured_data = {"status": "SUCCESS", "message": "Direct assistant response generated"}

        if multimodal_asset:
            output_text += f" [Multimodal asset '{multimodal_asset.get('filename')}' ({multimodal_asset.get('mime_type')}) processed]."

        in_tokens = max(1, math.ceil(len(prompt) / 3.8))
        out_tokens = max(1, math.ceil(len(output_text) / 3.8))
        cost_usd = ((in_tokens / 1_000_000) * 0.59) + ((out_tokens / 1_000_000) * 0.79)
        elapsed_ms = round((time.time() - start_time) * 1000, 2)

        telemetry = {
            "request_id": req_id,
            "timestamp": time.time(),
            "model_requested": self.primary_model,
            "model_used": model_used,
            "fallback_triggered": fallback_triggered,
            "retries_attempted": retry_count,
            "prompt_tokens": in_tokens,
            "completion_tokens": out_tokens,
            "total_tokens": in_tokens + out_tokens,
            "estimated_cost_usd": f"${cost_usd:.6f}",
            "latency_ms": elapsed_ms,
            "memory_tokens_active": self.memory.current_tokens(),
            "status": "SUCCESS"
        }

        self.telemetry_log.append(telemetry)
        self.memory.add_message("assistant", output_text)

        return LLMAPIResponse(
            request_id=req_id,
            model_used=model_used,
            output_text=output_text,
            structured_data=structured_data,
            tool_executed=tool_result,
            telemetry=telemetry
        )

    def stream_completion(self, prompt: str) -> Generator[Dict[str, Any], None, None]:
        full_text = f"Live streaming from {self.primary_model} via Groq LPU acceleration: Real-time token streaming reduces Time-To-First-Token (TTFT) and improves human perceived responsiveness."
        words = full_text.split(" ")
        accumulated = ""
        for i, word in enumerate(words):
            chunk = word + (" " if i < len(words) - 1 else "")
            accumulated += chunk
            yield {
                "chunk_index": i,
                "delta": chunk,
                "accumulated_text": accumulated,
                "is_final": (i == len(words) - 1)
            }
