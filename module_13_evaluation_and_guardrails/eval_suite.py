# Module 13: 50 Business Queries Evaluation Suite (Practical)
import json
import time
from pathlib import Path
from typing import Dict, Any, List
try:
    from .guardrails import PIIDetectorRedactor, PromptInjectionDefense, RBACAccessFilter
    from .metrics import RAGEvaluationMetrics
except ImportError:
    from guardrails import PIIDetectorRedactor, PromptInjectionDefense, RBACAccessFilter
    from metrics import RAGEvaluationMetrics

class ProductionEvaluationSuite:
    """
    Practical: Create an evaluation suite of 50 business queries with:
    - Expected answers
    - Sources & RBAC tiers
    - Precision, Recall, Faithfulness, LLM Judge quality scores
    - Failure categories classification
    """
    def __init__(self, golden_dataset_path: Path):
        with open(golden_dataset_path, "r", encoding="utf-8") as f:
            self.dataset = json.load(f)

    def run_suite(self) -> Dict[str, Any]:
        results = []
        total_precision = 0.0
        total_recall = 0.0
        total_faithfulness = 0.0
        total_judge_scores = 0.0
        passed_count = 0
        failure_breakdown = {
            "RetrievalMiss": 0,
            "Hallucination": 0,
            "RBACAccessDenied": 0,
            "PromptInjectionBlocked": 0,
            "Correct": 0
        }

        start_time = time.time()

        for case in self.dataset:
            q_id = case["query_id"]
            query = case["query_text"]
            expected = case["expected_answer"]
            gold_srcs = case["golden_source_ids"]
            role = case["required_role"]

            # Guardrail 1: Prompt Injection Check
            is_inj, inj_msg = PromptInjectionDefense.inspect_prompt(query)
            if is_inj:
                failure_breakdown["PromptInjectionBlocked"] += 1
                continue

            # Guardrail 2: RBAC Access Control
            if not RBACAccessFilter.is_authorized(role, case["required_role"]):
                failure_breakdown["RBACAccessDenied"] += 1
                continue

            # Simulated RAG Retrieval & Generation
            retrieved_sources = gold_srcs.copy()  # Simulated high-accuracy retriever
            generated_answer = f"According to {', '.join(gold_srcs)}: {expected}"
            
            # Metrics Calculation
            prec, rec = RAGEvaluationMetrics.retrieval_precision_recall(retrieved_sources, gold_srcs)
            faith = RAGEvaluationMetrics.faithfulness_score(generated_answer, expected)
            judge_score, judge_verdict = RAGEvaluationMetrics.llm_judge_score(generated_answer, expected)

            total_precision += prec
            total_recall += rec
            total_faithfulness += faith
            total_judge_scores += judge_score

            is_passed = judge_score >= case["min_acceptable_score"]
            if is_passed:
                passed_count += 1
                failure_breakdown["Correct"] += 1
            else:
                failure_breakdown["Hallucination"] += 1

            results.append({
                "query_id": q_id,
                "category": case["category"],
                "query": query,
                "precision": prec,
                "recall": rec,
                "faithfulness": faith,
                "quality_score": judge_score,
                "verdict": judge_verdict,
                "status": "PASS" if is_passed else "FAIL"
            })

        duration = round(time.time() - start_time, 3)
        n = len(self.dataset)

        summary = {
            "total_queries_evaluated": n,
            "passed_count": passed_count,
            "pass_rate_percentage": round((passed_count / n) * 100, 2),
            "mean_retrieval_precision": round(total_precision / n, 3),
            "mean_retrieval_recall": round(total_recall / n, 3),
            "mean_faithfulness": round(total_faithfulness / n, 3),
            "mean_llm_judge_score": round(total_judge_scores / n, 3),
            "evaluation_duration_seconds": duration,
            "failure_taxonomy_distribution": failure_breakdown,
            "detailed_results": results
        }

        return summary
