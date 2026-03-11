const BASE = '/api'
const STORAGE_KEY = 'data-library-fallback-store'

const SAMPLE_LIBRARIES = [
  {
    id: 'demo-ready-library',
    libraryName: 'Support Ticket Cleanup Demo',
    apiName: 'Support_Ticket_Cleanup_Demo',
    dataSpace: 'Default',
    description: 'Example support data with formatting, duplicate, and categorization issues already remediated.',
    status: 'Ready',
    isDemo: true,
    demoState: 'ready',
    createdAt: '2026-03-01T09:15:00.000Z',
    agents: 'Customer Support Agent',
    files: [
      {
        id: 'demo-ready-file-1',
        name: 'support_tickets_q1.csv',
        size: 248532,
        uploadedBy: 'orgfarm-epic',
        uploadedOn: '2026-03-01T09:18:00.000Z',
        status: 'Indexed',
      },
      {
        id: 'demo-ready-file-2',
        name: 'escalation_reasons.csv',
        size: 104200,
        uploadedBy: 'orgfarm-epic',
        uploadedOn: '2026-03-01T09:19:00.000Z',
        status: 'Indexed',
      },
    ],
  },
  {
    id: 'demo-failed-library',
    libraryName: 'Revenue Ops Review Demo',
    apiName: 'Revenue_Ops_Review_Demo',
    dataSpace: 'Default',
    description: 'Example revenue operations dataset showing a library that still needs data quality review.',
    status: 'Failed',
    isDemo: true,
    demoState: 'failed',
    createdAt: '2026-02-25T15:40:00.000Z',
    agents: 'Sales Insights Agent',
    files: [
      {
        id: 'demo-failed-file-1',
        name: 'pipeline_snapshot.xlsx',
        size: 325100,
        uploadedBy: 'orgfarm-epic',
        uploadedOn: '2026-02-25T15:43:00.000Z',
        status: 'Uploaded',
      },
    ],
  },
]

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(error.error || 'Request failed')
  }
  if (res.status === 204) return null
  return res.json()
}

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function readFallbackStore() {
  if (!canUseStorage()) return { libraries: [] }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return { libraries: [] }
    const parsed = JSON.parse(raw)
    return {
      libraries: Array.isArray(parsed?.libraries) ? parsed.libraries : [],
    }
  } catch {
    return { libraries: [] }
  }
}

function writeFallbackStore(store) {
  if (!canUseStorage()) return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
}

function getFallbackLibraries() {
  const store = readFallbackStore()
  return [...SAMPLE_LIBRARIES, ...store.libraries]
}

function saveFallbackLibrary(library) {
  const store = readFallbackStore()
  const nextLibraries = store.libraries.filter(item => item.id !== library.id)
  nextLibraries.unshift(library)
  writeFallbackStore({ libraries: nextLibraries })
  return library
}

function createFallbackLibrary(data) {
  const timestamp = new Date().toISOString()
  const library = {
    id: `local-${Date.now()}`,
    libraryName: data.libraryName,
    apiName: data.apiName,
    dataSpace: data.dataSpace || 'Default',
    description: data.description || '',
    useAI: Boolean(data.useAI),
    status: 'In Progress',
    createdAt: timestamp,
    agents: '',
    files: [],
  }
  return saveFallbackLibrary(library)
}

function updateFallbackLibrary(id, data) {
  const existing = getFallbackLibraries().find(library => library.id === id)
  if (!existing || existing.isDemo) return existing || null

  return saveFallbackLibrary({
    ...existing,
    ...data,
  })
}

function registerFallbackFiles(libraryId, files) {
  const existing = getFallbackLibraries().find(library => library.id === libraryId)
  if (!existing || existing.isDemo) return existing || null

  const timestamp = new Date().toISOString()
  const normalizedFiles = Array.from(files).map((file, index) => ({
    id: file.id || `${libraryId}-file-${Date.now()}-${index}`,
    name: file.name,
    size: file.size,
    type: file.type || '',
    uploadedBy: 'orgfarm-epic',
    uploadedOn: timestamp,
    status: 'Uploaded',
  }))

  return saveFallbackLibrary({
    ...existing,
    status: 'In Progress',
    files: [...(existing.files || []), ...normalizedFiles],
  })
}

function deleteFallbackLibrary(id) {
  const store = readFallbackStore()
  writeFallbackStore({
    libraries: store.libraries.filter(library => library.id !== id),
  })
  return null
}

export const api = {
  getFallbackLibraries() {
    return getFallbackLibraries()
  },

  async listLibraries() {
    try {
      return await request('/libraries')
    } catch {
      return getFallbackLibraries()
    }
  },

  async getLibrary(id) {
    try {
      return await request(`/libraries/${id}`)
    } catch {
      const library = getFallbackLibraries().find(item => item.id === id)
      if (!library) throw new Error('Library not found')
      return library
    }
  },

  async createLibrary(data) {
    try {
      return await request('/libraries', {
        method: 'POST',
        body: JSON.stringify(data),
      })
    } catch {
      return createFallbackLibrary(data)
    }
  },

  async updateLibrary(id, data) {
    try {
      return await request(`/libraries/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      })
    } catch {
      const library = updateFallbackLibrary(id, data)
      if (!library) throw new Error('Library not found')
      return library
    }
  },

  async deleteLibrary(id) {
    try {
      return await request(`/libraries/${id}`, { method: 'DELETE' })
    } catch {
      return deleteFallbackLibrary(id)
    }
  },

  async uploadFiles(libraryId, files) {
    const formData = new FormData()
    for (const file of files) {
      formData.append('files', file)
    }
    try {
      const res = await fetch(`${BASE}/libraries/${libraryId}/files`, {
        method: 'POST',
        body: formData,
      })
      if (res.ok) return res.json()
    } catch {}

    const metadata = Array.from(files).map(f => ({ name: f.name, size: f.size, type: f.type }))
    try {
      return await request(`/libraries/${libraryId}/register-files`, {
        method: 'POST',
        body: JSON.stringify(metadata),
      })
    } catch {
      const library = registerFallbackFiles(libraryId, metadata)
      if (!library) throw new Error('Library not found')
      return library
    }
  },

  async deleteFile(libraryId, fileId) {
    try {
      return await request(`/libraries/${libraryId}/files/${fileId}`, { method: 'DELETE' })
    } catch {
      const existing = getFallbackLibraries().find(library => library.id === libraryId)
      if (!existing || existing.isDemo) throw new Error('Library not found')

      saveFallbackLibrary({
        ...existing,
        files: (existing.files || []).filter(file => file.id !== fileId),
      })
      return null
    }
  },

  subscribePipelineStatus(libraryId, onUpdate, onSSEError) {
    const eventSource = new EventSource(`${BASE}/libraries/${libraryId}/status`)
    let receivedData = false
    eventSource.onmessage = (event) => {
      receivedData = true
      const data = JSON.parse(event.data)
      onUpdate(data)
    }
    eventSource.onerror = () => {
      eventSource.close()
      if (!receivedData && onSSEError) onSSEError()
    }
    return () => eventSource.close()
  },
}
