# Module 10: Practical 1 - PDF Question-Answering Bot
import re
from pathlib import Path
from typing import List, Dict, Any

class PDFDocumentLoader:
    """Simulates PDF text extraction with page segmentation."""
    @staticmethod
    def load(file_path: Path) -> List[Dict[str, Any]]:
        text = file_path.read_text(encoding="utf-8")
        raw_pages = text.split("Page ")
        pages = []
        for p in raw_pages:
            if not p.strip():
                continue
            lines = p.strip().split("\n")
            header = lines[0]
            body = "\n".join(lines[1:])
            page_num = header.split(":")[0].strip() if ":" in header else "1"
            pages.append({
                "page": f"Page {page_num}",
                "title": header,
                "content": body,
                "source": file_path.name
            })
        return pages

class RecursiveCharacterTextSplitter:
    """Splits document text into manageable chunks with overlap."""
    def __init__(self, chunk_size: int = 200, chunk_overlap: int = 30):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap

    def split_pages(self, pages: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        chunks = []
        for p in pages:
            text = p["content"]
            sentences = [s.strip() for s in text.split(". ") if s.strip()]
            for s in sentences:
                chunks.append({
                    "text": s,
                    "page": p["page"],
                    "source": p["source"]
                })
        return chunks

class PDFQABot:
    """PDF Question-Answering Chain with Page Attribution."""
    def __init__(self, data_path: Path):
        pages = PDFDocumentLoader.load(data_path)
        splitter = RecursiveCharacterTextSplitter()
        self.chunks = splitter.split_pages(pages)

    def answer_query(self, query: str) -> Dict[str, Any]:
        query_words = set(re.findall(r'\w+', query.lower()))
        matched_chunks = []
        for c in self.chunks:
            c_words = set(re.findall(r'\w+', c["text"].lower()))
            overlap = len(query_words.intersection(c_words))
            if overlap > 0:
                matched_chunks.append((overlap, c))
        matched_chunks.sort(key=lambda x: x[0], reverse=True)
        
        top_chunks = [c for score, c in matched_chunks[:2]]
        citations = [f"[{c['source']}, {c['page']}]" for c in top_chunks]
        context = " ".join([c["text"] for c in top_chunks])
        
        answer = f"Based on {', '.join(set(citations))}: {context}"
        return {
            "query": query,
            "answer": answer,
            "citations": list(set(citations)),
            "retrieved_context": top_chunks
        }
