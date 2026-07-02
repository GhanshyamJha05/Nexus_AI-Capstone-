"""ChromaDB vector store integration for RAG."""

from typing import List, Optional, Tuple

import structlog
import chromadb
from chromadb.config import Settings as ChromaSettings
from langchain_chroma import Chroma
from langchain_google_genai import GoogleGenerativeAIEmbeddings

from app.config import get_settings

settings = get_settings()
logger = structlog.get_logger(__name__)

_chroma_client: Optional[chromadb.AsyncHttpClient] = None
_vector_store: Optional[Chroma] = None


def get_embeddings() -> GoogleGenerativeAIEmbeddings:
    return GoogleGenerativeAIEmbeddings(
        model="models/embedding-001",
        google_api_key=settings.gemini_api_key,
    )


async def get_chroma_client() -> chromadb.HttpClient:
    global _chroma_client
    if _chroma_client is None:
        _chroma_client = chromadb.HttpClient(
            host=settings.chroma_host,
            port=settings.chroma_port,
            settings=ChromaSettings(anonymized_telemetry=False),
        )
    return _chroma_client


async def get_vector_store() -> Chroma:
    global _vector_store
    if _vector_store is None:
        client = await get_chroma_client()
        _vector_store = Chroma(
            client=client,
            collection_name=settings.chroma_collection,
            embedding_function=get_embeddings(),
        )
    return _vector_store


async def add_documents(
    texts: List[str],
    metadatas: Optional[List[dict]] = None,
    ids: Optional[List[str]] = None,
) -> List[str]:
    """Add documents to the vector store. Returns list of IDs."""
    vs = await get_vector_store()
    return vs.add_texts(texts=texts, metadatas=metadatas, ids=ids)


async def similarity_search(
    query: str,
    k: int = 5,
    filter_metadata: Optional[dict] = None,
) -> List[Tuple[str, float, dict]]:
    """Search vector store. Returns list of (content, score, metadata)."""
    vs = await get_vector_store()
    results = vs.similarity_search_with_score(
        query=query,
        k=k,
        filter=filter_metadata,
    )
    return [(doc.page_content, score, doc.metadata) for doc, score in results]


async def retrieve_context(
    query: str,
    domain: Optional[str] = None,
    k: int = 5,
    min_score: float = 0.5,
) -> str:
    """Retrieve relevant context as a formatted string for agent injection."""
    filter_metadata = {"domain": domain} if domain else None
    results = await similarity_search(query, k=k, filter_metadata=filter_metadata)

    if not results:
        return ""

    context_parts = []
    for content, score, metadata in results:
        if score < min_score:
            continue
        title = metadata.get("title", "Unknown Source")
        source = metadata.get("source", "")
        context_parts.append(f"[Source: {title} ({source}), Relevance: {score:.2f}]\n{content}")

    return "\n\n---\n\n".join(context_parts)
