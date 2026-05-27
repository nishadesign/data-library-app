import React, { useState, useRef } from 'react'
import { ChevronDown, Search, Plus, MoreHorizontal, ArrowUpDown, X, Trash2, Sparkles } from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Checkbox } from '../ui/checkbox'
import { Switch } from '../ui/switch'
import { Card } from '../ui/card'
import { Label } from '../ui/label'
import { Tooltip, TooltipTrigger, TooltipContent } from '../ui/tooltip'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../ui/table'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '../ui/collapsible'
import StatusCard from '../StatusCard/StatusCard'
import AgentToolCard from '../AgentToolCard/AgentToolCard'
import { api } from '../../lib/api'

const DEFAULT_STEPS = [
  { name: 'Uploading files', status: 'default' },
  { name: 'Creating search index', status: 'default' },
  { name: 'Setting up retriever', status: 'default' },
  { name: 'Building agent tool', status: 'default' },
  { name: 'Indexing data', status: 'default' },
]

export default function LibraryDetail({ onCancel, onSave }) {
  const [dataSpace, setDataSpace] = useState('Default')
  const [libraryName, setLibraryName] = useState('Files Library')
  const [apiName, setApiName] = useState('Files_Library')
  const [description, setDescription] = useState('')
  const [filesOpen, setFilesOpen] = useState(true)
  const [dragOver, setDragOver] = useState(false)
  const [useAI, setUseAI] = useState(true)
  const [showAIWarning, setShowAIWarning] = useState(false)
  const [pendingFiles, setPendingFiles] = useState([])
  const [rawFiles, setRawFiles] = useState([])
  const [saving, setSaving] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState(new Set())
  const fileInputRef = useRef(null)

  function handleLibraryNameChange(e) {
    const name = e.target.value
    setLibraryName(name)
    setApiName(name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, ''))
  }

  function formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  function addFiles(fileList) {
    const files = Array.from(fileList)
    setRawFiles(prev => [...prev, ...files])
    setPendingFiles(prev => [
      ...prev,
      ...files.map(f => ({ name: f.name, size: formatSize(f.size), status: '' })),
    ])
  }

  function toggleFileSelected(index) {
    setSelectedFiles(prev => {
      const next = new Set(prev)
      next.has(index) ? next.delete(index) : next.add(index)
      return next
    })
  }

  function toggleAllFiles() {
    if (selectedFiles.size === pendingFiles.length) {
      setSelectedFiles(new Set())
    } else {
      setSelectedFiles(new Set(pendingFiles.map((_, i) => i)))
    }
  }

  function handleRemoveFiles() {
    const indices = selectedFiles
    setPendingFiles(prev => prev.filter((_, i) => !indices.has(i)))
    setRawFiles(prev => prev.filter((_, i) => !indices.has(i)))
    setSelectedFiles(new Set())
  }

  async function handleSave() {
    if (pendingFiles.length === 0) return
    setSaving(true)

    const unsavedIndices = pendingFiles
      .map((f, i) => (f.status === '' ? i : -1))
      .filter(i => i !== -1)

    setPendingFiles(prev =>
      prev.map((f, i) => unsavedIndices.includes(i) ? { ...f, status: 'Uploading' } : f)
    )

    try {
      const library = await api.createLibrary({
        libraryName,
        apiName,
        dataSpace,
        description,
        useAI,
      })

      if (rawFiles.length > 0) {
        await api.uploadFiles(library.id, rawFiles)
      }

      setPendingFiles(prev =>
        prev.map((f, i) => unsavedIndices.includes(i) ? { ...f, status: 'Uploaded' } : f)
      )

      await new Promise(r => setTimeout(r, 600))
      const fresh = await api.getLibrary(library.id)
      onSave?.(fresh)
    } catch (err) {
      console.error('Failed to save library:', err)
      setPendingFiles(prev =>
        prev.map((f, i) => unsavedIndices.includes(i) ? { ...f, status: '' } : f)
      )
    } finally {
      setSaving(false)
    }
  }

  const hasUnsavedPendingFiles = pendingFiles.some(file => file.status === '')
  const saveDisabled = saving || !hasUnsavedPendingFiles

  return (
    <div className="flex-1 h-full bg-muted flex flex-col overflow-hidden">
      {/* Sticky metadata card */}
      <Card className="px-6 shrink-0 rounded-none border-x-0 border-t-0 p-5 pb-0">
        <div className="flex flex-col gap-1.5 w-full mb-4">
          <Label htmlFor="dataSpace">Data Space</Label>
          <div className="relative flex items-center">
            <Input
              id="dataSpace"
              value={dataSpace}
              readOnly
              className="pr-9 cursor-pointer"
            />
            {dataSpace && (
                <button
                className="absolute right-2.5 bg-transparent border-none cursor-pointer p-0.5 flex items-center justify-center text-muted-foreground rounded-full hover:bg-secondary"
                onClick={() => setDataSpace('')}
                aria-label="Clear data space"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        <div className="flex gap-6 mb-4">
          <div className="flex flex-col gap-1.5 flex-1">
            <Label htmlFor="libraryName">Library Name</Label>
            <Input
              id="libraryName"
              value={libraryName}
              onChange={handleLibraryNameChange}
            />
          </div>
          <div className="flex flex-col gap-1.5 flex-1">
            <Label htmlFor="apiName">API Name</Label>
            <Input
              id="apiName"
              value={apiName}
              onChange={e => setApiName(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5 w-full mb-4">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="This description will be used by agent to decide when to call this data library..."
          />
        </div>

        <div className="flex items-center gap-2.5 py-4 -mx-6 px-6 border-t border-border">
          <Switch
            id="useAI"
            checked={useAI}
            onCheckedChange={(checked) => {
              if (!checked) {
                setShowAIWarning(true)
              } else {
                setUseAI(true)
              }
            }}
          />
          <Label htmlFor="useAI" className="text-sm text-foreground font-normal cursor-pointer inline-flex items-center gap-1.5">
            Use Intelligent Context to process content, extract text, tables, images and structures from files.
            <Tooltip>
              <TooltipTrigger asChild>
                <Sparkles size={14} className="text-primary shrink-0" />
              </TooltipTrigger>
              <TooltipContent className="bg-tooltip-ai">This feature uses LLM to process content</TooltipContent>
            </Tooltip>
          </Label>
        </div>
      </Card>

      <div className="flex-1 p-6 pb-0 overflow-y-auto min-h-0">
        <AgentToolCard />
        <StatusCard steps={DEFAULT_STEPS} defaultOpen={false} />

        {/* Files Section */}
        <Collapsible open={filesOpen} onOpenChange={setFilesOpen}>
          <Card className="mb-4 p-0">
            <div className="flex items-center py-4 px-6 min-h-[68px]">
              <CollapsibleTrigger className="flex items-center gap-2 cursor-pointer select-none bg-transparent border-none p-0 flex-1 text-left font-sans hover:opacity-85">
                <span className={`flex items-center transition-transform duration-200 ${filesOpen ? 'rotate-0' : '-rotate-90'}`}>
                  <ChevronDown size={12} />
                </span>
                <span className="text-[15px] font-bold text-foreground">Files</span>
                <span className="text-sm text-muted-foreground font-normal ml-1">· You can add up to 1000 files per library</span>
              </CollapsibleTrigger>
              {pendingFiles.length > 0 && filesOpen && (
                  <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 border border-input rounded-full px-3 py-[5px] bg-background w-40 focus-within:border-ring focus-within:ring-1 focus-within:ring-ring">
                    <Search size={14} className="text-muted-foreground" />
                    <input type="text" placeholder="Search..." className="border-none outline-none text-sm font-sans text-foreground flex-1 bg-transparent placeholder:text-muted-foreground" />
                  </div>
                  <Button variant="neutral" onClick={() => fileInputRef.current?.click()}>
                    <Plus size={12} />
                    Add Files
                  </Button>
                </div>
              )}
            </div>

            <CollapsibleContent>
              <div className="px-6 pb-5">
                {pendingFiles.length === 0 ? (
                  <div
                    className={`border-2 border-dashed rounded-md min-h-[140px] flex flex-col items-center justify-center cursor-pointer transition-colors mb-3 ${
                      dragOver
                        ? 'border-ring bg-secondary'
                        : 'border-input bg-muted'
                    }`}
                    onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                    onDragLeave={e => { e.preventDefault(); setDragOver(false) }}
                    onDrop={e => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files) }}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-sm font-bold text-primary cursor-pointer font-sans hover:underline">Browse</span>
                      <span className="text-sm text-muted-foreground font-sans">&nbsp;Or drop files</span>
                    </div>
                  </div>
                ) : (
                  <div className="border border-border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-9 text-center">
                          <Checkbox
                            aria-label="Select all"
                            checked={pendingFiles.length > 0 && selectedFiles.size === pendingFiles.length}
                            onCheckedChange={toggleAllFiles}
                          />
                        </TableHead>
                        <TableHead><span className="flex items-center gap-1">File Name <ArrowUpDown size={10} className="text-muted-foreground" /></span></TableHead>
                        <TableHead><span className="flex items-center gap-1">Size <ArrowUpDown size={10} className="text-muted-foreground" /></span></TableHead>
                        <TableHead><span className="flex items-center gap-1">Status <ArrowUpDown size={10} className="text-muted-foreground" /></span></TableHead>
                        <TableHead><span className="flex items-center gap-1">Uploaded By <ArrowUpDown size={10} className="text-muted-foreground" /></span></TableHead>
                        <TableHead><span className="flex items-center gap-1">Uploaded On <ArrowUpDown size={10} className="text-muted-foreground" /></span></TableHead>
                        <TableHead className="w-9 text-center" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingFiles.map((file, i) => (
                        <TableRow key={i}>
                          <TableCell className="text-center">
                            <Checkbox
                              aria-label={`Select ${file.name}`}
                              checked={selectedFiles.has(i)}
                              onCheckedChange={() => toggleFileSelected(i)}
                            />
                          </TableCell>
                          <TableCell>{file.name}</TableCell>
                          <TableCell>{file.size}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {file.status}
                          </TableCell>
                          <TableCell />
                          <TableCell />
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
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.html,.txt"
                  className="hidden"
                  onChange={e => { addFiles(e.target.files); e.target.value = '' }}
                />
              </div>

            </CollapsibleContent>
          </Card>
        </Collapsible>

      </div>

      {/* Footer */}
      <div className="flex justify-center gap-3 py-4 px-6 bg-background border-t border-border shrink-0">
        <Button variant="ghost" className="h-auto px-0 text-foreground hover:bg-transparent" onClick={onCancel}>
          Cancel
        </Button>
        {selectedFiles.size > 0 ? (
          <Button variant="destructive" onClick={handleRemoveFiles}>
            <Trash2 size={14} />
            Remove Files
          </Button>
        ) : (
          saveDisabled && !saving ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-flex">
                  <Button variant="brand" onClick={handleSave} disabled>
                    Save
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent>Add files to enable save</TooltipContent>
            </Tooltip>
          ) : (
            <Button variant="brand" onClick={handleSave} disabled={saveDisabled}>
              {saving ? 'Saving...' : 'Save'}
            </Button>
          )
        )}
      </div>

      {showAIWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={() => setShowAIWarning(false)}>
          <div
            className="w-full max-w-lg rounded-xl border border-border bg-background shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ai-warning-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 pt-6 pb-4 border-b border-border text-center">
              <h3 id="ai-warning-title" className="m-0 text-base font-semibold text-foreground font-sans">
                Disable Intelligent Context?
              </h3>
            </div>
            <div className="px-6 pt-4 pb-4 text-center">
              <p className="mt-0 mb-0 text-sm text-muted-foreground leading-relaxed">
                Without Intelligent Context, processing may be slower and complex content like images and data tables may not index accurately.
              </p>
            </div>
            <div className="flex justify-center gap-3 px-6 py-4 border-t border-border">
              <Button variant="ghost" onClick={() => setShowAIWarning(false)}>
                Not Sure
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  setUseAI(false)
                  setShowAIWarning(false)
                }}
              >
                Yes, Disable
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
