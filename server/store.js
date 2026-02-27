import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const IS_VERCEL = !!process.env.VERCEL
const DB_PATH = IS_VERCEL ? '/tmp/data.json' : join(__dirname, '..', 'data.json')

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
  return readDB().libraries
}

export function getLibrary(id) {
  return readDB().libraries.find(lib => lib.id === id) || null
}

export function createLibrary(library) {
  const db = readDB()
  db.libraries.push(library)
  writeDB(db)
  return library
}

export function updateLibrary(id, updates) {
  const db = readDB()
  const index = db.libraries.findIndex(lib => lib.id === id)
  if (index === -1) return null
  db.libraries[index] = { ...db.libraries[index], ...updates, updatedAt: new Date().toISOString() }
  writeDB(db)
  return db.libraries[index]
}

export function deleteLibrary(id) {
  const db = readDB()
  const index = db.libraries.findIndex(lib => lib.id === id)
  if (index === -1) return false
  db.libraries.splice(index, 1)
  writeDB(db)
  return true
}

export function addFileToLibrary(id, file) {
  const db = readDB()
  const lib = db.libraries.find(lib => lib.id === id)
  if (!lib) return null
  if (!lib.files) lib.files = []
  lib.files.push(file)
  lib.updatedAt = new Date().toISOString()
  writeDB(db)
  return file
}

export function removeFileFromLibrary(libraryId, fileId) {
  const db = readDB()
  const lib = db.libraries.find(lib => lib.id === libraryId)
  if (!lib || !lib.files) return false
  const index = lib.files.findIndex(f => f.id === fileId)
  if (index === -1) return false
  lib.files.splice(index, 1)
  lib.updatedAt = new Date().toISOString()
  writeDB(db)
  return true
}
