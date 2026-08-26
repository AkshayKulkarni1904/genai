# Module 12: Multi-Agent Systems & Architectures

[![Python 3.10+](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/downloads/)
[![Status](https://img.shields.io/badge/status-production--ready-brightgreen.svg)]()
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Overview

This module demonstrates enterprise **Autonomous and Semi-Autonomous Multi-Agent Systems** orchestrated via a **Supervisor-Worker design pattern** with a **Shared Blackboard State**. It assigns specialized personas to solve high-severity production incidents with strict safety boundaries and audit verification.

```
                      ┌──────────────────────────┐
                      │    Supervisor Agent      │
                      │ (Orchestrator & Router)  │
                      └────────────┬─────────────┘
                                   │
       ┌───────────────────────────┼───────────────────────────┐
       ▼                           ▼                           ▼
┌──────────────┐            ┌──────────────┐            ┌──────────────┐
│ Triage Agent │            │  RCA Agent   │            │ Escalation   │
│ (P1 Severity │            │  (Telemetry  │            │ (Briefing &  │
│ & Blast Rad) │            │  & Causal)   │            │ Stakeholders)│
└──────────────┘            └──────────────┘            └──────────────┘
       │                           │                           │
       └───────────────────────────┼───────────────────────────┘
                                   │
                                   ▼
                      ┌──────────────────────────┐
                      │  Shared Blackboard State │
                      │   (Audit Trail & Memory) │
                      └────────────┬─────────────┘
                                   │
       ┌───────────────────────────┴───────────────────────────┐
       ▼                                                       ▼
┌──────────────────────────────┐                ┌──────────────────────────────┐
│  Knowledge Retrieval Agent   │                │ Resolution Validator Agent   │
│  (SOP & Runbook Search)      │                │ (Safety, Rollback, Approval) │
└──────────────────────────────┘                └──────────────────────────────┘
```

---

## Key Architectural Patterns

1. **Supervisor-Worker Architecture**: The supervisor decomposes complex incident reports and delegates subtasks to autonomous worker agents.
2. **Shared Blackboard Pattern**: Agents communicate by reading and writing to a synchronized blackboard rather than direct, uncoordinated peer-to-peer messaging.
3. **Specialist Personas**:
   - `TriageAgent`: Assesses severity (P1-Critical to P4-Low), calculates blast radius, and sets SLA timers.
   - `KnowledgeRetrievalAgent`: Searches runbooks, architectural docs, and verified post-mortems.
   - `RootCauseAnalysisAgent`: Analyzes error telemetry and isolates underlying causal mechanisms.
   - `ResolutionValidationAgent`: Validates proposed fixes against safety rules, rollback feasibility, and change-management policies.
   - `HumanSupportEscalationAgent`: Compiles executive briefings and notifies stakeholder channels (PagerDuty, Slack, StatusPage).
4. **Safety Boundaries & Human Oversight**: Critical actions (e.g., database schema changes, cluster restarts) require pre-execution validation before enactment.

---

## File Structure

```
module_12_multi_agent_systems/
├── agents/
│   ├── escalation_agent.py       # Stakeholder communication & executive briefing generator
│   ├── rca_agent.py              # Telemetry & causal root cause analysis agent
│   ├── retrieval_agent.py        # Knowledge base & runbook search agent
│   ├── triage_agent.py           # Severity & blast-radius assessment agent
│   └── validator_agent.py        # Safety validation & rollback plan verification agent
├── supervisor.py                 # Supervisor Orchestrator and Shared Blackboard implementation
├── main.py                       # Standalone CLI executable runner
└── README.md                     # Module documentation
```

---

## Execution

### CLI Runner
```bash
python main.py
```

### Via Root Orchestrator
```bash
# Run from repository root:
python run_all.py 6
```

### Via Interactive Web Console
Access `http://127.0.0.1:8000` to launch the multi-agent incident solver, monitor each specialist's output in real time, and inspect the shared blackboard state.
