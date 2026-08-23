# Module 10: LangChain Framework

## Overview
This module demonstrates core LangChain abstractions, LCEL (LangChain Expression Language), and production RAG/extraction workflows.

## Key Concepts Implemented
- **Core Abstractions**: Models, Runnables, Prompts, Output Parsers, Vector Stores, Chains, Tools.
- **LCEL Expressions**: Composable pipe architecture for data transformation and structured generation.
- **Document Loaders & Text Splitters**: Page-aware loading and recursive chunking with overlap.
- **Structured Pydantic Parsers**: Type-safe schema extraction from unstructured business documents.
- **Citation Attribution**: Fine-grained inline citation referencing for auditability and compliance.

## Practicals Built
1. **PDF Question-Answering Bot**: Retrieves chunked passages with page citations.
2. **Structured Invoice Extraction**: Validates and extracts typed invoices into Pydantic models.
3. **Knowledge Assistant with Source Citations**: Synthesizes verified multi-source answers with bibliographic references.

## Execution
```bash
python main.py
```
