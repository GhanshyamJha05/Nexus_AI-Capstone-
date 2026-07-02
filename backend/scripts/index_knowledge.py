"""
Seed the ChromaDB vector store with background knowledge documents.
Run this once after deployment to enable RAG context for agents.
"""

import asyncio
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

KNOWLEDGE_DOCUMENTS = [
    {
        "title": "Global Manufacturing Cost Comparison 2024",
        "domain": "economics",
        "content": """
China remains the world's dominant manufacturing hub with labor costs averaging $6-8/hour
for skilled manufacturing workers, compared to India's $2-4/hour. However, China's costs
have risen 5x since 2000. India's manufacturing productivity is improving with the PLI scheme
injecting $26 billion in incentives across 14 sectors. Apple's supply chain in China involves
over 900 suppliers. Building an equivalent ecosystem in India would take 5-10 years minimum.
Key manufacturing hubs in India: Tamil Nadu (electronics), Telangana (pharma), Maharashtra (auto).
Infrastructure gaps: India's port capacity handles 1.5B tons vs China's 16B tons annually.
Power reliability: India averages 3.5 hours of power cuts/day vs near-zero in China's SEZs.
""",
    },
    {
        "title": "US-China Trade War Tariff Analysis",
        "domain": "policy",
        "content": """
Section 301 tariffs imposed by the US on Chinese goods range from 7.5% to 25% across
various categories. Electronics face 7.5-25% additional tariffs. These tariffs affected
$370B of Chinese imports in 2023. The CHIPS Act provides $52B for domestic semiconductor
manufacturing. India-US trade currently totals $190B annually. India's Most Favored Nation
status and Generalized System of Preferences benefits impact 3,700 product categories.
US-India trade negotiations ongoing under IPEF (Indo-Pacific Economic Framework).
Key policy: India's PLI scheme offers 4-6% production-linked incentives for electronics.
""",
    },
    {
        "title": "Federal Reserve Monetary Policy Framework",
        "domain": "economics",
        "content": """
The Federal Reserve operates under a dual mandate: price stability (2% inflation target)
and maximum employment. The federal funds rate affects USD strength, emerging market
capital flows, and global debt servicing costs. A 100bp rate cut typically:
- Weakens USD by 3-8% against major currencies
- Increases US equity markets by 8-12% in near term
- Stimulates mortgage refinancing by 40-60%
- Increases emerging market capital inflows
- Reduces US government borrowing costs by ~$200B annually
Historical cuts: 2008 (475bp over 15 months), 2020 (150bp in March), 2024 (100bp total).
""",
    },
    {
        "title": "Global Carbon Emission Standards 2024",
        "domain": "environment",
        "content": """
The Paris Agreement targets limit global warming to 1.5°C above pre-industrial levels.
Corporate reporting: TCFD recommendations now mandatory in UK, EU (CSRD), and increasingly
in the US (SEC climate disclosure rules). Scope 3 emissions now represent 70%+ of
corporate carbon footprints for most industries. Carbon pricing: EU ETS at €65/tonne,
UK at £50/tonne, California at $30/tonne. India's grid emissions factor: 0.71 kg CO2/kWh.
China: 0.55 kg CO2/kWh. India's renewable target: 500GW by 2030.
Manufacturing relocation from China to India typically increases Scope 1+2 by 15-25%
in the short term but India's renewable trajectory offers mitigation by 2030.
""",
    },
    {
        "title": "Global Semiconductor Supply Chain",
        "domain": "technology",
        "content": """
TSMC produces 92% of the world's advanced chips (below 5nm). Samsung produces 8%.
The CHIPS Act ($52B) and EU Chips Act (€43B) aim to diversify production.
ASML's EUV machines (€150M each) are required for advanced chip production.
Geopolitical risk: Taiwan Strait tension creates existential risk for global tech supply.
India's semiconductor ambitions: Tata Electronics and Foxconn announced $11B fab investment.
Time to build a fab: 3-4 years from groundbreaking. Yield ramp: additional 2-3 years.
AI chip demand: NVIDIA H100 demand 3x supply in 2024. Training large AI models requires
10,000-100,000 GPUs. Cloud providers spending $200B+ annually on AI infrastructure.
""",
    },
    {
        "title": "Supply Chain Resilience Post-COVID",
        "domain": "supply_chain",
        "content": """
COVID-19 exposed vulnerabilities in just-in-time supply chains. Companies are now pursuing:
- Nearshoring: moving production closer to end markets (Mexico for US, Poland for EU)
- Friend-shoring: moving to politically aligned countries
- Dual-sourcing: maintaining 2+ suppliers for critical components
- Safety stock: increasing inventory buffers from 2-3 weeks to 4-8 weeks
Apple's supply chain: 70% of iPhone components from China. Moving 10% takes 2+ years.
Vietnam has become alternative to China for lower-complexity electronics assembly.
India competitive advantage: English-speaking workforce, large talent pool, democratic ally.
Key bottleneck: semiconductor packaging and testing ecosystem in India is nascent.
""",
    },
]


async def index_documents() -> None:
    from app.rag.vector_store import add_documents

    print(f"Indexing {len(KNOWLEDGE_DOCUMENTS)} knowledge documents...")
    texts = [doc["content"].strip() for doc in KNOWLEDGE_DOCUMENTS]
    metadatas = [
        {"title": doc["title"], "domain": doc["domain"], "source": "nexus-knowledge-base"}
        for doc in KNOWLEDGE_DOCUMENTS
    ]

    ids = await add_documents(texts=texts, metadatas=metadatas)
    print(f"✅ Indexed {len(ids)} documents into ChromaDB.")

    # Also save to database
    from app.core.database import AsyncSessionLocal
    from app.models.knowledge_source import KnowledgeSource, SourceType

    async with AsyncSessionLocal() as db:
        for i, (doc, doc_id) in enumerate(zip(KNOWLEDGE_DOCUMENTS, ids)):
            source = KnowledgeSource(
                title=doc["title"],
                source_type=SourceType.SEED,
                content=texts[i],
                chroma_document_id=doc_id,
                is_indexed=True,
                domain_tags=[doc["domain"]],
            )
            db.add(source)
        await db.commit()
        print(f"✅ Saved {len(ids)} knowledge sources to database.")


if __name__ == "__main__":
    asyncio.run(index_documents())
