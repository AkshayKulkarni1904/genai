# Module 12: Agents and Multi-Agent Systems

## Overview
This module demonstrates autonomous and semi-autonomous multi-agent systems using a Supervisor-Worker design pattern.

## Key Concepts Implemented
- **Agent vs. Workflow**: When to use deterministic graphs vs. emergent multi-agent reflection.
- **Supervisor-Worker Architecture**: Centralized supervisor delegating work to autonomous specialist agents.
- **Shared State vs. Isolated Memory**: Blackboard state pattern enabling safe context exchange.
- **Specialist Agent Personas**:
  1. `TriageAgent`: Severity classification & blast-radius estimation.
  2. `KnowledgeRetrievalAgent`: SOP and historical playbook search.
  3. `RootCauseAnalysisAgent`: Causal inference and telemetry analysis.
  4. `ResolutionValidationAgent`: Safety rules, rollback validation, and policy compliance.
  5. `HumanSupportEscalationAgent`: Executive briefing generation and stakeholder communication.
- **Safety Boundaries & Enterprise Accountability**: Pre-execution verification barriers to prevent uncontrolled autonomous actions.

## Practical
**Multi-Agent Incident-Resolution System** coordinating 5 specialist agents to diagnose, validate, and escalate high-severity production incidents.

## Execution
```bash
python main.py
```
