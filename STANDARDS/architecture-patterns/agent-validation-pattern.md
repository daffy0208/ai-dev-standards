# Agent Validation & CI/CD Pattern

**Category:** Architecture Patterns > MLOps / LLMOps
**Related Skills:** agent-evaluator, release-manager

---

## The Problem

Integrating Probabilistic AI components into deterministic CI/CD pipelines creates friction. Traditional CI fails on binary conditions (Pass/Fail), but AI models fluctuate (Pass rate 92% vs 95%).

## The Solution: The Agent Validation Pipeline

A specialized architecture for validating AI agents that accommodates latency, cost, and non-determinism while ensuring reliability.

## Architecture Diagram

```mermaid
graph TD
    A[Developer] -->|Push Code/Prompt| B[Git Repo]
    B -->|Trigger| C[CI Pipeline]
    C -->|1. Static Analysis| D[Linting/Types]
    C -->|2. Unit Tests| E[Deterministic Logic]
    C -->|3. Agent Evals| F[Eval Runner]

    subgraph "Eval Environment"
        F -->|Load| G[Golden Dataset]
        F -->|Invoke| H[Agent Candidate]
        F -->|Grade| I[Model Judge (LLM)]
        H -->|Retrieve| J[Vector DB (Test)]
    end

    I -->|Score| K[Metrics Store]
    K -->|Compare| L[Baseline Check]
    L -->|Pass/Fail| M[Merge Gate]
```

## Core Components

### 1. The Eval Runner

A dedicated service or script (e.g., using Promptfoo, LangSmith SDK, or custom Python) that:

1.  Orchestrates the tests.
2.  Manages concurrency (rate limits).
3.  Calculates aggregate metrics.

### 2. The Baseline Store

You cannot define absolute "success" easily (e.g., "Must be 100% accurate"). Instead, use **Relative Success**:

- _Current PR Score_ >= _Main Branch Score_ (No Regression).
- _Latency_ <= _Baseline + 10%_.

### 3. The Model Judge

A separate, high-intelligence model (e.g., GPT-4o, Claude 3.5 Sonnet) configured with a strict "System Prompt for Grading".

- **Architecture Note:** Isolate the Judge from the Agent. Do not let the Agent "see" the Judge's rubric during inference.

### 4. Synthetic Data Generator (Optional)

For scale, use an LLM to generate variations of the Golden Dataset inputs to check for robustness.

## Pipeline Stages

### Stage 1: Smoke Tests (Fast)

- **Goal:** Did we break the build?
- **Checks:** JSON schema validity, tool call formats, basic "Hello" response.
- **Cost:** Low.
- **Blocking:** Yes.

### Stage 2: Regression Evals (Medium)

- **Goal:** Did we make it dumber?
- **Dataset:** The "Golden Set" (curated 50-100 examples).
- **Checks:** Semantic similarity, factual accuracy.
- **Cost:** Medium.
- **Blocking:** Yes (if score drops > threshold).

### Stage 3: Performance/Safety Evals (Slow/Periodic)

- **Goal:** Is it safe and fast enough?
- **Checks:** Jailbreak attempts, load testing, massive dataset runs.
- **Cost:** High.
- **Blocking:** No (Run nightly or pre-release).

## Implementation Guidelines

### Environment Isolation

- **Mock External APIs:** During evals, the agent should NOT call real Stripe/Twilio APIs. Use mocks or recording/replay (VCR).
- **Test Vector DB:** Use a fixed, small subset of documents for RAG tests to ensure deterministic retrieval context.

### Caching

- Cache Model Judge results if the Agent Output is identical to a previous run. This saves money and time.

### Flakiness Management

- **Retries:** Run the agent 3 times for "temperature > 0" tests and average the score.
- **Pass Thresholds:** Allow 95% pass rate, not 100%, for soft evals.

## Decision Matrix: CI Integration

| Feature                 | Approach                        |
| :---------------------- | :------------------------------ |
| **Prompt Change**       | Run full Regression Evals.      |
| **Code Change (Logic)** | Run Unit Tests + Smoke Evals.   |
| **Model Change**        | Run Performance + Safety Evals. |

## Summary

This architecture treats "Intelligence" as a managed artifact. By decoupling the _Agent_ from the _Judge_ and establishing _Baselines_, you can deploy AI with the same confidence as traditional software.
