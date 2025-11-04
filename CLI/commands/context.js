const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const CONTEXT_DIR = path.join(process.cwd(), '.claude', 'context');
const FILES_DIR = path.join(CONTEXT_DIR, 'files');
const SESSIONS_DIR = path.join(CONTEXT_DIR, 'sessions');
const ACTIVE_SESSION_FILE = path.join(CONTEXT_DIR, 'active-session.json');

/**
 * Get time ago string
 */
function getTimeAgo(timestamp) {
  const now = Date.now();
  const then = new Date(timestamp).getTime();
  const diffMs = now - then;
  
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
}

/**
 * Format duration
 */
function formatDuration(startTime, endTime) {
  const start = new Date(startTime).getTime();
  const end = endTime ? new Date(endTime).getTime() : Date.now();
  const diffMs = end - start;
  
  const hours = Math.floor(diffMs / 3600000);
  const mins = Math.floor((diffMs % 3600000) / 60000);
  
  if (hours === 0) return `${mins}m`;
  return `${hours}h ${mins}m`;
}

/**
 * Show current session context
 */
function showContext() {
  if (!fs.existsSync(ACTIVE_SESSION_FILE)) {
    console.log(chalk.yellow('\n⚠️  No active session found'));
    console.log(chalk.gray('   Start working to initialize a session\n'));
    return;
  }

  const session = JSON.parse(fs.readFileSync(ACTIVE_SESSION_FILE, 'utf-8'));
  
  console.log(chalk.bold.cyan('\n📍 Current Session Context\n'));
  
  console.log(chalk.gray(`Session ID: ${session.sessionId}`));
  console.log(chalk.gray(`Started: ${getTimeAgo(session.startTime)} (${new Date(session.startTime).toLocaleString()})`));
  
  const duration = formatDuration(session.startTime, session.lastActivity);
  console.log(chalk.gray(`Duration: ${duration}`));
  console.log(chalk.gray(`Activity: ${session.promptCount} prompts, ${session.fileChangeCount} file changes\n`));
  
  // Modified files
  if (session.modifiedFiles && session.modifiedFiles.length > 0) {
    console.log(chalk.bold('📂 Modified Files (Last 5):'));
    const recentFiles = session.modifiedFiles.slice(-5).reverse();
    recentFiles.forEach((file, index) => {
      const timeAgo = getTimeAgo(file.timestamp);
      const typeColor = file.type === 'added' ? chalk.green : file.type === 'deleted' ? chalk.red : chalk.yellow;
      console.log(`  ${index + 1}. ${chalk.white(file.path)} ${timeAgo} - ${typeColor(file.type)}`);
    });
    console.log();
  }
  
  // Active skills
  if (session.activeSkills && session.activeSkills.length > 0) {
    console.log(chalk.bold('🎯 Active Skills:'));
    session.activeSkills.forEach(skill => {
      console.log(`  ${chalk.cyan('•')} ${skill}`);
    });
    console.log();
  }
  
  // Agents used
  if (session.agentsUsed && session.agentsUsed.length > 0) {
    console.log(chalk.bold('🤖 Agents Used:'));
    session.agentsUsed.forEach(agent => {
      console.log(`  ${chalk.cyan('•')} ${agent}`);
    });
    console.log();
  }
  
  // Statistics
  const totalFiles = session.modifiedFiles ? session.modifiedFiles.length : 0;
  console.log(chalk.bold('📊 Statistics:'));
  console.log(`  ${chalk.gray('•')} Total files tracked: ${totalFiles}`);
  console.log(`  ${chalk.gray('•')} Average session: ${duration}`);
  console.log();
}

/**
 * Show session history
 */
function showHistory(options = {}) {
  const limit = options.limit || 10;
  
  if (!fs.existsSync(SESSIONS_DIR)) {
    console.log(chalk.yellow('\n⚠️  No session history found\n'));
    return;
  }
  
  const sessionFiles = fs.readdirSync(SESSIONS_DIR)
    .filter(f => f.endsWith('.json'))
    .sort()
    .reverse()
    .slice(0, limit);
  
  if (sessionFiles.length === 0) {
    console.log(chalk.yellow('\n⚠️  No completed sessions found\n'));
    return;
  }
  
  console.log(chalk.bold.cyan(`\n📜 Recent Sessions (Last ${sessionFiles.length}):\n`));
  
  sessionFiles.forEach((file, index) => {
    const sessionPath = path.join(SESSIONS_DIR, file);
    const session = JSON.parse(fs.readFileSync(sessionPath, 'utf-8'));
    
    const startTime = new Date(session.startTime).toLocaleString();
    const duration = formatDuration(session.startTime, session.endTime);
    
    console.log(chalk.bold(`${index + 1}. Session ${session.sessionId}`));
    console.log(chalk.gray(`   Started: ${startTime}`));
    console.log(chalk.gray(`   Duration: ${duration}`));
    console.log(chalk.gray(`   Activity: ${session.promptCount || 0} prompts, ${session.filesModified || 0} files modified`));
    
    if (session.skillsUsed && session.skillsUsed.length > 0) {
      console.log(chalk.gray(`   Skills: ${session.skillsUsed.join(', ')}`));
    }
    
    if (session.summary) {
      console.log(chalk.gray(`   Summary: ${session.summary}`));
    }
    
    console.log();
  });
}

/**
 * Clear old context data
 */
function clearContext(options = {}) {
  const olderThanDays = options.olderThan || 30;
  const cutoffDate = Date.now() - (olderThanDays * 24 * 60 * 60 * 1000);
  
  console.log(chalk.cyan(`\n🗑️  Clearing context data older than ${olderThanDays} days...\n`));
  
  let filesCleared = 0;
  let sessionsCleared = 0;
  
  // Clear old file change records
  if (fs.existsSync(FILES_DIR)) {
    const files = fs.readdirSync(FILES_DIR);
    for (const file of files) {
      const filePath = path.join(FILES_DIR, file);
      const stats = fs.statSync(filePath);
      
      if (stats.mtimeMs < cutoffDate) {
        fs.unlinkSync(filePath);
        filesCleared++;
      }
    }
  }
  
  // Clear old sessions
  if (fs.existsSync(SESSIONS_DIR)) {
    const sessions = fs.readdirSync(SESSIONS_DIR);
    for (const sessionFile of sessions) {
      const sessionPath = path.join(SESSIONS_DIR, sessionFile);
      try {
        const session = JSON.parse(fs.readFileSync(sessionPath, 'utf-8'));
        const sessionTime = new Date(session.endTime || session.startTime).getTime();
        
        if (sessionTime < cutoffDate) {
          fs.unlinkSync(sessionPath);
          sessionsCleared++;
        }
      } catch (error) {
        // Skip invalid files
      }
    }
  }
  
  console.log(chalk.green(`✓ Cleared ${filesCleared} file change records`));
  console.log(chalk.green(`✓ Cleared ${sessionsCleared} old sessions\n`));
}

/**
 * Restore a specific session
 */
function restoreSession(sessionId) {
  const sessionPath = path.join(SESSIONS_DIR, `${sessionId}.json`);
  
  if (!fs.existsSync(sessionPath)) {
    console.log(chalk.red(`\n✗ Session ${sessionId} not found\n`));
    return;
  }
  
  const session = JSON.parse(fs.readFileSync(sessionPath, 'utf-8'));
  
  // Create new active session based on old one
  const newSession = {
    sessionId: `session-${Date.now()}`,
    startTime: new Date().toISOString(),
    lastActivity: new Date().toISOString(),
    modifiedFiles: session.modifiedFiles || [],
    activeSkills: session.skillsUsed || [],
    agentsUsed: session.agentsUsed || [],
    promptCount: 0,
    fileChangeCount: 0
  };
  
  fs.writeFileSync(ACTIVE_SESSION_FILE, JSON.stringify(newSession, null, 2));
  
  console.log(chalk.green(`\n✓ Restored session ${sessionId} as new active session\n`));
  console.log(chalk.gray(`   Skills: ${newSession.activeSkills.join(', ')}`));
  console.log(chalk.gray(`   Files: ${newSession.modifiedFiles.length} files tracked\n`));
}

/**
 * Show context statistics
 */
function showStats() {
  console.log(chalk.bold.cyan('\n📊 Context Statistics\n'));
  
  let totalFiles = 0;
  let totalSessions = 0;
  let totalSize = 0;
  
  // Count file change records
  if (fs.existsSync(FILES_DIR)) {
    const files = fs.readdirSync(FILES_DIR);
    totalFiles = files.length;
    
    files.forEach(file => {
      const filePath = path.join(FILES_DIR, file);
      const stats = fs.statSync(filePath);
      totalSize += stats.size;
    });
  }
  
  // Count sessions
  if (fs.existsSync(SESSIONS_DIR)) {
    const sessions = fs.readdirSync(SESSIONS_DIR).filter(f => f.endsWith('.json'));
    totalSessions = sessions.length;
    
    sessions.forEach(session => {
      const sessionPath = path.join(SESSIONS_DIR, session);
      const stats = fs.statSync(sessionPath);
      totalSize += stats.size;
    });
  }
  
  // Active session
  if (fs.existsSync(ACTIVE_SESSION_FILE)) {
    const stats = fs.statSync(ACTIVE_SESSION_FILE);
    totalSize += stats.size;
  }
  
  const sizeMB = (totalSize / 1024 / 1024).toFixed(2);
  
  console.log(chalk.gray(`File change records: ${totalFiles}`));
  console.log(chalk.gray(`Completed sessions: ${totalSessions}`));
  console.log(chalk.gray(`Active session: ${fs.existsSync(ACTIVE_SESSION_FILE) ? 'Yes' : 'No'}`));
  console.log(chalk.gray(`Total storage: ${sizeMB} MB\n`));
}

/**
 * Main context command handler
 */
function contextCommand(action, options = {}) {
  switch (action) {
    case 'show':
      showContext();
      break;
      
    case 'history':
      showHistory(options);
      break;
      
    case 'clear':
      clearContext(options);
      break;
      
    case 'restore':
      if (!options.sessionId) {
        console.log(chalk.red('\n✗ Session ID required\n'));
        console.log(chalk.gray('Usage: ai-dev context restore <session-id>\n'));
        return;
      }
      restoreSession(options.sessionId);
      break;
      
    case 'stats':
      showStats();
      break;
      
    default:
      console.log(chalk.red(`\n✗ Unknown action: ${action}\n`));
      console.log(chalk.gray('Available actions: show, history, clear, restore, stats\n'));
  }
}

module.exports = contextCommand;
