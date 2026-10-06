# Module 2: Prompt Engineering

## Overview
This module explores prompt design patterns, structured generation, chain-of-thought synthesis, defensive instruction hygiene, and automated prompt evaluation.

## Core Topics
1. **Prompt Anatomy**: Clear delineation between System directives, Developer instructions, User input, and Output JSON schemas.
2. **Techniques**: Zero-Shot vs Few-Shot exemplar conditioning, Role prompting, Chain-of-Thought (CoT).
3. **Structured Schemas**: Enforcing Pydantic models for guaranteed downstream API parseability.
4. **Defensive Wrappers**: Neutralizing prompt injection attacks via input sanitization and encapsulation boundaries (`<untrusted_user_input>`).
5. **Practical Implementations**:
   - Customer Support Ticket Classifier (Intent, Urgency, Department routing).
   - Contract Clause Extractor (Parties, Effective dates, Liabilities, Notice terms).
   - Meeting Summary Engine (CoT Executive brief, Action Items, Open Issues).
   - Business Rule Compliance Validator (Financial authorization checks, Audit scores).
