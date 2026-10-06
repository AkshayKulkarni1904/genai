# Module 3: Using LLM APIs in Programming - Terminal Runner
from rich.console import Console
from rich.panel import Panel
from rich.table import Table
try:
    from .api_client import ResilientLLMClient
except ImportError:
    from api_client import ResilientLLMClient

console = Console()

def run_module_3():
    console.print(Panel.fit(
        "[bold cyan]Module 3: Using LLM APIs in Programming[/bold cyan]\n"
        "[dim]Resilience, Fallbacks, Function Calling, Streaming, Safe Memory & Telemetry[/dim]"
    ))

    client = ResilientLLMClient(primary_model="gemini-1.5-pro", fallback_model="gpt-4o-mini")

    # 1. Standard Function Calling API Request
    console.print("\n[bold yellow]1. Function / Tool Calling Dispatch:[/bold yellow]")
    query_1 = "Check current status of the redis-cache cluster in us-east-1."
    console.print(f"[bold]User Prompt:[/bold] {query_1}")
    res1 = client.execute_with_resilience(query_1)
    
    t1_table = Table(title="Tool Calling Execution & Output", show_lines=True)
    t1_table.add_column("Parameter", style="bold green", width=22)
    t1_table.add_column("Value", style="white")
    t1_table.add_row("Model Used", res1.model_used)
    t1_table.add_row("Tool Dispatched", res1.tool_executed.get("tool_called") if res1.tool_executed else "None")
    t1_table.add_row("Structured Result", str(res1.structured_data))
    t1_table.add_row("Assistant Summary", res1.output_text)
    console.print(t1_table)

    # 2. Resilience: Primary Model Failure & Failover Fallback
    console.print("\n[bold yellow]2. Resilience & Fallback Failover (Simulating Primary Model RateLimit/Error):[/bold yellow]")
    query_2 = "What is our projected cloud budget next quarter if spend increases by 15%?"
    console.print(f"[bold]User Prompt:[/bold] {query_2}")
    res2 = client.execute_with_resilience(query_2, simulate_primary_failure=True)
    
    t2_table = Table(title="Failover Execution Telemetry", show_lines=True)
    t2_table.add_column("Metric", style="bold cyan", width=22)
    t2_table.add_column("Telemetry Value", style="yellow")
    for k, v in res2.telemetry.items():
        t2_table.add_row(k, str(v))
    console.print(t2_table)

    # 3. Streaming Response Simulator
    console.print("\n[bold yellow]3. Real-Time Token Delta Streaming Simulation:[/bold yellow]")
    stream_chunks = list(client.stream_completion("Explain streaming"))
    console.print(f"Total Stream Chunks: [bold green]{len(stream_chunks)}[/bold green]")
    console.print(f"[dim]Final Stream Content:[/dim] {stream_chunks[-1]['accumulated_text']}")

    # 4. Safe Conversation Memory Status
    console.print("\n[bold yellow]4. Conversation Memory Tracking:[/bold yellow]")
    console.print(f"Active Turns in Buffer: [bold green]{len(client.memory.messages)}[/bold green]")
    console.print(f"Active Memory Tokens: [bold green]{client.memory.current_tokens()}[/bold green] / {client.memory.max_token_budget}")

    console.print("\n[bold green][PASS] Module 3 Execution Completed Successfully![/bold green]")

if __name__ == "__main__":
    run_module_3()
