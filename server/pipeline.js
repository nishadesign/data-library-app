import { updateLibrary } from './store.js'

const PIPELINE_STEPS = [
  { name: 'Uploading files', duration: 4000, description: '' },
  { name: 'Creating search index', duration: 3000, description: 'We\'re creating a search index so your agent can find the most relevant information quickly.' },
  { name: 'Setting up retriever', duration: 3000, description: 'We\'re creating a search index so your agent can find the most relevant information quickly.' },
  { name: 'Building agent tool', duration: 2000, description: 'Creating tool so agent can use this data for context.' },
  { name: 'Indexing data', duration: 5000, description: 'We\'re structuring your data so it\'s easy to search, manage, and use over time.' },
]

class PipelineManager {
  constructor() {
    this.pipelines = new Map()
    this.sseClients = new Map()
  }

  getStatus(libraryId) {
    return this.pipelines.get(libraryId) || null
  }

  subscribeSSE(libraryId, res) {
    if (!this.sseClients.has(libraryId)) {
      this.sseClients.set(libraryId, new Set())
    }
    this.sseClients.get(libraryId).add(res)

    res.on('close', () => {
      this.sseClients.get(libraryId)?.delete(res)
    })

    const status = this.getStatus(libraryId)
    if (status) {
      res.write(`data: ${JSON.stringify(status)}\n\n`)
    }
  }

  broadcast(libraryId, data) {
    const clients = this.sseClients.get(libraryId)
    if (!clients) return
    for (const client of clients) {
      client.write(`data: ${JSON.stringify(data)}\n\n`)
    }
  }

  async start(libraryId, fileCount) {
    const steps = PIPELINE_STEPS.map(step => ({
      name: step.name,
      status: 'default',
      description: '',
    }))

    this.pipelines.set(libraryId, { steps, overall: 'inProgress' })
    this.broadcast(libraryId, this.getStatus(libraryId))

    for (let i = 0; i < PIPELINE_STEPS.length; i++) {
      steps[i].status = 'inProgress'

      if (i === 0) {
        for (let uploaded = 0; uploaded <= fileCount; uploaded++) {
          steps[i].description = `${uploaded} out of ${fileCount} files uploaded`
          this.broadcast(libraryId, this.getStatus(libraryId))
          await this.delay(PIPELINE_STEPS[i].duration / (fileCount + 1))
        }
      } else {
        steps[i].description = PIPELINE_STEPS[i].description
        this.broadcast(libraryId, this.getStatus(libraryId))
        await this.delay(PIPELINE_STEPS[i].duration)
      }

      steps[i].status = 'ready'
      steps[i].description = ''
      this.broadcast(libraryId, this.getStatus(libraryId))
    }

    const finalStatus = { steps, overall: 'ready' }
    this.pipelines.set(libraryId, finalStatus)
    this.broadcast(libraryId, finalStatus)

    updateLibrary(libraryId, { status: 'Ready' })
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

export const pipelineManager = new PipelineManager()
