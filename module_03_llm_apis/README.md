# Module 3: Using LLM APIs in Programming

## Overview
This module demonstrates enterprise-grade programming with Large Language Model APIs, focusing on resilience, rate limiting, tool calling, token management, and observability.

## Key Capabilities
1. **Resilience & Fallback**: Automatic retries with exponential backoff and transparent failover from primary frontier models to cost-efficient backup models.
2. **Function & Tool Calling**: Exposing external business logic tools with automatic argument parsing and result reintegration.
3. **Streaming Responses**: Chunk-by-chunk delta generation to minimize Time-to-First-Token (TTFT).
4. **Safe Conversation Memory**: Budgeted sliding-window memory that prevents context-window overflow while preserving system instructions.
5. **Telemetry & Observability**: Granular audit logging of request IDs, latency (ms), input/output tokens, and financial cost in USD.
