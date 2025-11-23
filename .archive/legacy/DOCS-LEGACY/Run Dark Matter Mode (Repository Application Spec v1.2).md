# 🧠 Run Dark Matter Mode (Repository Application Spec v1.2)

**Mode:** `repository_scan`  
**Target:** Entire repository _(code + documentation + metadata)_  
**Intent:** Reveal what is unseen, unsaid, and unmeasured — then restore coherence.

---

## ⚙️ Sensing Parameters

```yaml
include: ['src/', 'app/', 'docs/', '*.md', 'README.md']
exclude: ['node_modules/', 'dist/', '.env', '.next/']
max_depth: 3
```
