# Module 7: Advanced RAG Patterns

## Overview
This module implements enterprise-grade Advanced Retrieval-Augmented Generation (RAG) patterns.

## Key Concepts Implemented
- **Parent-Child Retrieval**: Small child chunks for search, full parent context returned.
- **Multi-Vector Retrieval**: Encodes summaries, full text, and keywords.
- **Query Decomposition & Multi-Hop Retrieval**: Splits compound questions into discrete searches.
- **Corrective RAG (CRAG)**: Evaluates semantic relevance and activates fallback logic.
- **RAG with SQL Databases**: Integrates relational customer configuration database.
- **Knowledge-Base Lifecycle**: Supports versioning, upserting, and soft/hard deletion.
- **Semantic LRU Caching**: Optimizes retrieval speed and reduces redundancy.

## Practical
**Support-Resolution Assistant** that retrieves:
1. Product documentation
2. Similar resolved incidents
3. Known issues database
4. Customer configuration details (SQLite)

## Execution
`ash
python main.py
`
