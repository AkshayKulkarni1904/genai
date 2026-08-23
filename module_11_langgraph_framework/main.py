# Module 11: LangGraph Framework - Executable Runner
from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from rich.tree import Tree

try:
    from .support_graph_workflow import SupportAgentStateGraph
except ImportError:
    from support_graph_workflow import SupportAgentStateGraph

console = Console()

def run_module_11():
    console.print(Panel.fit("[bold cyan]Module 11: LangGraph Framework[/bold cyan]\n[dim]Stateful Agent Workflows, Nodes, Conditional Routing, ServiceNow Tool, Human Escalation[/dim]"))
    
    workflow = SupportAgentStateGraph(confidence_threshold=0.75)
    
    # Scenario A: High Confidence -> Auto-Resolution Path
    console.print("\n[bold yellow]Scenario A: High Confidence Incident (Auto-Resolution Path)[/bold yellow]")
    state_a = workflow.run(
        ticket_id="INC-10091",
        query="Payment ingress pod in CrashLoopBackOff with OOMKilled code 137 error"
    )
    
    trace_tree_a = Tree(f"[bold green]StateGraph Execution Trace: {state_a.ticket_id} (Status: {state_a.status})[/bold green]")
    for step in state_a.execution_trace:
        trace_tree_a.add(step)
    console.print(trace_tree_a)
    
    console.print(Panel(
        f"[bold]Caller:[/bold] {state_a.servicenow_data['caller']} | [bold]CI:[/bold] {state_a.servicenow_data['cmdb_ci']}\n"
        f"[bold]Confidence:[/bold] {state_a.confidence_score:.2f} (Threshold: 0.75)\n\n"
        f"[bold green]Proposed Resolution:[/bold green]\n{state_a.proposed_resolution}",
        title="[bold green]Automated Resolution Approved[/bold green]",
        expand=False
    ))
    
    # Scenario B: Low Confidence -> Human-in-the-loop Escalation Path
    console.print("\n[bold yellow]Scenario B: Ambiguous Incident (Human Escalation Path & Interrupt)[/bold yellow]")
    state_b = workflow.run(
        ticket_id="INC-10092",
        query="Salesforce OAuth sync returned unexpected 998 code and connection drop",
        human_override="Senior SRE reviewed token logs: Discovered tenant secret expiration; manually renewed certificate."
    )
    
    trace_tree_b = Tree(f"[bold magenta]StateGraph Execution Trace: {state_b.ticket_id} (Status: {state_b.status})[/bold magenta]")
    for step in state_b.execution_trace:
        trace_tree_b.add(step)
    console.print(trace_tree_b)
    
    console.print(Panel(
        f"[bold]Caller:[/bold] {state_b.servicenow_data['caller']} | [bold]CI:[/bold] {state_b.servicenow_data['cmdb_ci']}\n"
        f"[bold]Confidence Score:[/bold] [bold red]{state_b.confidence_score:.2f}[/bold red] (Below threshold: 0.75)\n"
        f"[bold]Escalation Group:[/bold] {state_b.servicenow_data['assignment_group']}\n\n"
        f"[bold yellow]Human-in-the-Loop Engineer Action:[/bold yellow]\n{state_b.human_feedback}",
        title="[bold red]Human Escalation & Interrupt Triggered[/bold red]",
        expand=False
    ))
    
    console.print("\n[bold green]? Module 11 Execution Completed Successfully![/bold green]")

if __name__ == "__main__":
    run_module_11()
