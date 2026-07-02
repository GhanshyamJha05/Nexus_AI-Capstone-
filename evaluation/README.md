# Nexus AI — Evaluation Framework

This directory contains tools for evaluating the quality, accuracy, and reliability
of Nexus AI simulation outputs.

## Evaluation Dimensions

| Dimension | Metric | Target |
|---|---|---|
| Factual accuracy | Cross-agent consistency | > 0.80 |
| Confidence calibration | Brier score | < 0.15 |
| Coverage | Stakeholders identified | > 5 per simulation |
| Timeline coherence | Logical ordering score | > 0.90 |
| Reasoning quality | Human evaluator score | > 4/5 |
| Consensus quality | Agreement rate | > 0.65 |
| Latency | End-to-end time | < 90s |

## Running Evaluation

```bash
cd evaluation
python evaluate.py --simulation-ids 1,2,3
python evaluate.py --all  # evaluate all completed simulations
```
