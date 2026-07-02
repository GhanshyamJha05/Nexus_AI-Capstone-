"""Seed script: creates demo user and sample simulations."""

import asyncio
import json
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.core.database import AsyncSessionLocal
from app.core.security import hash_password
from app.models.simulation import SimulationStatus
from app.models.agent_output import AgentRole, AgentStatus
from app.repositories.user_repository import UserRepository
from app.repositories.simulation_repository import SimulationRepository
from app.repositories.agent_output_repository import AgentOutputRepository


SAMPLE_SIMULATIONS = [
    {
        "title": "Apple Manufacturing Shift: China to India",
        "prompt": "What happens if Apple shifts 50% of its manufacturing from China to India?",
        "domain": "supply_chain",
        "tags": ["apple", "manufacturing", "india", "china", "supply-chain"],
        "consensus": {
            "overall_summary": (
                "Shifting 50% of Apple's manufacturing from China to India represents a multi-year, high-complexity strategic transition "
                "with significant economic, geopolitical, and operational implications. While the move reduces geopolitical risk exposure "
                "and aligns with India's 'Make in India' initiative, it faces substantial short-term headwinds including infrastructure gaps, "
                "skilled labor shortages, and ecosystem immaturity. The transition would likely span 5-8 years, cost $15-30B in capex, "
                "and temporarily pressure Apple's margins by 150-250 basis points."
            ),
            "agreements": [
                "The transition will take at least 5-8 years to reach 50% capacity in India",
                "Short-term cost increases are unavoidable during the ramp-up phase",
                "India's regulatory environment has improved but still lags China significantly",
                "Component supplier ecosystems in India are nascent and need substantial development",
                "The move improves supply chain resilience and reduces US-China trade war exposure",
            ],
            "conflicts": [
                {
                    "topic": "Carbon footprint impact",
                    "positions": {
                        "environment": "India's coal-heavy grid increases Scope 2 emissions significantly",
                        "supply_chain": "Shorter shipping routes to Western markets partially offset emissions",
                    },
                    "resolution": "Net emissions will increase in the 5-year horizon but India's renewable push offers long-term mitigation",
                }
            ],
            "overall_confidence": 0.73,
            "final_reasoning": "The consensus across all expert domains points to a strategically sound but operationally challenging transition. Economic models suggest 3-5% long-term cost savings once fully ramped, while policy analysis confirms India's strong political will to support this transition. Technology assessment reveals 2-3 year gaps in precision manufacturing capability that must be bridged through training and investment.",
            "key_uncertainties": [
                "Speed of India's infrastructure development (ports, roads, power)",
                "China's potential retaliatory trade or regulatory measures",
                "India's ability to develop precision component suppliers",
                "Future US-China tariff trajectory",
            ],
            "recommended_actions": [
                "Begin with non-critical components and accessories before moving flagship iPhone production",
                "Invest $2-3B in supplier development programs in Tamil Nadu and Telangana",
                "Negotiate preferential power purchase agreements for renewable energy in Indian factories",
                "Lobby Indian government for customs and tax incentives under PLI scheme",
                "Develop parallel supply chains for 12 months before decommissioning Chinese capacity",
            ],
            "risk_level": "high",
        },
    },
    {
        "title": "Federal Reserve Rate Cut Impact Analysis",
        "prompt": "What are the global implications if the Federal Reserve cuts interest rates by 100 basis points in Q1 2026?",
        "domain": "economics",
        "tags": ["federal-reserve", "interest-rates", "monetary-policy", "global-markets"],
        "consensus": {
            "overall_summary": (
                "A 100 basis point Fed rate cut would send significant ripple effects across global financial markets, emerging economies, "
                "and real estate sectors. While it would stimulate domestic US economic activity and relieve pressure on over-leveraged "
                "businesses, it risks reigniting inflation, weakening the dollar, and creating asset bubbles in rate-sensitive sectors. "
                "Emerging market economies would experience capital inflows and currency appreciation, potentially benefiting their debt "
                "servicing but hurting export competitiveness."
            ),
            "agreements": [
                "US equity markets would rally 8-15% in the immediate aftermath",
                "The US dollar would weaken 5-8% against major currencies",
                "Emerging market debt servicing burdens would ease significantly",
                "Real estate and mortgage markets would see increased activity",
                "Treasury yields would compress, driving institutional investors toward risk assets",
            ],
            "conflicts": [],
            "overall_confidence": 0.81,
            "final_reasoning": "Strong economic consensus on market mechanics, with policy analysts noting geopolitical timing risks given current US-China tensions.",
            "key_uncertainties": [
                "Whether inflation has truly been tamed sufficiently to justify cuts",
                "Geopolitical events that could override monetary policy signals",
                "Corporate debt refinancing dynamics in a lower-rate environment",
            ],
            "recommended_actions": [
                "Position portfolios toward rate-sensitive sectors (REITs, utilities, financials) ahead of cut",
                "Hedge dollar exposure for multinational corporations",
                "Monitor emerging market currency strength for export competitiveness impacts",
                "Watch for inflationary pressures in commodities and housing",
            ],
            "risk_level": "medium",
        },
    },
]


async def seed():
    async with AsyncSessionLocal() as db:
        user_repo = UserRepository(db)
        sim_repo = SimulationRepository(db)
        agent_repo = AgentOutputRepository(db)

        # Check if demo user exists
        existing = await user_repo.get_by_email("demo@nexus-ai.com")
        if existing:
            print("Demo user already exists. Skipping seed.")
            return

        # Create demo user
        user = await user_repo.create(
            email="demo@nexus-ai.com",
            username="demo",
            full_name="Demo User",
            hashed_password=hash_password("Demo@12345"),
            is_verified=True,
            is_active=True,
        )
        print(f"Created demo user: {user.email}")

        # Create admin user
        admin = await user_repo.create(
            email="admin@nexus-ai.com",
            username="admin",
            full_name="Nexus Admin",
            hashed_password=hash_password("Admin@12345"),
            is_verified=True,
            is_active=True,
            is_admin=True,
        )
        print(f"Created admin user: {admin.email}")

        # Create sample simulations
        for sample in SAMPLE_SIMULATIONS:
            sim = await sim_repo.create(
                user_id=user.id,
                title=sample["title"],
                prompt=sample["prompt"],
                domain=sample["domain"],
                tags=sample["tags"],
                status=SimulationStatus.COMPLETED,
                consensus=sample["consensus"],
                execution_time_seconds=47.3,
            )
            print(f"Created simulation: {sim.title}")

            # Add sample agent outputs
            agent_summaries = {
                AgentRole.ECONOMIST: "The economic impact involves significant short-term cost increases (estimated $2-4B) but long-term efficiency gains as Indian wages remain 40-60% below Chinese equivalents for comparable manufacturing roles.",
                AgentRole.POLICY: "The geopolitical calculus strongly favors this move from a US-India strategic partnership perspective. India's government has offered PLI incentives worth $6.6B for electronics manufacturers.",
                AgentRole.TECHNOLOGY: "India's technology ecosystem for precision electronics is 3-5 years behind Shenzhen. Key gaps: component miniaturization, yield rates for advanced chips, and industrial automation density.",
                AgentRole.ENVIRONMENT: "The carbon footprint will initially increase due to India's coal-heavy power grid (65% coal vs 58% in China), but India's 500GW renewable target by 2030 provides a credible mitigation path.",
                AgentRole.SUPPLY_CHAIN: "The immediate supply chain challenge is the absence of a Shenzhen-like ecosystem in India. 237 specialized component suppliers would need to be either relocated or developed locally over 5-7 years.",
            }

            for role, summary in agent_summaries.items():
                await agent_repo.upsert(
                    simulation_id=sim.id,
                    role=role,
                    status=AgentStatus.COMPLETE,
                    summary=summary,
                    reasoning=f"Detailed reasoning from {role.value} perspective on this strategic decision.",
                    assumptions=["Market conditions remain stable", "No major regulatory changes", "Technology adoption continues at current pace"],
                    confidence=0.72,
                    evidence=[{"point": "Historical data supports this", "strength": "strong", "source": "industry research"}],
                    citations=[{"title": "Industry Report 2024", "source": "domain research", "relevance": 0.85}],
                    timeline_impacts={
                        "immediate": "Market volatility and stock price impact",
                        "one_week": "Supplier negotiations begin",
                        "one_month": "Initial site assessments in India",
                        "six_months": "First production trials",
                        "one_year": "5% capacity transferred",
                        "five_years": "50% capacity milestone achieved",
                    },
                    affected_stakeholders=["Apple shareholders", "Chinese factory workers", "Indian manufacturing sector", "US consumers"],
                    thinking_steps=["Identified key decision drivers", "Analyzed historical analogues", "Modeled financial impact", "Assessed geopolitical risk"],
                )

        await db.commit()
        print("\n✅ Seed data created successfully!")
        print("Demo login: demo@nexus-ai.com / Demo@12345")
        print("Admin login: admin@nexus-ai.com / Admin@12345")


if __name__ == "__main__":
    asyncio.run(seed())
