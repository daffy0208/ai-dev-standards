#!/usr/bin/env node

/**
 * Reference Implementation: Eval-Driven Development (EDD) Runner
 *
 * This script demonstrates the "Agent Validation Pattern" defined in
 * STANDARDS/architecture-patterns/agent-validation-pattern.md.
 *
 * It accepts a "Golden Dataset" and runs evaluations against an agent's output.
 * Supports deterministic checks (Exact, Contains, Regex) and probabilistic checks (LLM-Graded).
 */

import fs from 'fs'
import path from 'path'
import { program } from 'commander'
import chalk from 'chalk'

program
  .name('agent-eval')
  .description('Run evaluations against an AI agent using a Golden Dataset')
  .requiredOption('-d, --dataset <path>', 'Path to golden dataset JSON file')
  .option('-o, --output <path>', 'Path to save evaluation report', 'eval-report.json')
  .option('--mock', 'Run in mock mode (simulate agent responses)', false)
  .parse(process.argv)

const options = program.opts()

// --- Types & Interfaces ---

/**
 * @typedef {Object} TestCase
 * @property {string} id - Unique ID
 * @property {string} input - Input prompt for the agent
 * @property {string} expected - Expected output (ground truth)
 * @property {string} criteria - "exact" | "contains" | "regex" | "llm-graded"
 * @property {string} [context] - Optional context (RAG docs, user state)
 */

/**
 * @typedef {Object} EvalResult
 * @property {string} id
 * @property {boolean} passed
 * @property {number} score - 0.0 to 1.0
 * @property {string} reason
 * @property {string} actualOutput
 * @property {number} latencyMs
 */

// --- Agent Interface (Mockable) ---

async function queryAgent(input, context, isMock) {
  const start = Date.now()

  // In a real scenario, this would call your actual Agent API / Class
  let output
  if (isMock) {
    // Simulate agent behavior based on input keywords
    if (input.includes('password')) output = 'To reset your password, go to settings.'
    else if (input.includes('CEO')) output = 'Jane Doe is the CEO.'
    else output = 'I am an AI assistant.'

    // Simulate network latency
    await new Promise(r => setTimeout(r, 50))
  } else {
    // TODO: Implement actual agent hook here
    // output = await MyAgent.process(input, context);
    throw new Error('Real agent execution not implemented in this reference script. Use --mock.')
  }

  const end = Date.now()
  return { output, latency: end - start }
}

// --- Evaluators ---

async function evaluate(testCase, actualOutput) {
  const { expected, criteria } = testCase

  switch (criteria) {
    case 'exact': {
      return {
        passed: actualOutput.trim() === expected.trim(),
        score: actualOutput.trim() === expected.trim() ? 1 : 0,
        reason: `Expected exact match: "${expected}"`
      }
    }

    case 'contains': {
      const passedContains = actualOutput.includes(expected)
      return {
        passed: passedContains,
        score: passedContains ? 1 : 0,
        reason: `Expected to contain: "${expected}"`
      }
    }

    case 'regex': {
      const regex = new RegExp(expected)
      const passedRegex = regex.test(actualOutput)
      return {
        passed: passedRegex,
        score: passedRegex ? 1 : 0,
        reason: `Expected to match regex: ${expected}`
      }
    }

    case 'llm-graded': {
      // In a real implementation, this would call a "Judge" LLM (GPT-4/Claude 3.5)
      // For this reference script, we'll use a simple heuristic fallback
      // or return a "Skipped/Mocked" result if no API key.
      return {
        passed: true,
        score: 0.8, // Mock score
        reason: '(Mock) LLM Judge evaluated semantics as acceptable'
      }
    }

    default: {
      return {
        passed: false,
        score: 0,
        reason: `Unknown criteria: ${criteria}`
      }
    }
  }
}

// --- Main Runner ---

async function run() {
  console.log(chalk.blue.bold(`🚀 Starting Agent Evaluation Run`))
  console.log(`📂 Dataset: ${options.dataset}`)
  console.log(`🤖 Mode: ${options.mock ? 'Mock Agent' : 'Real Agent'}\n`)

  let dataset
  try {
    const data = fs.readFileSync(options.dataset, 'utf8')
    dataset = JSON.parse(data)
  } catch (err) {
    console.error(chalk.red(`❌ Failed to load dataset: ${err.message}`))
    process.exit(1)
  }

  const results = []
  let passedCount = 0

  for (const testCase of dataset) {
    process.stdout.write(`Test ${testCase.id}: `)

    try {
      // 1. Execute Agent
      const { output, latency } = await queryAgent(testCase.input, testCase.context, options.mock)

      // 2. Evaluate Result
      const evalResult = await evaluate(testCase, output)

      // 3. Record
      const resultEntry = {
        ...evalResult,
        id: testCase.id,
        actualOutput: output,
        latencyMs: latency,
        testCase
      }

      results.push(resultEntry)

      if (evalResult.passed) {
        passedCount++
        console.log(chalk.green('✅ PASS'))
      } else {
        console.log(chalk.red('❌ FAIL'))
        console.log(chalk.dim(`   Expected (${testCase.criteria}): ${testCase.expected}`))
        console.log(chalk.dim(`   Actual: ${output}`))
      }
    } catch (err) {
      console.log(chalk.red('💥 ERROR'))
      console.error(`   ${err.message}`)
      results.push({
        id: testCase.id,
        passed: false,
        score: 0,
        reason: `Runtime Error: ${err.message}`,
        testCase
      })
    }
  }

  // --- Reporting ---

  const passRate = (passedCount / dataset.length) * 100
  const averageScore = results.reduce((acc, r) => acc + (r.score || 0), 0) / results.length
  const averageLatency = results.reduce((acc, r) => acc + (r.latencyMs || 0), 0) / results.length

  console.log(chalk.bold('\n📊 Summary'))
  console.log('----------------------------------------')
  console.log(`Total Tests:    ${dataset.length}`)
  console.log(`Passed:         ${passedCount}`)
  console.log(`Failed:         ${dataset.length - passedCount}`)
  console.log(
    `Pass Rate:      ${passRate === 100 ? chalk.green(passRate.toFixed(1) + '%') : chalk.yellow(passRate.toFixed(1) + '%')}`
  )
  console.log(`Avg Score:      ${averageScore.toFixed(2)}`)
  console.log(`Avg Latency:    ${averageLatency.toFixed(0)}ms`)
  console.log('----------------------------------------')

  // Save Report
  fs.writeFileSync(
    options.output,
    JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        summary: { passRate, averageScore, averageLatency },
        results
      },
      null,
      2
    )
  )

  console.log(`📝 Report saved to: ${options.output}`)

  if (passRate < 100) {
    process.exit(1) // Fail CI if not 100% (configurable)
  }
}

run()
