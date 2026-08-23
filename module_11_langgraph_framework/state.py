# Module 11: LangGraph State & Schema Definitions
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field

class SupportAgentState(BaseModel):
    ticket_id: str
    user_query: str
    intent: Optional[str] = None
    servicenow_data: Optional[Dict[str, Any]] = None
    retrieved_knowledge: List[Dict[str, Any]] = Field(default_factory=list)
    proposed_resolution: Optional[str] = None
    confidence_score: float = 0.0
    status: str = "INITIALIZED"  # INITIALIZED, INVESTIGATING, AUTO_RESOLVED, ESCALATED_TO_HUMAN
    human_feedback: Optional[str] = None
    execution_trace: List[str] = Field(default_factory=list)
    checkpoints: List[Dict[str, Any]] = Field(default_factory=list)

    def log_step(self, step_name: str, detail: str):
        self.execution_trace.append(f"[{step_name}] {detail}")
        self.checkpoints.append({
            "step": step_name,
            "status": self.status,
            "confidence": self.confidence_score,
            "detail": detail
        })
