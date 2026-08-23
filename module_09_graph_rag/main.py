# Module 9: GraphRAG - Executable Runner
from pathlib import Path
from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from rich.tree import Tree

try:
    from .incident_graphrag_pipeline import IncidentGraphRAGPipeline
except ImportError:
    from incident_graphrag_pipeline import IncidentGraphRAGPipeline

console = Console()

def run_module_9():
    console.print(Panel.fit("[bold cyan]Module 9: GraphRAG[/bold cyan]\n[dim]Vector RAG vs GraphRAG, Multi-Hop Reasoning, Local/Global Search, Provenance[/dim]"))
    
    # Comparison Table: Vector RAG vs GraphRAG
    table_comp = Table(title="Capability Comparison: Vector RAG vs. GraphRAG", show_lines=True)
    table_comp.add_column("Capability", style="bold cyan")
    table_comp.add_column("Vector RAG", style="white")
    table_comp.add_column("GraphRAG", style="bold green")
    table_comp.add_column("Enterprise Advantage", style="yellow")
    
    table_comp.add_row("Finds similar text", "Strong", "Strong (Combined)", "Hybrid lexical & dense search")
    table_comp.add_row("Handles relationships", "Limited", "Strong", "Captures transitive dependencies")
    table_comp.add_row("Multi-hop reasoning", "Weak", "Strong", "Follows N-degree causal paths")
    table_comp.add_row("Root-cause analysis", "Limited", "Strong", "Traces failures to upstream assets")
    table_comp.add_row("Evidence & Provenance", "Document-level", "Graph + Document", "Explicit verifiable chain of custody")
    table_comp.add_row("Best for", "FAQ and document Q&A", "Connected Decisions", "ITSM, Outages, Policy & Risk")
    console.print(table_comp)
    
    # Practical Execution: 4-Step Incident Resolution Workflow
    console.print("\n[bold yellow]Executing Practical: 4-Step Incident Resolution GraphRAG Workflow[/bold yellow]")
    
    data_dir = Path(__file__).parent / "data"
    pipeline = IncidentGraphRAGPipeline(data_dir=data_dir)
    
    incident = {
        "product": "Checkout API",
        "error_code": "ERR_VPC_MTU_DROP",
        "customer": "FinTech Prime Corp",
        "environment": "Production AWS East (VPC-East)",
        "symptom": "HTTP 504 Gateway Timeouts during payment payload transmission"
    }
    
    res = pipeline.execute_incident_resolution_workflow(incident)
    
    # Step 1 Display
    s1 = res["step_1_identification"]
    console.print(Panel(
        f"[bold]Product:[/bold] {s1['product']} | [bold]Error Code:[/bold] {s1['error_code']}\n"
        f"[bold]Customer:[/bold] {s1['customer']} | [bold]Environment:[/bold] {s1['environment']}\n"
        f"[bold]Symptom:[/bold] {s1['reported_symptom']}",
        title="[bold cyan]Step 1: Incident Identity & Context Extraction[/bold cyan]"
    ))
    
    # Step 2 Display
    s2 = res["step_2_retrieved_knowledge"]
    s2_table = Table(title="Step 2: Retrieved Articles & Global Community Context", show_header=True)
    s2_table.add_column("Type", style="bold magenta")
    s2_table.add_column("Source / Community", style="cyan")
    s2_table.add_column("Snippet / Summary", style="white")
    
    for doc in s2["matched_articles"]:
        s2_table.add_row("Article (Vector)", f"[{doc['doc_id']}] {doc['title']}", doc["content"][:120] + "...")
    for comm in s2["community_context"]:
        s2_table.add_row("Community (Global)", comm["community"], comm["summary"][:120] + "...")
    console.print(s2_table)
    
    # Step 3 Display
    s3 = res["step_3_dependency_traversal"]
    tree = Tree("[bold cyan]Step 3: Dependency Graph Traversal & Failure Path Traversed[/bold cyan]")
    tree.add(f"Root Node: [bold yellow]{s3['entity']}[/bold yellow] ({s3['entity_details'].get('name')})")
    for p in s3["traversed_paths"]:
        tree.add(f"Path: [green]{' '.join(p)}[/green]")
    console.print(tree)
    
    # Step 4 Display
    s4 = res["step_4_recommendation"]
    console.print(Panel(
        s4["recommendation"],
        title="[bold green]Step 4: Recommended Resolution & Evidence Provenance[/bold green]"
    ))
    
    console.print("\n[bold green]? Module 9 Execution Completed Successfully![/bold green]")

if __name__ == "__main__":
    run_module_9()
