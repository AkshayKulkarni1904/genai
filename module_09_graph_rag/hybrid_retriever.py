# Module 9: Hybrid GraphRAG Retriever
import networkx as nx
import math
import re
from typing import List, Dict, Any

class HybridGraphRAGRetriever:
    """
    Combines:
    1. Vector-based document similarity
    2. Knowledge graph neighborhood traversal (Local Search)
    3. Community summary retrieval (Global Search)
    """
    def __init__(self, graph: nx.DiGraph, documents: List[Dict[str, Any]], community_summaries: Dict[str, str]):
        self.graph = graph
        self.documents = documents
        self.community_summaries = community_summaries

    def _sim(self, a: str, b: str) -> float:
        ta = set(re.findall(r'\w+', a.lower()))
        tb = set(re.findall(r'\w+', b.lower()))
        if not ta or not tb:
            return 0.0
        return len(ta.intersection(tb)) / math.sqrt(len(ta) * len(tb))

    def local_search(self, entity_id: str, depth: int = 2) -> Dict[str, Any]:
        """Explores local neighborhood, incoming/outgoing dependencies, and failure patterns."""
        if entity_id not in self.graph:
            return {"entity": entity_id, "neighbors": [], "paths": []}
            
        visited = set([entity_id])
        queue = [(entity_id, 0, [entity_id])]
        paths = []
        
        while queue:
            curr, d, path = queue.pop(0)
            if d < depth:
                for neighbor in self.graph.neighbors(curr):
                    edge_data = self.graph.get_edge_data(curr, neighbor)
                    new_path = path + [f"--[{edge_data.get('type')}]-->", neighbor]
                    paths.append(new_path)
                    if neighbor not in visited:
                        visited.add(neighbor)
                        queue.append((neighbor, d + 1, path + [neighbor]))
                        
        return {
            "entity": entity_id,
            "entity_details": self.graph.nodes[entity_id],
            "traversed_paths": paths
        }

    def global_search(self, query: str) -> List[Dict[str, Any]]:
        """Searches across high-level community summaries for global reasoning."""
        scored = []
        for comm, summary in self.community_summaries.items():
            score = self._sim(query, f"{comm} {summary}")
            if score > 0.05:
                scored.append({"community": comm, "summary": summary, "relevance": round(score, 3)})
        scored.sort(key=lambda x: x["relevance"], reverse=True)
        return scored

    def vector_search_docs(self, query: str, top_k: int = 2) -> List[Dict[str, Any]]:
        scored = []
        for doc in self.documents:
            score = self._sim(query, doc["content"] + " " + doc["title"])
            if score > 0.05:
                doc_res = doc.copy()
                doc_res["score"] = round(score, 3)
                scored.append((score, doc_res))
        scored.sort(key=lambda x: x[0], reverse=True)
        return [d for s, d in scored[:top_k]]
