# Module 10: Practical 3 - Knowledge Assistant with Source Citations
from typing import Dict, Any, List

class CitationKnowledgeAssistant:
    """Knowledge Assistant that provides factual responses with verifiable inline citations."""
    def __init__(self):
        self.kb = [
            {
                "id": "SOP-SEC-01",
                "source": "Security Compliance Manual (Rev 4)",
                "page": 14,
                "fact": "All production API secrets and RSA private keys must be rotated at least every 90 days."
            },
            {
                "id": "SOP-OPS-08",
                "source": "Infrastructure SRE Playbook (v2.1)",
                "page": 42,
                "fact": "Maximum tolerable latency for core checkout microservices is 250ms at p99."
            },
            {
                "id": "POL-HR-20",
                "source": "Remote Work Policy (2026)",
                "page": 5,
                "fact": "Employees connecting remotely must use corporate Zero-Trust VPN with hardware MFA tokens."
            }
        ]

    def ask(self, query: str) -> Dict[str, Any]:
        q_lower = query.lower()
        matched = []
        for item in self.kb:
            if any(k in item["fact"].lower() for k in q_lower.split() if len(k) > 3):
                matched.append(item)
                
        if not matched:
            matched = [self.kb[0]]
            
        citations = []
        statements = []
        for idx, m in enumerate(matched, 1):
            ref = f"[{idx}]"
            statements.append(f"{m['fact']} {ref}")
            citations.append({
                "citation_tag": ref,
                "document": m["source"],
                "page": m["page"],
                "doc_id": m["id"]
            })
            
        answer = " ".join(statements)
        return {
            "query": query,
            "answer_with_citations": answer,
            "citations_bibliography": citations
        }
