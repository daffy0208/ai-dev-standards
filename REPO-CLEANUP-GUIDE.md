# Repository Cleanup Guide

This guide walks you through cleaning up merged branches and setting up automatic branch deletion.

## Quick Start

Run the cleanup script:

```bash
bash scripts/cleanup-merged-branches.sh
```

## Manual Cleanup (Alternative)

If you prefer to delete branches one at a time:

```bash
# Delete individual branches
git push origin --delete codex/add-registry-fields-and-updates
git push origin --delete codex/update-mcp-integrator-warning-checks
git push origin --delete copilot/fix-207889146-1081173453-7fbabeed-c905-4af8-9c56-b050c92658cd
git push origin --delete copilot/fix-linting-errors-and-review
git push origin --delete copilot/improve-repo-functionality
git push origin --delete copilot/update-vivantio-repo
git push origin --delete feat/post-phase2-improvements
git push origin --delete security/critical-project-isolation-v3.0.0
git push origin --delete test/codex-review-workflow
```

Or delete all merged branches at once:

```bash
git branch -r --merged origin/main | \
  grep -v 'main\|copilot/review-existing-branches' | \
  sed 's/origin\///' | \
  xargs -I {} git push origin --delete {}
```

## Enable Automatic Branch Deletion in GitHub

Follow these steps to automatically delete branches when PRs are merged:

### Method 1: Repository Settings (Recommended)

1. **Navigate to Repository Settings**
   - Go to: https://github.com/daffy0208/ai-dev-standards/settings

2. **Scroll to "Pull Requests" Section**
   - Look for the section titled "Pull Requests"

3. **Enable Automatic Branch Deletion**
   - Check the box: **"Automatically delete head branches"**
   - This will delete branches automatically after PRs are merged

4. **Save Changes**
   - The setting is saved automatically when you check the box

### Method 2: Using GitHub CLI (Alternative)

If you have the GitHub CLI installed:

```bash
gh repo edit daffy0208/ai-dev-standards --delete-branch-on-merge
```

### Verification

To verify the setting is enabled:

```bash
# Using GitHub CLI
gh repo view daffy0208/ai-dev-standards --json deleteBranchOnMerge

# Should return:
# {
#   "deleteBranchOnMerge": true
# }
```

## Visual Guide

### Step-by-Step Screenshots

1. **Go to Settings Tab**

   ```
   Repository → Settings (⚙️ gear icon in top menu)
   ```

2. **Find Pull Requests Section**

   ```
   Scroll down to "Pull Requests" section
   (Usually located after "Features" and before "Archives")
   ```

3. **Enable the Setting**

   ```
   ☑️ Automatically delete head branches

   Description shown:
   "Deleted branches will still be able to be restored."
   ```

## Benefits of Automatic Branch Deletion

✅ **Keeps repository clean** - No manual cleanup needed
✅ **Reduces clutter** - Branch list stays manageable
✅ **Safe operation** - Deleted branches can be restored if needed
✅ **Best practice** - Industry standard for modern Git workflows

## Additional Cleanup Tasks

### Review Open PR #11

The branch `codex/review-orchestration-and-management-system` has an open PR that's 10 days old:

```bash
# View the PR
gh pr view 11

# Options:
# 1. Merge if changes are still needed
gh pr merge 11

# 2. Close if superseded
gh pr close 11

# 3. Delete the branch if PR is closed
git push origin --delete codex/review-orchestration-and-management-system
```

### Local Cleanup

Clean up your local references to deleted remote branches:

```bash
# Remove local references to deleted remote branches
git fetch --prune origin

# Or more aggressively (removes all stale tracking branches)
git remote prune origin
```

## Maintenance Schedule

With automatic branch deletion enabled, your ongoing maintenance is minimal:

- **Weekly:** Review open PRs (close or merge stale ones)
- **Monthly:** Run `git fetch --prune` to clean local references
- **Quarterly:** Review branch protection rules and settings

## Troubleshooting

### "Permission denied" when deleting branches

You need admin or write access to delete branches. Contact the repository owner if needed.

### "Branch is protected"

Protected branches cannot be deleted. Review branch protection rules in Settings → Branches.

### Branch appears deleted but still shows in UI

Wait a few minutes for GitHub's cache to refresh, or force refresh (Ctrl+F5 / Cmd+Shift+R).

### Restored deleted branch

GitHub keeps deleted branches for a limited time. To restore:

1. Go to the closed PR
2. Click "Restore branch" button at the bottom

## References

- [GitHub Docs: Managing automatic deletion](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-branches-in-your-repository/managing-the-automatic-deletion-of-branches)
- [Branch Review Report](./BRANCH-REVIEW-REPORT.md) - Detailed analysis of all branches

## Summary

1. ✅ Run `bash scripts/cleanup-merged-branches.sh` to delete 9 merged branches
2. ✅ Enable automatic deletion in Settings → Pull Requests → ☑️ Automatically delete head branches
3. ✅ Review/close PR #11
4. ✅ Run `git fetch --prune` locally

Your repository will now stay clean automatically! 🎉
