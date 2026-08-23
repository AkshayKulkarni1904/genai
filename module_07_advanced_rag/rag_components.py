# Module 7: Advanced RAG Components
import re
import math
import sqlite3
import json
import time
from typing import List, Dict, Any, Optional, Tuple

class SimpleEmbeddingEngine:
    @staticmethod
    def tokenize(text: str) -> List[str]:
        return [w.lower() for w in re.findall(r'\w+', text) if len(w) > 1]

    @classmethod
    def similarity(cls, text_a: str, text_b: str) -> float:
        tokens_a = set(cls.tokenize(text_a))
        tokens_b = set(cls.tokenize(text_b))
        if not tokens_a or not tokens_b:
            return 0.0
        intersection = tokens_a.intersection(tokens_b)
        return len(intersection) / math.sqrt(len(tokens_a) * len(tokens_b))

class LRUSemanticCache:
    def __init__(self, capacity: int = 100, ttl_seconds: int = 300):
        self.capacity = capacity
        self.ttl = ttl_seconds
        self.cache: Dict[str, Dict[str, Any]] = {}
        self.hits = 0
        self.misses = 0

    def get(self, query: str) -> Optional[Any]:
        key = query.strip().lower()
        if key in self.cache:
            entry = self.cache[key]
            if time.time() - entry['timestamp'] <= self.ttl:
                self.hits += 1
                return entry['data']
            else:
                del self.cache[key]
        self.misses += 1
        return None

    def put(self, query: str, data: Any):
        key = query.strip().lower()
        if len(self.cache) >= self.capacity:
            oldest_key = min(self.cache.keys(), key=lambda k: self.cache[k]['timestamp'])
            del self.cache[oldest_key]
        self.cache[key] = {'data': data, 'timestamp': time.time()}

class ParentChildRetriever:
    def __init__(self):
        self.parents: Dict[str, Dict[str, Any]] = {}
        self.children: List[Dict[str, Any]] = []

    def add_parent_document(self, parent_id: str, title: str, full_content: str, metadata: Dict[str, Any] = None):
        self.parents[parent_id] = {
            'parent_id': parent_id,
            'title': title,
            'content': full_content,
            'metadata': metadata or {}
        }
        sentences = [s.strip() for s in re.split(r'\.\s+', full_content) if s.strip()]
        for idx, sentence in enumerate(sentences):
            self.children.append({
                'child_id': f"{parent_id}_c{idx}",
                'parent_id': parent_id,
                'chunk_text': sentence,
                'metadata': metadata or {}
            })

    def retrieve(self, query: str, top_k: int = 2) -> List[Dict[str, Any]]:
        scored_children = []
        for child in self.children:
            score = SimpleEmbeddingEngine.similarity(query, child['chunk_text'])
            if score > 0.05:
                scored_children.append((score, child))
        scored_children.sort(key=lambda x: x[0], reverse=True)
        
        seen_parents = set()
        results = []
        for score, child in scored_children:
            p_id = child['parent_id']
            if p_id not in seen_parents:
                seen_parents.add(p_id)
                parent_doc = self.parents[p_id].copy()
                parent_doc['retrieval_score'] = round(score, 3)
                parent_doc['matched_child_chunk'] = child['chunk_text']
                results.append(parent_doc)
                if len(results) >= top_k:
                    break
        return results

class MultiVectorRetriever:
    def __init__(self):
        self.docs: List[Dict[str, Any]] = []

    def add_document(self, doc_id: str, content: str, summary: str, keywords: List[str], metadata: Dict[str, Any] = None):
        self.docs.append({
            'doc_id': doc_id,
            'content': content,
            'summary': summary,
            'keywords': keywords,
            'metadata': metadata or {}
        })

    def retrieve(self, query: str, top_k: int = 2) -> List[Dict[str, Any]]:
        scored = []
        for d in self.docs:
            score_c = SimpleEmbeddingEngine.similarity(query, d['content'])
            score_s = SimpleEmbeddingEngine.similarity(query, d['summary'])
            score_k = SimpleEmbeddingEngine.similarity(query, ' '.join(d['keywords']))
            blended = max(score_c, score_s * 1.2, score_k * 1.1)
            if blended > 0.05:
                doc_copy = d.copy()
                doc_copy['blended_score'] = round(blended, 3)
                scored.append((blended, doc_copy))
        scored.sort(key=lambda x: x[0], reverse=True)
        return [doc for score, doc in scored[:top_k]]

class QueryDecomposer:
    @staticmethod
    def decompose(query: str) -> List[str]:
        parts = re.split(r'\band\b|\balso\b|\bplus\b|;|\?|\.', query, flags=re.IGNORECASE)
        sub_queries = [p.strip() for p in parts if len(p.strip()) > 8]
        return sub_queries if sub_queries else [query]

class CorrectiveRAG:
    def __init__(self, relevance_threshold: float = 0.12):
        self.threshold = relevance_threshold

    def evaluate_and_filter(self, query: str, documents: List[Dict[str, Any]]) -> Tuple[List[Dict[str, Any]], str]:
        graded_docs = []
        for doc in documents:
            text = doc.get('content', '') or doc.get('summary', '') or doc.get('resolution', '')
            score = SimpleEmbeddingEngine.similarity(query, text)
            doc['relevance_grade'] = 'RELEVANT' if score >= self.threshold else 'IRRELEVANT'
            doc['relevance_score'] = round(score, 3)
            if score >= self.threshold:
                graded_docs.append(doc)

        if not graded_docs:
            return [], "FALLBACK_TRIGGERED: Query reformulations and broader fallback search invoked."
        return graded_docs, "RELEVANCE_PASSED"

class SQLDatabaseRetriever:
    def __init__(self, db_path: str):
        self.db_path = db_path

    def get_customer_config(self, customer_id: str) -> Optional[Dict[str, Any]]:
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        cur = conn.cursor()
        cur.execute("SELECT * FROM customer_configs WHERE customer_id = ?", (customer_id,))
        row = cur.fetchone()
        conn.close()
        return dict(row) if row else None

class KnowledgeBaseLifecycleManager:
    def __init__(self):
        self.kb_store: Dict[str, Dict[str, Any]] = {}

    def upsert_document(self, doc_id: str, title: str, content: str, version: str):
        prev = self.kb_store.get(doc_id)
        self.kb_store[doc_id] = {
            'doc_id': doc_id,
            'title': title,
            'content': content,
            'version': version,
            'updated_at': time.time(),
            'deleted': False
        }
        return f"Document {doc_id} upserted to version {version} (Prior: {prev.get('version') if prev else 'None'})"

    def delete_document(self, doc_id: str, hard: bool = False):
        if doc_id in self.kb_store:
            if hard:
                del self.kb_store[doc_id]
                return f"Document {doc_id} permanently removed."
            else:
                self.kb_store[doc_id]['deleted'] = True
                return f"Document {doc_id} marked as soft-deleted."
        return f"Document {doc_id} not found."
