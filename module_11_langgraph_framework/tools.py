# Module 11: ServiceNow & RAG Tool Integrations
from typing import Dict, Any, List

class ServiceNowTicketTool:
    """Mock ServiceNow Table API tool for incident lookups."""
    TICKETS_DB = {
        "INC-10091": {
            "sys_id": "sys_98234710",
            "caller": "Jane Doe (Engineering)",
            "priority": "P2 - High",
            "cmdb_ci": "Kube-Cluster-Prod-03",
            "short_description": "Pod CrashLoopBackOff on Payment Ingress",
            "assignment_group": "Cloud Platform SRE"
        },
        "INC-10092": {
            "sys_id": "sys_98234711",
            "caller": "Mark Vance (Sales Ops)",
            "priority": "P4 - Low",
            "cmdb_ci": "Salesforce-Connector-SaaS",
            "short_description": "Unknown OAuth synchronization error code 998",
            "assignment_group": "Enterprise Apps"
        }
    }

    @classmethod
    def lookup_ticket(cls, ticket_id: str) -> Dict[str, Any]:
        return cls.TICKETS_DB.get(ticket_id, {
            "sys_id": "sys_generic",
            "caller": "Unknown User",
            "priority": "P3 - Moderate",
            "cmdb_ci": "Unassigned CI",
            "short_description": "General support inquiry",
            "assignment_group": "Service Desk Tier-1"
        })

class KnowledgeRAGTool:
    """Retrieves standard operational procedures (SOPs)."""
    KB_PLAYBOOKS = [
        {
            "id": "SOP-K8S-01",
            "title": "Kubernetes OOMKilled / CrashLoopBackOff Remediation",
            "match_keywords": ["crashloop", "pod", "kube", "oomkilled", "ingress"],
            "resolution_steps": "1. Check container exit code (137=OOM). 2. Increase pod memory limit in values.yaml. 3. Perform rolling restart: kubectl rollout restart deploy/payment-ingress.",
            "confidence_base": 0.92
        },
        {
            "id": "SOP-AUTH-09",
            "title": "Third-Party OAuth Token Invalidation",
            "match_keywords": ["oauth", "salesforce", "sync", "token", "998"],
            "resolution_steps": "1. Re-authenticate connected app in Admin Console. 2. Purge cached bearer tokens.",
            "confidence_base": 0.60  # Low confidence due to ambiguity
        }
    ]

    @classmethod
    def retrieve_playbook(cls, query: str) -> List[Dict[str, Any]]:
        q = query.lower()
        matches = []
        for pb in cls.KB_PLAYBOOKS:
            if any(kw in q for kw in pb["match_keywords"]):
                matches.append(pb)
        return matches if matches else [cls.KB_PLAYBOOKS[0]]
