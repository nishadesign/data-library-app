import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { ChevronDown, Search, Plus, MoreHorizontal, ArrowUpDown, Trash2, X } from 'lucide-react'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Checkbox } from '../ui/checkbox'
import { Switch } from '../ui/switch'
import { Card } from '../ui/card'
import { Label } from '../ui/label'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../ui/table'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '../ui/collapsible'
import StatusCard from '../StatusCard/StatusCard'
import { RetrieverIcon, ArrowUpRight } from '../../assets/icons'
import { api } from '../../lib/api'

function formatSize(bytes) {
  if (typeof bytes === 'string') return bytes
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

const DEFAULT_STEPS = [
  { name: 'Uploading files', status: 'default' },
  { name: 'Creating search index', status: 'default' },
  { name: 'Setting up retriever', status: 'default' },
  { name: 'Building agent tool', status: 'default' },
  { name: 'Indexing data', status: 'default' },
]

const PIPELINE_TIMINGS = [
  { name: 'Uploading files', duration: 4000 },
  { name: 'Creating search index', duration: 3000, description: "We're creating a search index so your agent can find the most relevant information quickly." },
  { name: 'Setting up retriever', duration: 3000, description: "We're creating a search index so your agent can find the most relevant information quickly." },
  { name: 'Building agent tool', duration: 2000, description: 'Creating tool so agent can use this data for context.' },
  { name: 'Indexing data', duration: 5000, description: "We're structuring your data so it's easy to search, manage, and use over time." },
]

function AgentToolCard({ libraryName }) {
  const [open, setOpen] = useState(true)

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card className="mb-4 overflow-hidden p-0">
        <CollapsibleTrigger className="flex items-center gap-2 py-4 px-6 cursor-pointer bg-transparent border-none w-full text-left font-sans hover:opacity-85">
          <span className={`flex items-center transition-transform duration-200 ${open ? 'rotate-0' : '-rotate-90'}`}>
            <ChevronDown size={12} />
          </span>
          <span className="text-[15px] font-bold text-foreground">Agent Tool</span>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-6 pb-5">
            <p className="text-sm text-foreground leading-[1.55] m-0 mb-3 font-sans">
              To use this data, add the retriever action to the topic
            </p>
            <a href="#" className="inline-flex items-center gap-2 text-sm text-primary font-sans font-normal no-underline hover:underline">
              <RetrieverIcon size={18} />
              Get information from {libraryName}
              <ArrowUpRight size={11} />
            </a>
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}

export default function LibraryView({ library, onEdit, onLibraryUpdate, onCancel }) {
  const [filesOpen, setFilesOpen] = useState(true)
  const [useAI, setUseAI] = useState(true)
  const [pipelineSteps, setPipelineSteps] = useState(DEFAULT_STEPS)
  const [pipelineOverall, setPipelineOverall] = useState('idle')
  const [indexingFileIndex, setIndexingFileIndex] = useState(-1)
  const [newFiles, setNewFiles] = useState([])
  const [rawNewFiles, setRawNewFiles] = useState([])
  const [saving, setSaving] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState(new Set())
  const [metaCollapsed, setMetaCollapsed] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editDraft, setEditDraft] = useState({})
  const fileInputRef = useRef(null)
  const scrollRef = useRef(null)
  const pipelineCancelRef = useRef(null)

  const runClientPipeline = useCallback(async (fileCount, skipReady) => {
    if (pipelineCancelRef.current) pipelineCancelRef.current.cancelled = true
    const cancel = { cancelled: false }
    pipelineCancelRef.current = cancel

    const steps = PIPELINE_TIMINGS.map(s => ({ name: s.name, status: 'default', description: '' }))
    const reuploadSkip = new Set(['Creating search index', 'Setting up retriever', 'Building agent tool'])

    if (skipReady) {
      steps.forEach(s => { if (reuploadSkip.has(s.name)) s.status = 'ready' })
    }

    setPipelineSteps([...steps])
    setPipelineOverall('inProgress')

    const delay = (ms) => new Promise(r => setTimeout(r, ms))

    for (let i = 0; i < PIPELINE_TIMINGS.length; i++) {
      if (cancel.cancelled) return
      if (skipReady && reuploadSkip.has(PIPELINE_TIMINGS[i].name)) continue

      steps[i].status = 'inProgress'

      if (i === 0) {
        for (let u = 0; u <= fileCount; u++) {
          if (cancel.cancelled) return
          steps[i].description = `${u} out of ${fileCount} files uploaded`
          setPipelineSteps([...steps])
          await delay(PIPELINE_TIMINGS[i].duration / (fileCount + 1))
        }
      } else if (PIPELINE_TIMINGS[i].name === 'Indexing data') {
        steps[i].description = PIPELINE_TIMINGS[i].description
        const perFile = PIPELINE_TIMINGS[i].duration / Math.max(fileCount, 1)
        for (let f = 0; f < fileCount; f++) {
          if (cancel.cancelled) return
          setIndexingFileIndex(f)
          setPipelineSteps([...steps])
          await delay(perFile)
        }
        setIndexingFileIndex(fileCount)
      } else {
        steps[i].description = PIPELINE_TIMINGS[i].description || ''
        setPipelineSteps([...steps])
        await delay(PIPELINE_TIMINGS[i].duration)
      }

      if (cancel.cancelled) return
      steps[i].status = 'ready'
      steps[i].description = ''
      setPipelineSteps([...steps])
    }

    if (!cancel.cancelled) {
      setPipelineOverall('ready')
      onLibraryUpdate?.({ status: 'Ready' })
    }
  }, [onLibraryUpdate])

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return
    if (!editing) setMetaCollapsed(scrollRef.current.scrollTop > 20)
  }, [editing])

  function startEditing() {
    setEditDraft({
      libraryName: library.libraryName || '',
      apiName: library.apiName || '',
      dataSpace: library.dataSpace || 'Default',
      description: library.description || '',
    })
    setMetaCollapsed(false)
    setEditing(true)
  }

  function cancelEditing() {
    setEditing(false)
  }

  function handleDraftChange(field, value) {
    setEditDraft(prev => {
      const next = { ...prev, [field]: value }
      if (field === 'libraryName') {
        next.apiName = value.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '')
      }
      return next
    })
  }

  const sseFailedRef = useRef(false)

  useEffect(() => {
    return () => { if (pipelineCancelRef.current) pipelineCancelRef.current.cancelled = true }
  }, [])

  useEffect(() => {
    if (!library?.id) return
    sseFailedRef.current = false

    const unsubscribe = api.subscribePipelineStatus(
      library.id,
      (data) => {
        if (data.steps?.length > 0) {
          setPipelineSteps(data.steps)
        }
        setPipelineOverall(data.overall)

        if (data.indexingFileIndex !== undefined) {
          setIndexingFileIndex(data.indexingFileIndex)
        }

        if (data.overall === 'ready') {
          onLibraryUpdate?.({ status: 'Ready' })
        }
      },
      () => {
        sseFailedRef.current = true
        if (library.status === 'In Progress') {
          const fileCount = library.files?.length || 1
          runClientPipeline(fileCount, false)
        }
      }
    )

    return unsubscribe
  }, [library?.id, library?.status, onLibraryUpdate, runClientPipeline])

  const files = library.files || []

  function handleAddFiles(fileList) {
    const added = Array.from(fileList)
    setRawNewFiles(prev => [...prev, ...added])
    setNewFiles(prev => [
      ...prev,
      ...added.map(f => ({
        id: `new-${Date.now()}-${Math.random()}`,
        name: f.name,
        size: f.size,
        status: '',
      })),
    ])
  }

  const allFileIds = [...files.map(f => f.id), ...newFiles.map(f => f.id)]

  function toggleFileSelected(id) {
    setSelectedFiles(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function toggleAllFiles() {
    if (selectedFiles.size === allFileIds.length) {
      setSelectedFiles(new Set())
    } else {
      setSelectedFiles(new Set(allFileIds))
    }
  }

  function handleRemoveFiles() {
    setNewFiles(prev => prev.filter(f => !selectedFiles.has(f.id)))
    setRawNewFiles(prev => {
      const newFileIds = newFiles.filter(f => selectedFiles.has(f.id)).map(f => f.name)
      return prev.filter(f => !newFileIds.includes(f.name))
    })
    setSelectedFiles(new Set())
  }

  async function handleSave() {
    setSaving(true)

    try {
      if (editing) {
        await api.updateLibrary(library.id, editDraft)
        onLibraryUpdate?.(editDraft)
        setEditing(false)
      }

      const unsavedIds = newFiles.filter(f => f.status === '').map(f => f.id)

      if (unsavedIds.length > 0) {
        setNewFiles(prev =>
          prev.map(f => unsavedIds.includes(f.id) ? { ...f, status: 'Uploading' } : f)
        )

        if (rawNewFiles.length > 0) {
          await api.uploadFiles(library.id, rawNewFiles)
        }

        setNewFiles(prev =>
          prev.map(f => unsavedIds.includes(f.id) ? { ...f, status: 'Uploaded' } : f)
        )
        setRawNewFiles([])

        const fresh = await api.getLibrary(library.id)
        setNewFiles([])
        onLibraryUpdate?.(fresh)

        if (sseFailedRef.current) {
          const totalFiles = fresh.files?.length || 1
          const hadSearchIndex = pipelineSteps.some(s => s.name === 'Creating search index' && s.status === 'ready')
          runClientPipeline(totalFiles, hadSearchIndex)
        }
      }
    } catch (err) {
      console.error('Failed to save:', err)
      setNewFiles(prev =>
        prev.map(f => f.status === 'Uploading' ? { ...f, status: '' } : f)
      )
    } finally {
      setSaving(false)
    }
  }

  const indexingStep = pipelineSteps.find(s => s.name === 'Indexing data')
  const isIndexing = indexingStep?.status === 'inProgress'
  const indexingDone = indexingStep?.status === 'ready'

  function getFileDisplayStatus(file, fileIndex) {
    if (isIndexing) {
      if (fileIndex < indexingFileIndex) return 'Indexed'
      if (fileIndex === indexingFileIndex) return 'Indexing'
      return file.status || 'Uploaded'
    }
    if (indexingDone) return 'Indexed'
    return file.status || 'Uploaded'
  }

  const isProcessing = pipelineSteps.some(s => s.status === 'inProgress')
  const displayStatus = pipelineOverall === 'ready' ? 'Ready'
    : isProcessing ? 'Processing'
    : (library.status || 'Draft')

  const agentToolReady = pipelineSteps.some(
    s => s.name === 'Building agent tool' && s.status === 'ready'
  )

  const enrichedSteps = useMemo(() => {
    const fileCount = files.length
    const now = new Date()
    const refreshTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} hrs`

    return pipelineSteps.map(step => {
      if (step.status !== 'ready') return step

      switch (step.name) {
        case 'Uploading files':
          return { ...step, readyDescription: `${fileCount} out of ${fileCount} files uploaded` }
        case 'Creating search index':
          return { ...step, link: { label: 'Search Index', href: '#' } }
        case 'Setting up retriever':
          return { ...step, links: [
            { label: 'Retriever', href: '#' },
            { label: 'Test Retriever', href: '#' },
          ] }
        case 'Building agent tool':
          return { ...step, link: { label: 'Agent tool', href: '#' } }
        case 'Indexing data':
          return { ...step, readyDescription: `Last refreshed: ${refreshTime}` }
        default:
          return step
      }
    })
  }, [pipelineSteps, files.length])

  return (
    <div className="flex-1 h-full bg-background flex flex-col overflow-hidden">
      {/* Sticky metadata card */}
      <Card className={`px-6 shrink-0 rounded-none border-x-0 border-t-0 transition-all duration-200 ${metaCollapsed ? 'py-3' : 'p-5 pb-5'}`}>
        {editing ? (
          <>
            <div className="flex flex-col gap-1.5 mb-4">
              <Label htmlFor="editLibraryName">Library Name</Label>
              <Input
                id="editLibraryName"
                value={editDraft.libraryName}
                onChange={e => handleDraftChange('libraryName', e.target.value)}
              />
            </div>

            <div className="flex gap-6 mb-4">
              <div className="flex flex-col gap-1.5 flex-1">
                <Label htmlFor="editApiName">API Name</Label>
                <Input
                  id="editApiName"
                  value={editDraft.apiName}
                  onChange={e => handleDraftChange('apiName', e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5 flex-1">
                <Label htmlFor="editDataSpace">Data Space</Label>
                <div className="relative flex items-center">
                  <Input
                    id="editDataSpace"
                    value={editDraft.dataSpace}
                    readOnly
                    className="pr-9 cursor-pointer"
                  />
                  {editDraft.dataSpace && (
                    <button
                      className="absolute right-2.5 bg-transparent border-none cursor-pointer p-0.5 flex items-center justify-center text-muted-foreground rounded-full hover:bg-secondary"
                      onClick={() => handleDraftChange('dataSpace', '')}
                      aria-label="Clear data space"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="editDescription">Description</Label>
              <Textarea
                id="editDescription"
                value={editDraft.description}
                onChange={e => handleDraftChange('description', e.target.value)}
                placeholder="This description will be used by agent to decide when to call this data library..."
              />
            </div>
          </>
        ) : (
          <>
            <div className={`flex items-center justify-between ${metaCollapsed ? '' : 'mb-4'}`}>
              <h1 className={`font-bold text-foreground m-0 font-sans transition-all duration-200 ${metaCollapsed ? 'text-base' : 'text-[22px]'}`}>{library.libraryName}</h1>
              <Button variant="link" onClick={startEditing}>Edit</Button>
            </div>

            {!metaCollapsed && (
              <>
                <div className="flex gap-12 mb-0">
                  <div className="flex flex-col gap-0.5">
                    <Label className="font-normal">API Name</Label>
                    <span className="text-sm font-normal text-foreground font-sans">{library.apiName}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <Label className="font-normal">Data Space</Label>
                    <span className="text-sm font-normal text-foreground font-sans">{library.dataSpace || 'Default'}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <Label className="font-normal">Data Type</Label>
                    <span className="text-sm font-normal text-foreground font-sans">Files</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <Label className="font-normal">Status</Label>
                    <Badge variant={displayStatus === 'Ready' ? 'success' : displayStatus === 'Processing' ? 'inProgress' : 'default'}>
                      {displayStatus}
                    </Badge>
                  </div>
                </div>

                {library.description && (
                  <div className="mt-4">
                    <Label className="font-normal mb-0.5">Description</Label>
                    <p className="text-sm text-foreground font-sans leading-relaxed m-0">{library.description}</p>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </Card>

      <div ref={scrollRef} onScroll={handleScroll} className="flex-1 p-6 overflow-y-auto min-h-0 bg-muted">
        {/* Status card */}
        <StatusCard steps={enrichedSteps} />

        {/* Agent Tool card */}
        {agentToolReady && (
          <AgentToolCard libraryName={library.libraryName} />
        )}

        {/* Files card */}
        <Collapsible open={filesOpen} onOpenChange={setFilesOpen}>
          <Card className="overflow-hidden p-0">
            <div className="flex items-center py-4 px-6">
              <CollapsibleTrigger className="flex items-center gap-2 flex-1 cursor-pointer bg-transparent border-none p-0 font-sans hover:opacity-85">
                <span className={`flex items-center transition-transform duration-200 ${filesOpen ? 'rotate-0' : '-rotate-90'}`}>
                  <ChevronDown size={12} />
                </span>
                <span className="text-[15px] font-bold text-foreground">Files</span>
              </CollapsibleTrigger>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 border border-input rounded px-3 py-[5px] bg-background w-40 focus-within:border-ring focus-within:ring-1 focus-within:ring-ring">
                  <Search size={14} className="text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="border-none outline-none text-sm font-sans text-foreground flex-1 bg-transparent placeholder:text-muted-foreground"
                  />
                </div>
                <Button variant="neutral" onClick={() => fileInputRef.current?.click()}>
                  <Plus size={12} />
                  Add Files
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.html,.txt"
                  className="hidden"
                  onChange={e => {
                    if (e.target.files?.length) handleAddFiles(e.target.files)
                    e.target.value = ''
                  }}
                />
              </div>
            </div>

            <CollapsibleContent>
              <div className="px-6 pb-5">
                <p className="text-xs text-muted-foreground font-sans m-0 mb-3">
                  Add files up to 1000 files &middot; Supports PDF, HTML, .TXT
                </p>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-9 text-center">
                        <Checkbox
                          aria-label="Select all"
                          checked={allFileIds.length > 0 && selectedFiles.size === allFileIds.length}
                          onCheckedChange={toggleAllFiles}
                        />
                      </TableHead>
                      <TableHead>
                        <span className="flex items-center gap-1">File Name <ArrowUpDown size={10} className="text-muted-foreground" /></span>
                      </TableHead>
                      <TableHead>
                        <span className="flex items-center gap-1">Size <ArrowUpDown size={10} className="text-muted-foreground" /></span>
                      </TableHead>
                      <TableHead>
                        <span className="flex items-center gap-1">Status <ArrowUpDown size={10} className="text-muted-foreground" /></span>
                      </TableHead>
                      <TableHead>
                        <span className="flex items-center gap-1">Uploaded By <ArrowUpDown size={10} className="text-muted-foreground" /></span>
                      </TableHead>
                      <TableHead>
                        <span className="flex items-center gap-1">Uploaded On <ArrowUpDown size={10} className="text-muted-foreground" /></span>
                      </TableHead>
                      <TableHead className="w-9 text-center" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {files.map((file, fileIndex) => (
                      <TableRow key={file.id}>
                        <TableCell className="text-center">
                          <Checkbox
                            aria-label={`Select ${file.name}`}
                            checked={selectedFiles.has(file.id)}
                            onCheckedChange={() => toggleFileSelected(file.id)}
                          />
                        </TableCell>
                        <TableCell>{file.name}</TableCell>
                        <TableCell>{formatSize(file.size)}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {getFileDisplayStatus(file, fileIndex)}
                        </TableCell>
                        <TableCell className="text-sm">{file.uploadedBy || ''}</TableCell>
                        <TableCell className="text-sm">
                          {file.uploadedOn ? new Date(file.uploadedOn).toLocaleDateString() : ''}
                        </TableCell>
                        <TableCell className="text-center">
                          <button className="bg-transparent border-none cursor-pointer p-0.5 flex items-center justify-center rounded-full text-muted-foreground hover:bg-secondary" aria-label="Actions">
                            <MoreHorizontal size={16} />
                          </button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {newFiles.map((file) => (
                      <TableRow key={file.id}>
                        <TableCell className="text-center">
                          <Checkbox
                            aria-label={`Select ${file.name}`}
                            checked={selectedFiles.has(file.id)}
                            onCheckedChange={() => toggleFileSelected(file.id)}
                          />
                        </TableCell>
                        <TableCell>{file.name}</TableCell>
                        <TableCell>{formatSize(file.size)}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {file.status || ''}
                        </TableCell>
                        <TableCell className="text-sm" />
                        <TableCell className="text-sm" />
                        <TableCell className="text-center">
                          <button className="bg-transparent border-none cursor-pointer p-0.5 flex items-center justify-center rounded-full text-muted-foreground hover:bg-secondary" aria-label="Actions">
                            <MoreHorizontal size={16} />
                          </button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex items-center gap-2.5 py-4 px-6 border-t border-border opacity-60">
                <Switch
                  id="useAIView"
                  checked={useAI}
                  disabled
                />
                <Label htmlFor="useAIView" className="text-sm text-foreground font-normal cursor-default">
                  Use AI to process content, extract text, tables, images and structures from files.
                </Label>
              </div>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      </div>

      {/* Footer */}
      <div className="flex justify-center gap-3 py-4 px-6 bg-background border-t border-border shrink-0">
        <Button variant="neutral" onClick={() => { if (editing) cancelEditing(); else onCancel?.(); }}>
          Cancel
        </Button>
        {selectedFiles.size > 0 ? (
          <Button variant="destructive" onClick={handleRemoveFiles}>
            <Trash2 size={14} />
            Remove Files
          </Button>
        ) : (
          <Button variant="brand" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        )}
      </div>
    </div>
  )
}
