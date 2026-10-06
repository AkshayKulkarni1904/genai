# Module 5: Embeddings and Vector Search
import math
import re
from typing import Dict, Any, List, Optional, Tuple

POLICY_DOCUMENTS = [
    {
        "doc_id": "POL-SEC-01",
        "title": "Corporate Cryptography & Secret Rotation Policy",
        "department": "Security",
        "document_type": "Policy",
        "date": "2026-01-15",
        "access_level": 3, # 1: Public, 2: Internal, 3: Confidential, 4: Restricted
        "content": "All API keys, cryptographic secrets, and production certificates must be rotated at least every 90 days. Symmetric encryption at rest must enforce AES-256-GCM. Asymmetric keys must be RSA-4096 or Ed25519."
    },
    {
        "doc_id": "POL-HR-02",
        "title": "Global Remote Work & International Relocation Guidelines",
        "department": "Human Resources",
        "document_type": "Guideline",
        "date": "2026-02-10",
        "access_level": 2,
        "content": "Employees working remotely abroad beyond 30 consecutive calendar days must notify HR Global Mobility and obtain host-country tax clearance. Work laptops must always connect through corporate WireGuard VPN."
    },
    {
        "doc_id": "POL-COMP-03",
        "title": "Customer Data Privacy, GDPR & CCPA Compliance Framework",
        "department": "Compliance",
        "document_type": "Framework",
        "date": "2026-03-05",
        "access_level": 3,
        "content": "Data Subject Access Requests (DSAR) and Right-to-be-Forgotten deletion requests must be completed within 30 days. PII fields in database tables must be pseudonymized and indexed under strict RBAC controls."
    },
    {
        "doc_id": "POL-FIN-04",
        "title": "Capital Expenditure & Cloud Resource Allocation Policy",
        "department": "Finance",
        "document_type": "Policy",
        "date": "2026-03-20",
        "access_level": 2,
        "content": "All cloud resource provisioning exceeding $10,000 monthly spend requires pre-approval from the Engineering FinOps council and FinOps tag enforcement (Owner, CostCenter, Environment)."
    },
    {
        "doc_id": "POL-IT-05",
        "title": "Zero Trust Endpoint Security & BYOD Standard",
        "department": "IT Operations",
        "document_type": "Standard",
        "date": "2026-04-01",
        "access_level": 1,
        "content": "Personal devices accessing corporate email or Slack must enroll in Mobile Device Management (MDM). Storage encryption, biometrics, and automatic screen lock after 5 minutes are mandatory."
    }
]


class TextChunker:
    """Demonstrates 4 core chunking strategies."""
    
    @staticmethod
    def fixed_length_chunk(text: str, chunk_size: int = 120, overlap: int = 20) -> List[str]:
        chunks = []
        start = 0
        while start < len(text):
            end = min(start + chunk_size, len(text))
            chunks.append(text[start:end])
            if end == len(text):
                break
            start += (chunk_size - overlap)
        return chunks

    @staticmethod
    def recursive_character_chunk(text: str, chunk_size: int = 150, overlap: int = 30) -> List[str]:
        # Split recursively on paragraphs, then sentences, then words
        paragraphs = text.split("\n\n")
        chunks = []
        current = ""
        for p in paragraphs:
            if len(current) + len(p) <= chunk_size:
                current = (current + " " + p).strip()
            else:
                if current:
                    chunks.append(current)
                current = p
        if current:
            chunks.append(current)
        return chunks

    @staticmethod
    def document_aware_chunk(text: str) -> List[Dict[str, str]]:
        # Splits cleanly on markdown headings or section prefixes
        sections = []
        current_header = "Intro"
        current_body = []
        for line in text.split("\n"):
            if line.startswith("#") or line.startswith("Section"):
                if current_body:
                    sections.append({"section": current_header, "content": " ".join(current_body)})
                    current_body = []
                current_header = line.strip("# ")
            else:
                if line.strip():
                    current_body.append(line.strip())
        if current_body:
            sections.append({"section": current_header, "content": " ".join(current_body)})
        return sections


class VectorSimilarityMetrics:
    """Computes similarity using Cosine, Dot Product, and Euclidean Distance."""
    
    @staticmethod
    def cosine_similarity(v1: List[float], v2: List[float]) -> float:
        dot = sum(a * b for a, b in zip(v1, v2))
        norm1 = math.sqrt(sum(a * a for a in v1))
        norm2 = math.sqrt(sum(b * b for b in v2))
        if norm1 == 0 or norm2 == 0:
            return 0.0
        return round(dot / (norm1 * norm2), 4)

    @staticmethod
    def dot_product(v1: List[float], v2: List[float]) -> float:
        return round(sum(a * b for a, b in zip(v1, v2)), 4)

    @staticmethod
    def euclidean_distance(v1: List[float], v2: List[float]) -> float:
        dist = math.sqrt(sum((a - b) ** 2 for a, b in zip(v1, v2)))
        return round(dist, 4)


class EmbeddingGenerator:
    """Generates normalized dense vectors in a shared 16-dimensional semantic latent space."""
    VOCAB_SEEDS = [
        "encrypt", "secret", "rotate", "key", "vpn", "remote", "laptop", "gdpr",
        "privacy", "pii", "delete", "cost", "cloud", "budget", "mdm", "device"
    ]

    @classmethod
    def embed(cls, text: str) -> List[float]:
        text_lower = text.lower()
        vec = []
        for term in cls.VOCAB_SEEDS:
            # Score based on frequency and word boundary match
            count = len(re.findall(rf"\b{term}", text_lower))
            vec.append(float(count * 1.5 + (0.1 if term in text_lower else 0.0)))
        
        # Add text length bias dimension to prevent zero vectors
        vec.append(min(1.0, len(text) / 200))
        
        # L2 normalize
        norm = math.sqrt(sum(x * x for x in vec))
        if norm == 0:
            return [0.0] * len(vec)
        return [round(x / norm, 4) for x in vec]


class PolicySemanticSearchEngine:
    """
    Semantic Search System with:
    - Metadata filtering (department, doc_type, date, access_level)
    - Similarity metric comparison (Cosine, Dot Product, Euclidean)
    - Hybrid Search (BM25 Sparse + Dense Embedding Reciprocal Rank Fusion)
    """
    def __init__(self, documents: List[Dict[str, Any]] = None):
        self.documents = documents or POLICY_DOCUMENTS
        self.embedded_corpus = []
        for doc in self.documents:
            vec = EmbeddingGenerator.embed(doc["title"] + " " + doc["content"])
            self.embedded_corpus.append({"doc": doc, "vector": vec})

    def search(
        self,
        query: str,
        department_filter: Optional[str] = None,
        max_access_level: int = 4,
        top_k: int = 3,
        hybrid: bool = True
    ) -> List[Dict[str, Any]]:
        query_vec = EmbeddingGenerator.embed(query)
        query_words = set(query.lower().split())

        candidates = []
        for item in self.embedded_corpus:
            doc = item["doc"]
            # Apply Metadata Filters
            if department_filter and doc["department"].lower() != department_filter.lower():
                continue
            if doc["access_level"] > max_access_level:
                continue

            # Dense similarity metrics
            cos_sim = VectorSimilarityMetrics.cosine_similarity(query_vec, item["vector"])
            dot_prod = VectorSimilarityMetrics.dot_product(query_vec, item["vector"])
            l2_dist = VectorSimilarityMetrics.euclidean_distance(query_vec, item["vector"])

            # Sparse BM25 keyword score simulation
            doc_text = (doc["title"] + " " + doc["content"]).lower()
            keyword_matches = sum(1 for w in query_words if w in doc_text)
            sparse_score = keyword_matches / max(1, len(query_words))

            # Reciprocal Rank Fusion (RRF) for Hybrid search
            dense_rank_score = cos_sim
            hybrid_score = (dense_rank_score * 0.65) + (sparse_score * 0.35) if hybrid else cos_sim

            candidates.append({
                "doc_id": doc["doc_id"],
                "title": doc["title"],
                "department": doc["department"],
                "document_type": doc["document_type"],
                "date": doc["date"],
                "access_level": doc["access_level"],
                "content_preview": doc["content"][:100] + "...",
                "cosine_similarity": cos_sim,
                "dot_product": dot_prod,
                "euclidean_distance": l2_dist,
                "sparse_keyword_score": round(sparse_score, 3),
                "hybrid_rrf_score": round(hybrid_score, 4)
            })

        # Sort by score descending
        candidates.sort(key=lambda x: x["hybrid_rrf_score"] if hybrid else x["cosine_similarity"], reverse=True)
        return candidates[:top_k]
