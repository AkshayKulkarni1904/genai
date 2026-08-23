# Module 12: Supervisor-Worker Coordinator
from typing import Dict, Any, List
try:
    from .agents.triage_agent import TriageAgent
    from .agents.retrieval_agent import KnowledgeRetrievalAgent
    from .agents.rca_agent import RootCauseAnalysisAgent
    from .agents.validator_agent import ResolutionValidationAgent
    from .agents.escalation_agent import HumanSupportEscalationAgent
except ImportError:
    from agents.triage_agent import TriageAgent
    from agents.retrieval_agent import KnowledgeRetrievalAgent
    from agents.rca_agent import RootCauseAnalysisAgent
    from agents.validator_agent import ResolutionValidationAgent
    from agents.escalation_agent import HumanSupportEscalationAgent

class MultiAgentIncidentSupervisor:
    """
    Supervisor-worker architecture coordinating 5 specialist agents with:
    - Shared blackboard state
    - Tool permissions and approval boundaries
    - Reflection and safety verification
    - End-to-end auditability
    """
    def __init__(self):
        self.triage = TriageAgent()
        self.retrieval = KnowledgeRetrievalAgent()
        self.rca = RootCauseAnalysisAgent()
        self.validator = ResolutionValidationAgent()
        self.escalation = HumanSupportEscalationAgent()

    def resolve_incident(self, raw_incident: Dict[str, Any]) -> Dict[str, Any]:
        blackboard = {"raw_incident": raw_incident, "execution_log": []}

        # Step 1: Triage Agent
        triage_out = self.triage.run(raw_incident)
        blackboard["triage"] = triage_out
        blackboard["execution_log"].append(f"[Supervisor] Dispatched TriageAgent -> Severity: {triage_out['severity']}")

        # Step 2: Knowledge Retrieval Agent
        retrieval_out = self.retrieval.run(triage_out, raw_incident.get("description", ""))
        blackboard["retrieval"] = retrieval_out
        blackboard["execution_log"].append(f"[Supervisor] Dispatched KnowledgeRetrievalAgent -> Retrieved {len(retrieval_out['retrieved_sources'])} sources")

        # Step 3: Root Cause Analysis Agent
        rca_out = self.rca.run(triage_out, retrieval_out, raw_incident)
        blackboard["rca"] = rca_out
        blackboard["execution_log"].append(f"[Supervisor] Dispatched RCA Agent -> Causal Mechanism identified")

        # Step 4: Resolution Validation Agent
        action = "Scale Redis replica nodes and apply randomized TTL jitter."
        validator_out = self.validator.run(rca_out, action)
        blackboard["validator"] = validator_out
        blackboard["execution_log"].append(f"[Supervisor] Dispatched ValidatorAgent -> Safety Verdict: {validator_out['verdict']}")

        # Step 5: Human Support Escalation Agent
        escalation_out = self.escalation.run(blackboard)
        blackboard["escalation"] = escalation_out
        blackboard["execution_log"].append(f"[Supervisor] Dispatched EscalationAgent -> Stakeholder briefing published")

        return blackboard
