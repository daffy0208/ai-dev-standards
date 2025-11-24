# Scripts Directory

This directory contains utility scripts for repository maintenance and operations.

## Branch Management

### cleanup-merged-branches.sh

**Purpose:** Delete merged branches that are safe to remove from the remote repository.

**Usage:**

```bash
bash scripts/cleanup-merged-branches.sh
```

**Features:**

- Lists all branches to be deleted
- Requires confirmation before deletion
- Provides detailed feedback for each deletion
- Shows summary statistics
- Safe operation (only deletes already-merged branches)

**What it deletes:**

- 9 branches that have been merged into main
- All changes from these branches are already in the main branch
- See [BRANCH-REVIEW-REPORT.md](../BRANCH-REVIEW-REPORT.md) for the full list

**Requirements:**

- Git access with push permissions
- Repository must be cloned locally

## Other Scripts

For information about other scripts in this directory, refer to the main repository documentation.

## Contributing

When adding new scripts to this directory:

1. Make scripts executable: `chmod +x script-name.sh`
2. Add proper shebang: `#!/bin/bash` or `#!/usr/bin/env node`
3. Include usage documentation
4. Update this README
5. Test thoroughly before committing

## See Also

- [REPO-CLEANUP-GUIDE.md](../REPO-CLEANUP-GUIDE.md) - Comprehensive cleanup guide
- [BRANCH-REVIEW-REPORT.md](../BRANCH-REVIEW-REPORT.md) - Branch analysis report
