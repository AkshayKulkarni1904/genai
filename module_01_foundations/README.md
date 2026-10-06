# Module 1: Foundations of Generative AI and LLMs

## Overview
This module explores the core mechanics of Large Language Models (LLMs), autoregressive token generation, parameter behavior, and enterprise operational tradeoffs.

## Core Concepts Covered
1. **Autoregressive Text Generation**: Next-token prediction conditioned on context.
2. **Tokenization & Context Windows**: Byte Pair Encoding (BPE), token economics, and context saturation.
3. **Sampling Parameters**:
   - `temperature`: Controls entropy (0.0 for deterministic greedy decoding, >1.0 for high randomness).
   - `top_p` (Nucleus Sampling): Cumulative probability cutoff for candidate tokens.
   - `max_tokens`: Enforces strict generation caps.
4. **Reliability & Hallucination**: Impact of external grounding context vs parametric memory.
5. **Model Categorization**: Frontier hosted, open-weights (Llama), reasoning models (o1), and small language models (Phi-3.5).
6. **Enterprise Economics**: Latency (p50/p99 ms), throughput (tokens/sec), and token cost per million.
