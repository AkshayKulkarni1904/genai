# Module 5: Embeddings and Vector Search - Terminal Runner
from rich.console import Console
from rich.panel import Panel
from rich.table import Table
try:
    from .vector_engine import PolicySemanticSearchEngine, TextChunker, POLICY_DOCUMENTS
except ImportError:
    from vector_engine import PolicySemanticSearchEngine, TextChunker, POLICY_DOCUMENTS

console = Console()

def run_module_5():
    console.print(Panel.fit(
        "[bold cyan]Module 5: Embeddings, Vector Search & Hybrid Retrieval[/bold cyan]\n"
        "[dim]Chunking Strategies, Cosine/Dot/L2 Metrics, Metadata Filtering & BM25 Fusion[/dim]"
    ))

    # 1. Chunking Comparison
    console.print("\n[bold yellow]1. Chunking Strategies Demonstration:[/bold yellow]")
    sample_text = POLICY_DOCUMENTS[0]["content"]
    fixed_chunks = TextChunker.fixed_length_chunk(sample_text, chunk_size=80, overlap=15)
    rec_chunks = TextChunker.recursive_character_chunk(sample_text, chunk_size=100, overlap=20)
    
    console.print(f"Original Text Length: [bold]{len(sample_text)} characters[/bold]")
    console.print(f"Fixed Length Chunks (size=80, ov=15): [bold green]{len(fixed_chunks)} chunks[/bold green]")
    console.print(f"Recursive Character Chunks (size=100, ov=20): [bold green]{len(rec_chunks)} chunks[/bold green]")

    # 2. Semantic Search with Multiple Similarity Metrics
    search_engine = PolicySemanticSearchEngine()
    test_query = "What is the policy for encrypting laptop storage and corporate VPN for remote employees?"
    console.print(f"\n[bold yellow]2. Multi-Metric Vector Search & Hybrid Ranking:[/bold yellow]")
    console.print(f"[bold]Query:[/bold] {test_query}\n")

    results = search_engine.search(test_query, top_k=3, hybrid=True)

    res_table = Table(title="Semantic & Hybrid Search Results", show_lines=True)
    res_table.add_column("Doc ID & Title", style="bold cyan", width=26)
    res_table.add_column("Department / Type", style="white", width=18)
    res_table.add_column("Cosine Sim", justify="right")
    res_table.add_column("Euclidean L2", justify="right")
    res_table.add_column("BM25 Keyword", justify="right")
    res_table.add_column("Hybrid Score", style="bold green", justify="right")

    for r in results:
        res_table.add_row(
            f"[{r['doc_id']}]\n{r['title']}",
            f"{r['department']}\n({r['document_type']})",
            str(r["cosine_similarity"]),
            str(r["euclidean_distance"]),
            str(r["sparse_keyword_score"]),
            str(r["hybrid_rrf_score"])
        )
    console.print(res_table)

    # 3. Metadata Filtering
    console.print(f"\n[bold yellow]3. Metadata Filtering (Restricting to Security Dept, Access Level <= 3):[/bold yellow]")
    filtered_results = search_engine.search(test_query, department_filter="Security", max_access_level=3, top_k=2)
    
    fil_table = Table(title="Filtered Retrieval Results", show_lines=True)
    fil_table.add_column("Doc ID", style="bold yellow")
    fil_table.add_column("Title", style="white")
    fil_table.add_column("Department", style="magenta")
    fil_table.add_column("Access Level", justify="center")
    fil_table.add_column("Cosine Sim", style="bold green", justify="right")

    for fr in filtered_results:
        fil_table.add_row(fr["doc_id"], fr["title"], fr["department"], f"Level {fr['access_level']}", str(fr["cosine_similarity"]))
    console.print(fil_table)

    console.print("\n[bold green][PASS] Module 5 Execution Completed Successfully![/bold green]")

if __name__ == "__main__":
    run_module_5()
