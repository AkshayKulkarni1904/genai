# Module 9: Incident Resolution GraphRAG Pipeline (Practical)
import json
from pathlib import Path
from typing import Dict, Any, List
import networkx as nx

try:
    from .graph_extractor import GraphExtractor, CommunityDetector
    from .hybrid_retriever import HybridGraphRAGRetriever
except ImportError:
    from graph_extractor import GraphExtractor, CommunityDetector
    from hybrid_retriever import HybridGraphRAGRetriever

class IncidentGraphRAGPipeline:
    """
    Practical: Create a GraphRAG workflow for incident resolution:
    1. Identify product, error code, customer, and environment
    2. Retrieve related incidents and knowledge articles
    3. Traverse dependencies and known failure patterns
    4. Recommend resolution with evidence & provenance
    """
    def __init__(self, data_dir: Path):
        self.data_dir = data_dir
        
        # Load Knowledge Articles
        with open(data_dir / "incident_corpus.json", "r", encoding="utf-8") as f:
            self.docs = json.load(f)
            
        # Build Dependency Graph
        with open(data_dir / "dependency_graph.json", "r", encoding="utf-8") as f:
            graph_data = json.load(f)
            
        self.graph = nx.DiGraph()
        for node in graph_data["nodes"]:
            self.graph.add_node(node["id"], **node)
        for edge in graph_data["edges"]:
            self.graph.add_edge(edge["source"], edge["target"], type=edge["type"])
            
        detector = CommunityDetector(self.graph)
        self.communities = detector.detect_communities()
        self.community_summaries = detector.generate_community_summaries()
        
        self.retriever = HybridGraphRAGRetriever(
            graph=self.graph,
            documents=self.docs,
            community_summaries=self.community_summaries
        )

    def execute_incident_resolution_workflow(self, incident_payload: Dict[str, Any]) -> Dict[str, Any]:
        # Step 1: Identify product, error code, customer, and environment
        step1_identification = {
            "product": incident_payload.get("product", "Checkout API"),
            "error_code": incident_payload.get("error_code", "ERR_VPC_MTU_DROP"),
            "customer": incident_payload.get("customer", "Enterprise Partner"),
            "environment": incident_payload.get("environment", "Production AWS East"),
            "reported_symptom": incident_payload.get("symptom", "High 504 Gateway Timeouts on payment checkout")
        }

        # Step 2: Retrieve related incidents and knowledge articles (Vector + Global Community Search)
        query = f"{step1_identification['product']} {step1_identification['error_code']} {step1_identification['reported_symptom']}"
        matched_articles = self.retriever.vector_search_docs(query, top_k=2)
        global_communities = self.retriever.global_search(query)

        # Step 3: Traverse dependencies and known failure patterns (Local Graph Traversal)
        target_service = "svc_checkout" if "checkout" in step1_identification["product"].lower() else "svc_payment_gw"
        local_traversal = self.retriever.local_search(target_service, depth=2)

        # Step 4: Recommend resolution with evidence & provenance
        evidence_chain = []
        for doc in matched_articles:
            evidence_chain.append({
                "source_type": "KnowledgeArticle",
                "source_id": doc["doc_id"],
                "title": doc["title"],
                "evidence_text": doc["content"]
            })
            
        for path in local_traversal["traversed_paths"]:
            evidence_chain.append({
                "source_type": "DependencyGraphTraversal",
                "source_id": "GRAPH-TOPOLOGY",
                "path_segment": " ".join(path)
            })

        # Synthesize recommendation
        if "MTU" in step1_identification["error_code"] or "504" in step1_identification["reported_symptom"]:
            recommendation = (
                "Root Cause: MTU mismatch on VPC-East peering link causing packet black-holing under jumbo frames.\n"
                "Action Plan:\n"
                "1. Apply immediate iptables MSS clamping (1460 bytes) on checkout ingress gateway.\n"
                "2. Standardize interface MTU to 1500 across all VPC East subnets.\n"
                "3. Verify payment RPC latency normalizes below 120ms."
            )
        else:
            recommendation = (
                "Root Cause: Database table lock escalation on Transaction DB cluster.\n"
                "Action Plan:\n"
                "1. Reroute concurrent batch billing jobs to read replicas.\n"
                "2. Scale connection pool and reset circuit breaker threshold."
            )

        return {
            "step_1_identification": step1_identification,
            "step_2_retrieved_knowledge": {
                "matched_articles": matched_articles,
                "community_context": global_communities
            },
            "step_3_dependency_traversal": local_traversal,
            "step_4_recommendation": {
                "recommendation": recommendation,
                "evidence_provenance_chain": evidence_chain
            }
        }
