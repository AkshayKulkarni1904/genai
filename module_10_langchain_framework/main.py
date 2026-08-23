# Module 10: LangChain Framework - Executable Runner
from pathlib import Path
from rich.console import Console
from rich.panel import Panel
from rich.table import Table

try:
    from .pdf_qa_bot import PDFQABot
    from .invoice_extractor import InvoiceExtractionLCELChain
    from .citation_knowledge_assistant import CitationKnowledgeAssistant
except ImportError:
    from pdf_qa_bot import PDFQABot
    from invoice_extractor import InvoiceExtractionLCELChain
    from citation_knowledge_assistant import CitationKnowledgeAssistant

console = Console()

def run_module_10():
    console.print(Panel.fit("[bold cyan]Module 10: LangChain Framework[/bold cyan]\n[dim]LCEL, Document Loaders, Recursive Splitters, Structured Output, Citations, Production Fallbacks[/dim]"))
    
    data_dir = Path(__file__).parent / "data"
    
    # Practical 1: PDF QA Bot
    console.print("\n[bold yellow]1. Practical 1: PDF Question-Answering Bot with Page Attribution[/bold yellow]")
    qa_bot = PDFQABot(data_dir / "cloud_architecture_whitepaper.txt")
    q1 = "What is the encryption standard for data at rest and in transit?"
    res1 = qa_bot.answer_query(q1)
    console.print(f"[bold]Query:[/bold] {q1}")
    console.print(Panel(res1["answer"], title="[bold green]PDF QA Bot Response[/bold green]", expand=False))
    
    # Practical 2: Structured Invoice Extraction
    console.print("\n[bold yellow]2. Practical 2: Structured Invoice-Extraction Workflow (Pydantic / LCEL)[/bold yellow]")
    extractor = InvoiceExtractionLCELChain()
    invoice_text = (data_dir / "sample_invoice.txt").read_text(encoding="utf-8")
    structured_inv = extractor.extract(invoice_text)
    
    inv_table = Table(title=f"Extracted Invoice: {structured_inv.invoice_number} ({structured_inv.vendor_name})", show_header=True)
    inv_table.add_column("Line Item Description", style="bold cyan")
    inv_table.add_column("Qty", justify="center")
    inv_table.add_column("Unit Price", justify="right")
    inv_table.add_column("Total Amount", justify="right", style="bold green")
    
    for item in structured_inv.line_items:
        inv_table.add_row(item.description, str(item.quantity), f"${item.unit_price:,.2f}", f"${item.amount:,.2f}")
    console.print(inv_table)
    
    console.print(f"[bold]Subtotal:[/bold] ${structured_inv.subtotal:,.2f} | [bold]Tax (8.5%):[/bold] ${structured_inv.tax_amount:,.2f} | [bold green]Grand Total:[/bold green] ${structured_inv.total_amount:,.2f}")
    
    # Practical 3: Citation Knowledge Assistant
    console.print("\n[bold yellow]3. Practical 3: Knowledge Assistant with Verifiable Citations[/bold yellow]")
    assistant = CitationKnowledgeAssistant()
    q3 = "What is the policy regarding API secrets rotation and remote work VPN?"
    res3 = assistant.ask(q3)
    console.print(f"[bold]Query:[/bold] {q3}")
    console.print(Panel(res3["answer_with_citations"], title="[bold green]Knowledge Assistant Response with Citations[/bold green]", expand=False))
    
    bib_table = Table(title="Verified Source Bibliography", show_header=True)
    bib_table.add_column("Ref Tag", style="bold magenta")
    bib_table.add_column("Document Source", style="cyan")
    bib_table.add_column("Page", style="yellow")
    bib_table.add_column("Document ID", style="white")
    
    for b in res3["citations_bibliography"]:
        bib_table.add_row(b["citation_tag"], b["document"], str(b["page"]), b["doc_id"])
    console.print(bib_table)
    
    console.print("\n[bold green]? Module 10 Execution Completed Successfully![/bold green]")

if __name__ == "__main__":
    run_module_10()
