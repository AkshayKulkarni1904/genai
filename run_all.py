# Master Orchestrator: GenAI Practical Modules (1 - 13)
import sys
import subprocess
from pathlib import Path
from rich.console import Console
from rich.panel import Panel
from rich.table import Table

console = Console()
BASE = Path(__file__).parent.resolve()

MODULES = [
    ("module_01_foundations", "Module 1: Foundations of GenAI & LLMs", "LLM Parameter Engine, Sampling, Token Economics & Latency"),
    ("module_02_prompt_engineering", "Module 2: Prompt Engineering", "Few-Shot Classification, Contract Extraction, CoT Summaries & Rules"),
    ("module_03_llm_apis", "Module 3: Using LLM APIs in Programming", "Resilient Client, Failover Fallbacks, Tool Calling & Streaming"),
    ("module_04_direct_api_vs_langchain", "Module 4: Direct APIs vs LangChain", "Side-by-Side Document Q&A Benchmark & Trade-off Matrix"),
    ("module_05_embeddings_and_vector_search", "Module 5: Embeddings & Vector Search", "Chunking Strategies, Multi-Metric Vector Search & Hybrid RRF"),
    ("module_06_rag_foundations", "Module 6: Retrieval-Augmented Generation", "Conversational RAG, Query Rewriting, Multi-Tenant RBAC & Citations"),
    ("module_07_advanced_rag", "Module 7: Advanced RAG Patterns", "Support-Resolution Assistant with Multi-Source Retrieval"),
    ("module_08_knowledge_graph", "Module 8: Knowledge Graph Fundamentals", "IT Support Graph Modeling & Cypher Traversal"),
    ("module_09_graph_rag", "Module 9: GraphRAG", "4-Step Incident Resolution GraphRAG Workflow"),
    ("module_10_langchain_framework", "Module 10: LangChain Framework", "PDF QA Bot, Invoice Extractor, & Citation Assistant"),
    ("module_11_langgraph_framework", "Module 11: LangGraph Framework", "Stateful Support Workflow with ServiceNow & HITL Escalation"),
    ("module_12_multi_agent_systems", "Module 12: Agents & Multi-Agent Systems", "Supervisor-Worker 5-Specialist Incident Resolution"),
    ("module_13_evaluation_and_guardrails", "Module 13: Evaluation & Guardrails", "50 Business Queries Evaluation Suite & Security Filters")
]

def run_single_module(module_dir: str, title: str, practical: str, python_exe: str):
    console.print(f"\n{'='*75}")
    console.print(f"[bold cyan]EXECUTING {title}[/bold cyan]")
    console.print(f"[yellow]Practical:[/yellow] {practical}")
    console.print(f"{'='*75}\n")
    
    mod_path = BASE / module_dir / "main.py"
    res = subprocess.run([python_exe, str(mod_path)], cwd=str(BASE / module_dir))
    if res.returncode != 0:
        console.print(f"[bold red]✘ Error executing {title}[/bold red]")
        return False
    return True

def main():
    python_exe = sys.executable
    console.print(Panel.fit(
        "[bold green]Enterprise GenAI Practical Engineering Repository[/bold green]\n"
        "[dim]Complete Curriculum Modules 1 - 13 End-to-End Orchestration Suite[/dim]\n"
        f"[dim]Python Environment: {python_exe}[/dim]"
    ))

    table = Table(title="GenAI Practical Modules Portfolio (Modules 1 - 13)", show_lines=True)
    table.add_column("No.", style="bold cyan", width=4)
    table.add_column("Module Name", style="bold white", width=42)
    table.add_column("Core Practical Project", style="yellow")
    
    for idx, (dir_name, title, practical) in enumerate(MODULES, 1):
        table.add_row(str(idx), title, practical)
    table.add_row("14", "[bold magenta]Interactive Enterprise Web Console[/bold magenta]", "Launch Modern Web UI for all 13 modules (http://127.0.0.1:8000)")
    console.print(table)

    if len(sys.argv) > 1:
        choice = sys.argv[1]
        if choice == "14" or choice.lower() == "ui":
            console.print("\n[bold magenta]Launching Enterprise Web Console...[/bold magenta]")
            ui_server_path = BASE / "ui_server.py"
            subprocess.run([python_exe, str(ui_server_path)])
            return
        try:
            mod_idx = int(choice) - 1
            if 0 <= mod_idx < len(MODULES):
                dir_name, title, practical = MODULES[mod_idx]
                run_single_module(dir_name, title, practical, python_exe)
                return
        except ValueError:
            pass

    console.print("\n[bold yellow]Running All 13 Modules Sequentially...[/bold yellow]\n")
    results = {}
    for dir_name, title, practical in MODULES:
        success = run_single_module(dir_name, title, practical, python_exe)
        results[title] = success

    console.print(f"\n{'='*75}")
    console.print("[bold green]ALL MODULES (1 - 13) EXECUTION SUMMARY[/bold green]")
    console.print(f"{'='*75}")
    
    summary_table = Table(show_header=True)
    summary_table.add_column("Module", style="bold cyan")
    summary_table.add_column("Status", justify="center")
    
    all_ok = True
    for title, ok in results.items():
        status_str = "[bold green]PASS[/bold green]" if ok else "[bold red]FAIL[/bold red]"
        if not ok:
            all_ok = False
        summary_table.add_row(title, status_str)
        
    console.print(summary_table)
    if all_ok:
        console.print("\n[bold green]✔ All 13 Modules Executed and Verified Successfully![/bold green]")
    else:
        console.print("\n[bold red]✘ Some modules encountered issues.[/bold red]")

if __name__ == "__main__":
    main()
