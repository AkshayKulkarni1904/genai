# Module 7: Support-Resolution Assistant (Practical)
import json
from pathlib import Path
from typing import Dict, Any, List
try:
    from .rag_components import (
        ParentChildRetriever,
        MultiVectorRetriever,
        QueryDecomposer,
        CorrectiveRAG,
        SQLDatabaseRetriever,
        LRUSemanticCache,
        KnowledgeBaseLifecycleManager
    )
except ImportError:
    from rag_components import (
        ParentChildRetriever,
        MultiVectorRetriever,
        QueryDecomposer,
        CorrectiveRAG,
        SQLDatabaseRetriever,
        LRUSemanticCache,
        KnowledgeBaseLifecycleManager
    )

class SupportResolutionAssistant:
    def __init__(self, data_dir: Path):
        self.data_dir = data_dir
        self.cache = LRUSemanticCache()
        self.crag = CorrectiveRAG(relevance_threshold=0.10)
        self.kb_manager = KnowledgeBaseLifecycleManager()
        
        # Parent-Child Retriever
        self.doc_retriever = ParentChildRetriever()
        with open(data_dir / "product_docs.json", "r", encoding="utf-8") as f:
            docs = json.load(f)
            for d in docs:
                self.doc_retriever.add_parent_document(
                    parent_id=d["doc_id"],
                    title=d["title"],
                    full_content=d["content"],
                    metadata=d["metadata"]
                )
                self.kb_manager.upsert_document(d["doc_id"], d["title"], d["content"], d["version"])

        # Multi-Vector Retriever
        self.incident_retriever = MultiVectorRetriever()
        with open(data_dir / "resolved_incidents.json", "r", encoding="utf-8") as f:
            incidents = json.load(f)
            for inc in incidents:
                self.incident_retriever.add_document(
                    doc_id=inc["incident_id"],
                    content=f"Incident {inc['incident_id']}: {inc['summary']}. Root cause: {inc['root_cause']}. Resolution: {inc['resolution']}",
                    summary=inc["summary"],
                    keywords=[inc["product"], inc["error_code"], inc["customer_tier"]],
                    metadata={"error_code": inc["error_code"], "product": inc["product"]}
                )

        # Known Issues Store
        with open(data_dir / "known_issues.json", "r", encoding="utf-8") as f:
            self.known_issues = json.load(f)

        # SQL Retriever
        self.sql_retriever = SQLDatabaseRetriever(str(data_dir / "customer_configs.sqlite"))

    def search_known_issues(self, error_code: str, product: str = None) -> List[Dict[str, Any]]:
        matches = []
        for ki in self.known_issues:
            if ki["error_code"].lower() in error_code.lower():
                matches.append(ki)
            elif product and ki["product"].lower() == product.lower():
                matches.append(ki)
        return matches

    def resolve_ticket(self, customer_id: str, user_query: str) -> Dict[str, Any]:
        cache_key = f"{customer_id}:{user_query}"
        cached = self.cache.get(cache_key)
        if cached:
            cached_copy = cached.copy()
            cached_copy["from_cache"] = True
            return cached_copy

        # A: Query Decomposition
        sub_queries = QueryDecomposer.decompose(user_query)

        # B: SQL Customer Config Lookup
        cust_config = self.sql_retriever.get_customer_config(customer_id)

        # C: Retrieve Product Docs (Parent-Child)
        doc_matches = self.doc_retriever.retrieve(user_query, top_k=2)

        # D: Retrieve Similar Resolved Incidents (Multi-Vector)
        inc_matches = self.incident_retriever.retrieve(user_query, top_k=2)

        # E: Known Issues Check
        error_code = "ERR_TOKEN_EXPIRED" if any(k in user_query.lower() for k in ["token", "skew", "4012", "sso"]) else "ERR_CONN_TIMEOUT"
        ki_matches = self.search_known_issues(error_code)

        # F: Corrective RAG Evaluation
        all_docs = doc_matches + inc_matches
        graded_docs, crag_status = self.crag.evaluate_and_filter(user_query, all_docs)

        # G: Synthesize Resolution
        resolution_plan = []
        if cust_config:
            resolution_plan.append(f"? Customer Environment: {cust_config['company_name']} ({cust_config['tier']} Tier), Identity: {cust_config['sso_provider']}, Clock Skew: {cust_config['clock_skew_seconds']}s")
        
        if ki_matches:
            ki = ki_matches[0]
            resolution_plan.append(f"? Known Issue Alert [{ki['issue_id']}]: {ki['title']} | Workaround: {ki['workaround']}")
        
        if inc_matches:
            inc = inc_matches[0]
            resolution_plan.append(f"? Resolved Incident Precedent [{inc['doc_id']}]: {inc.get('content', '')}")

        if doc_matches:
            doc = doc_matches[0]
            resolution_plan.append(f"? Official Product Doc [{doc['parent_id']} - {doc['title']}]: {doc['content']}")

        output = {
            "query": user_query,
            "customer_id": customer_id,
            "sub_queries": sub_queries,
            "customer_config": cust_config,
            "retrieved_documentation": doc_matches,
            "similar_resolved_incidents": inc_matches,
            "known_issues": ki_matches,
            "crag_status": crag_status,
            "synthesized_resolution": "\n".join(resolution_plan),
            "from_cache": False
        }

        self.cache.put(cache_key, output)
        return output
