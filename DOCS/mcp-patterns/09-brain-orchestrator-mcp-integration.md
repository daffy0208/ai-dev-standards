# Brain Orchestrator Integration: MCP Pattern Selection

## Executive Summary

This guide shows how to integrate MCP pattern selection (Direct MCP vs Code Execution) into your ai-dev-standards brain orchestrator. The brain will automatically choose the optimal pattern based on task complexity, data size, and available resources.

**Goal**: Automate the decision "Should I use Direct MCP or Code Execution for this task?"

**Integration Time**: 1-2 weeks

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Approach Selector Logic](#approach-selector-logic)
3. [Implementation](#implementation)
4. [Integration with Existing Brain](#integration-with-existing-brain)
5. [Testing & Validation](#testing-validation)

---

## Architecture Overview

### Current Brain Flow (Simplified)

```
User Request
    ↓
brain_select_skills (choose which skills to use)
    ↓
brain_relationships (map MCP dependencies)
    ↓
Execute using Direct MCP
    ↓
Return Results
```

### Enhanced Brain Flow (With Pattern Selection)

```
User Request
    ↓
brain_analyze_complexity (NEW - analyze task)
    ↓
brain_select_approach (NEW - choose Direct MCP or Code Execution)
    ├─ Simple task → Direct MCP
    └─ Complex task → Code Execution
        ↓
brain_select_skills (choose which skills to use)
    ↓
brain_relationships (map MCP dependencies)
    ↓
Execute using chosen pattern
    ↓
Return Results
```

---

## Approach Selector Logic

### Decision Matrix

```python
class ApproachSelector:
    """
    Automatically selects the best MCP pattern based on task characteristics.
    """

    def select_approach(self, task: dict) -> str:
        """
        Returns: 'direct_mcp' or 'code_execution'
        """

        # Analyze task complexity
        complexity_score = self._calculate_complexity(task)

        # Apply decision rules
        if complexity_score >= 7:
            return 'code_execution'
        elif complexity_score <= 3:
            return 'direct_mcp'
        else:
            # Medium complexity: check additional factors
            return self._detailed_analysis(task)

    def _calculate_complexity(self, task: dict) -> int:
        """
        Calculate complexity score (0-10)
        Higher score = more complex = favor Code Execution
        """
        score = 0

        # Factor 1: Number of tools (0-3 points)
        tool_count = task.get('estimated_tool_count', 0)
        if tool_count >= 10:
            score += 3
        elif tool_count >= 5:
            score += 2
        elif tool_count >= 3:
            score += 1

        # Factor 2: Data size (0-3 points)
        data_size_kb = task.get('estimated_data_size_kb', 0)
        if data_size_kb >= 100:
            score += 3
        elif data_size_kb >= 50:
            score += 2
        elif data_size_kb >= 10:
            score += 1

        # Factor 3: Workflow complexity (0-2 points)
        has_conditionals = task.get('requires_conditionals', False)
        has_loops = task.get('requires_loops', False)
        if has_conditionals or has_loops:
            score += 2

        # Factor 4: Requires data transformation (0-2 points)
        requires_transformation = task.get('requires_transformation', False)
        if requires_transformation:
            score += 2

        return min(score, 10)  # Cap at 10

    def _detailed_analysis(self, task: dict) -> str:
        """
        For medium complexity tasks, perform detailed analysis
        """

        # Check for specific patterns favoring Code Execution
        code_execution_signals = [
            task.get('requires_polling', False),  # Polling benefits from in-code loops
            task.get('has_pii', False),  # PII benefits from tokenization
            task.get('repeated_workflow', False),  # Can create reusable skill
            len(task.get('data_dependencies', [])) > 3  # Complex data flow
        ]

        # If 2+ signals, use Code Execution
        if sum(code_execution_signals) >= 2:
            return 'code_execution'

        # Check for patterns favoring Direct MCP
        direct_mcp_signals = [
            task.get('real_time_interaction', False),  # Chat-like needs direct
            task.get('simple_crud', False),  # Simple create/read/update/delete
            task.get('single_tool', False),  # Only one tool needed
            task.get('resource_constrained', False)  # Limited infrastructure
        ]

        # If 2+ signals, use Direct MCP
        if sum(direct_mcp_signals) >= 2:
            return 'direct_mcp'

        # Default to Direct MCP for medium complexity
        return 'direct_mcp'
```

### Task Complexity Analyzer

```python
class TaskComplexityAnalyzer:
    """
    Analyzes task to estimate complexity factors
    """

    def analyze(self, task_description: str) -> dict:
        """
        Extract complexity factors from task description
        """

        analysis = {
            'estimated_tool_count': self._estimate_tools(task_description),
            'estimated_data_size_kb': self._estimate_data_size(task_description),
            'requires_conditionals': self._check_conditionals(task_description),
            'requires_loops': self._check_loops(task_description),
            'requires_transformation': self._check_transformation(task_description),
            'has_pii': self._check_pii_handling(task_description),
            'real_time_interaction': self._check_real_time(task_description),
            'simple_crud': self._check_simple_crud(task_description)
        }

        return analysis

    def _estimate_tools(self, description: str) -> int:
        """
        Estimate number of tools from task description
        """
        # Count mentions of systems/services
        systems = [
            'google drive', 'notion', 'salesforce', 'slack',
            'gmail', 'sheets', 'calendar', 'jira', 'github',
            'postgres', 'mongodb', 'redis', 'api', 'database'
        ]

        # Count how many systems are mentioned
        mentioned = sum(1 for system in systems if system in description.lower())

        # Each system typically needs 2-3 tools
        return mentioned * 2

    def _estimate_data_size(self, description: str) -> int:
        """
        Estimate data size from task description
        """
        # Keywords indicating large data
        large_data_keywords = [
            'all', 'entire', 'full', 'complete', 'every',
            'batch', 'bulk', 'mass', 'multiple', 'many'
        ]

        # Keywords indicating small data
        small_data_keywords = [
            'single', 'one', 'specific', 'particular'
        ]

        large_matches = sum(1 for kw in large_data_keywords if kw in description.lower())
        small_matches = sum(1 for kw in small_data_keywords if kw in description.lower())

        if large_matches > small_matches:
            return 100  # Large dataset
        elif small_matches > large_matches:
            return 5  # Small dataset
        else:
            return 25  # Medium dataset

    def _check_conditionals(self, description: str) -> bool:
        """Check if task requires conditional logic"""
        conditional_keywords = [
            'if', 'when', 'depending on', 'based on', 'check if',
            'only if', 'unless', 'in case', 'should'
        ]

        return any(kw in description.lower() for kw in conditional_keywords)

    def _check_loops(self, description: str) -> bool:
        """Check if task requires loops"""
        loop_keywords = [
            'each', 'every', 'all', 'for each', 'repeatedly',
            'iterate', 'loop', 'multiple', 'batch'
        ]

        return any(kw in description.lower() for kw in loop_keywords)

    def _check_transformation(self, description: str) -> bool:
        """Check if task requires data transformation"""
        transform_keywords = [
            'transform', 'convert', 'parse', 'extract', 'format',
            'clean', 'normalize', 'aggregate', 'summarize', 'analyze'
        ]

        return any(kw in description.lower() for kw in transform_keywords)

    def _check_pii_handling(self, description: str) -> bool:
        """Check if task involves PII"""
        pii_keywords = [
            'customer', 'user', 'personal', 'contact', 'email',
            'phone', 'address', 'name', 'ssn', 'credit card',
            'sensitive', 'confidential', 'private'
        ]

        return any(kw in description.lower() for kw in pii_keywords)

    def _check_real_time(self, description: str) -> bool:
        """Check if task requires real-time interaction"""
        realtime_keywords = [
            'chat', 'respond', 'answer', 'reply', 'conversation',
            'interactive', 'live', 'real-time', 'immediate'
        ]

        return any(kw in description.lower() for kw in realtime_keywords)

    def _check_simple_crud(self, description: str) -> bool:
        """Check if task is simple CRUD"""
        # Simple if only one action word
        action_words = ['create', 'read', 'get', 'update', 'delete', 'list']
        actions_found = sum(1 for word in action_words if word in description.lower())

        # And task is short
        return actions_found == 1 and len(description.split()) < 15
```

---

## Implementation

### Step 1: Add Approach Selector to Brain

```python
# /TOOLS/brain-mcp/approach_selector.py

from .complexity_analyzer import TaskComplexityAnalyzer
from typing import Dict

class MCPApproachSelector:
    """
    Intelligent selector for MCP pattern (Direct vs Code Execution)
    """

    def __init__(self):
        self.analyzer = TaskComplexityAnalyzer()

    def select_approach(self, task_description: str, skills_needed: list) -> Dict:
        """
        Main entry point: select MCP approach based on task

        Args:
            task_description: Natural language task description
            skills_needed: List of skills identified by brain_select_skills

        Returns:
            {
                'approach': 'direct_mcp' or 'code_execution',
                'reasoning': explanation,
                'complexity_score': 0-10,
                'confidence': 0-1
            }
        """

        # Analyze task complexity
        analysis = self.analyzer.analyze(task_description)

        # Add skill count to analysis
        analysis['estimated_tool_count'] = max(
            analysis['estimated_tool_count'],
            len(skills_needed) * 2  # Each skill might use 2 tools
        )

        # Calculate complexity score
        complexity_score = self._calculate_complexity(analysis)

        # Make decision
        if complexity_score >= 7:
            approach = 'code_execution'
            reasoning = self._explain_code_execution_choice(analysis)
            confidence = min(1.0, (complexity_score - 6) / 4)  # 0.25 to 1.0

        elif complexity_score <= 3:
            approach = 'direct_mcp'
            reasoning = self._explain_direct_mcp_choice(analysis)
            confidence = min(1.0, (4 - complexity_score) / 4)  # 0.25 to 1.0

        else:
            # Medium complexity: detailed analysis
            approach = self._detailed_analysis(analysis)
            reasoning = self._explain_medium_complexity_choice(analysis, approach)
            confidence = 0.6  # Medium confidence for medium complexity

        return {
            'approach': approach,
            'reasoning': reasoning,
            'complexity_score': complexity_score,
            'confidence': confidence,
            'analysis': analysis
        }

    def _calculate_complexity(self, analysis: dict) -> int:
        """Calculate 0-10 complexity score"""
        score = 0

        # Tool count (0-3 points)
        tool_count = analysis['estimated_tool_count']
        if tool_count >= 10:
            score += 3
        elif tool_count >= 5:
            score += 2
        elif tool_count >= 3:
            score += 1

        # Data size (0-3 points)
        data_size = analysis['estimated_data_size_kb']
        if data_size >= 100:
            score += 3
        elif data_size >= 50:
            score += 2
        elif data_size >= 10:
            score += 1

        # Workflow complexity (0-2 points)
        if analysis['requires_conditionals'] or analysis['requires_loops']:
            score += 2

        # Data transformation (0-2 points)
        if analysis['requires_transformation']:
            score += 2

        return min(score, 10)

    def _detailed_analysis(self, analysis: dict) -> str:
        """Detailed analysis for medium complexity tasks"""

        # Favor Code Execution if...
        code_exec_score = 0
        if analysis.get('requires_loops', False):
            code_exec_score += 2
        if analysis.get('has_pii', False):
            code_exec_score += 2
        if analysis.get('requires_transformation', False):
            code_exec_score += 1

        # Favor Direct MCP if...
        direct_mcp_score = 0
        if analysis.get('real_time_interaction', False):
            direct_mcp_score += 2
        if analysis.get('simple_crud', False):
            direct_mcp_score += 2
        if analysis['estimated_tool_count'] <= 2:
            direct_mcp_score += 1

        # Decide
        return 'code_execution' if code_exec_score > direct_mcp_score else 'direct_mcp'

    def _explain_code_execution_choice(self, analysis: dict) -> str:
        """Generate reasoning for Code Execution choice"""
        reasons = []

        if analysis['estimated_tool_count'] >= 5:
            reasons.append(f"task requires {analysis['estimated_tool_count']} tools")

        if analysis['estimated_data_size_kb'] >= 10:
            reasons.append(f"large data volume ({analysis['estimated_data_size_kb']}KB)")

        if analysis['requires_loops']:
            reasons.append("requires iterative processing")

        if analysis['has_pii']:
            reasons.append("involves PII (benefits from tokenization)")

        if analysis['requires_transformation']:
            reasons.append("requires data transformation")

        return f"Code Execution selected because: {', '.join(reasons)}"

    def _explain_direct_mcp_choice(self, analysis: dict) -> str:
        """Generate reasoning for Direct MCP choice"""
        reasons = []

        if analysis['estimated_tool_count'] <= 2:
            reasons.append(f"simple task ({analysis['estimated_tool_count']} tools)")

        if analysis['estimated_data_size_kb'] < 10:
            reasons.append("small data volume")

        if analysis['real_time_interaction']:
            reasons.append("requires real-time interaction")

        if analysis['simple_crud']:
            reasons.append("simple CRUD operation")

        return f"Direct MCP selected because: {', '.join(reasons)}"

    def _explain_medium_complexity_choice(self, analysis: dict, approach: str) -> str:
        """Generate reasoning for medium complexity decision"""
        return (
            f"Medium complexity task (score: {self._calculate_complexity(analysis)}/10). "
            f"Selected {approach.replace('_', ' ').title()} based on specific characteristics."
        )
```

### Step 2: Update Brain Orchestrator

```python
# /TOOLS/brain-mcp/brain_orchestrator.py

from .brain_select_skills import BrainSelectSkills
from .brain_relationships import BrainRelationships
from .approach_selector import MCPApproachSelector

class BrainOrchestrator:
    """
    Enhanced brain with automatic MCP pattern selection
    """

    def __init__(self):
        self.skill_selector = BrainSelectSkills()
        self.relationship_mapper = BrainRelationships()
        self.approach_selector = MCPApproachSelector()  # NEW

    def orchestrate(self, task_description: str) -> dict:
        """
        Main orchestration logic with pattern selection
        """

        # Step 1: Select relevant skills (existing)
        skills = self.skill_selector.select(task_description)

        # Step 2: NEW - Select MCP approach
        approach_decision = self.approach_selector.select_approach(
            task_description,
            skills
        )

        # Step 3: Map relationships (existing)
        relationships = self.relationship_mapper.map(skills)

        # Step 4: Prepare execution plan
        execution_plan = {
            'task': task_description,
            'approach': approach_decision['approach'],
            'approach_reasoning': approach_decision['reasoning'],
            'confidence': approach_decision['confidence'],
            'skills': skills,
            'mcps_needed': relationships['mcps'],
            'tools_needed': relationships['tools'],
            'estimated_complexity': approach_decision['complexity_score'],
            'estimated_cost': self._estimate_cost(
                approach_decision['approach'],
                approach_decision['complexity_score']
            )
        }

        return execution_plan

    def _estimate_cost(self, approach: str, complexity: int) -> dict:
        """
        Estimate token cost based on approach and complexity
        """

        # Base token estimates
        if approach == 'direct_mcp':
            # Direct MCP: scales linearly with complexity
            base_tokens = 5000
            tokens_per_complexity = 3000
            estimated_tokens = base_tokens + (complexity * tokens_per_complexity)

        else:  # code_execution
            # Code Execution: more efficient, especially for complex tasks
            if complexity <= 4:
                # Low complexity: similar to direct MCP
                estimated_tokens = 5000 + (complexity * 2000)
            else:
                # High complexity: big savings
                estimated_tokens = 3000 + (complexity * 1000)

        # Cost calculation (GPT-4 pricing example)
        input_cost_per_1k = 0.003
        output_cost_per_1k = 0.015

        # Assume 70% input, 30% output
        input_tokens = estimated_tokens * 0.7
        output_tokens = estimated_tokens * 0.3

        cost_usd = (
            (input_tokens / 1000 * input_cost_per_1k) +
            (output_tokens / 1000 * output_cost_per_1k)
        )

        return {
            'estimated_tokens': estimated_tokens,
            'estimated_cost_usd': round(cost_usd, 3),
            'breakdown': {
                'input_tokens': int(input_tokens),
                'output_tokens': int(output_tokens)
            }
        }
```

---

## Integration with Existing Brain

### Modify Existing Files

#### Update brain_select_skills.py

No changes needed! The approach selector works with the existing skill selection.

#### Update brain_relationships.py

Minor enhancement to include approach in the output:

```python
# /TOOLS/brain-mcp/brain_relationships.py

def map(self, skills: list, approach: str = 'direct_mcp') -> dict:
    """
    Map relationships with awareness of execution approach

    Args:
        skills: List of skills to map
        approach: 'direct_mcp' or 'code_execution'
    """

    # Existing relationship mapping logic...
    relationships = self._do_existing_mapping(skills)

    # Add approach-specific metadata
    if approach == 'code_execution':
        # For code execution, include filesystem paths
        relationships['filesystem_structure'] = self._map_filesystem_paths(
            relationships['mcps']
        )

    return relationships

def _map_filesystem_paths(self, mcps: list) -> dict:
    """Map MCPs to /servers/ filesystem structure"""
    return {
        mcp: f"/servers/{mcp.replace('_', '-')}"
        for mcp in mcps
    }
```

---

## Testing & Validation

### Test Suite

```python
# test_approach_selector.py

import pytest
from brain_mcp.approach_selector import MCPApproachSelector

class TestApproachSelector:
    def setup_method(self):
        self.selector = MCPApproachSelector()

    def test_simple_task_uses_direct_mcp(self):
        """Simple tasks should use Direct MCP"""
        result = self.selector.select_approach(
            "Get a single document from Google Drive",
            skills_needed=['gdrive-reader']
        )

        assert result['approach'] == 'direct_mcp'
        assert result['complexity_score'] <= 3
        assert result['confidence'] >= 0.5

    def test_complex_task_uses_code_execution(self):
        """Complex tasks should use Code Execution"""
        result = self.selector.select_approach(
            "Analyze all customer emails from Gmail, extract sentiment, "
            "aggregate by category, and update Salesforce records",
            skills_needed=[
                'gmail-reader', 'sentiment-analyzer', 'data-aggregator',
                'salesforce-updater', 'report-generator'
            ]
        )

        assert result['approach'] == 'code_execution'
        assert result['complexity_score'] >= 7
        assert result['confidence'] >= 0.5

    def test_pii_task_uses_code_execution(self):
        """Tasks with PII should use Code Execution (for tokenization)"""
        result = self.selector.select_approach(
            "Read customer contact information from database and send to sales team",
            skills_needed=['db-reader', 'slack-sender']
        )

        # Should prefer code_execution due to PII
        assert result['approach'] == 'code_execution'
        assert result['analysis']['has_pii'] == True

    def test_real_time_chat_uses_direct_mcp(self):
        """Real-time chat should use Direct MCP"""
        result = self.selector.select_approach(
            "Answer customer questions in real-time chat",
            skills_needed=['chat-responder']
        )

        assert result['approach'] == 'direct_mcp'
        assert result['analysis']['real_time_interaction'] == True

    def test_orchestrator_integration(self):
        """Test full orchestrator with approach selection"""
        from brain_mcp.brain_orchestrator import BrainOrchestrator

        orchestrator = BrainOrchestrator()

        plan = orchestrator.orchestrate(
            "Copy all meeting transcripts from Google Drive to Notion CRM"
        )

        # Should produce complete execution plan
        assert 'approach' in plan
        assert plan['approach'] in ['direct_mcp', 'code_execution']
        assert 'skills' in plan
        assert 'mcps_needed' in plan
        assert 'estimated_cost' in plan

        # For this task (multiple docs, data processing), should be code execution
        assert plan['approach'] == 'code_execution'
```

### Manual Testing

```bash
# Test the orchestrator with real tasks
python -m brain_mcp.cli "Create a new Notion page with meeting notes"
# Expected: direct_mcp (simple, 1-2 tools)

python -m brain_mcp.cli "Analyze all Salesforce leads from last quarter, calculate conversion rates by source, and create a comprehensive report in Google Sheets with visualizations"
# Expected: code_execution (complex, many tools, data transformation)

python -m brain_mcp.cli "Send a Slack message to the team channel"
# Expected: direct_mcp (simple, real-time)
```

---

## Deployment

### Rollout Plan

**Phase 1: Shadow Mode (Week 1)**

- Deploy approach selector
- Run in parallel with existing system
- Log decisions but don't act on them
- Validate accuracy

**Phase 2: Gradual Rollout (Week 2)**

- Apply approach selection to 10% of tasks
- Monitor results
- Adjust thresholds if needed

**Phase 3: Full Deployment (Week 3)**

- Apply to 100% of tasks
- Monitor performance
- Iterate on decision logic

---

## Monitoring

### Key Metrics

```python
monitoring_metrics = {
    "approach_distribution": {
        "direct_mcp_percent": "% of tasks using Direct MCP",
        "code_execution_percent": "% of tasks using Code Execution",
        "target": "60% direct, 40% code execution"
    },
    "decision_accuracy": {
        "false_positives": "Tasks that should have used Direct MCP but used Code Execution",
        "false_negatives": "Tasks that should have used Code Execution but used Direct MCP",
        "target": "<10% error rate"
    },
    "performance_impact": {
        "avg_tokens_direct_mcp": "Average tokens for Direct MCP tasks",
        "avg_tokens_code_execution": "Average tokens for Code Execution tasks",
        "overall_savings": "Total token savings vs all-direct-mcp baseline"
    }
}
```

---

## Conclusion

Integrating approach selection into your brain orchestrator enables:

- **Automatic optimization**: Brain chooses best pattern for each task
- **Cost savings**: Code Execution used only when beneficial
- **Simplified usage**: Users don't need to understand MCP patterns
- **Better performance**: Right tool for the right job

**Next Steps**:

1. Add `approach_selector.py` to your brain-mcp directory
2. Update `brain_orchestrator.py` to call approach selector
3. Test with sample tasks
4. Deploy in shadow mode
5. Gradually roll out to production

🧠 **Your brain just got smarter!**
