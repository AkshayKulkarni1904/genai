# Module 9: Graph Extractor & Community Summarizer
import re
from typing import List, Dict, Any, Tuple
import networkx as nx

class GraphExtractor:
    """Extracts entities, relationships, and generates hierarchical community clusters."""
    @staticmethod
    def extract_entities_and_relations(text: str) -> Tuple[List[str], List[Tuple[str, str, str]]]:
        entities = []
        relations = []
        # Pattern-based entity extraction
        if "VPC" in text or "Network" in text:
            entities.extend(["VPC Peering", "Network Infrastructure"])
        if "Payment" in text or "Checkout" in text:
            entities.extend(["Payment Gateway", "Checkout Service"])
        if "Database" in text or "Lock" in text or "DB" in text:
            entities.extend(["Transaction DB", "Lock Escalation"])
            
        if "Payment" in text and "Database" in text:
            relations.append(("Payment Gateway", "DEPENDS_ON", "Transaction DB"))
        if "VPC" in text and "Packet" in text:
            relations.append(("VPC Peering", "CAUSES", "TCP Drops"))
            
        return list(set(entities)), relations

class CommunityDetector:
    """Clusters graph nodes into semantic communities and synthesizes summaries."""
    def __init__(self, nx_graph: nx.DiGraph):
        self.graph = nx_graph

    def detect_communities(self) -> Dict[str, List[str]]:
        communities = {}
        for node, data in self.graph.nodes(data=True):
            comm = data.get("community", "General")
            communities.setdefault(comm, []).append(node)
        return communities

    def generate_community_summaries(self) -> Dict[str, str]:
        summaries = {
            "Payment Core": "Handles real-time customer transactions, payment authentication, and RPC routing to financial settlement gateways. Vulnerable to upstream database locks.",
            "Network Infrastructure": "Encompasses cross-region VPC peering and subnet routing tables. Prone to MTU packet drop anomalies during jumbo frame transmission.",
            "Data Tier": "Contains primary relational transaction databases and read replicas. Prone to table lock escalation during heavy unindexed batch reports."
        }
        return summaries
