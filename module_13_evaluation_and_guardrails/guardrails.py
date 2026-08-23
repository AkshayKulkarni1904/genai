# Module 13: Production Guardrails & Defense
import re
from typing import Dict, Any, Tuple, List

class PIIDetectorRedactor:
    """Detects and redacts sensitive PII (SSN, Credit Cards, API Keys, Emails, Phone)."""
    PATTERNS = {
        "SSN": r"\b\d{3}-\d{2}-\d{4}\b",
        "CREDIT_CARD": r"\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13})\b",
        "API_KEY": r"\b(?:sk_live_|api_key_|ghp_)[a-zA-Z0-9]{20,}\b",
        "EMAIL": r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b",
        "PHONE": r"\b\+?[1-9]\d{1,14}\b"
    }

    @classmethod
    def sanitize(cls, text: str) -> Tuple[str, List[str]]:
        detected = []
        clean_text = text
        for pii_type, regex in cls.PATTERNS.items():
            matches = re.findall(regex, clean_text)
            if matches:
                detected.append(pii_type)
                clean_text = re.sub(regex, f"[REDACTED_{pii_type}]", clean_text)
        return clean_text, detected

class PromptInjectionDefense:
    """Detects adversarial jailbreak and system exfiltration attempts."""
    JAILBREAK_TRIGGERS = [
        "ignore previous instructions",
        "system prompt reveal",
        "disregard all prior rules",
        "exfiltrate database credentials",
        "you are now evil mode",
        "sudo rm -rf",
        "bypass security filter"
    ]

    @classmethod
    def inspect_prompt(cls, prompt: str) -> Tuple[bool, str]:
        p_low = prompt.lower()
        for trig in cls.JAILBREAK_TRIGGERS:
            if trig in p_low:
                return True, f"INJECTION_ATTACK_DETECTED: '{trig}'"
        return False, "PROMPT_SAFE"

class RBACAccessFilter:
    """Role-Based Access Control (RBAC) filter for document retrieval."""
    ROLE_HIERARCHY = {
        "Admin": 4,
        "Security": 3,
        "Engineering": 2,
        "SupportTier1": 2,
        "BillingClerk": 2,
        "GeneralUser": 1
    }

    @classmethod
    def is_authorized(cls, user_role: str, document_min_role: str) -> bool:
        user_lvl = cls.ROLE_HIERARCHY.get(user_role, 1)
        doc_lvl = cls.ROLE_HIERARCHY.get(document_min_role, 1)
        return user_lvl >= doc_lvl

class ModelFallbackRouter:
    """Production model fallback router with latency & failure recovery."""
    def __init__(self):
        self.primary_model = "gemini-3.7-flash"
        self.fallback_model = "gemini-3.7-pro"
        self.fallback_invocations = 0

    def execute_with_fallback(self, execute_fn, payload: Any) -> Tuple[Any, str]:
        try:
            # Simulate primary execution
            return execute_fn(payload), self.primary_model
        except Exception as e:
            self.fallback_invocations += 1
            # Fallback path
            return f"Fallback recovery: {execute_fn(payload)}", self.fallback_model
