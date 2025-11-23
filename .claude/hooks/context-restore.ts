#!/usr/bin/env tsx
/**
 * Context Restore Hook (UserPromptSubmit)
 *
 * Restores context from previous session when user starts a new conversation.
 * Shows "Where you left off" summary with recent files, skills, and next steps.
 *
 * Part of Phase 4: File tracking for context retention
 */

import * as fs from 'fs'
import * as path from 'path'

interface FileChange {
  path: string
  type: 'added' | 'modified' | 'deleted'
  timestamp: string
  size?: number
}

interface SessionContext {
  sessionId: string
  startTime: string
  lastActivity: string
  modifiedFiles: FileChange[]
  activeSkills: string[]
  agentsUsed: string[]
  promptCount: number
  fileChangeCount: number
}

const CONTEXT_DIR = path.join(process.cwd(), '.claude', 'context')
const ACTIVE_SESSION_FILE = path.join(CONTEXT_DIR, 'active-session.json')

/**
 * Get time ago string
 */
function getTimeAgo(timestamp: string): string {
  const now = Date.now()
  const then = new Date(timestamp).getTime()
  const diffMs = now - then

  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
}

/**
 * Format file path for display
 */
function formatFilePath(filePath: string): string {
  // Show just the file name and parent directory for brevity
  const parts = filePath.split('/')
  if (parts.length <= 2) return filePath
  return `${parts[parts.length - 2]}/${parts[parts.length - 1]}`
}

/**
 * Load previous session context
 */
function loadPreviousSession(): SessionContext | null {
  if (!fs.existsSync(ACTIVE_SESSION_FILE)) {
    return null
  }

  try {
    const content = fs.readFileSync(ACTIVE_SESSION_FILE, 'utf-8')
    return JSON.parse(content)
  } catch (error) {
    return null
  }
}

/**
 * Generate context summary
 */
function generateContextSummary(session: SessionContext): string {
  const parts: string[] = []

  // Header
  parts.push('\n📍 Where you left off:\n')

  // Last activity time
  const lastActivity = getTimeAgo(session.lastActivity)
  parts.push(`  Last active: ${lastActivity}\n`)

  // Recent files (top 5)
  if (session.modifiedFiles.length > 0) {
    parts.push('\n  📂 Recent files:')
    const recentFiles = session.modifiedFiles.slice(-5).reverse()
    for (const file of recentFiles) {
      const timeAgo = getTimeAgo(file.timestamp)
      const fileName = formatFilePath(file.path)
      parts.push(`    • ${fileName} (${timeAgo})`)
    }
  }

  // Active skills
  if (session.activeSkills.length > 0) {
    parts.push('\n  🎯 Skills used:')
    for (const skill of session.activeSkills) {
      parts.push(`    • ${skill}`)
    }
  }

  // Agents used
  if (session.agentsUsed.length > 0) {
    parts.push('\n  🤖 Agents used:')
    for (const agent of session.agentsUsed) {
      parts.push(`    • ${agent}`)
    }
  }

  // Activity stats
  parts.push(
    `\n  📊 Activity: ${session.promptCount} prompts, ${session.fileChangeCount} file changes\n`
  )

  // Suggestions
  parts.push(
    '\n  💡 Suggested: Continue working on these files or ask "What\'s next?" for guidance\n'
  )

  return parts.join('\n')
}

/**
 * Check if should show context (not every prompt)
 */
function shouldShowContext(userPrompt: string): boolean {
  // Show context if:
  // - Prompt is very short (like "hey", "hi", "continue")
  // - Prompt mentions "continue", "resume", "last", "previous"
  // - First prompt of new session

  const lowerPrompt = userPrompt.toLowerCase().trim()

  if (lowerPrompt.length < 20) return true

  const contextKeywords = [
    'continue',
    'resume',
    'last',
    'previous',
    'where',
    'what was',
    'what were'
  ]
  if (contextKeywords.some(keyword => lowerPrompt.includes(keyword))) return true

  return false
}

/**
 * Main execution
 */
function main(): void {
  try {
    // Get user prompt from command line args
    const userPrompt = process.argv.slice(2).join(' ') || ''

    // Load previous session
    const session = loadPreviousSession()

    // Only show context if relevant
    if (!session || !shouldShowContext(userPrompt)) {
      // Increment prompt count silently
      if (session) {
        session.promptCount++
        fs.writeFileSync(ACTIVE_SESSION_FILE, JSON.stringify(session, null, 2))
      }
      process.exit(0)
    }

    // Check if session is stale (more than 6 hours old)
    const lastActivity = new Date(session.lastActivity).getTime()
    const hoursSinceActivity = (Date.now() - lastActivity) / 3600000

    if (hoursSinceActivity < 0.5) {
      // Very recent, don't show context
      session.promptCount++
      fs.writeFileSync(ACTIVE_SESSION_FILE, JSON.stringify(session, null, 2))
      process.exit(0)
    }

    // Generate and display context summary
    const summary = generateContextSummary(session)
    console.log(summary)

    // Update prompt count
    session.promptCount++
    session.lastActivity = new Date().toISOString()
    fs.writeFileSync(ACTIVE_SESSION_FILE, JSON.stringify(session, null, 2))
  } catch (error) {
    // Silently fail - context restoration is optional
    process.exit(0)
  }
}

// Run if called directly
if (require.main === module) {
  main()
}
