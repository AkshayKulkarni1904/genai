# Module 8: IT Support Knowledge Graph Engine
import json
import networkx as nx
from pathlib import Path
from typing import Dict, Any, List, Optional, Tuple

try:
    from .schema import EnterpriseOntology, EntityResolver
except ImportError:
    from schema import EnterpriseOntology, EntityResolver

class ITSupportKnowledgeGraph:
    """
    Practical: Model an IT support graph connecting users, devices,
    applications, incidents, known errors, teams, and resolutions.
    """
    def __init__(self):
        self.graph = nx.DiGraph()
        self.resolver = EntityResolver()

    def load_from_json(self, file_path: Path):
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            
        for node in data["nodes"]:
            self.graph.add_node(
                node["id"],
                label=node["label"],
                **node["properties"]
            )
            
        for rel in data["relationships"]:
            self.graph.add_edge(
                rel["source"],
                rel["target"],
                type=rel["type"],
                **rel.get("properties", {})
            )

    def execute_cypher_pattern(self, pattern: str) -> List[Dict[str, Any]]:
        """
        Cypher query parser & pattern matching engine.
        Supports patterns like:
        - MATCH (i:Incident)-[:CAUSED_BY_KNOWN_ERROR]->(ke:KnownError)-[:RESOLVED_BY]->(r:Resolution)
        - MATCH (u:User)-[:REPORTED_INCIDENT]->(i:Incident)-[:AFFECTS_APPLICATION]->(a:Application)
        """
        results = []
        if "CAUSED_BY_KNOWN_ERROR" in pattern and "RESOLVED_BY" in pattern:
            for n1, n2, d1 in self.graph.edges(data=True):
                if d1.get("type") == "CAUSED_BY_KNOWN_ERROR":
                    for _, n3, d2 in self.graph.out_edges(n2, data=True):
                        if d2.get("type") == "RESOLVED_BY":
                            results.append({
                                "Incident": {"id": n1, **self.graph.nodes[n1]},
                                "KnownError": {"id": n2, **self.graph.nodes[n2]},
                                "Resolution": {"id": n3, **self.graph.nodes[n3]}
                            })
                            
        elif "REPORTED_INCIDENT" in pattern and "AFFECTS_APPLICATION" in pattern:
            for u, inc, d1 in self.graph.edges(data=True):
                if d1.get("type") == "REPORTED_INCIDENT":
                    for _, app, d2 in self.graph.out_edges(inc, data=True):
                        if d2.get("type") == "AFFECTS_APPLICATION":
                            results.append({
                                "User": {"id": u, **self.graph.nodes[u]},
                                "Incident": {"id": inc, **self.graph.nodes[inc]},
                                "Application": {"id": app, **self.graph.nodes[app]}
                            })
        else:
            # Fallback direct edge matching
            for u, v, d in self.graph.edges(data=True):
                results.append({"source": u, "target": v, "relation": d.get("type"), "properties": d})
        return results

    def trace_incident_root_cause_path(self, incident_id: str) -> List[str]:
        """Traverses graph to construct complete causal resolution path."""
        path_desc = []
        if incident_id not in self.graph:
            return [f"Incident {incident_id} not found in graph."]
        
        inc_node = self.graph.nodes[incident_id]
        path_desc.append(f"Incident: [{incident_id}] {inc_node.get('title', '')} (Severity: {inc_node.get('severity')})")
        
        # 1. Affected Application & Dependencies
        for _, app, d in self.graph.out_edges(incident_id, data=True):
            if d.get("type") == "AFFECTS_APPLICATION":
                app_node = self.graph.nodes[app]
                path_desc.append(f" ??? Affects Application: [{app}] {app_node.get('name')} (Owner: {app_node.get('service_owner', 'N/A')})")
                for _, dep, d2 in self.graph.out_edges(app, data=True):
                    if d2.get("type") == "DEPENDS_ON":
                        dep_node = self.graph.nodes[dep]
                        path_desc.append(f"      ??? Upstream Dependency: [{dep}] {dep_node.get('name')}")

        # 2. Assigned Team
        for _, team, d in self.graph.out_edges(incident_id, data=True):
            if d.get("type") == "ASSIGNED_TO_TEAM":
                team_node = self.graph.nodes[team]
                path_desc.append(f" ??? Escalated To: [{team}] {team_node.get('name')} (Lead: {team_node.get('lead')}, Channel: {team_node.get('slack_channel')})")

        # 3. Known Error and Resolution SOP
        for _, ke, d in self.graph.out_edges(incident_id, data=True):
            if d.get("type") == "CAUSED_BY_KNOWN_ERROR":
                ke_node = self.graph.nodes[ke]
                path_desc.append(f" ??? Root Cause Identified: [{ke}] {ke_node.get('summary')} (Workaround: {ke_node.get('workaround')})")
                for _, res, d3 in self.graph.out_edges(ke, data=True):
                    if d3.get("type") == "RESOLVED_BY":
                        res_node = self.graph.nodes[res]
                        path_desc.append(f"      ??? Standard Resolution: [{res}] {res_node.get('action')} (Verified SOP: {d3.get('standard_sop')})")

        return path_desc

    def validate_graph_governance(self) -> Dict[str, Any]:
        """Validates graph data quality, governance, orphan nodes, and schema compliance."""
        orphan_nodes = [n for n in self.graph.nodes() if self.graph.degree(n) == 0]
        schema_violations = []
        
        for u, v, d in self.graph.edges(data=True):
            rel_type = d.get("type")
            u_label = self.graph.nodes[u].get("label")
            v_label = self.graph.nodes[v].get("label")
            expected = EnterpriseOntology.ALLOWED_RELATIONSHIPS.get(rel_type)
            if expected:
                if (u_label, v_label) != expected:
                    schema_violations.append({
                        "edge": f"({u}:{u_label})-[:{rel_type}]->({v}:{v_label})",
                        "expected": f"({expected[0]})-[:{rel_type}]->({expected[1]})"
                    })
        
        return {
            "total_nodes": self.graph.number_of_nodes(),
            "total_edges": self.graph.number_of_edges(),
            "orphan_nodes_count": len(orphan_nodes),
            "orphan_nodes": orphan_nodes,
            "schema_violations_count": len(schema_violations),
            "schema_violations": schema_violations,
            "governance_status": "COMPLIANT" if len(orphan_nodes) == 0 and len(schema_violations) == 0 else "WARNINGS"
        }
