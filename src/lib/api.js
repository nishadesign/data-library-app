const BASE = '/api'

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

export const api = {
  listLibraries() {
    return request('/libraries')
  },

  getLibrary(id) {
    return request(`/libraries/${id}`)
  },

  createLibrary(data) {
    return request('/libraries', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  updateLibrary(id, data) {
    return request(`/libraries/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  deleteLibrary(id) {
    return request(`/libraries/${id}`, { method: 'DELETE' })
  },

  async uploadFiles(libraryId, files) {
    const formData = new FormData()
    for (const file of files) {
      formData.append('files', file)
    }
    const res = await fetch(`${BASE}/libraries/${libraryId}/files`, {
      method: 'POST',
      body: formData,
    })
    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: res.statusText }))
      throw new Error(error.error || 'Upload failed')
    }
    return res.json()
  },

  deleteFile(libraryId, fileId) {
    return request(`/libraries/${libraryId}/files/${fileId}`, { method: 'DELETE' })
  },

  subscribePipelineStatus(libraryId, onUpdate) {
    const eventSource = new EventSource(`${BASE}/libraries/${libraryId}/status`)
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data)
      onUpdate(data)
    }
    eventSource.onerror = () => {
      eventSource.close()
    }
    return () => eventSource.close()
  },
}
