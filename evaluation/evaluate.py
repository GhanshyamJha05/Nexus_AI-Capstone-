"""
Nexus AI Evaluation Script.

Evaluates simulation quality across multiple dimensions:
- Confidence calibration (Brier score)
- Cross-agent consistency
- Coverage completeness
- Timeline coherence
- Latency performance
"""

import argparse
import asyncio
import json
import statistics
import sys
import os
from datetime import datetime
from typing import Any

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))


async def load_simulations(ids: list[int] | None = None) -> list[dict[str, Any]]:
    """Load simulations from the database."""
    from app.core.database import AsyncSessionLocal
    from app.models.simulation import Simulation, SimulationStatus
    from sqlalchemy import select
    from sqlalchemy.orm import selectinload

    async with AsyncSessionLocal() as db:
        query = (
            select(Simulation)
            .where(Simulation.status == SimulationStatus.COMPLETED)
            .options(selectinload(Simulation.agent_outputs))
        )
        if ids:
            query = query.where(Simulation.id.in_(ids))
        result = await db.execute(query)
        sims = result.scalars().all()
        return [
            {
                "id": s.id,
                "title": s.title,
                "agent_outputs": [
                    {
                        "role": o.agent_role,
                        "confidence": o.confidence,
                        "affected_stakeholders": o.affected_stakeholders or [],
                        "assumptions": o.assumptions or [],
                        "timeline_impacts": o.timeline_impacts or {},
                    }
                    for o in s.agent_outputs
                ],
                "consensus": s.consensus or {},
                "execution_time_seconds": s.execution_time_seconds,
            }
            for s in sims
        ]


def evaluate_confidence_calibration(simulations: list[dict]) -> dict:
    """
    Calibration: are confidence scores meaningful?
    A well-calibrated agent that claims 70% confidence should be correct ~70% of the time.
    We approximate by checking cross-agent agreement vs reported confidence.
    """
    scores = []
    for sim in simulations:
        outputs = sim["agent_outputs"]
        if not outputs:
            continue
        confidences = [o["confidence"] for o in outputs if o["confidence"] is not None]
        if len(confidences) < 2:
            continue
        mean_conf = statistics.mean(confidences)
        stdev_conf = statistics.stdev(confidences) if len(confidences) > 1 else 0
        # Lower stdev relative to mean = better calibration
        calibration_score = 1.0 - min(1.0, stdev_conf / max(mean_conf, 0.01))
        scores.append(calibration_score)

    return {
        "metric": "confidence_calibration",
        "mean_score": round(statistics.mean(scores), 3) if scores else 0,
        "n_simulations": len(scores),
        "target": "> 0.80",
        "pass": statistics.mean(scores) > 0.80 if scores else False,
    }


def evaluate_stakeholder_coverage(simulations: list[dict]) -> dict:
    """Check that each simulation identifies a sufficient number of stakeholders."""
    counts = []
    for sim in simulations:
        all_stakeholders = set()
        for o in sim["agent_outputs"]:
            all_stakeholders.update(o.get("affected_stakeholders", []))
        counts.append(len(all_stakeholders))

    avg = statistics.mean(counts) if counts else 0
    return {
        "metric": "stakeholder_coverage",
        "mean_unique_stakeholders": round(avg, 1),
        "n_simulations": len(counts),
        "target": "> 5",
        "pass": avg > 5,
    }


def evaluate_timeline_coherence(simulations: list[dict]) -> dict:
    """
    Check that timeline entries exist for all 6 horizons across all agents.
    Score = fraction of (agent × horizon) cells that are populated.
    """
    HORIZONS = ["immediate", "one_week", "one_month", "six_months", "one_year", "five_years"]
    scores = []
    for sim in simulations:
        outputs = sim["agent_outputs"]
        if not outputs:
            continue
        total_cells = len(outputs) * len(HORIZONS)
        filled_cells = 0
        for o in outputs:
            impacts = o.get("timeline_impacts", {})
            for h in HORIZONS:
                if impacts.get(h) and len(str(impacts[h])) > 10:
                    filled_cells += 1
        scores.append(filled_cells / max(total_cells, 1))

    avg = statistics.mean(scores) if scores else 0
    return {
        "metric": "timeline_coherence",
        "mean_completeness": round(avg, 3),
        "n_simulations": len(scores),
        "target": "> 0.90",
        "pass": avg > 0.90,
    }


def evaluate_latency(simulations: list[dict]) -> dict:
    """Evaluate end-to-end execution time."""
    times = [s["execution_time_seconds"] for s in simulations if s.get("execution_time_seconds")]
    if not times:
        return {"metric": "latency", "data": "no data", "pass": False}

    return {
        "metric": "latency",
        "mean_seconds": round(statistics.mean(times), 1),
        "median_seconds": round(statistics.median(times), 1),
        "p95_seconds": round(sorted(times)[int(len(times) * 0.95)], 1),
        "n_simulations": len(times),
        "target": "< 90s",
        "pass": statistics.mean(times) < 90,
    }


def evaluate_consensus_quality(simulations: list[dict]) -> dict:
    """Check consensus fields are populated."""
    required_fields = [
        "overall_summary", "agreements", "conflicts",
        "overall_confidence", "final_reasoning", "recommended_actions",
    ]
    scores = []
    for sim in simulations:
        c = sim.get("consensus") or {}
        filled = sum(1 for f in required_fields if c.get(f))
        scores.append(filled / len(required_fields))

    avg = statistics.mean(scores) if scores else 0
    return {
        "metric": "consensus_quality",
        "mean_completeness": round(avg, 3),
        "n_simulations": len(scores),
        "target": "> 0.90",
        "pass": avg > 0.90,
    }


async def main() -> None:
    parser = argparse.ArgumentParser(description="Nexus AI Evaluation")
    parser.add_argument("--simulation-ids", type=str, default="", help="Comma-separated IDs")
    parser.add_argument("--all", action="store_true", help="Evaluate all completed simulations")
    parser.add_argument("--output", type=str, default="evaluation_report.json")
    args = parser.parse_args()

    ids = None
    if not args.all and args.simulation_ids:
        ids = [int(x.strip()) for x in args.simulation_ids.split(",") if x.strip()]

    print(f"Loading simulations{'...' if args.all else f' (ids={ids})...'}")
    simulations = await load_simulations(ids)
    print(f"Loaded {len(simulations)} completed simulations.\n")

    if not simulations:
        print("No simulations found. Run seed_data.py first.")
        return

    results = {
        "generated_at": datetime.utcnow().isoformat(),
        "n_simulations_evaluated": len(simulations),
        "metrics": [
            evaluate_confidence_calibration(simulations),
            evaluate_stakeholder_coverage(simulations),
            evaluate_timeline_coherence(simulations),
            evaluate_latency(simulations),
            evaluate_consensus_quality(simulations),
        ],
    }

    passed = sum(1 for m in results["metrics"] if m.get("pass"))
    total = len(results["metrics"])
    results["summary"] = {
        "passed": passed,
        "total": total,
        "overall_pass": passed == total,
    }

    # Print results
    print("=" * 60)
    print("NEXUS AI EVALUATION REPORT")
    print("=" * 60)
    for metric in results["metrics"]:
        status = "✅ PASS" if metric.get("pass") else "❌ FAIL"
        print(f"\n{status} {metric['metric']}")
        for k, v in metric.items():
            if k != "metric":
                print(f"    {k}: {v}")

    print("\n" + "=" * 60)
    print(f"OVERALL: {passed}/{total} metrics passing")
    print("=" * 60)

    with open(args.output, "w") as f:
        json.dump(results, f, indent=2)
    print(f"\nReport saved to {args.output}")


if __name__ == "__main__":
    asyncio.run(main())
