# Enterprise GenAI Practical Engineering Repository

This repository contains a comprehensive practical codebase spanning **Modules 7 through 13** of the GenAI Engineering curriculum. Every module is structured in serial order, includes all required theoretical concepts, contains realistic enterprise test fixtures, and features a complete end-to-end practical project.

All projects share a common Python virtual environment located in the root `genai/venv` folder.

---

## Repository Structure

```
genai/
??? venv/                                   # Root shared Python virtual environment
??? requirements.txt                        # Unified production dependencies
??? run_all.py                              # Master CLI orchestrator (runs all modules)
??? setup_env.ps1                           # PowerShell activation and launch script
??? README.md                               # Master architectural guide
?
??? module_07_advanced_rag/                 # Module 7: Advanced RAG Patterns
?   ??? data/                               # Product docs, resolved incidents, known issues, SQLite DB
?   ??? rag_components.py                   # Parent-child, multi-vector, query decomposition, CRAG, caching
?   ??? support_assistant.py                # Practical: Support-Resolution Assistant
?   ??? main.py                             # Executable runner
?   ??? README.md
?
??? module_08_knowledge_graph/              # Module 8: Knowledge Graph Fundamentals
?   ??? data/                               # IT Support Graph JSON dataset
?   ??? schema.py                           # Ontology, taxonomy, canonical identifiers & entity resolution
?   ??? it_support_graph.py                 # Practical: IT Support Graph & Cypher Query Engine
?   ??? main.py                             # Executable runner
?   ??? README.md
?
??? module_09_graph_rag/                    # Module 9: GraphRAG
?   ??? data/                               # Incident corpus and dependency graph datasets
?   ??? graph_extractor.py                  # Entity/relation extraction & community summarizer
?   ??? hybrid_retriever.py                 # Vector + Graph Traversal + SQL metadata retriever
?   ??? incident_graphrag_pipeline.py       # Practical: 4-Step Incident Resolution GraphRAG Pipeline
?   ??? main.py                             # Executable runner
?   ??? README.md
?
??? module_10_langchain_framework/          # Module 10: LangChain Framework
?   ??? data/                               # Sample whitepaper text & sample invoices
?   ??? pdf_qa_bot.py                       # Practical 1: PDF QA Bot with Page Attribution
?   ??? invoice_extractor.py                # Practical 2: Structured Invoice-Extraction LCEL Chain
?   ??? citation_knowledge_assistant.py     # Practical 3: Knowledge Assistant with Source Citations
?   ??? main.py                             # Executable runner
?   ??? README.md
?
??? module_11_langgraph_framework/          # Module 11: LangGraph Framework
?   ??? state.py                            # TypedState, memory checkpoints, and ticket schema
?   ??? tools.py                            # ServiceNow Table API & RAG playbook tools
?   ??? support_graph_workflow.py           # Practical: Stateful Support Agent StateGraph (HITL)
?   ??? main.py                             # Executable runner
?   ??? README.md
?
??? module_12_multi_agent_systems/          # Module 12: Agents and Multi-Agent Systems
?   ??? agents/                             # Triage, Retrieval, RCA, Validator, Escalation agents
?   ??? supervisor.py                       # Supervisor-Worker Orchestrator & Shared Blackboard
?   ??? main.py                             # Executable runner
?   ??? README.md
?
??? module_13_evaluation_and_guardrails/    # Module 13: Evaluation, Guardrails, and Production Readiness
    ??? data/                               # 50 Golden Business Queries Dataset
    ??? guardrails.py                       # PII redactor, prompt injection defense, RBAC, fallbacks
    ??? metrics.py                          # Precision, Recall, Faithfulness, LLM Judge scorer
    ??? eval_suite.py                       # Practical: 50 Business Queries Evaluation Suite
    ??? main.py                             # Executable runner
    ??? README.md
```

---

## Quickstart & Execution

### 1. Launch Interactive Enterprise Web Console (Recommended)
You can launch the full-featured, modern Web UI to interactively test, visualize, and inspect all 7 modules:

```powershell
# Option A: PowerShell Launcher
.\start_ui.ps1

# Option B: Windows Command Prompt Launcher
.\start_ui.bat

# Option C: Direct Python Server Launch
.\venv\Scripts\python.exe ui_server.py --port 8000

# Option D: Via Master CLI Orchestrator
.\venv\Scripts\python.exe run_all.py 8
```
Once started, navigate to **http://127.0.0.1:8000** in your browser.

### 2. Execute All Modules via CLI
```powershell
# From C:\Users\Akshay\.gemini\antigravity\scratch\genai
.\venv\Scripts\python.exe run_all.py
```

### 3. Execute a Single Module via CLI
```powershell
# Run Module 7
.\venv\Scripts\python.exe run_all.py 1

# Or run directly inside the module directory
cd module_07_advanced_rag
..\venv\Scripts\python.exe main.py
```

---

## Detailed Module Summary

| Module | Core Concepts Covered | Practical Implementation |
| :--- | :--- | :--- |
| **Module 7: Advanced RAG Patterns** | Parent-child chunks, multi-vector representations, query decomposition, corrective RAG (CRAG), SQL integration, semantic LRU caching, KB lifecycle. | **Support-Resolution Assistant** resolving enterprise customer tickets across product docs, resolved incidents, known issues, and SQLite configs. |
| **Module 8: Knowledge Graph Fundamentals** | Graph primitives (nodes, edges, labels), ontology vs. taxonomy, entity resolution & canonical IDs, Cypher query patterns, graph governance. | **IT Support Graph** connecting Users, Devices, Apps, Incidents, Known Errors, Teams, and Resolutions with causal path traversal. |
| **Module 9: GraphRAG** | Vector vs. GraphRAG, multi-hop reasoning, entity extraction, community summaries, hybrid retrieval, explainability & provenance. | **4-Step Incident Resolution GraphRAG Pipeline** (Identity -> Retrieve -> Traverse -> Recommend with Evidence). |
| **Module 10: LangChain Framework** | Models, Runnables, LCEL pipes, recursive splitters, Pydantic structured output parsers, citation chains. | **Three Practicals**: PDF QA bot with page citations, structured invoice extraction, and verifiable citation assistant. |
| **Module 11: LangGraph Framework** | Stateful graphs, TypedState, conditional edge routing, tool calling, memory checkpoints, human-in-the-loop (HITL) escalation. | **Stateful Support Agent Workflow** with Intent Classifier, ServiceNow tool, RAG retrieval, and confidence-gated human escalation. |
| **Module 12: Agents & Multi-Agent Systems** | Supervisor-worker architecture, specialist agent personas, shared blackboard state, safety boundaries, reflection. | **Multi-Agent Incident-Resolution System** coordinating Triage, Retrieval, RCA, Validator, and Escalation agents. |
| **Module 13: Evaluation & Guardrails** | 50 golden queries, Precision/Recall/Faithfulness metrics, LLM-as-a-judge, PII redaction, prompt injection defense, RBAC access filter. | **50 Business Queries Evaluation Suite** computing aggregate quality scores, pass/fail metrics, and failure taxonomy distributions. |
