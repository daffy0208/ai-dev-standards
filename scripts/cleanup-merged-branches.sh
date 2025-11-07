#!/bin/bash

# Branch Cleanup Script
# This script deletes merged branches that are safe to remove
# Run this from the repository root directory

set -e

echo "🧹 Branch Cleanup Script"
echo "======================="
echo ""

# List of merged branches to delete (safe to remove - already in main)
BRANCHES=(
  "codex/add-registry-fields-and-updates"
  "codex/update-mcp-integrator-warning-checks"
  "copilot/fix-207889146-1081173453-7fbabeed-c905-4af8-9c56-b050c92658cd"
  "copilot/fix-linting-errors-and-review"
  "copilot/improve-repo-functionality"
  "copilot/update-vivantio-repo"
  "feat/post-phase2-improvements"
  "security/critical-project-isolation-v3.0.0"
  "test/codex-review-workflow"
)

echo "This script will delete the following ${#BRANCHES[@]} merged branches:"
echo ""
for branch in "${BRANCHES[@]}"; do
  echo "  - $branch"
done
echo ""

# Ask for confirmation
read -p "Do you want to proceed? (y/N): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "❌ Cleanup cancelled."
  exit 0
fi

echo ""
echo "Starting cleanup..."
echo ""

SUCCESS_COUNT=0
FAIL_COUNT=0
ALREADY_DELETED=0

for branch in "${BRANCHES[@]}"; do
  echo "Deleting: $branch"
  
  # Try to delete the branch
  if git push origin --delete "$branch" 2>&1 | tee /tmp/branch_delete.log; then
    echo "✅ Successfully deleted: $branch"
    SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
  else
    # Check if it was already deleted
    if grep -q "unable to delete" /tmp/branch_delete.log || grep -q "not found" /tmp/branch_delete.log; then
      echo "ℹ️  Already deleted: $branch"
      ALREADY_DELETED=$((ALREADY_DELETED + 1))
    else
      echo "❌ Failed to delete: $branch"
      FAIL_COUNT=$((FAIL_COUNT + 1))
    fi
  fi
  echo ""
done

echo "==========================="
echo "📊 Cleanup Summary"
echo "==========================="
echo "✅ Successfully deleted: $SUCCESS_COUNT branches"
echo "ℹ️  Already deleted: $ALREADY_DELETED branches"
echo "❌ Failed to delete: $FAIL_COUNT branches"
echo ""

TOTAL_CLEANED=$((SUCCESS_COUNT + ALREADY_DELETED))
if [ $TOTAL_CLEANED -eq ${#BRANCHES[@]} ]; then
  echo "🎉 All merged branches are now cleaned up!"
else
  echo "⚠️  Some branches could not be deleted. You may need to check permissions or branch protection rules."
fi

echo ""
echo "Next steps:"
echo "1. Enable automatic branch deletion in GitHub (see REPO-CLEANUP-GUIDE.md)"
echo "2. Review open PR #11 (codex/review-orchestration-and-management-system)"
