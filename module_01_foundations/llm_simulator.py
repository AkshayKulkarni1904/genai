# Module 1: Foundations of Generative AI and LLMs
import os
import json
import math
import random
import time
import urllib.request
from typing import Dict, Any, List, Optional
from pathlib import Path

# Load .env if present
try:
    import env_loader
except ImportError:
    try:
        from ..env_loader import load_dotenv
        load_dotenv()
    except Exception:
        pass


class TokenizerSimulator:
    """Simulates BPE (Byte Pair Encoding) tokenization and token metrics."""
    @staticmethod
    def count_tokens(text: str) -> int:
        if not text:
            return 0
        words = text.strip().split()
        char_count = len(text)
        est_tokens = max(len(words), math.ceil(char_count / 3.8))
        return est_tokens

    @staticmethod
    def tokenize(text: str) -> List[str]:
        words = text.split(" ")
        tokens = []
        for w in words:
            if len(w) > 6:
                tokens.append(w[:4])
                tokens.append(w[4:])
            else:
                tokens.append(w)
        return tokens


class ModelCatalog:
    """Catalog of hosted, open-source, small, reasoning, and Groq LPU models."""
    MODELS = {
        "groq-qwen-27b": {
            "type": "groq_lpu_accelerated",
            "model_id": "qwen/qwen3.8-27b",
            "context_window": 32_768,
            "cost_per_million_input": 0.59,
            "cost_per_million_output": 0.79,
            "latency_p50_ms": 95,
            "strengths": ["Ultra-fast Groq LPU inference", "Live API execution", "Low latency"],
            "enterprise_readiness": "Active Live API Key"
        },
        "groq-gpt-oss-20b": {
            "type": "groq_lpu_fast",
            "model_id": "openai/gpt-oss-20b",
            "context_window": 32_768,
            "cost_per_million_input": 0.20,
            "cost_per_million_output": 0.20,
            "latency_p50_ms": 45,
            "strengths": ["Extreme 45ms latency", "Low cost", "Reasoning tokens"],
            "enterprise_readiness": "Active Live API Key"
        },
        "gemini-1.5-pro": {
            "type": "hosted_frontier",
            "context_window": 2_000_000,
            "cost_per_million_input": 3.50,
            "cost_per_million_output": 10.50,
            "latency_p50_ms": 650,
            "strengths": ["Massive 2M context", "Multimodal native", "Complex reasoning"],
            "enterprise_readiness": "High"
        },
        "gpt-4o": {
            "type": "hosted_frontier",
            "context_window": 128_000,
            "cost_per_million_input": 2.50,
            "cost_per_million_output": 10.00,
            "latency_p50_ms": 550,
            "strengths": ["Fast inference", "Tool calling accuracy", "Broad ecosystem"],
            "enterprise_readiness": "High"
        },
        "o1-reasoning": {
            "type": "reasoning_model",
            "context_window": 128_000,
            "cost_per_million_input": 15.00,
            "cost_per_million_output": 60.00,
            "latency_p50_ms": 3200,
            "strengths": ["Deep chain-of-thought", "STEM/Code verification", "Low hallucination"],
            "enterprise_readiness": "Specialized"
        },
        "llama-3.3-70b-instruct": {
            "type": "open_weights",
            "context_window": 128_000,
            "cost_per_million_input": 0.80,
            "cost_per_million_output": 0.80,
            "latency_p50_ms": 420,
            "strengths": ["Self-hosted privacy", "No vendor lock-in", "Cost efficient"],
            "enterprise_readiness": "High (Self-managed)"
        },
        "phi-3.5-mini-slm": {
            "type": "small_language_model",
            "context_window": 128_000,
            "cost_per_million_input": 0.15,
            "cost_per_million_output": 0.15,
            "latency_p50_ms": 95,
            "strengths": ["On-device / edge deployment", "Ultra-low latency", "Low power"],
            "enterprise_readiness": "Targeted"
        }
    }


class LLMParameterEngine:
    """
    Demonstrates parameter impact: temperature, top_p, max_tokens, determinism vs randomness,
    context window utilization, and live Groq API execution.
    """
    def __init__(self):
        self.tokenizer = TokenizerSimulator()

    def _call_live_groq_api(self, prompt: str, model_id: str, temperature: float, max_tokens: int) -> Optional[Dict[str, Any]]:
        api_key = os.environ.get("GROQ_API_KEY")
        if not api_key:
            return None
        url = "https://api.groq.com/openai/v1/chat/completions"
        payload = json.dumps({
            "model": model_id,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": max(0.01, temperature),
            "max_tokens": max_tokens
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
                content = choice.get("content") or choice.get("reasoning") or "Response completed."
                usage = data.get("usage", {})
                return {
                    "content": content,
                    "prompt_tokens": usage.get("prompt_tokens", 0),
                    "completion_tokens": usage.get("completion_tokens", 0),
                    "total_tokens": usage.get("total_tokens", 0),
                    "actual_latency_ms": elapsed_ms
                }
        except Exception as e:
            return None

    def generate(
        self,
        prompt: str,
        model_name: str = "groq-qwen-27b",
        temperature: float = 0.7,
        top_p: float = 0.9,
        max_tokens: int = 150,
        grounding_context: Optional[str] = None
    ) -> Dict[str, Any]:
        start_time = time.time()
        model_info = ModelCatalog.MODELS.get(model_name, ModelCatalog.MODELS["groq-qwen-27b"])
        
        # Check if live Groq execution applies
        live_groq_res = None
        if "groq" in model_name.lower() or os.environ.get("GROQ_API_KEY"):
            groq_target_model = model_info.get("model_id", "qwen/qwen3.8-27b")
            effective_prompt = prompt
            if grounding_context:
                effective_prompt = f"Grounded Context:\n{grounding_context}\n\nTask:\n{prompt}"
            live_groq_res = self._call_live_groq_api(effective_prompt, groq_target_model, temperature, max_tokens)

        if live_groq_res:
            core_content = live_groq_res["content"]
            prompt_tokens = live_groq_res["prompt_tokens"]
            generated_tokens = live_groq_res["completion_tokens"]
            total_tokens = live_groq_res["total_tokens"]
            context_tokens = self.tokenizer.count_tokens(grounding_context) if grounding_context else 0
            simulated_latency_ms = live_groq_res["actual_latency_ms"]
            execution_mode = "LIVE_GROQ_LPU_EXECUTION"
        else:
            prompt_tokens = self.tokenizer.count_tokens(prompt)
            context_tokens = self.tokenizer.count_tokens(grounding_context) if grounding_context else 0
            total_input_tokens = prompt_tokens + context_tokens
            
            random.seed(int(sum(ord(c) for c in prompt) + (0 if temperature == 0.0 else int(temperature * 1000))))
            
            if grounding_context:
                core_content = (
                    f"Based directly on the verified enterprise documentation: "
                    f"The system conforms to specifications in {grounding_context[:40]}... "
                    f"Operational parameters are enforced deterministically."
                )
            else:
                if temperature > 1.0:
                    core_content = (
                        f"Speculative response generated with temperature {temperature}: "
                        f"While theoretical formulations suggest variable outcomes, the model may extrapolate "
                        f"unverified assumptions or hallucinate non-existent enterprise parameters."
                    )
                elif temperature == 0.0:
                    core_content = (
                        f"Deterministic greedy response (temperature=0.0): "
                        f"Standard enterprise protocols require explicit grounding. In the absence of retrieved context, "
                        f"only foundational pre-training parametric knowledge is utilized."
                    )
                else:
                    core_content = (
                        f"Balanced response (temp={temperature}, top_p={top_p}): "
                        f"Enterprise LLMs generate outputs through autoregressive next-token prediction, balancing "
                        f"coherent fluency against parametric limitations."
                    )

            generated_tokens = min(max_tokens, self.tokenizer.count_tokens(core_content))
            total_tokens = total_input_tokens + generated_tokens
            simulated_latency_ms = model_info["latency_p50_ms"] + int(generated_tokens * 8)
            execution_mode = "PARAMETRIC_SIMULATION"

        total_input_tokens = prompt_tokens + context_tokens
        max_ctx = model_info["context_window"]
        utilization_pct = round((total_input_tokens / max_ctx) * 100, 4)

        if grounding_context:
            hallucination_risk = "VERY_LOW (Grounding Context Provided)"
            grounding_score = 0.96
        else:
            if temperature > 1.0:
                hallucination_risk = "HIGH (High temperature with ungrounded generation)"
                grounding_score = 0.42
            elif temperature == 0.0:
                hallucination_risk = "LOW_MODERATE (Deterministic decoding)"
                grounding_score = 0.78
            else:
                hallucination_risk = "MODERATE (Standard temperature without retrieval grounding)"
                grounding_score = 0.65

        # Financial cost calculation
        input_cost = (total_input_tokens / 1_000_000) * model_info["cost_per_million_input"]
        output_cost = (generated_tokens / 1_000_000) * model_info["cost_per_million_output"]
        total_cost_usd = input_cost + output_cost

        return {
            "model": model_name,
            "model_type": model_info["type"],
            "execution_mode": execution_mode,
            "parameters": {
                "temperature": temperature,
                "top_p": top_p,
                "max_tokens": max_tokens,
                "is_deterministic": (temperature == 0.0)
            },
            "token_metrics": {
                "prompt_tokens": prompt_tokens,
                "grounding_context_tokens": context_tokens,
                "total_input_tokens": total_input_tokens,
                "generated_tokens": generated_tokens,
                "total_tokens": total_tokens,
                "context_window_limit": max_ctx,
                "context_window_utilization_pct": f"{utilization_pct}%"
            },
            "economics_and_performance": {
                "estimated_cost_usd": f"${total_cost_usd:.6f}",
                "simulated_latency_ms": simulated_latency_ms,
                "tokens_per_second": round(generated_tokens / max(0.01, (simulated_latency_ms / 1000)), 1)
            },
            "reliability_and_safety": {
                "hallucination_risk": hallucination_risk,
                "grounding_score": grounding_score,
                "model_readiness": model_info["enterprise_readiness"]
            },
            "generated_text": core_content
        }
