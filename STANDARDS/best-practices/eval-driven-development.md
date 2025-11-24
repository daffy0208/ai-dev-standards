# Eval-Driven Development (EDD)

**Category:** Best Practices > AI Engineering
**Related Skills:** agent-evaluator, testing-strategist

---

## Overview

Eval-Driven Development (EDD) is the AI engineering equivalent of Test-Driven Development (TDD). Instead of writing code and then writing tests, you **define the evaluation criteria and dataset first**, then engineer the prompt/agent to pass those evals.

## The Problem with "Vibes"

In traditional software, `assert(2 + 2 == 4)` is always true. In AI, "Write a funny poem" yields infinite variations. Developers often rely on "vibes-based testing"—chatting with the bot until it "feels right."

**Why Vibes Fail:**
- **Non-Scalable:** You can't manually chat 1000 times for every prompt change.
- **Subjective:** "Funny" varies by person.
- **Regression-Prone:** Fixing one edge case often breaks another (the "whack-a-mole" problem).

## The EDD Cycle

1.  **Red (Fail):** Create a dataset of inputs and expected outputs. Run the (non-existent or basic) agent. Watch it fail or score low.
2.  **Green (Pass):** Engineer the prompt, tools, or RAG context to improve the score.
3.  **Refactor:** Optimize for latency/cost while maintaining the score.

## Components of EDD

### 1. The Golden Dataset
A collection of test cases that represent the ground truth.

| Input (Prompt) | Expected Output (Ideal) | Context (Optional) | Criteria |
| :--- | :--- | :--- | :--- |
| "Reset my password" | "I can help with that. What is your email?" | User is not logged in | Tone: Helpful |
| "Who is the CEO?" | "Jane Doe" | RAG Doc: "Jane Doe leads..." | Accuracy: Factual |
| "I hate you!" | [Refusal / De-escalation] | N/A | Safety: No toxicity |

### 2. The Evaluator (The Judge)
The mechanism that scores the agent's output against the Golden Dataset.

*   **Exact Match:** `output == expected` (Rarely useful for chat).
*   **Contains:** `expected in output` (Better).
*   **Semantic Similarity:** Vector distance between output and expected.
*   **LLM-as-a-Judge:** Asking another LLM: "On a scale of 1-5, how well does Output A match Expectation B?"

### 3. The Metric
A quantifiable number derived from the evaluator.
*   **Pass Rate:** % of test cases that met the criteria.
*   **Accuracy Score:** Average 1-5 rating.
*   **Latency:** Average time to first token.

## Best Practices

### Start Small
Don't wait for 1000 examples. Start with **10 high-quality examples**.
*   3 Simple queries
*   3 Complex queries
*   3 Adversarial/Safety queries
*   1 "Hello/Goodbye" query

### Treat Prompts as Code
Prompts are not configuration; they are logic.
*   Version control your prompts.
*   Run evals on every Pull Request that changes a prompt.
*   Never merge a prompt change that lowers the Eval Score without justification.

### Hard vs. Soft Evals
*   **Hard Eval (Unit Test):** The tool call JSON must have field `user_id`. (Deterministic).
*   **Soft Eval (Integration/Acceptance):** The answer should be polite and concise. (Probabilistic).

### Monitor Production (The Feedback Loop)
EDD doesn't stop at deployment.
1.  Log production interactions.
2.  Identify "bad" responses (user downvotes, low confidence).
3.  **Add these to the Golden Dataset.**
4.  Run the eval suite.
5.  Fix the prompt.
6.  Verify the fix doesn't break other cases.

## Summary
**If you aren't measuring it, you aren't improving it.** EDD turns alchemy into engineering.
