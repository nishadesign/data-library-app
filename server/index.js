import express from 'express'
import cors from 'cors'
import { libraryRouter } from './routes/libraries.js'
import { pipelineManager } from './pipeline.js'

const app = express()
const PORT = 3001

app.use(cors())
app.use(express.json())

app.use('/api/libraries', libraryRouter)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})

export { pipelineManager }
