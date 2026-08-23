# Module 8: Knowledge Graph Fundamentals - Executable Runner
from pathlib import Path
from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from rich.tree import Tree

try:
    from .it_support_graph import ITSupportKnowledgeGraph
    from .schema import EntityResolver, EnterpriseTaxonomy
except ImportError:
    from it_support_graph import ITSupportKnowledgeGraph
    from schema import EntityResolver, EnterpriseTaxonomy

console = Console()

def run_module_8():
    console.print(Panel.fit("[bold cyan]Module 8: Knowledge Graph Fundamentals[/bold cyan]\n[dim]Nodes, Edges, Properties, Ontologies, Cypher Queries, IT Support Modeling, Governance[/dim]"))
    
    data_path = Path(__file__).parent / "data" / "it_support_data.json"
    kg = ITSupportKnowledgeGraph()
    kg.load_from_json(data_path)
    
    # 1. Entity Resolution Demo
    console.print("\n[bold yellow]1. Entity Resolution & Canonical Identifiers:[/bold yellow]")
    resolver = EntityResolver()
    samples = ["Alice Smith", "alice@acme.com", "SAP ERP", "Postgres"]
    res_table = Table(title="Entity Resolution Mapping", show_header=True)
    res_table.add_column("Raw Mention / Alias", style="cyan")
    res_table.add_column("Canonical Universal Identifier", style="bold green")
    for s in samples:
        res_table.add_row(s, resolver.resolve(s))
    console.print(res_table)
    
    # 2. Cypher Pattern Execution
    console.print("\n[bold yellow]2. Cypher Pattern Matching Execution:[/bold yellow]")
    cypher_query = "MATCH (i:Incident)-[:CAUSED_BY_KNOWN_ERROR]->(ke:KnownError)-[:RESOLVED_BY]->(r:Resolution)"
    console.print(f"[bold]Query:[/bold] [italic]{cypher_query}[/italic]")
    matches = kg.execute_cypher_pattern(cypher_query)
    
    cypher_table = Table(title="Cypher Pattern Results", show_lines=True)
    cypher_table.add_column("Incident", style="bold red")
    cypher_table.add_column("Known Error Root Cause", style="bold yellow")
    cypher_table.add_column("Verified Resolution", style="bold green")
    
    for m in matches:
        inc = m["Incident"]
        ke = m["KnownError"]
        res = m["Resolution"]
        cypher_table.add_row(
            f"[{inc['id']}] {inc['title']}\nSeverity: {inc['severity']}",
            f"[{ke['id']}] {ke['error_code']}\n{ke['summary']}",
            f"[{res['id']}] {res['res_code']}\nAction: {res['action']}"
        )
    console.print(cypher_table)
    
    # 3. Practical IT Support Traversal
    console.print("\n[bold yellow]3. Incident Root-Cause & Impact Graph Traversal (INC-9001):[/bold yellow]")
    path_lines = kg.trace_incident_root_cause_path("inc_9001")
    
    tree = Tree("[bold red]Incident Resolution Graph Traversal: INC-9001[/bold red]")
    current_branch = tree
    for line in path_lines:
        tree.add(line)
    console.print(tree)
    
    # 4. Graph Quality & Governance Validation
    console.print("\n[bold yellow]4. Graph Data Quality & Governance Audit:[/bold yellow]")
    gov = kg.validate_graph_governance()
    gov_table = Table(title="Knowledge Graph Governance Report", show_header=True)
    gov_table.add_column("Metric", style="bold cyan")
    gov_table.add_column("Value", style="bold white")
    gov_table.add_row("Total Graph Nodes", str(gov["total_nodes"]))
    gov_table.add_row("Total Graph Relationships", str(gov["total_edges"]))
    gov_table.add_row("Orphan Nodes Count", str(gov["orphan_nodes_count"]))
    gov_table.add_row("Schema Violations Count", str(gov["schema_violations_count"]))
    gov_table.add_row("Governance Compliance", f"[bold green]{gov['governance_status']}[/bold green]")
    console.print(gov_table)
    
    console.print("\n[bold green]? Module 8 Execution Completed Successfully![/bold green]")

if __name__ == "__main__":
    run_module_8()
