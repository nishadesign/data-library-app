import { Router } from 'express'
import multer from 'multer'
import { v4 as uuidv4 } from 'uuid'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { existsSync, mkdirSync } from 'fs'
import {
  getAllLibraries,
  getLibrary,
  createLibrary,
  updateLibrary,
  deleteLibrary,
  addFileToLibrary,
  removeFileFromLibrary,
} from '../store.js'
import { pipelineManager } from '../pipeline.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const IS_VERCEL = !!process.env.VERCEL
const UPLOADS_DIR = IS_VERCEL ? '/tmp/uploads' : join(__dirname, '..', '..', 'uploads')

if (!existsSync(UPLOADS_DIR)) {
  mkdirSync(UPLOADS_DIR, { recursive: true })
}

const storage = IS_VERCEL
  ? multer.memoryStorage()
  : multer.diskStorage({
      destination: (req, file, cb) => cb(null, UPLOADS_DIR),
      filename: (req, file, cb) => {
        const uniqueName = `${uuidv4()}-${file.originalname}`
        cb(null, uniqueName)
      },
    })

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.html', '.txt', '.htm']
    const ext = file.originalname.toLowerCase().slice(file.originalname.lastIndexOf('.'))
    if (allowed.includes(ext)) {
      cb(null, true)
    } else {
      cb(new Error(`File type ${ext} not supported. Use PDF, HTML, or TXT.`))
    }
  },
})

export const libraryRouter = Router()

libraryRouter.get('/', (req, res) => {
  res.json(getAllLibraries())
})

libraryRouter.get('/:id', (req, res) => {
  const lib = getLibrary(req.params.id)
  if (!lib) return res.status(404).json({ error: 'Library not found' })
  res.json(lib)
})

libraryRouter.post('/', (req, res) => {
  const { libraryName, apiName, dataSpace, description, useAI } = req.body

  if (!libraryName) {
    return res.status(400).json({ error: 'libraryName is required' })
  }

  const library = {
    id: uuidv4(),
    libraryName,
    apiName: apiName || libraryName.replace(/\s+/g, '_'),
    dataSpace: dataSpace || 'Default',
    description: description || '',
    useAI: useAI !== false,
    status: 'Draft',
    files: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  createLibrary(library)
  res.status(201).json(library)
})

libraryRouter.put('/:id', (req, res) => {
  const updated = updateLibrary(req.params.id, req.body)
  if (!updated) return res.status(404).json({ error: 'Library not found' })
  res.json(updated)
})

libraryRouter.delete('/:id', (req, res) => {
  const deleted = deleteLibrary(req.params.id)
  if (!deleted) return res.status(404).json({ error: 'Library not found' })
  res.status(204).send()
})

libraryRouter.post('/:id/files', upload.array('files', 1000), (req, res) => {
  const lib = getLibrary(req.params.id)
  if (!lib) return res.status(404).json({ error: 'Library not found' })

  const addedFiles = []
  for (const file of req.files) {
    const fileRecord = {
      id: uuidv4(),
      name: file.originalname,
      storedName: file.filename || `${uuidv4()}-${file.originalname}`,
      size: file.size,
      mimetype: file.mimetype,
      status: 'Uploaded',
      uploadedBy: 'Current User',
      uploadedOn: new Date().toISOString(),
    }
    addFileToLibrary(req.params.id, fileRecord)
    addedFiles.push(fileRecord)
  }

  updateLibrary(req.params.id, { status: 'In Progress' })
  pipelineManager.start(req.params.id, addedFiles.length)

  res.status(201).json(addedFiles)
})

libraryRouter.post('/:id/register-files', (req, res) => {
  const lib = getLibrary(req.params.id)
  if (!lib) return res.status(404).json({ error: 'Library not found' })

  const fileMetas = req.body
  if (!Array.isArray(fileMetas)) return res.status(400).json({ error: 'Expected array of file metadata' })

  const addedFiles = []
  for (const meta of fileMetas) {
    const fileRecord = {
      id: uuidv4(),
      name: meta.name,
      storedName: `${uuidv4()}-${meta.name}`,
      size: meta.size || 0,
      mimetype: meta.type || 'application/octet-stream',
      status: 'Uploaded',
      uploadedBy: 'Current User',
      uploadedOn: new Date().toISOString(),
    }
    addFileToLibrary(req.params.id, fileRecord)
    addedFiles.push(fileRecord)
  }

  updateLibrary(req.params.id, { status: 'In Progress' })
  pipelineManager.start(req.params.id, addedFiles.length)

  res.status(201).json(addedFiles)
})

libraryRouter.delete('/:id/files/:fileId', (req, res) => {
  const removed = removeFileFromLibrary(req.params.id, req.params.fileId)
  if (!removed) return res.status(404).json({ error: 'File not found' })
  res.status(204).send()
})

libraryRouter.get('/:id/status', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  })

  pipelineManager.subscribeSSE(req.params.id, res)

  const status = pipelineManager.getStatus(req.params.id)
  if (!status) {
    res.write(`data: ${JSON.stringify({ steps: [], overall: 'idle' })}\n\n`)
  }
})
