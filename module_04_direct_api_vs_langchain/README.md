# Module 4: When to Use Direct LLM API Calls vs LangChain

## Overview
This module conducts an objective, data-driven engineering comparison between implementing GenAI workflows using Direct LLM API calls versus using the LangChain abstraction framework.

## Trade-off Dimensions
1. **Direct API Calls**:
   - Best when: building high-throughput microservices, single-step tasks (classifiers, summarizers), latency-sensitive paths, or when maximum control and minimal dependency churn are required.
   - Advantages: Zero framework overhead, transparent native Python stack traces, simple unit testing.
2. **LangChain Framework**:
   - Best when: building multi-step chains, connecting disparate vector databases/loaders, experimenting with multiple model providers, or rapid enterprise prototyping.
   - Advantages: Standardized components (LCEL), broad ecosystem of 100+ connectors, built-in LangSmith tracing.
3. **Avoid LangChain When**:
   - The workflow is small enough to write directly.
   - Abstractions obscure performance bottlenecks and complicate debugging.
