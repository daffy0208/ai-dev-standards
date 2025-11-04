#!/usr/bin/env tsx
/**
 * File Tracker Hook (PostToolUse)
 * 
 * Tracks file modifications, additions, and deletions to maintain
 * context across Claude sessions. Runs after tool execution to capture
 * file system changes.
 * 
 * Part of Phase 4: File tracking for context retention
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

interface FileChange {
  path: string;
  type: 'added' | 'modified' | 'deleted';
  timestamp: string;
  size?: number;
}

interface SessionContext {
  sessionId: string;
  startTime: string;
  lastActivity: string;
  modifiedFiles: FileChange[];
  activeSkills: string[];
  agentsUsed: string[];
  promptCount: number;
  fileChangeCount: number;
}

const CONTEXT_DIR = path.join(process.cwd(), '.claude', 'context');
const FILES_DIR = path.join(CONTEXT_DIR, 'files');
const SESSIONS_DIR = path.join(CONTEXT_DIR, 'sessions');
const ACTIVE_SESSION_FILE = path.join(CONTEXT_DIR, 'active-session.json');

/**
 * Initialize context directories
 */
function initializeContextDirs(): void {
  [CONTEXT_DIR, FILES_DIR, SESSIONS_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}

/**
 * Get current session or create new one
 */
function getCurrentSession(): SessionContext {
  if (fs.existsSync(ACTIVE_SESSION_FILE)) {
    const content = fs.readFileSync(ACTIVE_SESSION_FILE, 'utf-8');
    return JSON.parse(content);
  }

  // Create new session
  const session: SessionContext = {
    sessionId: `session-${Date.now()}`,
    startTime: new Date().toISOString(),
    lastActivity: new Date().toISOString(),
    modifiedFiles: [],
    activeSkills: [],
    agentsUsed: [],
    promptCount: 0,
    fileChangeCount: 0
  };

  fs.writeFileSync(ACTIVE_SESSION_FILE, JSON.stringify(session, null, 2));
  return session;
}

/**
 * Get file changes using git status
 */
function getFileChanges(): FileChange[] {
  try {
    // Get git status
    const status = execSync('git status --porcelain', { encoding: 'utf-8' }).trim();
    if (!status) return [];

    const changes: FileChange[] = [];
    const lines = status.split('\n');

    for (const line of lines) {
      if (!line.trim()) continue;

      const statusCode = line.substring(0, 2).trim();
      const filePath = line.substring(3).trim();

      let type: 'added' | 'modified' | 'deleted';
      if (statusCode === 'A' || statusCode === '??') {
        type = 'added';
      } else if (statusCode === 'D') {
        type = 'deleted';
      } else {
        type = 'modified';
      }

      let size: number | undefined;
      try {
        if (type !== 'deleted' && fs.existsSync(filePath)) {
          const stats = fs.statSync(filePath);
          size = stats.size;
        }
      } catch (err) {
        // Ignore stat errors
      }

      changes.push({
        path: filePath,
        type,
        timestamp: new Date().toISOString(),
        size
      });
    }

    return changes;
  } catch (error) {
    // Not a git repo or git not available
    return [];
  }
}

/**
 * Extract skills and agents from recent activity
 */
function extractSkillsAndAgents(session: SessionContext): void {
  // This would be enhanced to parse Claude's recent responses
  // For now, we track what we can from file patterns
  
  const recentFiles = session.modifiedFiles.slice(-10);
  
  // Skill detection based on file patterns
  const skillPatterns: Record<string, string[]> = {
    'security-engineer': ['auth', 'security', 'jwt', 'encryption', 'permissions'],
    'testing-strategist': ['test', 'spec', 'jest', 'vitest', 'playwright'],
    'frontend-builder': ['.tsx', '.jsx', 'components', 'pages'],
    'backend-developer': ['api', 'server', 'controller', 'service'],
    'database-architect': ['database', 'schema', 'migration', 'query']
  };

  const detectedSkills = new Set<string>();
  
  for (const file of recentFiles) {
    for (const [skill, patterns] of Object.entries(skillPatterns)) {
      if (patterns.some(pattern => file.path.toLowerCase().includes(pattern))) {
        detectedSkills.add(skill);
      }
    }
  }

  session.activeSkills = Array.from(detectedSkills);
}

/**
 * Update session with file changes
 */
function updateSession(changes: FileChange[]): void {
  if (changes.length === 0) return;

  const session = getCurrentSession();
  
  // Update session data
  session.lastActivity = new Date().toISOString();
  session.fileChangeCount += changes.length;
  
  // Add new file changes (keep last 50)
  session.modifiedFiles.push(...changes);
  if (session.modifiedFiles.length > 50) {
    session.modifiedFiles = session.modifiedFiles.slice(-50);
  }

  // Extract skills and agents from activity
  extractSkillsAndAgents(session);

  // Save updated session
  fs.writeFileSync(ACTIVE_SESSION_FILE, JSON.stringify(session, null, 2));

  // Also save individual file change records
  for (const change of changes) {
    const changeRecord = {
      ...change,
      sessionId: session.sessionId
    };
    
    const fileHash = Buffer.from(change.path).toString('base64').substring(0, 16);
    const changeFile = path.join(FILES_DIR, `${fileHash}-${Date.now()}.json`);
    
    fs.writeFileSync(changeFile, JSON.stringify(changeRecord, null, 2));
  }
}

/**
 * Cleanup old file change records (older than 30 days)
 */
function cleanupOldRecords(): void {
  try {
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const files = fs.readdirSync(FILES_DIR);

    for (const file of files) {
      const filePath = path.join(FILES_DIR, file);
      const stats = fs.statSync(filePath);
      
      if (stats.mtimeMs < thirtyDaysAgo) {
        fs.unlinkSync(filePath);
      }
    }
  } catch (error) {
    // Ignore cleanup errors
  }
}

/**
 * Main execution
 */
function main(): void {
  try {
    // Initialize directories
    initializeContextDirs();

    // Get current file changes
    const changes = getFileChanges();

    // Update session context
    if (changes.length > 0) {
      updateSession(changes);
      console.log(`✓ Tracked ${changes.length} file change(s)`);
    }

    // Cleanup old records (run occasionally)
    if (Math.random() < 0.1) {
      cleanupOldRecords();
    }

  } catch (error) {
    console.error('File tracker error:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}
