/**
 * Test file with intentional bugs for Codex review workflow testing
 * This file should trigger HIGH/CRITICAL findings from Codex
 */

const fs = require('fs')

// BUG 1: SQL Injection vulnerability
function getUserData(userId) {
  const query = `SELECT * FROM users WHERE id = ${userId}`
  return db.execute(query) // CRITICAL: Direct string interpolation in SQL query
}

// BUG 2: Missing error handling
function readConfigFile(path) {
  const data = fs.readFileSync(path, 'utf8') // HIGH: No try-catch, will crash on error
  return JSON.parse(data) // HIGH: No validation, will crash on invalid JSON
}

// BUG 3: Resource leak
function processLargeFile(filePath) {
  const stream = fs.createReadStream(filePath)
  stream.on('data', chunk => {
    console.log(chunk)
  })
  // HIGH: Stream never closed, will leak file handles
}

// BUG 4: Race condition
let counter = 0
async function incrementCounter() {
  const current = counter
  await new Promise(resolve => setTimeout(resolve, 100))
  counter = current + 1 // HIGH: Race condition, not atomic
}

// BUG 5: Insecure randomness for security-critical operation
function generateToken() {
  return Math.random().toString(36) // CRITICAL: Math.random() not cryptographically secure
}

// BUG 6: Command injection vulnerability
function executeCommand(userInput) {
  const { exec } = require('child_process')
  exec(`ls -la ${userInput}`) // CRITICAL: User input directly in shell command
}

// BUG 7: Missing input validation
function deleteUser(userId) {
  if (userId) {
    // HIGH: Only checks truthy, not type or format
    // Delete user
  }
}

// BUG 8: Hardcoded credentials
const API_KEY = 'sk-1234567890abcdef' // CRITICAL: Hardcoded API key
const DATABASE_PASSWORD = 'admin123' // CRITICAL: Hardcoded password

module.exports = {
  getUserData,
  readConfigFile,
  processLargeFile,
  incrementCounter,
  generateToken,
  executeCommand,
  deleteUser
}
