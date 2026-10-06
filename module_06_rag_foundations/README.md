# Module 6: Retrieval-Augmented Generation (RAG)

## Overview
This module demonstrates enterprise standard Retrieval-Augmented Generation (RAG) covering end-to-end ingestion and query pipelines, conversational multi-turn query reformulation, strict source citations, multi-tenant RBAC filtering, and hallucination circuit-breakers.

## Core Capabilities
1. **Pipeline Architecture**: Ingestion (load, split, enrich, embed, index) and Querying (reformulate, retrieve, rerank, synthesize, cite).
2. **Conversational RAG**: Coreference resolution and query rewriting across conversational context turns.
3. **Multi-Tenant RBAC Security**: Strict document-level permission verification before any text chunks enter the LLM context.
4. **Source Attribution & Grounding**: Generating verifiable citation tags linked to exact document IDs and grounding snippets.
5. **Quality Metrics**: Automated measurement of Faithfulness, Context Recall, and Answer Relevance.
