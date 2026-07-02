"""Tests for agent schemas and utilities."""

import pytest

from app.agents.schemas import AgentResult, CausalGraph, CausalNode, CausalEdge, TimelineImpact
from app.agents.llm_client import extract_json_from_response


def test_extract_json_plain():
    text = '{"key": "value", "num": 42}'
    result = extract_json_from_response(text)
    assert result == {"key": "value", "num": 42}


def test_extract_json_markdown_block():
    text = '```json\n{"answer": true}\n```'
    result = extract_json_from_response(text)
    assert result == {"answer": True}


def test_extract_json_embedded():
    text = 'Here is the result: {"score": 0.9} and some extra text'
    result = extract_json_from_response(text)
    assert result == {"score": 0.9}


def test_extract_json_invalid():
    result = extract_json_from_response("this is not json at all")
    assert result == {}


def test_agent_result_schema():
    timeline = TimelineImpact(
        immediate="Immediate impact",
        one_week="One week impact",
        one_month="One month impact",
        six_months="Six months impact",
        one_year="One year impact",
        five_years="Five years impact",
    )
    result = AgentResult(
        agent_role="economist",
        summary="Test summary",
        reasoning="Test reasoning",
        confidence=0.8,
        timeline_impacts=timeline,
    )
    assert result.confidence == 0.8
    assert result.agent_role == "economist"
    assert len(result.assumptions) == 0


def test_causal_graph_schema():
    graph = CausalGraph(
        nodes=[
            CausalNode(id="n1", label="Decision", type="trigger", description="The main decision", confidence=0.9),
            CausalNode(id="n2", label="Effect", type="effect", description="A downstream effect", confidence=0.7),
        ],
        edges=[
            CausalEdge(source="n1", target="n2", label="causes", strength=0.8),
        ],
    )
    assert len(graph.nodes) == 2
    assert len(graph.edges) == 1
    assert graph.edges[0].source == "n1"
