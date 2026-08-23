# Module 13: Evaluation Metrics & LLM-as-a-Judge Scorer
import re
import math
from typing import Dict, Any, List, Tuple

class RAGEvaluationMetrics:
    @staticmethod
    def _tokens(t: str) -> set:
        return set(re.findall(r'\w+', t.lower()))

    @classmethod
    def retrieval_precision_recall(cls, retrieved_sources: List[str], golden_sources: List[str]) -> Tuple[float, float]:
        if not retrieved_sources or not golden_sources:
            return 0.0, 0.0
        set_ret = set(retrieved_sources)
        set_gold = set(golden_sources)
        hits = len(set_ret.intersection(set_gold))
        precision = hits / len(set_ret)
        recall = hits / len(set_gold)
        return round(precision, 3), round(recall, 3)

    @classmethod
    def faithfulness_score(cls, generated_answer: str, context: str) -> float:
        ans_tok = cls._tokens(generated_answer)
        ctx_tok = cls._tokens(context)
        if not ans_tok:
            return 0.0
        supported = len(ans_tok.intersection(ctx_tok))
        return round(min(1.0, supported / (len(ans_tok) * 0.8)), 3)

    @classmethod
    def llm_judge_score(cls, generated_answer: str, expected_answer: str) -> Tuple[float, str]:
        gen_tok = cls._tokens(generated_answer)
        exp_tok = cls._tokens(expected_answer)
        if not exp_tok or not gen_tok:
            return 0.0, "Empty Response"
        overlap = len(gen_tok.intersection(exp_tok))
        similarity = overlap / math.sqrt(len(gen_tok) * len(exp_tok))
        score = round(min(1.0, similarity * 1.3), 3)
        
        if score >= 0.80:
            verdict = "EXCELLENT"
        elif score >= 0.60:
            verdict = "ACCEPTABLE"
        else:
            verdict = "FAILED_HALLUCINATION_OR_MISS"
        return score, verdict
