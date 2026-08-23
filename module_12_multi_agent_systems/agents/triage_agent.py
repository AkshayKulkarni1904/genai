# Module 12: Specialist Agent 1 - Triage Agent
from typing import Dict, Any

class TriageAgent:
    """Classifies incident severity, customer impact, and SLA response time."""
    NAME = "TriageAgent"
    ROLE = "Incident Severity & Blast Radius Evaluator"

    def run(self, raw_incident: Dict[str, Any]) -> Dict[str, Any]:
        impacted_users = raw_incident.get("impacted_users", 0)
        symptom = raw_incident.get("description", "").lower()
        
        if "outage" in symptom or "data loss" in symptom or impacted_users > 5000:
            severity = "P1-CRITICAL"
            sla_mins = 15
            blast_radius = "Global Tier-1 Production Services"
        elif "latency" in symptom or "slow" in symptom or impacted_users > 500:
            severity = "P2-MAJOR"
            sla_mins = 60
            blast_radius = "Regional Microservice Cluster"
        else:
            severity = "P3-MINOR"
            sla_mins = 240
            blast_radius = "Isolated Tenant / Non-blocking"

        return {
            "agent": self.NAME,
            "severity": severity,
            "sla_target_minutes": sla_mins,
            "blast_radius": blast_radius,
            "requires_incident_commander": severity == "P1-CRITICAL"
        }
