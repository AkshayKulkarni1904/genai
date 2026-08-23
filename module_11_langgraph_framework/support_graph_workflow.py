# Module 11: Support Agent LangGraph Workflow (Practical)
import time
from typing import Dict, Any, Tuple
try:
    from .state import SupportAgentState
    from .tools import ServiceNowTicketTool, KnowledgeRAGTool
except ImportError:
    from state import SupportAgentState
    from tools import ServiceNowTicketTool, KnowledgeRAGTool

class SupportAgentStateGraph:
    """
    Practical: Build a support agent workflow with:
    ? Intent classifier node
    ? RAG retrieval node
    ? ServiceNow ticket lookup tool
    ? Resolution recommendation node
    ? Confidence evaluator
    ? Human escalation path
    """
    def __init__(self, confidence_threshold: float = 0.75):
        self.threshold = confidence_threshold

    # Node 1: Intent Classifier
    def intent_classifier_node(self, state: SupportAgentState) -> SupportAgentState:
        q = state.user_query.lower()
        if "incident" in q or "crash" in q or "down" in q or "error" in q:
            state.intent = "INCIDENT_TROUBLESHOOT"
        elif "request" in q or "access" in q:
            state.intent = "SERVICE_REQUEST"
        else:
            state.intent = "GENERAL_INQUIRY"
        state.log_step("IntentClassifier", f"Classified intent as '{state.intent}'")
        return state

    # Node 2: ServiceNow Ticket Lookup
    def servicenow_lookup_node(self, state: SupportAgentState) -> SupportAgentState:
        sn_info = ServiceNowTicketTool.lookup_ticket(state.ticket_id)
        state.servicenow_data = sn_info
        state.log_step("ServiceNowLookup", f"Retrieved CMDB CI: {sn_info['cmdb_ci']} | Priority: {sn_info['priority']}")
        return state

    # Node 3: RAG Retrieval Node
    def rag_retrieval_node(self, state: SupportAgentState) -> SupportAgentState:
        search_str = f"{state.user_query} {state.servicenow_data.get('short_description', '')}"
        playbooks = KnowledgeRAGTool.retrieve_playbook(search_str)
        state.retrieved_knowledge = playbooks
        state.log_step("RAGRetrieval", f"Retrieved {len(playbooks)} KB Playbook(s): {[pb['id'] for pb in playbooks]}")
        return state

    # Node 4: Resolution Recommendation Node
    def resolution_recommendation_node(self, state: SupportAgentState) -> SupportAgentState:
        if state.retrieved_knowledge:
            top_pb = state.retrieved_knowledge[0]
            state.proposed_resolution = f"Playbook [{top_pb['id']} - {top_pb['title']}]:\n{top_pb['resolution_steps']}"
            state.confidence_score = top_pb.get("confidence_base", 0.70)
        else:
            state.proposed_resolution = "No standardized resolution playbook found."
            state.confidence_score = 0.30
            
        state.log_step("ResolutionRecommendation", f"Proposed resolution generated with confidence={state.confidence_score:.2f}")
        return state

    # Node 5: Confidence Evaluator (Conditional Edge Router)
    def confidence_evaluator_node(self, state: SupportAgentState) -> Tuple[SupportAgentState, str]:
        if state.confidence_score >= self.threshold:
            state.status = "AUTO_RESOLVED"
            state.log_step("ConfidenceEvaluator", f"Confidence {state.confidence_score:.2f} >= threshold {self.threshold:.2f}. Routing to AUTO_RESOLVED.")
            return state, "auto_resolve"
        else:
            state.status = "ESCALATED_TO_HUMAN"
            state.log_step("ConfidenceEvaluator", f"Confidence {state.confidence_score:.2f} < threshold {self.threshold:.2f}. Routing to HUMAN_ESCALATION.")
            return state, "human_escalation"

    # Node 6: Human Escalation Path (Human-in-the-Loop Review)
    def human_escalation_node(self, state: SupportAgentState, human_decision: str = None) -> SupportAgentState:
        assigned_team = state.servicenow_data.get("assignment_group", "Senior Tier-2 Support")
        if not human_decision:
            human_decision = f"Escalated to On-Call Engineer ({assigned_team}). Manual triage initiated."
        state.human_feedback = human_decision
        state.log_step("HumanEscalation", f"Human-in-the-loop review executed: {human_decision}")
        return state

    def run(self, ticket_id: str, query: str, human_override: str = None) -> SupportAgentState:
        """Executes full stateful graph."""
        state = SupportAgentState(ticket_id=ticket_id, user_query=query)
        
        # 1. Intent Classifier
        state = self.intent_classifier_node(state)
        # 2. ServiceNow Lookup
        state = self.servicenow_lookup_node(state)
        # 3. RAG Retrieval
        state = self.rag_retrieval_node(state)
        # 4. Resolution Recommendation
        state = self.resolution_recommendation_node(state)
        # 5. Conditional Evaluation Edge
        state, next_edge = self.confidence_evaluator_node(state)
        
        # 6. Branching
        if next_edge == "human_escalation":
            state = self.human_escalation_node(state, human_override)
            
        return state
