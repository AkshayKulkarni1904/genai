# Module 12: Multi-Agent Systems - Executable Runner
from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from rich.tree import Tree

try:
    from .supervisor import MultiAgentIncidentSupervisor
except ImportError:
    from supervisor import MultiAgentIncidentSupervisor

console = Console()

def run_module_12():
    console.print(Panel.fit("[bold cyan]Module 12: Agents and Multi-Agent Systems[/bold cyan]\n[dim]Supervisor-Worker Architecture, Specialist Personas, Shared Blackboard, Validation Boundaries[/dim]"))
    
    raw_incident = {
        "incident_id": "INC-CRIT-992",
        "title": "Global Checkout Latency Surge & Connection Starvation",
        "description": "Critical outage on production payment checkout. Latency spiked to 4500ms. High 500 errors.",
        "impacted_users": 12500,
        "environment": "AWS us-east-1",
        "telemetry_logs": ["REDIS_OOM_WARN", "CONN_POOL_EXHAUSTED", "HTTP_500_SURGE"]
    }
    
    console.print(f"\n[bold yellow]Incoming Production Incident:[/bold yellow] [bold]{raw_incident['incident_id']} - {raw_incident['title']}[/bold]")
    console.print(f"Impacted Users: [bold red]{raw_incident['impacted_users']:,}[/bold red] | Environment: {raw_incident['environment']}\n")
    
    supervisor = MultiAgentIncidentSupervisor()
    result = supervisor.resolve_incident(raw_incident)
    
    # 1. Multi-Agent Collaboration Trace
    log_tree = Tree("[bold green]Supervisor Multi-Agent Coordination Pipeline[/bold green]")
    for log_item in result["execution_log"]:
        log_tree.add(log_item)
    console.print(log_tree)
    
    # 2. Specialist Findings Table
    spec_table = Table(title="Specialist Agent Outcomes & Delegated Responsibilities", show_lines=True)
    spec_table.add_column("Agent Persona", style="bold cyan", width=24)
    spec_table.add_column("Delegated Role", style="yellow", width=28)
    spec_table.add_column("Key Output / Assessment", style="white")
    
    t = result["triage"]
    spec_table.add_row(t["agent"], "Severity & SLA Triage", f"Severity: [bold red]{t['severity']}[/bold red]\nTarget SLA: {t['sla_target_minutes']}m | Blast: {t['blast_radius']}")
    
    r = result["retrieval"]
    spec_table.add_row(r["agent"], "Historical SOP Retrieval", f"Retrieved: {r['retrieved_sources'][0]['id']} ({r['retrieved_sources'][0]['title']})\nConfidence: {r['confidence']}")
    
    rca = result["rca"]
    spec_table.add_row(rca["agent"], "Causal Investigation", f"Primary Failure: {rca['primary_asset_failure']}\nMechanism: {rca['causal_mechanism'][:100]}...")
    
    v = result["validator"]
    spec_table.add_row(v["agent"], "Safety & Policy Auditor", f"Verdict: [bold green]{v['verdict']}[/bold green]\nDowntime Req: {v['safety_checklist']['requires_downtime']} | Data Loss Risk: {v['safety_checklist']['data_loss_risk']}")
    
    esc = result["escalation"]
    spec_table.add_row(esc["agent"], "Stakeholder Escalation", f"Channels: {', '.join(esc['channels_notified'])}")
    
    console.print(spec_table)
    
    # 3. Executive Briefing
    console.print(Panel(
        esc["executive_briefing"],
        title="[bold green]Executive Incident Briefing & Stakeholder Dispatch[/bold green]",
        expand=False
    ))
    
    console.print("\n[bold green]? Module 12 Execution Completed Successfully![/bold green]")

if __name__ == "__main__":
    run_module_12()
