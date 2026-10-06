# Module 4: When to Use Direct LLM API Calls vs LangChain
import time
import inspect
import sys
from typing import Dict, Any, List, Tuple
from pydantic import BaseModel

SAMPLE_DOCUMENT = """ACME ENTERPRISE IT INFRASTRUCTURE WHITE-PAPER 2026:
Section 1: Data Ingestion & Streaming
The enterprise data platform ingests streaming events from Apache Kafka clusters running across three availability zones.
Target sustained throughput is 250,000 events/second with p99 latency strictly under 15ms.

Section 2: High Availability & Disaster Recovery
Failover between primary AWS us-east-1 and secondary AWS us-west-2 regions is automated via Route 53 latency routing.
RPO (Recovery Point Objective) is 0 seconds due to synchronous database replication.
RTO (Recovery Time Objective) is strictly under 120 seconds.

Section 3: Security & Encryption Standards
All data at rest is encrypted using customer-managed KMS keys with AES-256-GCM.
Data in transit enforces TLS 1.3 with mandatory mTLS (Mutual TLS) on all internal service mesh communications.
"""

class DirectAPIDocumentQA:
    """Direct Python + LLM API implementation: Minimal dependencies, transparent stack, zero overhead."""
    def __init__(self, doc_text: str):
        self.doc_text = doc_text

    def answer_query(self, query: str) -> Dict[str, Any]:
        start = time.perf_counter()
        # Direct keyword / section matching
        query_words = set(query.lower().split())
        best_section = ""
        max_score = 0
        for section in self.doc_text.split("\n\n"):
            score = sum(1 for w in query_words if w in section.lower())
            if score > max_score:
                max_score = score
                best_section = section

        # Direct prompt payload
        prompt = (
            f"You are an enterprise system assistant. Ground your answer strictly in the context.\n"
            f"Context:\n{best_section}\n\nQuestion: {query}\nAnswer:"
        )

        # Direct API call simulation
        simulated_api_time = 0.045
        time.sleep(simulated_api_time)
        answer = f"According to Section 2, RPO is 0 seconds and RTO is under 120 seconds." if "rpo" in query.lower() or "rto" in query.lower() else f"Direct answer extracted from section: {best_section[:80]}..."
        
        elapsed_ms = round((time.perf_counter() - start) * 1000, 2)
        stack_depth = len(inspect.stack())

        return {
            "implementation": "Direct API Calls",
            "answer": answer,
            "latency_ms": elapsed_ms,
            "stack_depth": stack_depth,
            "dependencies_count": 0,
            "traceability": "High (Transparent line-by-line debugging)",
            "context_used": best_section[:100] + "..."
        }


class LangChainDocumentQA:
    """LangChain LCEL Pipeline Implementation: Abstractions, runnables, output parsers."""
    def __init__(self, doc_text: str):
        self.doc_text = doc_text
        # Simulated LCEL runnable pipeline
        self.chain_name = "RunnableSequence: DocumentLoader | RecursiveSplitter | PromptTemplate | ChatModel | StrOutputParser"

    def answer_query(self, query: str) -> Dict[str, Any]:
        start = time.perf_counter()
        
        # Abstraction simulation: Ingestion -> Prompt -> Model -> OutputParser
        simulated_pipeline_time = 0.078
        time.sleep(simulated_pipeline_time)
        
        answer = f"According to Section 2, RPO is 0 seconds and RTO is under 120 seconds." if "rpo" in query.lower() or "rto" in query.lower() else f"LangChain synthesized response based on retriever."
        
        elapsed_ms = round((time.perf_counter() - start) * 1000, 2)
        # LangChain pipelines typically traverse 15-25 wrapper stack frames
        stack_depth = len(inspect.stack()) + 12

        return {
            "implementation": "LangChain Framework (LCEL)",
            "answer": answer,
            "latency_ms": elapsed_ms,
            "stack_depth": stack_depth,
            "dependencies_count": 5,
            "traceability": "Moderate (Requires LangSmith for nested runnable tracing)",
            "chain_pipeline": self.chain_name
        }


class ArchitecturalComparator:
    """Evaluates and compares Direct API vs LangChain implementations side-by-side."""
    def __init__(self, document_text: str = SAMPLE_DOCUMENT):
        self.direct_qa = DirectAPIDocumentQA(document_text)
        self.langchain_qa = LangChainDocumentQA(document_text)

    def run_side_by_side_comparison(self, query: str) -> Dict[str, Any]:
        direct_res = self.direct_qa.answer_query(query)
        lc_res = self.langchain_qa.answer_query(query)

        latency_diff_pct = round(((lc_res["latency_ms"] - direct_res["latency_ms"]) / direct_res["latency_ms"]) * 100, 1)

        decision_framework = [
            {
                "dimension": "Code Clarity & Simplicity",
                "direct_api": "Explicit, zero magic, self-contained functions",
                "langchain": "Declarative LCEL expressions, requires learning framework DSL",
                "verdict": "Direct API for simple flows; LangChain for multi-step pipelines"
            },
            {
                "dimension": "Execution Latency & Overhead",
                "direct_api": f"{direct_res['latency_ms']} ms (Direct socket/HTTP call)",
                "langchain": f"{lc_res['latency_ms']} ms (+{latency_diff_pct}% abstraction overhead)",
                "verdict": "Direct API wins for high-throughput microservices"
            },
            {
                "dimension": "Stack Depth & Debuggability",
                "direct_api": f"{direct_res['stack_depth']} frames (Clean native Python stack trace)",
                "langchain": f"{lc_res['stack_depth']} frames (Nested runnables, requires LangSmith)",
                "verdict": "Direct API wins on native debugging ease"
            },
            {
                "dimension": "Extensibility & Ecosystem",
                "direct_api": "Requires manual integration for each vector store & document loader",
                "langchain": "Plug-and-play with 100+ vector DBs, splitters, and models",
                "verdict": "LangChain wins on rapid multi-tool integration"
            },
            {
                "dimension": "Maintenance & Upgrades",
                "direct_api": "Extremely stable (only depends on vendor API contract)",
                "langchain": "Frequent minor version deprecations and breaking changes",
                "verdict": "Direct API has lower long-term maintenance churn"
            }
        ]

        return {
            "query": query,
            "direct_api_result": direct_res,
            "langchain_result": lc_res,
            "latency_overhead_percent": f"+{latency_diff_pct}%",
            "decision_framework": decision_framework,
            "summary_recommendation": (
                "Use Direct API calls for microservices, high-frequency classifiers, and tight latency budgets. "
                "Use LangChain when prototyping multi-source RAG, complex document ingestion trees, or multi-vendor pipelines."
            )
        }
