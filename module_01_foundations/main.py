# Module 1: Foundations of Generative AI and LLMs - Terminal Runner
from rich.console import Console
from rich.panel import Panel
from rich.table import Table
try:
    from .llm_simulator import LLMParameterEngine, ModelCatalog
except ImportError:
    from llm_simulator import LLMParameterEngine, ModelCatalog

console = Console()

def run_module_1():
    console.print(Panel.fit(
        "[bold cyan]Module 1: Foundations of Generative AI and LLMs[/bold cyan]\n"
        "[dim]Tokens, Context Windows, Temperature, Hallucination, Economics & Latency[/dim]"
    ))

    engine = LLMParameterEngine()
    test_prompt = "Explain how high-availability Kubernetes ingress controllers handle SSL termination."

    console.print(f"\n[bold yellow]1. Experimenting with Inference Temperature & Determinism:[/bold yellow]")
    console.print(f"[bold]Input Prompt:[/bold] {test_prompt}\n")

    temp_experiments = [
        (0.0, 1.0, "Greedy / Deterministic Decoding"),
        (0.7, 0.9, "Balanced Enterprise Generation"),
        (1.4, 0.95, "High-Stochasticity / Creative")
    ]

    t_table = Table(title="Parameter Impact on Determinism & Hallucination Risk", show_lines=True)
    t_table.add_column("Config", style="bold green", width=22)
    t_table.add_column("Hallucination Risk", style="bold red", width=25)
    t_table.add_column("Output Preview", style="white")

    for temp, top_p, desc in temp_experiments:
        res = engine.generate(test_prompt, model_name="gemini-1.5-pro", temperature=temp, top_p=top_p)
        t_table.add_row(
            f"Temp: {temp}\nTop-P: {top_p}\n[dim]{desc}[/dim]",
            res["reliability_and_safety"]["hallucination_risk"],
            res["generated_text"][:120] + "..."
        )
    console.print(t_table)

    console.print(f"\n[bold yellow]2. Enterprise Model Catalog & Economic Trade-off Matrix:[/bold yellow]")
    cat_table = Table(title="Cross-Model Context Windows, Latency & Pricing", show_lines=True)
    cat_table.add_column("Model Name", style="bold cyan")
    cat_table.add_column("Architecture Type", style="yellow")
    cat_table.add_column("Context Window", justify="right")
    cat_table.add_column("Cost / 1M In", justify="right")
    cat_table.add_column("Cost / 1M Out", justify="right")
    cat_table.add_column("P50 Latency", justify="right")

    for name, data in ModelCatalog.MODELS.items():
        cat_table.add_row(
            name,
            data["type"],
            f"{data['context_window']:,} tokens",
            f"${data['cost_per_million_input']:.2f}",
            f"${data['cost_per_million_output']:.2f}",
            f"{data['latency_p50_ms']} ms"
        )
    console.print(cat_table)

    console.print(f"\n[bold yellow]3. Grounding Verification (Grounded vs Ungrounded):[/bold yellow]")
    doc_context = "Enterprise SLA Section 4.2: SSL termination must be performed on dedicated Envoy reverse proxies with TLS 1.3 only."
    grounded_res = engine.generate(test_prompt, model_name="gemini-1.5-pro", grounding_context=doc_context)
    console.print(Panel(
        f"[bold]Grounding Score:[/bold] {grounded_res['reliability_and_safety']['grounding_score']}\n"
        f"[bold]Hallucination Risk:[/bold] {grounded_res['reliability_and_safety']['hallucination_risk']}\n"
        f"[bold]Generated Response:[/bold] {grounded_res['generated_text']}",
        title="[bold green]Grounded Enterprise Generation[/bold green]"
    ))

    console.print("\n[bold green][PASS] Module 1 Execution Completed Successfully![/bold green]")

if __name__ == "__main__":
    run_module_1()
