# Module 7: Advanced RAG Patterns - Executable Runner
import json
from pathlib import Path
from rich.console import Console
from rich.panel import Panel
from rich.table import Table
try:
    from .support_assistant import SupportResolutionAssistant
except ImportError:
    from support_assistant import SupportResolutionAssistant

console = Console()

def run_module_7():
    console.print(Panel.fit("[bold cyan]Module 7: Advanced RAG Patterns[/bold cyan]\n[dim]Parent-Child, Multi-Vector, CRAG, SQL RAG, Caching, Lifecycle[/dim]"))
    
    data_dir = Path(__file__).parent / "data"
    assistant = SupportResolutionAssistant(data_dir=data_dir)
    
    test_query = "Users getting ERR_TOKEN_EXPIRED error 4012 when logging into Okta SSO and clock skew issue"
    customer_id = "CUST-1001"
    
    console.print(f"\n[bold yellow]1. Resolving Customer Ticket:[/bold yellow] {customer_id}")
    console.print(f"[bold]Query:[/bold] {test_query}\n")
    
    result = assistant.resolve_ticket(customer_id=customer_id, user_query=test_query)
    
    table = Table(title="Support-Resolution Assistant Multi-Source Retrieval", show_lines=True)
    table.add_column("Retrieval Component", style="bold green", width=25)
    table.add_column("Retrieved Evidence / Data", style="white")
    
    table.add_row("Query Decomposition", json.dumps(result["sub_queries"]))
    
    cfg = result["customer_config"]
    table.add_row("Customer SQL Config", f"Company: {cfg['company_name']} | Tier: {cfg['tier']} | Provider: {cfg['sso_provider']} | Skew: {cfg['clock_skew_seconds']}s")
    
    if result["retrieved_documentation"]:
        doc = result["retrieved_documentation"][0]
        table.add_row("Product Documentation (Parent-Child)", f"[{doc['parent_id']}] {doc['title']}\nMatched Chunk: {doc['matched_child_chunk']}\nFull Context: {doc['content']}")
    
    if result["similar_resolved_incidents"]:
        inc = result["similar_resolved_incidents"][0]
        table.add_row("Resolved Incident (Multi-Vector)", f"[{inc['doc_id']}] Blended Score: {inc['blended_score']}\nContent: {inc['content']}")
        
    if result["known_issues"]:
        ki = result["known_issues"][0]
        table.add_row("Known Issues Database", f"[{ki['issue_id']}] {ki['title']}\nWorkaround: {ki['workaround']}")
        
    table.add_row("Corrective RAG Status", f"[bold cyan]{result['crag_status']}[/bold cyan]")
    
    console.print(table)
    
    console.print(Panel(result["synthesized_resolution"], title="[bold green]Synthesized Support Resolution[/bold green]", expand=False))
    
    console.print("\n[bold yellow]2. Performance & Caching Verification:[/bold yellow]")
    cached_result = assistant.resolve_ticket(customer_id=customer_id, user_query=test_query)
    console.print(f"Cache Hit: [bold green]{cached_result.get('from_cache')}[/bold green] (Hits: {assistant.cache.hits}, Misses: {assistant.cache.misses})")
    
    console.print("\n[bold yellow]3. KB Lifecycle Management (Versioning & Soft-Delete):[/bold yellow]")
    msg1 = assistant.kb_manager.upsert_document("DOC-AUTH-101", "SSO Guide", "Updated content for v3.5", "v3.5")
    console.print(f"Upsert: [green]{msg1}[/green]")
    msg2 = assistant.kb_manager.delete_document("DOC-AUTH-101", hard=False)
    console.print(f"Delete: [yellow]{msg2}[/yellow]")
    
    console.print("\n[bold green]? Module 7 Execution Completed Successfully![/bold green]")

if __name__ == "__main__":
    run_module_7()
