# MCP Performance Benchmarking Guide

## Executive Summary

Performance benchmarking is critical to validate that your MCP Code Execution implementation is achieving the promised 90-99% token reduction and 3-10x latency improvements. This guide provides comprehensive testing procedures, metrics, and analysis frameworks.

**Key Metrics**: Token consumption, latency, skill usage rate, cost savings

**Benchmark Timeline**: 4 weeks (baseline → migration → optimization → validation)

---

## Table of Contents

1. [Performance Metrics](#performance-metrics)
2. [Baseline Measurement](#baseline-measurement)
3. [Post-Migration Benchmarks](#post-migration-benchmarks)
4. [Comparison Analysis](#comparison-analysis)
5. [Optimization Tracking](#optimization-tracking)
6. [Cost Analysis](#cost-analysis)

---

## Performance Metrics

### Primary Metrics

```python
primary_metrics = {
    "token_consumption": {
        "description": "Total tokens used per agent run",
        "unit": "tokens",
        "measured_by": "API response usage field",
        "target": "40-60% reduction (first run), 85-95% (with skills)"
    },
    "latency": {
        "description": "Time from request to response",
        "unit": "seconds",
        "measured_by": "Wall clock time",
        "target": "Same or better than baseline"
    },
    "output_tokens": {
        "description": "Tokens in agent output (expensive!)",
        "unit": "tokens",
        "measured_by": "API response usage.completion_tokens",
        "target": "90-95% reduction"
    },
    "skill_usage_rate": {
        "description": "% of runs using existing skills",
        "unit": "percentage",
        "measured_by": "Skill execution count / total runs",
        "target": ">60% after 1 month"
    }
}
```

### Secondary Metrics

```python
secondary_metrics = {
    "tool_discovery_time": {
        "description": "Time spent finding right tools",
        "unit": "seconds",
        "target": "<5 seconds"
    },
    "tool_read_count": {
        "description": "Number of tool files read",
        "unit": "count",
        "target": "<5 per run"
    },
    "code_execution_count": {
        "description": "Number of code executions",
        "unit": "count",
        "target": "1-2 per run"
    },
    "error_rate": {
        "description": "Failed runs / total runs",
        "unit": "percentage",
        "target": "<=baseline + 5%"
    }
}
```

### Cost Metrics

```python
cost_metrics = {
    "cost_per_run": {
        "description": "$ cost per agent execution",
        "unit": "USD",
        "formula": "(input_tokens * $0.003 + output_tokens * $0.015) / 1000"
    },
    "monthly_cost": {
        "description": "Total cost for 1 month",
        "unit": "USD",
        "formula": "cost_per_run * runs_per_month"
    },
    "cost_savings": {
        "description": "Monthly savings vs baseline",
        "unit": "USD",
        "formula": "baseline_monthly_cost - current_monthly_cost"
    },
    "roi_timeline": {
        "description": "Months to break even",
        "unit": "months",
        "formula": "implementation_cost / monthly_savings"
    }
}
```

---

## Baseline Measurement

### Step 1: Identify Test Cases

Select 5-10 representative tasks:

```python
baseline_test_cases = [
    {
        "name": "Simple copy-paste",
        "description": "Copy Google Drive doc to Notion",
        "complexity": "low",
        "expected_tools": ["gdrive.getDocument", "notion.createPage"],
        "expected_duration": "5-10 seconds"
    },
    {
        "name": "Multi-step workflow",
        "description": "Analyze sales data, create report, post to Slack",
        "complexity": "high",
        "expected_tools": ["salesforce.query", "openai.analyze", "notion.create", "slack.post"],
        "expected_duration": "30-60 seconds"
    },
    {
        "name": "Data transformation",
        "description": "Extract data from Sheets, transform, load to database",
        "complexity": "medium",
        "expected_tools": ["gsheets.read", "python.transform", "postgres.insert"],
        "expected_duration": "15-30 seconds"
    }
    # Add 2-7 more representative cases
]
```

### Step 2: Baseline Measurement Script

```python
import time
import json
from datetime import datetime

class BaselineBenchmark:
    def __init__(self, agent, test_cases):
        self.agent = agent
        self.test_cases = test_cases
        self.results = []
    
    def run_baseline(self, iterations=5):
        """Run each test case multiple times"""
        for test_case in self.test_cases:
            print(f"Running baseline for: {test_case['name']}")
            
            case_results = []
            for i in range(iterations):
                result = self._run_single_test(test_case)
                case_results.append(result)
                
                # Log individual result
                self._log_result(test_case['name'], i, result)
            
            # Aggregate results for this test case
            aggregated = self._aggregate_results(test_case['name'], case_results)
            self.results.append(aggregated)
        
        # Save baseline for future comparison
        self._save_baseline()
        
        return self.results
    
    def _run_single_test(self, test_case):
        """Execute single test and measure metrics"""
        start_time = time.time()
        
        # Execute agent
        response = self.agent.execute(test_case['description'])
        
        end_time = time.time()
        
        # Extract metrics
        return {
            "input_tokens": response.usage.prompt_tokens,
            "output_tokens": response.usage.completion_tokens,
            "total_tokens": response.usage.total_tokens,
            "latency": end_time - start_time,
            "success": response.success,
            "error": response.error if not response.success else None,
            "timestamp": datetime.now().isoformat()
        }
    
    def _aggregate_results(self, test_name, results):
        """Calculate mean, median, p95 for each metric"""
        import statistics
        
        successful = [r for r in results if r['success']]
        
        if not successful:
            return {
                "test_name": test_name,
                "error_rate": 100.0,
                "message": "All runs failed"
            }
        
        return {
            "test_name": test_name,
            "sample_size": len(results),
            "success_rate": (len(successful) / len(results)) * 100,
            "tokens": {
                "mean": statistics.mean([r['total_tokens'] for r in successful]),
                "median": statistics.median([r['total_tokens'] for r in successful]),
                "p95": self._percentile([r['total_tokens'] for r in successful], 95),
                "input_mean": statistics.mean([r['input_tokens'] for r in successful]),
                "output_mean": statistics.mean([r['output_tokens'] for r in successful])
            },
            "latency": {
                "mean": statistics.mean([r['latency'] for r in successful]),
                "median": statistics.median([r['latency'] for r in successful]),
                "p95": self._percentile([r['latency'] for r in successful], 95)
            }
        }
    
    def _percentile(self, data, percentile):
        """Calculate percentile"""
        import statistics
        return statistics.quantiles(data, n=100)[percentile-1]
    
    def _save_baseline(self):
        """Save baseline results for comparison"""
        with open('baseline-results.json', 'w') as f:
            json.dump({
                "timestamp": datetime.now().isoformat(),
                "agent_version": "direct-mcp",
                "results": self.results
            }, f, indent=2)
        
        print("✅ Baseline saved to baseline-results.json")
```

### Step 3: Run Baseline

```python
# Execute baseline benchmark
from baseline_benchmark import BaselineBenchmark
from agent import DirectMCPAgent

# Initialize agent
agent = DirectMCPAgent()

# Run benchmark
benchmark = BaselineBenchmark(agent, baseline_test_cases)
results = benchmark.run_baseline(iterations=5)

# Print summary
for result in results:
    print(f"\n{result['test_name']}:")
    print(f"  Tokens (mean): {result['tokens']['mean']:.0f}")
    print(f"  Latency (mean): {result['latency']['mean']:.2f}s")
    print(f"  Success rate: {result['success_rate']:.1f}%")
```

### Step 4: Document Baseline

```markdown
# Baseline Performance Report
**Date**: 2025-11-14
**Agent**: Direct MCP v2.0
**Test Iterations**: 5 per case

## Results

### Test Case 1: Simple Copy-Paste
- **Tokens**: 32,000 (mean), 31,500 (median)
  - Input: 28,000
  - Output: 4,000
- **Latency**: 8.3s (mean), 8.1s (median)
- **Success Rate**: 100%

### Test Case 2: Multi-Step Workflow
- **Tokens**: 67,000 (mean), 65,000 (median)
  - Input: 45,000
  - Output: 22,000
- **Latency**: 23.5s (mean), 22.8s (median)
- **Success Rate**: 100%

[... Continue for all test cases ...]

## Cost Analysis

**Current Cost per Run**:
- Simple tasks: $0.18 (32K tokens)
- Complex tasks: $0.48 (67K tokens)

**Monthly Cost** (1000 runs/month, 50% simple, 50% complex):
- Simple: 500 * $0.18 = $90
- Complex: 500 * $0.48 = $240
- **Total: $330/month**
```

---

## Post-Migration Benchmarks

### Run Same Tests with Code Execution Agent

```python
from code_execution_benchmark import CodeExecutionBenchmark
from agent import CodeExecutionAgent

# Initialize new agent
agent = CodeExecutionAgent()

# Run same test cases
benchmark = CodeExecutionBenchmark(agent, baseline_test_cases)
results = benchmark.run_benchmark(iterations=5)

# Important: Run twice to test skill reuse
print("\n=== First Run (No Skills) ===")
first_run = benchmark.run_benchmark(iterations=5)

print("\n=== Second Run (With Skills) ===")
second_run = benchmark.run_benchmark(iterations=5)
```

### Compare Results

```python
class BenchmarkComparison:
    def __init__(self, baseline_path, migration_path):
        with open(baseline_path) as f:
            self.baseline = json.load(f)
        with open(migration_path) as f:
            self.migration = json.load(f)
    
    def compare(self):
        """Generate comparison report"""
        comparisons = []
        
        for baseline_result, migration_result in zip(
            self.baseline['results'], 
            self.migration['results']
        ):
            comparison = {
                "test_name": baseline_result['test_name'],
                "token_reduction": self._calculate_reduction(
                    baseline_result['tokens']['mean'],
                    migration_result['tokens']['mean']
                ),
                "output_token_reduction": self._calculate_reduction(
                    baseline_result['tokens']['output_mean'],
                    migration_result['tokens']['output_mean']
                ),
                "latency_change": self._calculate_change(
                    baseline_result['latency']['mean'],
                    migration_result['latency']['mean']
                ),
                "baseline_tokens": baseline_result['tokens']['mean'],
                "migration_tokens": migration_result['tokens']['mean'],
                "baseline_latency": baseline_result['latency']['mean'],
                "migration_latency": migration_result['latency']['mean']
            }
            comparisons.append(comparison)
        
        return comparisons
    
    def _calculate_reduction(self, baseline, current):
        """Calculate % reduction"""
        return ((baseline - current) / baseline) * 100
    
    def _calculate_change(self, baseline, current):
        """Calculate % change (negative = improvement)"""
        return ((current - baseline) / baseline) * 100
    
    def print_report(self):
        """Print formatted comparison report"""
        comparisons = self.compare()
        
        print("\n" + "="*80)
        print("MIGRATION PERFORMANCE COMPARISON")
        print("="*80)
        
        for comp in comparisons:
            print(f"\n📊 {comp['test_name']}")
            print(f"   Tokens: {comp['baseline_tokens']:.0f} → {comp['migration_tokens']:.0f}")
            print(f"   ✅ Reduction: {comp['token_reduction']:.1f}%")
            print(f"   Output tokens reduction: {comp['output_token_reduction']:.1f}%")
            print(f"   Latency: {comp['baseline_latency']:.2f}s → {comp['migration_latency']:.2f}s")
            
            if comp['latency_change'] < 0:
                print(f"   ⚡ Faster by: {abs(comp['latency_change']):.1f}%")
            else:
                print(f"   ⏱️ Slower by: {comp['latency_change']:.1f}%")
        
        # Overall summary
        avg_token_reduction = sum(c['token_reduction'] for c in comparisons) / len(comparisons)
        print(f"\n{'='*80}")
        print(f"OVERALL RESULTS:")
        print(f"  Average token reduction: {avg_token_reduction:.1f}%")
        print(f"  Target: 40-60% (first run), 85-95% (with skills)")
        
        if 40 <= avg_token_reduction <= 60:
            print(f"  ✅ Within target range for first run!")
        elif avg_token_reduction >= 85:
            print(f"  🎉 Excellent! Exceeding even skill-optimized targets!")
        else:
            print(f"  ⚠️ Below target. Review prompts and tool loading.")
        
        print("="*80 + "\n")
```

### Example Output

```
================================================================================
MIGRATION PERFORMANCE COMPARISON
================================================================================

📊 Simple Copy-Paste
   Tokens: 32000 → 12000
   ✅ Reduction: 62.5%
   Output tokens reduction: 87.5%
   Latency: 8.30s → 4.20s
   ⚡ Faster by: 49.4%

📊 Multi-Step Workflow
   Tokens: 67000 → 28000
   ✅ Reduction: 58.2%
   Output tokens reduction: 81.8%
   Latency: 23.50s → 18.30s
   ⚡ Faster by: 22.1%

================================================================================
OVERALL RESULTS:
  Average token reduction: 60.4%
  Target: 40-60% (first run), 85-95% (with skills)
  ✅ Within target range for first run!
================================================================================
```

---

## Comparison Analysis

### Detailed Breakdown

```python
class DetailedAnalysis:
    def analyze_token_breakdown(self, baseline, migration):
        """Analyze where token savings come from"""
        
        breakdown = {
            "tool_descriptions_saved": self._calculate_tool_desc_savings(
                baseline, migration
            ),
            "intermediate_outputs_saved": self._calculate_intermediate_savings(
                baseline, migration
            ),
            "overhead_reduced": self._calculate_overhead_reduction(
                baseline, migration
            )
        }
        
        return breakdown
    
    def analyze_latency_breakdown(self, baseline, migration):
        """Analyze latency changes"""
        
        breakdown = {
            "tool_discovery_time": migration.get('discovery_time', 0),
            "code_execution_time": migration.get('execution_time', 0),
            "network_time": migration.get('network_time', 0),
            "total": migration['latency']['mean']
        }
        
        # Compare to baseline
        baseline_total = baseline['latency']['mean']
        
        analysis = {
            "breakdown": breakdown,
            "change_vs_baseline": {
                "absolute": breakdown['total'] - baseline_total,
                "percentage": ((breakdown['total'] - baseline_total) / baseline_total) * 100
            }
        }
        
        return analysis
```

### Visualization

```python
import matplotlib.pyplot as plt

def plot_comparison(comparisons):
    """Create visual comparison charts"""
    
    test_names = [c['test_name'] for c in comparisons]
    baseline_tokens = [c['baseline_tokens'] for c in comparisons]
    migration_tokens = [c['migration_tokens'] for c in comparisons]
    
    # Token comparison bar chart
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 6))
    
    x = range(len(test_names))
    width = 0.35
    
    ax1.bar([i - width/2 for i in x], baseline_tokens, width, label='Baseline', color='red', alpha=0.7)
    ax1.bar([i + width/2 for i in x], migration_tokens, width, label='Migration', color='green', alpha=0.7)
    ax1.set_ylabel('Tokens')
    ax1.set_title('Token Consumption Comparison')
    ax1.set_xticks(x)
    ax1.set_xticklabels([t[:15] + '...' if len(t) > 15 else t for t in test_names], rotation=45, ha='right')
    ax1.legend()
    ax1.grid(axis='y', alpha=0.3)
    
    # Reduction percentage
    reductions = [c['token_reduction'] for c in comparisons]
    colors = ['green' if r >= 40 else 'orange' for r in reductions]
    ax2.bar(x, reductions, color=colors, alpha=0.7)
    ax2.axhline(y=40, color='blue', linestyle='--', label='Target (40%)')
    ax2.axhline(y=60, color='blue', linestyle='--', label='Target (60%)')
    ax2.set_ylabel('Reduction (%)')
    ax2.set_title('Token Reduction by Test Case')
    ax2.set_xticks(x)
    ax2.set_xticklabels([t[:15] + '...' if len(t) > 15 else t for t in test_names], rotation=45, ha='right')
    ax2.legend()
    ax2.grid(axis='y', alpha=0.3)
    
    plt.tight_layout()
    plt.savefig('benchmark-comparison.png', dpi=300)
    print("📊 Chart saved to benchmark-comparison.png")
```

---

## Optimization Tracking

### Week-over-Week Tracking

```python
class OptimizationTracker:
    def __init__(self):
        self.weekly_results = []
    
    def record_week(self, week_number, benchmark_results):
        """Record benchmark results for a week"""
        self.weekly_results.append({
            "week": week_number,
            "timestamp": datetime.now().isoformat(),
            "results": benchmark_results
        })
    
    def track_improvement(self):
        """Track improvements over time"""
        if len(self.weekly_results) < 2:
            return "Need at least 2 weeks of data"
        
        improvements = []
        
        for i in range(1, len(self.weekly_results)):
            prev_week = self.weekly_results[i-1]
            curr_week = self.weekly_results[i]
            
            # Calculate improvement
            prev_tokens = self._avg_tokens(prev_week['results'])
            curr_tokens = self._avg_tokens(curr_week['results'])
            
            improvement = ((prev_tokens - curr_tokens) / prev_tokens) * 100
            
            improvements.append({
                "week": curr_week['week'],
                "improvement": improvement,
                "prev_tokens": prev_tokens,
                "curr_tokens": curr_tokens
            })
        
        return improvements
    
    def _avg_tokens(self, results):
        """Calculate average tokens across all tests"""
        return sum(r['tokens']['mean'] for r in results) / len(results)
```

### Skill Usage Tracking

```python
class SkillUsageTracker:
    def track_skill_adoption(self, runs):
        """Track how often skills are used vs created"""
        
        skill_created = sum(1 for r in runs if r.get('skill_created'))
        skill_used = sum(1 for r in runs if r.get('skill_used'))
        no_skill = sum(1 for r in runs if not r.get('skill_created') and not r.get('skill_used'))
        
        return {
            "total_runs": len(runs),
            "skills_created": skill_created,
            "skills_used": skill_used,
            "no_skill": no_skill,
            "skill_usage_rate": (skill_used / len(runs)) * 100 if runs else 0,
            "skill_library_size": self._count_skills()
        }
    
    def _count_skills(self):
        """Count skills in /mnt/skills"""
        import os
        skills_dir = '/mnt/skills'
        if os.path.exists(skills_dir):
            return len([f for f in os.listdir(skills_dir) if f.endswith('.ts')])
        return 0
```

---

## Cost Analysis

### ROI Calculator

```python
class ROICalculator:
    def __init__(self, baseline_cost, migration_cost, implementation_cost):
        self.baseline_monthly = baseline_cost
        self.migration_monthly = migration_cost
        self.implementation_cost = implementation_cost
    
    def calculate_roi(self):
        """Calculate return on investment"""
        
        monthly_savings = self.baseline_monthly - self.migration_monthly
        
        # Break-even point
        break_even_months = self.implementation_cost / monthly_savings if monthly_savings > 0 else float('inf')
        
        # 1-year projection
        year_1_savings = (monthly_savings * 12) - self.implementation_cost
        
        # 3-year projection
        year_3_savings = (monthly_savings * 36) - self.implementation_cost
        
        return {
            "monthly_savings": monthly_savings,
            "break_even_months": break_even_months,
            "year_1_net": year_1_savings,
            "year_3_net": year_3_savings,
            "roi_1_year": (year_1_savings / self.implementation_cost) * 100,
            "roi_3_year": (year_3_savings / self.implementation_cost) * 100
        }
    
    def print_report(self):
        """Print ROI analysis"""
        roi = self.calculate_roi()
        
        print("\n" + "="*60)
        print("ROI ANALYSIS")
        print("="*60)
        print(f"Implementation cost: ${self.implementation_cost:,.0f}")
        print(f"Baseline monthly cost: ${self.baseline_monthly:,.0f}")
        print(f"Migration monthly cost: ${self.migration_monthly:,.0f}")
        print(f"\n💰 Monthly savings: ${roi['monthly_savings']:,.0f}")
        print(f"📅 Break-even: {roi['break_even_months']:.1f} months")
        print(f"\n1-Year Analysis:")
        print(f"  Net savings: ${roi['year_1_net']:,.0f}")
        print(f"  ROI: {roi['roi_1_year']:.0f}%")
        print(f"\n3-Year Analysis:")
        print(f"  Net savings: ${roi['year_3_net']:,.0f}")
        print(f"  ROI: {roi['roi_3_year']:.0f}%")
        print("="*60 + "\n")
```

### Example ROI Report

```
============================================================
ROI ANALYSIS
============================================================
Implementation cost: $50,000
Baseline monthly cost: $3,300
Migration monthly cost: $550

💰 Monthly savings: $2,750
📅 Break-even: 18.2 months

1-Year Analysis:
  Net savings: -$17,000 (still paying off implementation)
  ROI: -34%

3-Year Analysis:
  Net savings: $49,000
  ROI: 98%
============================================================
```

---

## Automated Monitoring

### Continuous Benchmarking

```python
class ContinuousBenchmark:
    def __init__(self, agent, test_cases):
        self.agent = agent
        self.test_cases = test_cases
    
    def run_daily_benchmark(self):
        """Run lightweight benchmark daily"""
        # Run subset of test cases
        quick_tests = self.test_cases[:3]  # First 3 cases only
        
        results = []
        for test in quick_tests:
            result = self._run_single_test(test)
            results.append(result)
        
        # Compare to baseline
        self._check_regression(results)
        
        # Log
        self._log_daily_results(results)
    
    def _check_regression(self, results):
        """Alert if performance regresses"""
        baseline = self._load_baseline()
        
        for result, baseline_result in zip(results, baseline):
            # Check token regression
            if result['tokens'] > baseline_result['tokens'] * 1.2:  # 20% worse
                self._alert_regression(
                    f"Token regression detected in {result['test_name']}: "
                    f"{result['tokens']} vs baseline {baseline_result['tokens']}"
                )
            
            # Check latency regression
            if result['latency'] > baseline_result['latency'] * 1.5:  # 50% worse
                self._alert_regression(
                    f"Latency regression detected in {result['test_name']}: "
                    f"{result['latency']}s vs baseline {baseline_result['latency']}s"
                )
```

---

## Conclusion

Performance benchmarking is essential to:
1. **Validate** the migration is achieving promised benefits
2. **Track** improvements over time
3. **Detect** performance regressions early
4. **Calculate** ROI and justify the investment

**Key Steps**:
1. Measure baseline before migration
2. Run same tests after migration
3. Compare and analyze results
4. Track week-over-week improvements
5. Monitor continuously in production

**Success Criteria**:
- ✅ 40-60% token reduction (first run)
- ✅ 85-95% token reduction (with skills)
- ✅ Same or better latency
- ✅ >60% skill usage rate after 1 month
- ✅ Positive ROI within 18 months

📊 **Start benchmarking today!**
