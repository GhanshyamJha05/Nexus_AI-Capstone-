"""Knowledge source model for RAG corpus management."""

import enum
from typing import Optional

from sqlalchemy import Boolean, Enum, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.models.base import TimestampMixin


class SourceType(str, enum.Enum):
    WEB = "web"
    PDF = "pdf"
    TEXT = "text"
    API = "api"
    SEED = "seed"


class KnowledgeSource(Base, TimestampMixin):
    __tablename__ = "knowledge_sources"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    source_type: Mapped[SourceType] = mapped_column(
        Enum(SourceType), default=SourceType.TEXT, nullable=False
    )
    url: Mapped[Optional[str]] = mapped_column(String(1000), nullable=True)
    content: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    chroma_document_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True, index=True)
    is_indexed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    domain_tags: Mapped[Optional[list]] = mapped_column(JSONB, nullable=True)
    metadata_: Mapped[Optional[dict]] = mapped_column("metadata", JSONB, nullable=True)

    def __repr__(self) -> str:
        return f"<KnowledgeSource id={self.id} title={self.title[:40]}>"
