# Module 11: LangGraph Framework

[![Python 3.10+](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/downloads/)
[![Status](https://img.shields.io/badge/status-production--ready-brightgreen.svg)]()
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Overview

This module demonstrates cyclical, stateful agent orchestration using **LangGraph** architectural primitives. Moving beyond linear DAGs, LangGraph enables state machines with conditional routing, tool calling, memory checkpoints, and Human-in-the-Loop (HITL) interruptibility.

```
                    ┌─────────────────────────┐
                    │      [START NODE]       │
                    │   Intent Classifier     │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │ ServiceNow Lookup Tool  │
                    │  (Fetch Ticket Meta)    │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │   RAG Retrieval Node    │
                    │ (Fetch Relevant SOPs)   │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │ Resolution Synthesizer  │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │  Confidence Evaluator   │
                    └────┬───────────────┬────┘
                         │               │
        [Score >= 0.75]  │               │ [Score < 0.75]
                         ▼               ▼
            ┌──────────────────┐   ┌───────────────────────┐
            │  [AUTO_RESOLVED] │   │ [HUMAN_IN_THE_LOOP]   │
            │ Update Ticket &  │   │ Checkpoint State &    │
            │ Notify Customer  │   │ Escalate to L2 Senior │
            └──────────────────┘   └───────────────────────┘
```

---

## Key Architectural Concepts

1. **Why LangGraph Exists**: Overcomes linear chain limitations by supporting cyclic execution, self-correction loops, and conditional decision points.
2. **State Management (`TypedState`)**: Immutable central state tracking customer ticket details, execution trace, tool outputs, and confidence metrics.
3. **Nodes & Edges**: Granular functional nodes connected by deterministic and conditional routing edges.
4. **Tool Calling**: Integration with ServiceNow Table API mock and RAG playbook retrieval engines.
5. **Human-in-the-Loop (HITL)**: Safe escalation gates where the workflow pauses, checkpoints state, and routes to human support engineers when LLM confidence falls below a set threshold.

---

## File Structure

```
module_11_langgraph_framework/
├── state.py                      # Strongly typed state definition (TypedState, TicketSchema, Trace)
├── tools.py                      # ServiceNow Table API tool & RAG Playbook tool
├── support_graph_workflow.py     # Practical: IT Support StateGraph with HITL escalation
├── main.py                       # Standalone CLI executable runner
└── README.md                     # Module documentation
```

---

## Graph Node Pipeline

| Node | Input State | Action / Tool Invoked | Output State Transition |
| :--- | :--- | :--- | :--- |
| `classify_intent` | Raw ticket query | Categorizes into Infrastructure, Auth, or Database | Sets `intent_category` |
| `servicenow_lookup` | Ticket ID | Queries ServiceNow Table API | Injects ticket priority & tenant context |
| `rag_retrieval` | Intent + Ticket | Searches verified technical playbooks | Populates `retrieved_playbooks` |
| `synthesize_resolution`| Playbooks + Context | Synthesizes remediation plan | Generates `proposed_resolution` |
| `evaluate_confidence` | Resolution score | Checks against `confidence_threshold` | Routes to Auto-Resolve or Human Queue |

---

## Execution

### CLI Runner
```bash
python main.py
```

### Via Root Orchestrator
```bash
# Run from repository root:
python run_all.py 5
```

### Via Interactive Web Console
Open `http://127.0.0.1:8000` to trigger the LangGraph workflow, customize confidence thresholds, and inspect real-time execution node traces and HITL escalations.
