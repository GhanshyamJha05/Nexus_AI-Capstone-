# Nexus AI — Evaluation Methodology

## Philosophy

Nexus AI evaluates simulation quality across five dimensions:
**calibration**, **coverage**, **coherence**, **consensus quality**, and **latency**.

Unlike traditional ML benchmarks, strategic decision simulations are evaluated
for *usefulness and reliability* rather than ground-truth accuracy.

---

## Automated Metrics

### 1. Confidence Calibration
**What:** Are agent confidence scores internally consistent?  
**How:** Measure cross-agent agreement rate vs reported confidence. Lower
variance relative to mean = better calibration.  
**Target:** > 0.80  
**Formula:** `1 - (stdev(confidences) / mean(confidences))`

### 2. Stakeholder Coverage
**What:** Do agents collectively identify enough affected parties?  
**How:** Count unique stakeholders across all agent outputs per simulation.  
**Target:** > 5 unique stakeholders per simulation

### 3. Timeline Coherence
**What:** Is the timeline complete across all 6 horizons?  
**How:** Fraction of (agent × horizon) cells with meaningful content (> 10 chars).  
**Target:** > 90% completeness

### 4. Consensus Quality
**What:** Does the consensus output contain all required fields?  
**How:** Check presence of: summary, agreements, conflicts, confidence, reasoning, actions.  
**Target:** > 90% field completeness

### 5. Latency
**What:** How fast is the end-to-end simulation?  
**How:** Wall-clock time from task dispatch to completion.  
**Target:** Mean < 90 seconds  
**Measurement:** Stored as `execution_time_seconds` per simulation

---

## Human Evaluation Rubric

For high-stakes or novel simulations, human evaluators assess:

| Dimension | Score (1-5) | Criteria |
|---|---|---|
| Factual accuracy | 1-5 | Are claims verifiable? |
| Domain depth | 1-5 | Is expert knowledge credible? |
| Reasoning quality | 1-5 | Is the logic coherent? |
| Actionability | 1-5 | Are recommendations concrete? |
| Completeness | 1-5 | Are key angles covered? |

**Passing threshold:** Mean score > 4.0/5.0

---

## Running the Evaluation Suite

```bash
cd evaluation

# Install requirements (uses backend deps)
pip install -r ../backend/requirements.txt

# Evaluate all completed simulations
python evaluate.py --all

# Evaluate specific simulation IDs
python evaluate.py --simulation-ids 1,2,3

# Save to custom output file
python evaluate.py --all --output my_report.json
```

---

## Sample Evaluation Output

```
============================================================
NEXUS AI EVALUATION REPORT
============================================================

✅ PASS confidence_calibration
    mean_score: 0.847
    n_simulations: 12
    target: > 0.80

✅ PASS stakeholder_coverage
    mean_unique_stakeholders: 8.3
    n_simulations: 12
    target: > 5

✅ PASS timeline_coherence
    mean_completeness: 0.947
    n_simulations: 12
    target: > 0.90

✅ PASS latency
    mean_seconds: 52.4
    median_seconds: 48.1
    p95_seconds: 84.2
    target: < 90s

✅ PASS consensus_quality
    mean_completeness: 0.932
    n_simulations: 12
    target: > 0.90

============================================================
OVERALL: 5/5 metrics passing
============================================================
```

---

## Known Limitations

1. **Factual accuracy** cannot be automatically verified — LLMs may hallucinate statistics.
   Always treat outputs as decision-support tools, not ground truth.

2. **Confidence calibration** uses an approximation metric. True calibration
   would require comparing predictions against real outcomes over time.

3. **Domain novelty** affects quality. Simulations in well-documented domains
   (economics, supply chain) score higher than niche or speculative scenarios.

4. **Parallel agent independence** means agents don't see each other's work,
   which can lead to redundant analyses.

---

## Improvement Tracking

| Version | Avg Confidence Score | Timeline Completeness | Mean Latency |
|---|---|---|---|
| v1.0.0 | 0.72 | 0.85 | 68s |
| v1.1.0 | 0.78 | 0.91 | 54s |
| Target | 0.85+ | 0.95+ | < 45s |
