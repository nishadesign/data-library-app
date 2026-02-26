import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, Search, Plus, MoreHorizontal, ArrowUpDown } from 'lucide-react'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Checkbox } from '../ui/checkbox'
import { Switch } from '../ui/switch'
import { Card } from '../ui/card'
import { Label } from '../ui/label'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../ui/table'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '../ui/collapsible'
import StatusCard from '../StatusCard/StatusCard'
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

export default function LibraryView({ library, onEdit, onLibraryUpdate }) {
  const [filesOpen, setFilesOpen] = useState(true)
  const [useAI, setUseAI] = useState(true)
  const [pipelineSteps, setPipelineSteps] = useState(DEFAULT_STEPS)
  const [pipelineOverall, setPipelineOverall] = useState('idle')
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (!library?.id) return

    const unsubscribe = api.subscribePipelineStatus(library.id, (data) => {
      if (data.steps?.length > 0) {
        setPipelineSteps(data.steps)
      }
      setPipelineOverall(data.overall)

      if (data.overall === 'ready') {
        onLibraryUpdate?.({ status: 'Ready' })
      }
    })

    return unsubscribe
  }, [library?.id, onLibraryUpdate])

  async function handleAddFiles(fileList) {
    if (!library?.id) return
    try {
      await api.uploadFiles(library.id, Array.from(fileList))
      const fresh = await api.getLibrary(library.id)
      onLibraryUpdate?.(fresh)
    } catch (err) {
      console.error('Failed to upload files:', err)
    }
  }

  const files = library.files || []
  const displayStatus = pipelineOverall === 'ready' ? 'Ready' : (library.status || 'Draft')

  return (
    <div className="flex-1 bg-background overflow-y-auto flex flex-col">
      <div className="flex-1 p-6 overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <h1 className="text-[22px] font-bold text-foreground m-0 font-sans">{library.libraryName}</h1>
          <Button variant="link" onClick={onEdit}>Edit</Button>
        </div>

        {/* Metadata row */}
        <div className="flex gap-12 mb-5">
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
            <Badge variant={displayStatus === 'Ready' ? 'default' : 'inProgress'}>
              {displayStatus}
            </Badge>
          </div>
        </div>

        {/* Description */}
        {library.description && (
          <div className="mb-6">
            <Label className="font-normal mb-0.5">Description</Label>
            <p className="text-[13px] text-foreground font-sans leading-relaxed m-0">{library.description}</p>
          </div>
        )}

        {/* Status card */}
        <StatusCard steps={pipelineSteps} />

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
                    className="border-none outline-none text-[13px] font-sans text-foreground flex-1 bg-transparent placeholder:text-muted-foreground"
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
                  onChange={e => { handleAddFiles(e.target.files); e.target.value = '' }}
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
                        <Checkbox aria-label="Select all" />
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
                    {files.map((file) => (
                      <TableRow key={file.id}>
                        <TableCell className="text-center">
                          <Checkbox aria-label={`Select ${file.name}`} />
                        </TableCell>
                        <TableCell>{file.name}</TableCell>
                        <TableCell>{formatSize(file.size)}</TableCell>
                        <TableCell className="text-muted-foreground text-[13px]">
                          {file.status || 'Uploaded'}
                        </TableCell>
                        <TableCell className="text-[13px]">{file.uploadedBy || ''}</TableCell>
                        <TableCell className="text-[13px]">
                          {file.uploadedOn ? new Date(file.uploadedOn).toLocaleDateString() : ''}
                        </TableCell>
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

              <div className="flex items-center gap-2.5 py-4 px-6 border-t border-border">
                <Switch
                  id="useAIView"
                  checked={useAI}
                  onCheckedChange={setUseAI}
                />
                <Label htmlFor="useAIView" className="text-[13px] text-foreground font-normal cursor-pointer">
                  Use AI to process content, extract text, tables, images and structures from files.
                </Label>
              </div>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      </div>
    </div>
  )
}
