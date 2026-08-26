# Module 10: LangChain Framework

[![Python 3.10+](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/downloads/)
[![Pydantic v2](https://img.shields.io/badge/Pydantic-v2.0+-green.svg)](https://docs.pydantic.dev/)
[![Status](https://img.shields.io/badge/status-production--ready-brightgreen.svg)]()
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Overview

This module demonstrates core **LangChain abstractions**, **LangChain Expression Language (LCEL)**, and production extraction/RAG pipelines. It showcases how to build composable, auditable, and type-safe LLM applications using modern pipe syntax (`chain = prompt | model | parser`).

```
                ┌───────────────────────────────────┐
                │ LangChain Expression Language     │
                │ (LCEL Composable Pipeline)        │
                └─────────────────┬─────────────────┘
                                  │
      ┌───────────────────────────┼───────────────────────────┐
      ▼                           ▼                           ▼
[Practical 1: PDF QA Bot]  [Practical 2: Invoices]  [Practical 3: Citations]
- Page-aware chunking      - Pydantic schema parse  - Inline numbered tags [1]
- Exact page attribution   - Line item extraction   - Full bibliography
- Multi-query synthesis    - Currency/Tax validation- Audit provenance
```

---

## Core Abstractions Implemented

1. **Models & Runnables**: Standardized interface supporting sync, async, and streaming transformations.
2. **LCEL Pipes**: Composable chains chaining Prompts, Document Loaders, Splitters, Models, and Structured Parsers.
3. **Recursive Document Splitters**: Page-aware chunking preserving paragraph boundaries and configurable token overlap.
4. **Pydantic Structured Parsers**: Guaranteed schema validation transforming unstructured text directly into strongly-typed objects (`Invoice`, `LineItem`, `Vendor`).
5. **Citation Attribution**: Fine-grained inline citation referencing for auditability, regulatory compliance, and hallucination reduction.

---

## File Structure

```
module_10_langchain_framework/
├── data/
│   ├── cloud_architecture_whitepaper.txt   # Enterprise enterprise cloud architecture whitepaper
│   └── sample_invoice.txt                  # Realistic enterprise vendor invoices
├── citation_knowledge_assistant.py         # Practical 3: Verifiable Citation Assistant
├── invoice_extractor.py                    # Practical 2: Structured Invoice Extraction Chain
├── pdf_qa_bot.py                           # Practical 1: PDF QA Bot with Page Attribution
├── main.py                                 # Standalone CLI executable runner
└── README.md                               # Module documentation
```

---

## Practical Implementations

### 1. PDF QA Bot with Page Attribution (`pdf_qa_bot.py`)
Loads multi-page technical whitepapers, chunks text with page metadata, retrieves relevant context, and generates comprehensive answers that attribute every claim to specific document pages.

### 2. Structured Invoice-Extraction Chain (`invoice_extractor.py`)
Parses messy raw text invoices into validated Pydantic models with typed fields for `invoice_number`, `vendor_name`, `line_items`, `tax_amount`, and `total_amount`.

### 3. Knowledge Assistant with Source Citations (`citation_knowledge_assistant.py`)
Synthesizes answers across disparate technical documents, embeds inline numeric citation markers `[1]`, `[2]`, and compiles an exact bibliography.

---

## Execution

### CLI Runner
```bash
python main.py
```

### Via Root Orchestrator
```bash
# Run from repository root:
python run_all.py 4
```

### Via Interactive Web Console
Navigate to `http://127.0.0.1:8000` to test the PDF QA Bot, run structured invoice parsing with sample invoices, and test verifiable citation generation.
