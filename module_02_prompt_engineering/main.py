# Module 2: Prompt Engineering - Terminal Runner
from rich.console import Console
from rich.panel import Panel
from rich.table import Table
try:
    from .prompt_engine import PromptEngineeringEngine
except ImportError:
    from prompt_engine import PromptEngineeringEngine

console = Console()

def run_module_2():
    console.print(Panel.fit(
        "[bold cyan]Module 2: Prompt Engineering & Reusable Templates[/bold cyan]\n"
        "[dim]Zero-shot, Few-shot, CoT, Structured JSON Schemas, Defense & Prompt Evaluation[/dim]"
    ))

    engine = PromptEngineeringEngine()

    # 1. Customer Support Ticket Classification
    console.print("\n[bold yellow]1. Customer Support Ticket Classification (Few-Shot Prompting):[/bold yellow]")
    ticket_id = "TCK-8812"
    raw_text = "Urgent: Production Kafka cluster broker 3 connection timed out, microservices getting 503."
    t_res = engine.execute_ticket_classification(ticket_id, raw_text, few_shot=True)
    
    t_table = Table(title="Support Ticket Classification Result", show_lines=True)
    t_table.add_column("Field", style="bold green", width=22)
    t_table.add_column("Extracted Value", style="white")
    
    for k, v in t_res["classification"].items():
        t_table.add_row(k, str(v))
    console.print(t_table)
    console.print(f"[dim]Evaluation Status:[/dim] [bold green]{t_res['evaluation']['evaluation_status']}[/bold green] (Adherence: {t_res['evaluation']['adherence_score'] * 100}%)")

    # 2. Contract Data Extraction
    console.print("\n[bold yellow]2. Contract Data Extraction (Structured Schema Enforcement):[/bold yellow]")
    sample_contract = (
        "This Master Services Agreement is entered into by Acme Cloud Technologies Inc. and Global Logistics Partners LLC "
        "effective April 1, 2026. The total aggregate liability of either party shall not exceed $2,500,000 USD. "
        "Either party may terminate upon 30 days prior written notice."
    )
    c_res = engine.execute_contract_extraction(sample_contract)
    c_table = Table(title="Structured Contract Schema Extraction", show_lines=True)
    c_table.add_column("Contract Clause", style="bold cyan", width=25)
    c_table.add_column("Extracted Data", style="yellow")
    for k, v in c_res["extracted_contract_data"].items():
        c_table.add_row(k, str(v))
    console.print(c_table)

    # 3. Meeting Summary Generation
    console.print("\n[bold yellow]3. Meeting Summary Generation (Chain-of-Thought Synthesis):[/bold yellow]")
    m_res = engine.execute_meeting_summary(
        title="Q3 GenAI Platform Architecture Review",
        date="2026-10-05",
        transcript="Discussed GraphRAG migration, Pydantic schemas, and golden dataset evaluation."
    )
    console.print(Panel(
        f"[bold]Executive Summary:[/bold]\n{m_res['summary']['executive_summary']}\n\n"
        f"[bold]Action Items:[/bold]\n" +
        "\n".join([f"- {a['task']} -> Owner: {a['owner']} (Due: {a['deadline']})" for a in m_res['summary']['action_items']]),
        title="[bold green]Chain-of-Thought Executive Synthesis[/bold green]"
    ))

    # 4. Business Rule Validation
    console.print("\n[bold yellow]4. Business Rule Validation (Automated Policy Compliance):[/bold yellow]")
    rules = "Policy: All software procurement exceeding $50,000 requires CFO approval. Vendors must be verified."
    req = "Purchase request: $75,000 for CloudCluster Pro from unverified vendor CloudSphere Logistics."
    b_res = engine.execute_business_rule_validation(rules, req)
    
    b_table = Table(title="Policy Rule Audit Verdict", show_lines=True)
    b_table.add_column("Audit Metric", style="bold magenta", width=22)
    b_table.add_column("Assessment", style="white")
    val = b_res["validation_result"]
    b_table.add_row("Policy Name", val["rule_name"])
    b_table.add_row("Compliance Status", "[bold red]NON-COMPLIANT[/bold red]" if not val["is_compliant"] else "[bold green]COMPLIANT[/bold green]")
    b_table.add_row("Violations Identified", "\n".join(val["violations"]))
    b_table.add_row("Recommendation", val["recommendation"])
    console.print(b_table)

    console.print("\n[bold green][PASS] Module 2 Execution Completed Successfully![/bold green]")

if __name__ == "__main__":
    run_module_2()
