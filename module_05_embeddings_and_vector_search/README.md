# Module 5: Embeddings and Vector Search

## Overview
This module explores dense vector representation, semantic geometric spaces, chunking algorithms, similarity distance metrics, and hybrid search ranking.

## Core Capabilities
1. **Chunking Strategies**:
   - Fixed length chunking with sliding character overlap.
   - Recursive character chunking respecting natural paragraph/sentence boundaries.
   - Document-aware markdown sectioning.
2. **Similarity Metrics**:
   - Cosine Similarity (angle between normalized vectors).
   - Dot Product (magnitude and direction).
   - Euclidean Distance L2 (geometric distance in feature space).
3. **Hybrid Search**:
   - Dense semantic vector search blended with Sparse BM25 keyword matching via Reciprocal Rank Fusion (RRF).
4. **Metadata Filtering**:
   - Pre-filtering and post-filtering by organizational department, access tier, document type, and effective dates.
