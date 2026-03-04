import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const IS_VERCEL = !!process.env.VERCEL
const DB_PATH = IS_VERCEL ? '/tmp/data.json' : join(__dirname, '..', 'data.json')
const DEMO_READY_ID = 'demo-library-ready'
const DEMO_FAILED_ID = 'demo-library-failed'
const DEMO_TIMESTAMP = '2026-01-01T10:00:00.000Z'

function buildDemoLibraries() {
  const now = DEMO_TIMESTAMP

  return [
    {
      id: DEMO_READY_ID,
      libraryName: 'Sample Library 1',
      apiName: 'sample_library_1',
      dataSpace: 'Default',
      description: 'Sample ready-state library to demonstrate a fully successful indexing flow.',
      useAI: true,
      status: 'Ready',
      isDemo: true,
      demoState: 'ready',
      files: [
        {
          id: `${DEMO_READY_ID}-file-1`,
          name: 'sample file 1',
          storedName: 'sample-file-1.txt',
          size: 102400,
          mimetype: 'text/plain',
          status: 'Indexed',
          uploadedBy: 'Sample User',
          uploadedOn: now,
        },
        {
          id: `${DEMO_READY_ID}-file-2`,
          name: 'sample file 2',
          storedName: 'sample-file-2.txt',
          size: 245760,
          mimetype: 'text/plain',
          status: 'Indexed',
          uploadedBy: 'Sample User',
          uploadedOn: now,
        },
      ],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: DEMO_FAILED_ID,
      libraryName: 'Sample Library 2',
      apiName: 'sample_library_2',
      dataSpace: 'Default',
      description: 'Sample failed-state library to demonstrate troubleshooting when indexing fails.',
      useAI: true,
      status: 'Failed',
      isDemo: true,
      demoState: 'failed',
      files: [
        {
          id: `${DEMO_FAILED_ID}-file-1`,
          name: 'sample file 1',
          storedName: 'sample-file-1.txt',
          size: 131072,
          mimetype: 'text/plain',
          status: 'Uploaded',
          uploadedBy: 'Sample User',
          uploadedOn: now,
        },
        {
          id: `${DEMO_FAILED_ID}-file-2`,
          name: 'sample file 2',
          storedName: 'sample-file-2.txt',
          size: 286720,
          mimetype: 'text/plain',
          status: 'Uploaded',
          uploadedBy: 'Sample User',
          uploadedOn: now,
        },
      ],
      createdAt: now,
      updatedAt: now,
    },
  ]
}

function withDemoLibraries(db) {
  const demoLibraries = buildDemoLibraries()
  const nonDemoLibraries = db.libraries.filter(lib => !lib?.isDemo)
  const merged = [...demoLibraries]

  for (const lib of nonDemoLibraries) {
    merged.push(lib)
  }

  return { ...db, libraries: merged }
}

let memoryDB = { libraries: [] }

function readDB() {
  if (IS_VERCEL) {
    if (existsSync(DB_PATH)) {
      try { return JSON.parse(readFileSync(DB_PATH, 'utf-8')) }
      catch { return memoryDB }
    }
    return memoryDB
  }
  if (!existsSync(DB_PATH)) {
    writeFileSync(DB_PATH, JSON.stringify({ libraries: [] }, null, 2))
  }
  return JSON.parse(readFileSync(DB_PATH, 'utf-8'))
}

function writeDB(data) {
  if (IS_VERCEL) {
    memoryDB = data
    try { writeFileSync(DB_PATH, JSON.stringify(data, null, 2)) } catch {}
    return
  }
  writeFileSync(DB_PATH, JSON.stringify(data, null, 2))
}

export function getAllLibraries() {
  const db = readDB()
  const next = withDemoLibraries(db)
  if (JSON.stringify(next.libraries) !== JSON.stringify(db.libraries)) {
    writeDB(next)
  }
  return next.libraries
}

export function getLibrary(id) {
  return getAllLibraries().find(lib => lib.id === id) || null
}

export function createLibrary(library) {
  const db = withDemoLibraries(readDB())
  db.libraries.push(library)
  writeDB(db)
  return library
}

export function updateLibrary(id, updates) {
  const db = withDemoLibraries(readDB())
  const index = db.libraries.findIndex(lib => lib.id === id)
  if (index === -1) return null
  if (db.libraries[index]?.isDemo) return db.libraries[index]
  db.libraries[index] = { ...db.libraries[index], ...updates, updatedAt: new Date().toISOString() }
  writeDB(db)
  return db.libraries[index]
}

export function deleteLibrary(id) {
  const db = withDemoLibraries(readDB())
  const index = db.libraries.findIndex(lib => lib.id === id)
  if (index === -1) return false
  if (db.libraries[index]?.isDemo) return false
  db.libraries.splice(index, 1)
  writeDB(db)
  return true
}

export function addFileToLibrary(id, file) {
  const db = withDemoLibraries(readDB())
  const lib = db.libraries.find(lib => lib.id === id)
  if (!lib) return null
  if (lib.isDemo) return null
  if (!lib.files) lib.files = []
  lib.files.push(file)
  lib.updatedAt = new Date().toISOString()
  writeDB(db)
  return file
}

export function removeFileFromLibrary(libraryId, fileId) {
  const db = withDemoLibraries(readDB())
  const lib = db.libraries.find(lib => lib.id === libraryId)
  if (!lib || !lib.files) return false
  if (lib.isDemo) return false
  const index = lib.files.findIndex(f => f.id === fileId)
  if (index === -1) return false
  lib.files.splice(index, 1)
  lib.updatedAt = new Date().toISOString()
  writeDB(db)
  return true
}
