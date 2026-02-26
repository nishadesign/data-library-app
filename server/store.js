import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DB_PATH = join(__dirname, '..', 'data.json')

function readDB() {
  if (!existsSync(DB_PATH)) {
    writeFileSync(DB_PATH, JSON.stringify({ libraries: [] }, null, 2))
  }
  return JSON.parse(readFileSync(DB_PATH, 'utf-8'))
}

function writeDB(data) {
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
