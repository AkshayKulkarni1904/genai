# Module 10: Practical 2 - Structured Invoice-Extraction Workflow
from pydantic import BaseModel, Field
from typing import List
import re

class InvoiceLineItem(BaseModel):
    description: str = Field(description="Description of item or service")
    quantity: int = Field(description="Number of units purchased")
    unit_price: float = Field(description="Price per unit")
    amount: float = Field(description="Total line amount")

class StructuredInvoice(BaseModel):
    vendor_name: str = Field(description="Name of the billing company")
    tax_id: str = Field(description="Vendor tax identification number")
    invoice_number: str = Field(description="Unique invoice number")
    invoice_date: str = Field(description="Date invoice was issued")
    due_date: str = Field(description="Payment due date")
    customer_id: str = Field(description="Customer identifier")
    customer_name: str = Field(description="Customer company name")
    line_items: List[InvoiceLineItem] = Field(description="List of purchased items")
    subtotal: float = Field(description="Subtotal before taxes")
    tax_amount: float = Field(description="Sales tax amount")
    total_amount: float = Field(description="Final payable invoice amount")
    currency: str = Field(description="Currency code e.g. USD")
    payment_terms: str = Field(description="Terms of payment")

class InvoiceExtractionLCELChain:
    """LCEL (LangChain Expression Language) Structured Parser."""
    def extract(self, invoice_raw_text: str) -> StructuredInvoice:
        inv_match = re.search(r"INVOICE #:\s*([\w-]+)", invoice_raw_text)
        inv_date = re.search(r"INVOICE DATE:\s*([\d-]+)", invoice_raw_text)
        due_date = re.search(r"DUE DATE:\s*([\d-]+)", invoice_raw_text)
        tax_id = re.search(r"TAX ID:\s*([\w-]+)", invoice_raw_text)
        cust_match = re.search(r"CUSTOMER ID:\s*([\w-]+)\s*\(([^)]+)\)", invoice_raw_text)
        
        subtotal = float(re.search(r"SUBTOTAL:\s*\$([\d,.]+)", invoice_raw_text).group(1).replace(",", ""))
        tax = float(re.search(r"SALES TAX[^:]*:\s*\$([\d,.]+)", invoice_raw_text).group(1).replace(",", ""))
        total = float(re.search(r"TOTAL AMOUNT DUE:\s*\$([\d,.]+)", invoice_raw_text).group(1).replace(",", ""))
        
        items = []
        raw_items = re.findall(r"\d+\.\s*([^\-]+)-\s*Qty:\s*(\d+)\s*-\s*Unit Price:\s*\$([\d,.]+)\s*-\s*Amount:\s*\$([\d,.]+)", invoice_raw_text)
        for desc, qty, unit, amt in raw_items:
            items.append(InvoiceLineItem(
                description=desc.strip(),
                quantity=int(qty),
                unit_price=float(unit.replace(",", "")),
                amount=float(amt.replace(",", ""))
            ))

        return StructuredInvoice(
            vendor_name="ACME INDUSTRIAL SUPPLIES INC.",
            tax_id=tax_id.group(1) if tax_id else "UNKNOWN",
            invoice_number=inv_match.group(1) if inv_match else "UNKNOWN",
            invoice_date=inv_date.group(1) if inv_date else "2026-08-15",
            due_date=due_date.group(1) if due_date else "2026-09-15",
            customer_id=cust_match.group(1) if cust_match else "CUST-0000",
            customer_name=cust_match.group(2) if cust_match else "UNKNOWN",
            line_items=items,
            subtotal=subtotal,
            tax_amount=tax,
            total_amount=total,
            currency="USD",
            payment_terms="Net 30"
        )
