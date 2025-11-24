---
name: Agent Evaluator
description: Design and implement evaluation strategies for AI agents. Use when building reliable agents, moving beyond "vibes-based" testing, setting up golden datasets, or implementing model-graded evaluations.
version: 1.0.0
category: Testing & Quality
tags:
  - evals
  - llm
  - agents
  - reliability
---

# Agent Evaluator

**Move from "vibes" to verified.** Systematically evaluate AI agent performance using Eval-Driven Development (EDD).

## Purpose

To provide a rigorous methodology for validating the probabilistic nature of AI agents. Unlike traditional deterministic software testing, agent evaluation requires managing uncertainty, defining semantic success criteria, and measuring reliability over time.

## When to Use This Skill

- **Building New Agents:** Define success criteria before writing prompts (EDD).
- **Refactoring Prompts:** Ensure changes improve performance without regressions.
- **Improving Reliability:** Move from "it works on my machine" to "it works 95% of the time."
- **RAG Optimization:** Measure retrieval precision/recall and generation faithfulness.
- **Safety Checks:** Validate that the agent refuses harmful instructions.

## Core Methodology

### Step 1: Eval-Driven Development (EDD)

**Objective:** Define what "good" looks like before building.

**Actions:**

1.  **Identify Core Use Cases:** What _must_ the agent do well?
2.  **Create a "Golden Dataset":** A set of inputs and expected outputs (ground truth).
    - Start small (10-20 examples).
    - Include easy, medium, and hard cases.
    - Include adversarial/safety cases.
3.  **Define Metrics:** How will you measure success?
    - _Binary:_ Pass/Fail (e.g., JSON validity, specific tool call).
    - _Scalar:_ 1-5 score (e.g., helpfulness, tone).
    - _Semantic:_ Similarity to golden reference.

**Key Decisions:**

- **Deterministic vs. Probabilistic:** Can this be checked with code (regex, JSON schema) or does it need an LLM grader?
- **Eval Dataset Source:** Hand-curated (high quality) vs. Synthetic (high volume).

### Step 2: The Evaluation Pipeline

**Objective:** Run tests automatically and consistently.

**Actions:**

1.  **Select an Eval Framework:** (e.g., Promptfoo, LangSmith, or custom script).
2.  **Implement Model-Graded Evals:** Use a stronger model (e.g., GPT-4o, Claude 3.5 Sonnet) to grade the agent's output.
3.  **Establish Baselines:** Run the eval on the current version to get a baseline score.

**Example Model-Grader Prompt:**

```text
You are an expert grader. Compare the ACTUAL output to the EXPECTED output.
Context: [Input Context]
Expected: [Golden Answer]
Actual: [Agent Response]

Criteria:
1. Accuracy: Does the actual answer convey the same facts?
2. Tone: Is the tone appropriate?
3. Format: Is the structure correct?

Output a score (0-1) and a brief reasoning.
```

### Step 3: Iteration & Regression Testing

**Objective:** Improve the agent without breaking it.

**Actions:**

1.  **Run Evals on Every Change:** Treat prompts like code. Run evals in CI/CD.
2.  **Analyze Failures:** Look at the cases where the agent failed.
    - _Prompt Issue:_ Fix instructions.
    - _Context Issue:_ Fix retrieval (RAG).
    - _Model Issue:_ Switch models or fine-tune.
3.  **Update the Golden Set:** When you find a new edge case in production, add it to the dataset.

## Key Principles

1.  **Evaluation is not Optional:** You cannot improve what you cannot measure.
2.  **Test Behavior, Not Just Syntax:** Valid JSON is useless if the answer is wrong.
3.  **Model-Graded Evals > Human Evals:** For scale and speed. Humans are for creating the golden set.
4.  **Separate Dev and Test Sets:** Don't overfit your prompts to the specific test cases (unless they cover the entire domain).

## Decision Framework

**Choosing an Evaluation Method:**

| method                           | Use When...                                                                             | Cost   | Speed  |
| :------------------------------- | :-------------------------------------------------------------------------------------- | :----- | :----- |
| **Code-Based (Deterministic)**   | Output must follow strict format (JSON), contain specific keywords, or pass unit tests. | Low    | Fast   |
| **Model-Graded (Probabilistic)** | Assessing reasoning, creativity, tone, or semantic similarity.                          | Medium | Medium |
| **Human Review**                 | Establishing the initial golden set or auditing model graders.                          | High   | Slow   |

## Common Patterns

### Pattern 1: The "LLM-as-a-Judge"

Use a superior model to evaluate the outputs of a smaller/faster model.

- _Agent:_ Claude 3 Haiku (Fast)
- _Judge:_ Claude 3.5 Sonnet (Smart)

### Pattern 2: RAG Triad Evaluation

Evaluate three components of RAG separately:

1.  **Context Relevance:** Is the retrieved chunk relevant to the query?
2.  **Groundedness:** Is the answer supported by the retrieved chunks?
3.  **Answer Relevance:** Does the answer address the user's query?

## Related Resources

**Related Skills:**

- `testing-strategist` - General testing methodologies.
- `rag-implementer` - Specifics on building RAG (which needs evals).
- `quality-auditor` - Auditing the overall system quality.

**Related Standards:**

- `STANDARDS/best-practices/eval-driven-development.md`
- `STANDARDS/architecture-patterns/agent-validation-pattern.md`
