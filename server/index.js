import express from 'express'
import cors from 'cors'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { existsSync, mkdirSync } from 'fs'
import { libraryRouter } from './routes/libraries.js'
import { pipelineManager } from './pipeline.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const UPLOADS_DIR = join(__dirname, '..', 'uploads')
const DIST_DIR = join(__dirname, '..', 'dist')

if (!existsSync(UPLOADS_DIR)) {
  mkdirSync(UPLOADS_DIR, { recursive: true })
}

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

app.use('/api/libraries', libraryRouter)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

if (existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR))
  app.get('/{*splat}', (req, res) => {
    res.sendFile(join(DIST_DIR, 'index.html'))
  })
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})

export { pipelineManager }
