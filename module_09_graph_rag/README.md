# Module 9: GraphRAG

## Overview
This module demonstrates Graph-Augmented Generation (GraphRAG) for resolving complex multi-hop enterprise incidents.

## Key Concepts Implemented
- **Vector RAG vs. GraphRAG**: Comparative analysis and hybrid unification.
- **Entity & Relation Extraction**: Automatic extraction from raw operational text.
- **Community Detection & Summaries**: Global hierarchical graph summaries for thematic context.
- **Local & Global Search**: Combining granular entity neighborhood traversals with macro community insights.
- **Hybrid Retrieval**: Unifying vector search + graph paths + SQL parameters.
- **Explainability & Provenance**: Explicit chain of custody linking decisions to graph topological paths.

## Practical
**Incident Resolution GraphRAG Workflow**:
1. Identify product, error code, customer, and environment.
2. Retrieve related incidents and knowledge articles.
3. Traverse dependencies and known failure patterns.
4. Recommend resolution with linked evidence and provenance.

## Execution
`ash
python main.py
`
