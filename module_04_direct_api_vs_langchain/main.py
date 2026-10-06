# Module 4: When to Use Direct LLM API Calls vs LangChain - Terminal Runner
from rich.console import Console
from rich.panel import Panel
from rich.table import Table
try:
    from .comparator import ArchitecturalComparator
except ImportError:
    from comparator import ArchitecturalComparator

console = Console()

def run_module_4():
    console.print(Panel.fit(
        "[bold cyan]Module 4: Direct LLM API Calls vs LangChain Framework[/bold cyan]\n"
        "[dim]Architectural Trade-offs, Latency Overhead, Stack Depth, Debuggability & Decision Matrix[/dim]"
    ))

    comparator = ArchitecturalComparator()
    test_query = "What are the RPO and RTO objectives for disaster recovery failover?"

    console.print(f"\n[bold yellow]1. Executing Side-by-Side Document Q&A Comparison:[/bold yellow]")
    console.print(f"[bold]Query:[/bold] {test_query}\n")

    res = comparator.run_side_by_side_comparison(test_query)

    exec_table = Table(title="Runtime Execution Metrics Comparison", show_lines=True)
    exec_table.add_column("Evaluation Dimension", style="bold cyan", width=24)
    exec_table.add_column("Direct API Call", style="bold green", width=25)
    exec_table.add_column("LangChain (LCEL)", style="yellow", width=25)

    d_api = res["direct_api_result"]
    lc_res = res["langchain_result"]

    exec_table.add_row("Execution Latency", f"{d_api['latency_ms']} ms", f"{lc_res['latency_ms']} ms ({res['latency_overhead_percent']})")
    exec_table.add_row("Stack Trace Depth", f"{d_api['stack_depth']} frames (Clean native)", f"{lc_res['stack_depth']} frames (Nested wrappers)")
    exec_table.add_row("Third-Party Dependencies", str(d_api["dependencies_count"]), str(lc_res["dependencies_count"]))
    exec_table.add_row("Debugging Traceability", d_api["traceability"], lc_res["traceability"])
    exec_table.add_row("Synthesized Answer", d_api["answer"], lc_res["answer"])
    console.print(exec_table)

    console.print(f"\n[bold yellow]2. Architectural Decision Matrix & Trade-off Framework:[/bold yellow]")
    dec_table = Table(title="When to Choose Direct API vs LangChain", show_lines=True)
    dec_table.add_column("Engineering Dimension", style="bold magenta", width=24)
    dec_table.add_column("Direct API Calls", style="white", width=26)
    dec_table.add_column("LangChain Framework", style="white", width=26)
    dec_table.add_column("Recommended Verdict", style="bold cyan", width=22)

    for row in res["decision_framework"]:
        dec_table.add_row(row["dimension"], row["direct_api"], row["langchain"], row["verdict"])
    console.print(dec_table)

    console.print(Panel(
        f"[bold]Guiding Architectural Rule:[/bold]\n{res['summary_recommendation']}",
        title="[bold green]Executive Architecture Verdict[/bold green]"
    ))

    console.print("\n[bold green][PASS] Module 4 Execution Completed Successfully![/bold green]")

if __name__ == "__main__":
    run_module_4()
