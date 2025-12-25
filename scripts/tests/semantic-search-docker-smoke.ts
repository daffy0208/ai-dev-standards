import { spawnSync, SpawnSyncOptions } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import { createVectorStoreClient } from '../../mcp-servers/semantic-search-mcp/src/vector-store.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '..', '..')
const dockerfilePath = path.join(repoRoot, 'SECURITY', 'sandbox', 'docker-sandbox.dockerfile')
const toolsDir = path.join(
  repoRoot,
  'MCP-SERVERS',
  'semantic-search-mcp',
  'servers',
  'semantic-search',
  'tools'
)

function run(
  command: string,
  args: string[],
  options: SpawnSyncOptions & { allowFail?: boolean } = {}
) {
  const result = spawnSync(command, args, {
    encoding: 'utf-8',
    stdio: 'pipe',
    ...options
  })

  if (result.error) {
    throw result.error
  }

  if (result.status !== 0 && !options.allowFail) {
    throw new Error(`Command failed: ${command} ${args.join(' ')}\n${result.stderr}`)
  }

  return result
}

function ensureDockerAvailable() {
  try {
    run('docker', ['--version'])
  } catch (error) {
    throw new Error(
      'Docker CLI is required for the semantic-search docker smoke test. Install Docker and ensure `docker` is on your PATH.'
    )
  }
}

function ensureSandboxImage() {
  const inspect = spawnSync('docker', ['image', 'inspect', 'mcp-sandbox'], { stdio: 'ignore' })
  if (inspect.status === 0) {
    console.log('✅ mcp-sandbox image already available')
    return
  }

  console.log('🔧 Building mcp-sandbox image...')
  const build = spawnSync(
    'docker',
    ['build', '-f', dockerfilePath, '-t', 'mcp-sandbox', repoRoot],
    {
      stdio: 'inherit'
    }
  )

  if (build.status !== 0) {
    throw new Error('Failed to build mcp-sandbox image')
  }
}

function runToolInsideSandbox(toolFile: string) {
  const toolPath = path.join('/workspace/tools', toolFile)
  console.log(`🚀 Running ${toolFile} inside mcp-sandbox...`)

  const result = run('docker', [
    'run',
    '--rm',
    '--network',
    'none',
    '-v',
    `${toolsDir}:/workspace/tools:ro`,
    'mcp-sandbox',
    'python',
    toolPath
  ])

  if (!result.stdout.includes('Success')) {
    console.warn(result.stdout)
    throw new Error(`${toolFile} did not report success output`)
  }

  console.log(`✅ ${toolFile} completed successfully`)
}

async function runOptionalPineconeSmokeTest() {
  const { store, provider } = createVectorStoreClient()
  if (provider !== 'pinecone') {
    console.log('ℹ️  Pinecone env vars not set, skipping live Pinecone smoke test')
    return
  }

  const dimension = Number(process.env.PINECONE_DIMENSION || '1536')
  if (!Number.isFinite(dimension) || dimension <= 0) {
    throw new Error(
      'Set PINECONE_DIMENSION to match your Pinecone index dimensions before running the smoke test.'
    )
  }

  const embedding = Array.from(
    { length: dimension },
    (_, idx) => (Math.sin(idx + Date.now()) + 1) / 2
  )
  const docId = `smoke-${Date.now()}`

  console.log(`🔌 Running Pinecone smoke test against index ${process.env.PINECONE_INDEX}`)
  await store.upsert([
    {
      id: docId,
      text: 'Semantic-search docker smoke test document',
      embedding,
      metadata: { source: 'docker-smoke-test' }
    }
  ])

  const results = await store.query({
    embedding,
    topK: 1
  })

  if (!results.length || results[0].id !== docId) {
    throw new Error('Pinecone smoke test failed – inserted vector was not returned in query')
  }

  console.log('✅ Pinecone smoke test passed')
}

async function main() {
  if (!fs.existsSync(toolsDir)) {
    throw new Error(`Semantic-search tools directory not found: ${toolsDir}`)
  }

  ensureDockerAvailable()
  ensureSandboxImage()

  runToolInsideSandbox('vector_embed.py')
  runToolInsideSandbox('index_documents.py')

  await runOptionalPineconeSmokeTest()
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
