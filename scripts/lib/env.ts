import { existsSync, readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

function parseEnvLine(line: string): [string, string] | null {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith('#')) return null

  const sepIdxEq = trimmed.indexOf('=')
  const sepIdxColon = trimmed.indexOf(':')
  let sepIdx = -1

  if (sepIdxEq >= 0 && sepIdxColon >= 0) sepIdx = Math.min(sepIdxEq, sepIdxColon)
  else sepIdx = Math.max(sepIdxEq, sepIdxColon)

  if (sepIdx <= 0) return null

  const key = trimmed.slice(0, sepIdx).trim()
  const value = trimmed.slice(sepIdx + 1).trim()
  if (!key) return null
  return [key, value]
}

export function loadScriptEnv(): Record<string, string> {
  const env: Record<string, string> = {}

  for (const [key, value] of Object.entries(process.env)) {
    if (typeof value === 'string') env[key] = value
  }

  const envPath = resolve(__dirname, '../../.env')
  if (!existsSync(envPath)) return env

  const envText = readFileSync(envPath, 'utf-8').replace(/\r\n/g, '\n').replace(/\r/g, '\n')

  for (const line of envText.split('\n')) {
    const pair = parseEnvLine(line)
    if (!pair) continue
    const [key, value] = pair
    env[key] = value
  }

  return env
}

export function getSupabaseScriptConfig() {
  const env = loadScriptEnv()
  const url = env['VITE_SUPABASE_URL']
  const anonKey = env['VITE_SUPABASE_ANON_KEY']
  const authEmail = env['MIGRATION_AUTH_EMAIL']
  const authPass = env['MIGRATION_AUTH_PASS']

  if (!url || !anonKey) {
    throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env or process.env')
  }

  return { env, url, anonKey, authEmail, authPass }
}
