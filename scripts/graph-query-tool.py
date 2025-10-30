#!/usr/bin/env python3
"""
Enhanced Graph Query Tool
Provides path finding, relationship inference, and consistency validation
"""

import json
import sys
from pathlib import Path
from typing import List, Dict, Set, Tuple, Any
from collections import deque, defaultdict

class CapabilityGraph:
    def __init__(self, graph_path: str):
        """Load capability graph"""
        with open(graph_path) as f:
            data = json.load(f)
            self.graph = data['graph']
            self.version = data['version']
            self.node_count = data['node_count']
            self.edge_count = data['edge_count']

        # Build lookup indexes
        self.nodes_by_id = {node['id']: node for node in self.graph['nodes']}
        self.edges_by_from = defaultdict(list)
        self.edges_by_to = defaultdict(list)

        for edge in self.graph['edges']:
            self.edges_by_from[edge['from']].append(edge)
            self.edges_by_to[edge['to']].append(edge)

    def find_shortest_path(self, start: str, end: str,
                          edge_types: List[str] = None) -> List[str]:
        """Find shortest path between two capabilities using BFS"""
        if edge_types is None:
            edge_types = ['requires', 'enables', 'composes_with']

        if start not in self.nodes_by_id or end not in self.nodes_by_id:
            return None

        # BFS
        queue = deque([(start, [start])])
        visited = {start}

        while queue:
            current, path = queue.popleft()

            if current == end:
                return path

            # Explore neighbors
            for edge in self.edges_by_from.get(current, []):
                if edge['type'] in edge_types and edge['to'] not in visited:
                    visited.add(edge['to'])
                    queue.append((edge['to'], path + [edge['to']]))

            # Also check reverse edges
            for edge in self.edges_by_to.get(current, []):
                if edge['type'] in edge_types and edge['from'] not in visited:
                    visited.add(edge['from'])
                    queue.append((edge['from'], path + [edge['from']]))

        return None

    def find_all_dependencies(self, capability: str,
                             max_depth: int = 10) -> Dict[str, List[str]]:
        """Find all dependencies (transitive closure) of a capability"""
        if capability not in self.nodes_by_id:
            return {}

        dependencies = {
            'direct': [],
            'transitive': [],
            'depth': {}
        }

        visited = set()
        queue = deque([(capability, 0)])

        while queue:
            current, depth = queue.popleft()

            if current in visited or depth > max_depth:
                continue

            visited.add(current)

            # Find all 'requires' edges
            for edge in self.edges_by_to.get(current, []):
                if edge['type'] == 'requires':
                    dep = edge['from']

                    if depth == 0:
                        dependencies['direct'].append(dep)
                    else:
                        dependencies['transitive'].append(dep)

                    dependencies['depth'][dep] = depth + 1
                    queue.append((dep, depth + 1))

        return dependencies

    def find_composition_chains(self, capability: str,
                               max_length: int = 5) -> List[List[str]]:
        """Find composition chains starting from a capability"""
        if capability not in self.nodes_by_id:
            return []

        chains = []

        def dfs(current: str, chain: List[str], depth: int):
            if depth >= max_length:
                return

            for edge in self.edges_by_from.get(current, []):
                if edge['type'] == 'composes_with':
                    next_cap = edge['to']
                    new_chain = chain + [next_cap]
                    chains.append(new_chain)
                    dfs(next_cap, new_chain, depth + 1)

        dfs(capability, [capability], 0)
        return chains

    def find_conflicts(self, capabilities: List[str]) -> List[Tuple[str, str]]:
        """Find conflicts between a set of capabilities"""
        conflicts = []

        for cap in capabilities:
            for edge in self.edges_by_from.get(cap, []):
                if edge['type'] == 'conflicts_with' and edge['to'] in capabilities:
                    conflicts.append((cap, edge['to']))

        return conflicts

    def find_by_effect(self, effect: str) -> List[str]:
        """Find all capabilities that produce a given effect"""
        return self.graph['effects'].get(effect, [])

    def find_by_domain(self, domain: str) -> List[str]:
        """Find all capabilities in a domain"""
        return self.graph['domains'].get(domain, [])

    def validate_consistency(self) -> Dict[str, List[str]]:
        """Validate graph consistency and find issues"""
        issues = {
            'missing_nodes': [],
            'asymmetric_relationships': [],
            'circular_dependencies': [],
            'orphaned_nodes': []
        }

        # Check for missing nodes referenced in edges
        all_node_ids = set(self.nodes_by_id.keys())
        for edge in self.graph['edges']:
            if edge['from'] not in all_node_ids:
                issues['missing_nodes'].append(f"Edge references missing node: {edge['from']}")
            if edge['to'] not in all_node_ids:
                issues['missing_nodes'].append(f"Edge references missing node: {edge['to']}")

        # Check for asymmetric relationships
        for edge in self.graph['edges']:
            if edge['type'] == 'enables':
                # If A enables B, should B require A?
                reverse_exists = any(
                    e for e in self.graph['edges']
                    if e['from'] == edge['to'] and
                       e['to'] == edge['from'] and
                       e['type'] == 'requires'
                )
                if not reverse_exists:
                    issues['asymmetric_relationships'].append(
                        f"{edge['from']} enables {edge['to']} but {edge['to']} doesn't require {edge['from']}"
                    )

        # Check for circular dependencies
        def has_cycle(node: str, visited: Set[str], rec_stack: Set[str]) -> bool:
            visited.add(node)
            rec_stack.add(node)

            for edge in self.edges_by_from.get(node, []):
                if edge['type'] == 'requires':
                    neighbor = edge['to']
                    if neighbor not in visited:
                        if has_cycle(neighbor, visited, rec_stack):
                            return True
                    elif neighbor in rec_stack:
                        issues['circular_dependencies'].append(f"Cycle detected involving {node} -> {neighbor}")
                        return True

            rec_stack.remove(node)
            return False

        visited = set()
        for node_id in self.nodes_by_id:
            if node_id not in visited:
                has_cycle(node_id, visited, set())

        # Check for orphaned nodes (no incoming or outgoing edges)
        nodes_with_edges = set()
        for edge in self.graph['edges']:
            nodes_with_edges.add(edge['from'])
            nodes_with_edges.add(edge['to'])

        for node_id in self.nodes_by_id:
            if node_id not in nodes_with_edges:
                issues['orphaned_nodes'].append(node_id)

        return issues

    def infer_missing_relationships(self) -> List[Dict[str, str]]:
        """Infer potential missing relationships based on patterns"""
        suggestions = []

        # Pattern 1: If A and B share many domains, they might compose well
        for node_a_id, node_a in self.nodes_by_id.items():
            for node_b_id, node_b in self.nodes_by_id.items():
                if node_a_id >= node_b_id:
                    continue

                shared_domains = set(node_a.get('domains', [])) & set(node_b.get('domains', []))

                if len(shared_domains) >= 2:
                    # Check if relationship already exists
                    has_relationship = any(
                        e for e in self.graph['edges']
                        if (e['from'] == node_a_id and e['to'] == node_b_id) or
                           (e['from'] == node_b_id and e['to'] == node_a_id)
                    )

                    if not has_relationship:
                        suggestions.append({
                            'type': 'composes_with',
                            'from': node_a_id,
                            'to': node_b_id,
                            'reason': f"Share {len(shared_domains)} domains: {', '.join(list(shared_domains)[:2])}"
                        })

        return suggestions[:20]  # Top 20 suggestions

    def get_subgraph(self, capability: str, max_hops: int = 2) -> Dict[str, Any]:
        """Extract subgraph around a capability"""
        if capability not in self.nodes_by_id:
            return None

        subgraph = {
            'nodes': [],
            'edges': []
        }

        visited = set()
        queue = deque([(capability, 0)])

        while queue:
            current, depth = queue.popleft()

            if current in visited or depth > max_hops:
                continue

            visited.add(current)
            subgraph['nodes'].append(self.nodes_by_id[current])

            # Add edges
            for edge in self.edges_by_from.get(current, []):
                subgraph['edges'].append(edge)
                if edge['to'] not in visited:
                    queue.append((edge['to'], depth + 1))

            for edge in self.edges_by_to.get(current, []):
                subgraph['edges'].append(edge)
                if edge['from'] not in visited:
                    queue.append((edge['from'], depth + 1))

        return subgraph

def main():
    if len(sys.argv) < 2:
        print("""
Enhanced Graph Query Tool

Usage:
  python3 graph-query-tool.py <command> [args]

Commands:
  path <from> <to>           Find shortest path between capabilities
  deps <capability>          Find all dependencies
  chains <capability>        Find composition chains
  conflicts <cap1> <cap2>... Find conflicts in capability set
  effect <effect>            Find capabilities by effect
  domain <domain>            Find capabilities by domain
  validate                   Validate graph consistency
  infer                      Infer missing relationships
  subgraph <capability>      Extract subgraph
  stats                      Show graph statistics
        """)
        sys.exit(1)

    # Load graph
    project_root = Path(__file__).parent.parent
    graph_path = project_root / 'META' / 'capability-graph.json'
    graph = CapabilityGraph(graph_path)

    command = sys.argv[1]

    if command == 'path':
        if len(sys.argv) < 4:
            print("Usage: path <from> <to>")
            sys.exit(1)

        path = graph.find_shortest_path(sys.argv[2], sys.argv[3])
        if path:
            print(f"Shortest path: {' → '.join(path)}")
        else:
            print("No path found")

    elif command == 'deps':
        if len(sys.argv) < 3:
            print("Usage: deps <capability>")
            sys.exit(1)

        deps = graph.find_all_dependencies(sys.argv[2])
        print(f"\nDependencies for {sys.argv[2]}:")
        print(f"  Direct: {', '.join(deps['direct']) if deps['direct'] else 'None'}")
        print(f"  Transitive: {', '.join(deps['transitive']) if deps['transitive'] else 'None'}")

    elif command == 'chains':
        if len(sys.argv) < 3:
            print("Usage: chains <capability>")
            sys.exit(1)

        chains = graph.find_composition_chains(sys.argv[2])
        print(f"\nComposition chains from {sys.argv[2]}:")
        for i, chain in enumerate(chains[:10], 1):
            print(f"  {i}. {' → '.join(chain)}")

    elif command == 'conflicts':
        if len(sys.argv) < 3:
            print("Usage: conflicts <cap1> <cap2> ...")
            sys.exit(1)

        conflicts = graph.find_conflicts(sys.argv[2:])
        if conflicts:
            print("\nConflicts found:")
            for a, b in conflicts:
                print(f"  ⚠️  {a} conflicts with {b}")
        else:
            print("✅ No conflicts found")

    elif command == 'effect':
        if len(sys.argv) < 3:
            print("Usage: effect <effect>")
            sys.exit(1)

        capabilities = graph.find_by_effect(sys.argv[2])
        print(f"\nCapabilities with effect '{sys.argv[2]}':")
        for cap in capabilities:
            print(f"  • {cap}")

    elif command == 'domain':
        if len(sys.argv) < 3:
            print("Usage: domain <domain>")
            sys.exit(1)

        capabilities = graph.find_by_domain(sys.argv[2])
        print(f"\nCapabilities in domain '{sys.argv[2]}':")
        for cap in capabilities:
            print(f"  • {cap}")

    elif command == 'validate':
        issues = graph.validate_consistency()
        print("\n" + "=" * 60)
        print("GRAPH VALIDATION")
        print("=" * 60)

        total_issues = sum(len(v) for v in issues.values())

        if total_issues == 0:
            print("\n✅ No issues found! Graph is consistent.")
        else:
            for category, problems in issues.items():
                if problems:
                    print(f"\n⚠️  {category.replace('_', ' ').title()}: {len(problems)}")
                    for problem in problems[:5]:
                        print(f"    • {problem}")
                    if len(problems) > 5:
                        print(f"    ... and {len(problems) - 5} more")

    elif command == 'infer':
        suggestions = graph.infer_missing_relationships()
        print("\n" + "=" * 60)
        print("INFERRED RELATIONSHIPS")
        print("=" * 60)
        print(f"\nFound {len(suggestions)} potential relationships:")
        for sug in suggestions:
            print(f"\n  {sug['from']} → {sug['to']}")
            print(f"    Type: {sug['type']}")
            print(f"    Reason: {sug['reason']}")

    elif command == 'subgraph':
        if len(sys.argv) < 3:
            print("Usage: subgraph <capability>")
            sys.exit(1)

        subgraph = graph.get_subgraph(sys.argv[2])
        if subgraph:
            print(f"\nSubgraph for {sys.argv[2]}:")
            print(f"  Nodes: {len(subgraph['nodes'])}")
            print(f"  Edges: {len(subgraph['edges'])}")
            print(f"\n  Connected capabilities:")
            for node in subgraph['nodes'][:10]:
                print(f"    • {node['id']} ({node['kind']})")
        else:
            print(f"Capability '{sys.argv[2]}' not found")

    elif command == 'stats':
        print("\n" + "=" * 60)
        print("GRAPH STATISTICS")
        print("=" * 60)
        print(f"\nVersion: {graph.version}")
        print(f"Nodes: {graph.node_count}")

        skills = sum(1 for n in graph.graph['nodes'] if n['kind'] == 'skill')
        mcps = sum(1 for n in graph.graph['nodes'] if n['kind'] == 'mcp')
        print(f"  Skills: {skills}")
        print(f"  MCPs: {mcps}")

        print(f"\nEdges: {graph.edge_count}")
        edge_types = {}
        for edge in graph.graph['edges']:
            edge_types[edge['type']] = edge_types.get(edge['type'], 0) + 1

        for edge_type, count in sorted(edge_types.items(), key=lambda x: x[1], reverse=True):
            print(f"  {edge_type}: {count}")

        print(f"\nDomains: {len(graph.graph['domains'])}")
        print(f"Effects: {len(graph.graph['effects'])}")

        print(f"\nTop 5 Domains:")
        sorted_domains = sorted(graph.graph['domains'].items(), key=lambda x: len(x[1]), reverse=True)[:5]
        for domain, caps in sorted_domains:
            print(f"  {domain}: {len(caps)} capabilities")

    else:
        print(f"Unknown command: {command}")
        sys.exit(1)

if __name__ == '__main__':
    main()
