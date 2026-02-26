import React, { useState, useRef } from 'react'
import { ChevronDown, Search, Plus, MoreHorizontal, ArrowUpDown, X } from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Checkbox } from '../ui/checkbox'
import { Switch } from '../ui/switch'
import { Card } from '../ui/card'
import { Label } from '../ui/label'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../ui/table'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '../ui/collapsible'
import { api } from '../../lib/api'

export default function LibraryDetail({ onCancel, onSave }) {
  const [dataSpace, setDataSpace] = useState('Default')
  const [libraryName, setLibraryName] = useState('Files Library')
  const [apiName, setApiName] = useState('Files_Library')
  const [description, setDescription] = useState('')
  const [filesOpen, setFilesOpen] = useState(true)
  const [dragOver, setDragOver] = useState(false)
  const [useAI, setUseAI] = useState(true)
  const [pendingFiles, setPendingFiles] = useState([])
  const [rawFiles, setRawFiles] = useState([])
  const [saving, setSaving] = useState(false)
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
      ...files.map(f => ({ name: f.name, size: formatSize(f.size) })),
    ])
  }

  async function handleSave() {
    setSaving(true)
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

      const fresh = await api.getLibrary(library.id)
      onSave?.(fresh)
    } catch (err) {
      console.error('Failed to save library:', err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex-1 bg-muted overflow-y-auto flex flex-col">
      <div className="flex-1 p-6 pb-0 overflow-y-auto">
        {/* Form Section */}
        <Card className="p-5 px-6 pb-6 mb-4">
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

          <div className="flex flex-col gap-1.5 w-full">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="This description will be used by agent to decide when to call this data library..."
            />
          </div>
        </Card>

        {/* Files Section */}
        <Collapsible open={filesOpen} onOpenChange={setFilesOpen}>
          <Card className="mb-4 p-0">
            <div className="flex items-center py-4 px-6">
              <CollapsibleTrigger className="flex items-center gap-2 cursor-pointer select-none bg-transparent border-none p-0 flex-1 text-left font-sans hover:opacity-85">
                <span className={`flex items-center transition-transform duration-200 ${filesOpen ? 'rotate-0' : '-rotate-90'}`}>
                  <ChevronDown size={12} />
                </span>
                <span className="text-[15px] font-bold text-foreground">Files</span>
              </CollapsibleTrigger>
              {pendingFiles.length > 0 && filesOpen && (
                  <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 border border-input rounded px-3 py-[5px] bg-background w-40 focus-within:border-ring focus-within:ring-1 focus-within:ring-ring">
                    <Search size={14} className="text-muted-foreground" />
                    <input type="text" placeholder="Search..." className="border-none outline-none text-[13px] font-sans text-foreground flex-1 bg-transparent placeholder:text-muted-foreground" />
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
                <p className="text-xs text-muted-foreground m-0 mb-3 font-sans">
                  Add files up to 1000 files &middot; Supports PDF, HTML, .TXT
                </p>

                {pendingFiles.length === 0 ? (
                  <div
                    className={`border-2 border-dashed rounded-md min-h-[140px] flex flex-col items-center justify-center cursor-pointer transition-colors mb-3 ${
                      dragOver
                        ? 'border-primary bg-[#ddeeff]'
                        : 'border-primary-light-border bg-primary-light'
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
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-9 text-center">
                          <Checkbox aria-label="Select all" />
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
                            <Checkbox aria-label={`Select ${file.name}`} />
                          </TableCell>
                          <TableCell>{file.name}</TableCell>
                          <TableCell>{file.size}</TableCell>
                          <TableCell className="text-muted-foreground">Pending</TableCell>
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
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.html,.txt"
                  className="hidden"
                  onChange={e => { addFiles(e.target.files); e.target.value = '' }}
                />
                <div className="flex items-center gap-2.5 mt-1">
                  <Switch
                    id="useAI"
                    checked={useAI}
                    onCheckedChange={setUseAI}
                  />
                  <Label htmlFor="useAI" className="text-[13px] text-foreground font-normal cursor-pointer">
                    Use AI to process content, extract text, tables, images and structures from files.
                  </Label>
                </div>
              </div>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        <p className="text-xs text-muted-foreground mt-4 mb-0 font-sans">
          Add files up to 1000 files &middot; Supports PDF, HTML, .TXT
        </p>
      </div>

      {/* Footer */}
      <div className="flex justify-center gap-3 py-4 px-6 bg-background border-t border-border shrink-0">
        <Button variant="neutral" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="brand" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </div>
  )
}
