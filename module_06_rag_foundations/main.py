# Module 6: Retrieval-Augmented Generation (RAG) - Terminal Runner
from rich.console import Console
from rich.panel import Panel
from rich.table import Table
try:
    from .enterprise_rag import EnterpriseKnowledgeRAGAssistant
except ImportError:
    from enterprise_rag import EnterpriseKnowledgeRAGAssistant

console = Console()

def run_module_6():
    console.print(Panel.fit(
        "[bold cyan]Module 6: Retrieval-Augmented Generation (RAG)[/bold cyan]\n"
        "[dim]Ingestion/Query Pipelines, Citations, Multi-Tenant RBAC & Conversational Rewriting[/dim]"
    ))

    rag = EnterpriseKnowledgeRAGAssistant()

    # 1. Multi-turn Conversational RAG with Query Rewriting
    console.print("\n[bold yellow]1. Multi-Turn Conversational RAG & Coreference Rewriting:[/bold yellow]")
    history = [{"role": "user", "content": "What is the parental leave duration for employees?"}]
    follow_up = "What about sabbatical leave tenure?"
    console.print(f"[bold]Turn 1 User Query:[/bold] {history[0]['content']}")
    console.print(f"[bold]Turn 2 Follow-Up:[/bold] {follow_up}\n")

    res = rag.ask(follow_up, user_role="EMPLOYEE", conversation_history=history)

    console.print(f"Rewritten Standalone Query: [bold cyan]{res['rewritten_query']}[/bold cyan]")
    console.print(Panel(res["answer"], title="[bold green]Grounded Answer with Source Citations[/bold green]"))

    c_table = Table(title="Retrieved Citations & Source Evidence", show_lines=True)
    c_table.add_column("Citation Tag", style="bold green", width=18)
    c_table.add_column("Document ID & Title", style="bold cyan", width=25)
    c_table.add_column("Grounding Passage", style="white")

    for c in res["citations"]:
        c_table.add_row(c["citation_tag"], f"{c['doc_id']}\n{c['title']}", c["evidence"])
    console.print(c_table)

    # 2. Multi-Tenant RBAC Document Level Permissions
    console.print("\n[bold yellow]2. Multi-Tenant RBAC Enforcement (Employee vs HR_Admin):[/bold yellow]")
    confidential_query = "What is the executive bonus clawback policy and stock vesting cliff?"
    
    # Try with standard EMPLOYEE role
    emp_res = rag.ask(confidential_query, user_role="EMPLOYEE")
    console.print(f"[bold]Query:[/bold] {confidential_query}")
    console.print(f"Role [bold yellow]EMPLOYEE[/bold yellow] Result:")
    console.print(f"Grounded: {emp_res['is_grounded']} | RBAC Denied Docs: {emp_res['rbac_denied_documents']}")
    console.print(f"Response: [dim]{emp_res['answer']}[/dim]\n")

    # Try with HR_ADMIN role
    admin_res = rag.ask(confidential_query, user_role="HR_ADMIN")
    console.print(f"Role [bold green]HR_ADMIN[/bold green] Result:")
    console.print(f"Grounded: {admin_res['is_grounded']} | Citations: {[c['citation_tag'] for c in admin_res['citations']]}")
    console.print(f"Response: {admin_res['answer']}")

    # 3. RAG Quality Evaluation Metrics
    console.print("\n[bold yellow]3. RAG Performance & Quality Evaluation Metrics:[/bold yellow]")
    m_table = Table(title="RAG Evaluation Metrics", show_lines=True)
    m_table.add_column("Evaluation Metric", style="bold magenta", width=22)
    m_table.add_column("Score", style="bold green", justify="center")
    m_table.add_column("Benchmark Target", style="white", justify="center")

    for metric, score in admin_res["evaluation_metrics"].items():
        m_table.add_row(metric.replace("_", " ").title(), str(score), ">= 0.90")
    console.print(m_table)

    console.print("\n[bold green][PASS] Module 6 Execution Completed Successfully![/bold green]")

if __name__ == "__main__":
    run_module_6()
