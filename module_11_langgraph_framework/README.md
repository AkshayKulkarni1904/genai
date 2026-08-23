# Module 11: LangGraph Framework

## Overview
This module demonstrates cyclical, stateful agent orchestration with LangGraph architectural primitives.

## Key Concepts Implemented
- **Why LangGraph Exists**: Overcoming linear DAG limitations with state machines, loops, and conditional branches.
- **Stateful Workflows**: Centralized TypedState tracking ticket parameters, execution traces, and memory checkpoints.
- **Nodes & Edges**: Distinct functional processing steps connected via deterministic and conditional transitions.
- **Tool Calling**: Integration with enterprise ServiceNow Table API and RAG Playbook retrievers.
- **Confidence Evaluator**: Conditional edge routing based on statistical confidence scores.
- **Human-in-the-Loop (HITL)**: Interruptible execution checkpoints and human escalation handoffs.

## Practical
**IT Support Agent StateGraph**:
1. Intent Classifier Node
2. ServiceNow Ticket Lookup Tool
3. RAG Retrieval Node
4. Resolution Recommendation Node
5. Confidence Evaluator (Auto-Resolve vs. Escalation)
6. Human Escalation & Interrupt Path

## Execution
```bash
python main.py
```
