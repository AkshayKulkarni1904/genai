# Module 13: Evaluation, Guardrails, and Production Readiness

[![Python 3.10+](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/downloads/)
[![Status](https://img.shields.io/badge/status-production--ready-brightgreen.svg)]()
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Overview

This module provides **Enterprise Evaluation, Safety Guardrails, and Production-Readiness Verification** for GenAI systems. It couples a standardized **50 Golden Business Queries benchmark** with multi-layer security guardrails (PII redaction, prompt injection defense, RBAC access gates) and quantitative metrics.

```
       [Raw User / Application Prompt]
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ Multi-Layer Production Guardrails                           │
│ ├─ PII Detector & Redactor (SSN, Email, Phone, API Keys)    │
│ ├─ Prompt Injection Defense (Jailbreaks & Instruction Drift)│
│ └─ RBAC Access Gate (Enforce Role Privileges on Documents)  │
└─────────────────────────────┬───────────────────────────────┘
                              │ [Passed Sanitization]
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ 50 Golden Business Queries Evaluation Suite                 │
│ ├─ Retrieval Precision & Recall                             │
│ ├─ Generation Faithfulness & Context Relevance              │
│ ├─ LLM-as-a-Judge Quantitative Quality Scorer (0.0 to 1.0)  │
│ └─ Failure Taxonomy Classifier (Hallucination / Miss / RBAC)│
└─────────────────────────────────────────────────────────────┘
```

---

## Key Concepts & Guardrails

1. **Golden Dataset Curation**: 50 realistic business queries covering Authentication, Billing, Infrastructure, Compliance, and Security.
2. **Quantitative Metrics**:
   - **Retrieval Precision & Recall**: Verifies that required reference documents are retrieved without extraneous noise.
   - **Faithfulness**: Measures whether synthesized statements are strictly grounded in retrieved evidence.
   - **LLM-as-a-Judge**: Evaluates semantic accuracy against reference ground truth answers.
3. **PII Masking**: Automatically detects and replaces sensitive information (`SSN`, `EMAIL`, `PHONE`, `API_KEY`) with sanitized tokens.
4. **Prompt Injection Defense**: Defends against adversarial jailbreak attempts, delimiter escaping, and instructions to override system prompts.
5. **Role-Based Access Control (RBAC)**: Enforces document-level clearance requirements (e.g., `Engineering`, `Security`, `Executive`).
6. **Failure Taxonomy**: Categorizes failed interactions into `Hallucination`, `RetrievalMiss`, `RBACAccessDenied`, or `PromptInjectionBlocked`.

---

## File Structure

```
module_13_evaluation_and_guardrails/
├── data/
│   └── golden_business_queries.json   # 50 Golden Business Queries benchmark dataset
├── eval_suite.py                      # 50 Queries Evaluation Suite & Metrics Calculator
├── guardrails.py                      # PII Redactor, Injection Defense, & RBAC Guardrails
├── metrics.py                         # Precision, Recall, Faithfulness, and LLM Judge scoring
├── main.py                            # Standalone CLI executable runner
└── README.md                          # Module documentation
```

---

## Benchmark Results (50 Golden Queries)

| Metric | Benchmark Score | Target Threshold | Status |
| :--- | :--- | :--- | :--- |
| **Pass Rate Percentage** | **90.0%** | > 85.0% | `PASS` |
| **Mean Retrieval Precision** | **1.000** | > 0.900 | `PASS` |
| **Mean Retrieval Recall** | **1.000** | > 0.900 | `PASS` |
| **Mean Faithfulness Score** | **0.724** | > 0.700 | `PASS` |
| **LLM-as-a-Judge Quality Score** | **0.956 / 1.000** | > 0.850 | `PASS` |

---

## Execution

### CLI Runner
```bash
python main.py
```

### Via Root Orchestrator
```bash
# Run from repository root:
python run_all.py 7
```

### Via Interactive Web Console
Open `http://127.0.0.1:8000` to execute live guardrail audits, test custom regex PII patterns, and run the automated 50-query evaluation benchmark suite.
