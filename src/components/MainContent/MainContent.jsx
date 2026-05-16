import React, { useState, useEffect, useRef } from 'react'
import { Search, Filter, ChevronDown, CloudCog, ArrowUpDown, ChevronRight, Trash2, RotateCw } from 'lucide-react'
import {
  ArrowUpRight,
} from '../../assets/icons'
import filesIcon from '../../assets/files-icon.png'
import articleIcon from '../../assets/article-icon.png'
import websiteIcon from '../../assets/website-icon.png'
import mcpIcon from '../../assets/mcp-icon.png'
import retrieverCardIcon from '../../assets/retriever-card-icon.png'
import sharepointIcon from '../../assets/sharepoint-icon.png'
import jiraIcon from '../../assets/jira-icon.png'
import githubIcon from '../../assets/github-icon.png'
import slackIcon from '../../assets/slack-icon.png'
import { Button } from '../ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '../ui/dropdown-menu'
import { Tooltip, TooltipTrigger, TooltipContent } from '../ui/tooltip'
import { Checkbox } from '../ui/checkbox'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../ui/table'
import { Badge } from '../ui/badge'
import DataSourceCard from '../DataSourceCard/DataSourceCard'
import { api } from '../../lib/api'

function StatusIndicator({ status }) {
  const label = status === 'In Progress' ? 'Processing' : (status || 'Draft')
  const variant = label === 'Ready' ? 'success'
    : label === 'Processing' ? 'inProgress'
    : label === 'Failed' ? 'destructive'
    : 'default'
  return <Badge variant={variant}>{label}</Badge>
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' }) +
    ' ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}

export default function MainContent({ onNewLibrary, onViewLibrary, refreshKey, libraryOverrides = {} }) {
  const [libraries, setLibraries] = useState(() => mergeLibraries(api.getFallbackLibraries(), libraryOverrides))
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState({})
  const [searchQuery, setSearchQuery] = useState('')
  const [searchExpanded, setSearchExpanded] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const searchInputRef = useRef(null)

  function mergeLibraries(nextLibraries, overrides) {
    return nextLibraries.map((library) => (
      library?.id && overrides[library.id]
        ? { ...library, ...overrides[library.id] }
        : library
    ))
  }

  useEffect(() => {
    api.listLibraries()
      .then((nextLibraries) => setLibraries(mergeLibraries(nextLibraries, libraryOverrides)))
      .catch(() => setLibraries(mergeLibraries(api.getFallbackLibraries(), libraryOverrides)))
      .finally(() => setLoading(false))
  }, [refreshKey, libraryOverrides])

  useEffect(() => {
    setLibraries((previous) => mergeLibraries(previous, libraryOverrides))
  }, [libraryOverrides])

  const hasLibraries = libraries.length > 0
  const hasUserLibraries = libraries.some(lib => !lib.isDemo)

  const filteredLibraries = libraries.filter(lib => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (
      lib.libraryName?.toLowerCase().includes(q) ||
      lib.status?.toLowerCase().includes(q) ||
      lib.apiName?.toLowerCase().includes(q)
    )
  })

  const selectableLibraries = filteredLibraries.filter(lib => !lib.isDemo)
  const selectedIds = selectableLibraries.filter(lib => selected[lib.id]).map(lib => lib.id)
  const allSelected = selectableLibraries.length > 0 && selectableLibraries.every(l => selected[l.id])

  function toggleSelect(library) {
    if (library.isDemo) return
    setSelected(prev => ({ ...prev, [library.id]: !prev[library.id] }))
  }

  function toggleSelectAll() {
    if (allSelected) {
      setSelected({})
    } else {
      const next = {}
      selectableLibraries.forEach(l => { next[l.id] = true })
      setSelected(next)
    }
  }

  async function handleRemoveSelected() {
    setDeleting(true)
    for (const id of selectedIds) {
      try { await api.deleteLibrary(id) } catch {}
    }
    setShowDeleteConfirm(false)
    setSelected({})
    api.listLibraries()
      .then((nextLibraries) => setLibraries(mergeLibraries(nextLibraries, libraryOverrides)))
      .catch(() => setLibraries(mergeLibraries(api.getFallbackLibraries(), libraryOverrides)))
    setDeleting(false)
  }

  return (
    <main className="flex-1 h-full bg-background flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto min-h-0">
      {/* Title Bar */}
      <div className="flex items-center justify-between py-3 px-6 border-b border-border shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="text-sm text-muted-foreground font-sans">Agentforce Studio</span>
          <span className="text-sm text-muted-foreground">/</span>
          <h1 className="text-sm font-bold text-foreground m-0 font-sans">Data Library</h1>
        </div>
      </div>

      <div className="py-7 px-6">
        <h2 className="text-xl font-medium text-foreground m-0 mb-2 font-sans text-balance">
          Build agent knowledge in minutes
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed m-0 mb-6 font-sans text-pretty">
          Add data and we'll create a searchable index, set up retrieval, and surface data quality issues—all automatically.{' '}
          <a href="#" className="inline-flex items-center gap-1 text-primary no-underline text-sm font-normal hover:underline">
            Learn more in help
            <ArrowUpRight size={11} className="text-primary" />
          </a>
        </p>

        {/* Data source cards — keep for first-time users until they create their first ADL */}
        {!hasUserLibraries && (
          <div className="mb-8 grid grid-cols-[repeat(4,minmax(0,1fr))] gap-3 max-[900px]:grid-cols-2">
            <DataSourceCard
              icon={<img src={filesIcon} alt="Files" width={28} height={28} className="dark:invert dark:brightness-200" />}
              label="Upload Files"
              onClick={onNewLibrary}
            />
            <DataSourceCard
              icon={<img src={articleIcon} alt="Articles" width={28} height={28} className="dark:invert dark:brightness-200" />}
              label="Add Knowledge Articles"
            />
            <DataSourceCard
              icon={<img src={websiteIcon} alt="Websites" width={28} height={28} className="dark:invert dark:brightness-200" />}
              label="Search Websites"
            />
            <DataSourceCard
              icon={<img src={retrieverCardIcon} alt="Retrievers" width={28} height={28} className="dark:invert dark:brightness-200" />}
              label="Custom Retrievers"
            />
            <DataSourceCard
              icon={null}
              badges={
                <>
                  <img src={sharepointIcon} alt="SharePoint" width={26} height={26} />
                  <img src={jiraIcon} alt="Jira" width={26} height={26} />
                  <img src={githubIcon} alt="GitHub" width={26} height={26} />
                  <img src={slackIcon} alt="Slack" width={26} height={26} />
                </>
              }
              badgeMore="+32 more"
              label="Data Cloud Connectors"
              externalLink
            />
            <DataSourceCard
              icon={<img src={mcpIcon} alt="MCP" width={28} height={28} />}
              label="Use MCP servers"
              externalLink
            />
          </div>
        )}

        {/* Library list table */}
        {hasLibraries && (
          <>
          <div className="flex items-center justify-between gap-4 mb-3">
            <h3 className="text-base font-semibold text-foreground m-0 font-sans">All Libraries</h3>
            <div className="flex items-center gap-2">
              {searchExpanded ? (
                <div className="flex items-center gap-2 border border-ring rounded-full px-3 py-[5px] bg-background w-[200px] ring-1 ring-ring animate-in fade-in slide-in-from-right-2 duration-150">
                  <Search size={14} className="text-muted-foreground shrink-0" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    onBlur={() => { if (!searchQuery) setSearchExpanded(false) }}
                    onKeyDown={e => { if (e.key === 'Escape') { setSearchQuery(''); setSearchExpanded(false) } }}
                    className="border-none outline-none text-sm font-sans text-foreground flex-1 bg-transparent placeholder:text-muted-foreground min-w-0"
                    autoFocus
                  />
                </div>
              ) : (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="icon" 
                      size="icon" 
                      aria-label="Search"
                      onClick={() => {
                        setSearchExpanded(true)
                        setTimeout(() => searchInputRef.current?.focus(), 0)
                      }}
                    >
                      <Search size={16} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Search</TooltipContent>
                </Tooltip>
              )}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="icon" size="icon" aria-label="Refresh">
                    <RotateCw size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Refresh</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="icon" size="icon" aria-label="Filter">
                    <Filter size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Filter</TooltipContent>
              </Tooltip>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="brand">
                    Add Data
                    <ChevronDown size={10} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[260px]">
                  <DropdownMenuItem onClick={() => onNewLibrary?.()}>
                    <img src={filesIcon} alt="Files" width={20} height={20} />
                    <span className="flex-1">Files</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <img src={articleIcon} alt="Articles" width={20} height={20} />
                    <span className="flex-1">Salesforce Knowledge</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <img src={websiteIcon} alt="Websites" width={20} height={20} />
                    <span className="flex-1">Websites</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <img src={retrieverCardIcon} alt="Retrievers" width={20} height={20} />
                    <span className="flex-1">Custom Retrievers</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <CloudCog size={20} className="text-muted-foreground" />
                    <span className="flex-1">Data Cloud Connectors</span>
                    <ArrowUpRight size={14} className="text-muted-foreground" />
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <img src={mcpIcon} alt="MCP" width={20} height={20} />
                    <span className="flex-1">MCP Servers</span>
                    <ArrowUpRight size={14} className="text-muted-foreground" />
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <div className="mb-8 border border-border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-9 text-center">
                    <Checkbox aria-label="Select all" checked={allSelected} onChange={toggleSelectAll} />
                  </TableHead>
                  <TableHead className="font-medium"><span className="flex items-center gap-1">Name <ArrowUpDown size={10} className="text-muted-foreground" /></span></TableHead>
                  <TableHead><span className="flex items-center gap-1">Type <ArrowUpDown size={10} className="text-muted-foreground" /></span></TableHead>
                  <TableHead><span className="flex items-center gap-1">Status <ArrowUpDown size={10} className="text-muted-foreground" /></span></TableHead>
                  <TableHead><span className="flex items-center gap-1">Created By <ArrowUpDown size={10} className="text-muted-foreground" /></span></TableHead>
                  <TableHead><span className="flex items-center gap-1">Created On <ArrowUpDown size={10} className="text-muted-foreground" /></span></TableHead>
                  <TableHead><span className="flex items-center gap-1">Agents <ArrowUpDown size={10} className="text-muted-foreground" /></span></TableHead>
                  <TableHead className="w-9" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLibraries.map((lib) => (
                  <TableRow
                    key={lib.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => onViewLibrary?.(lib)}
                  >
                    <TableCell className="text-center" onClick={e => e.stopPropagation()}>
                      <Checkbox
                        aria-label={`Select ${lib.libraryName}`}
                        checked={!!selected[lib.id]}
                        onChange={() => toggleSelect(lib)}
                        disabled={lib.isDemo}
                      />
                    </TableCell>
                    <TableCell className="font-normal">{lib.libraryName}</TableCell>
                    <TableCell>Files</TableCell>
                    <TableCell>
                      <StatusIndicator status={lib.status} />
                    </TableCell>
                    <TableCell>{lib.files?.[0]?.uploadedBy || 'orgfarm-epic'}</TableCell>
                    <TableCell className="tabular-nums">{formatDate(lib.createdAt)}</TableCell>
                    <TableCell className="text-primary text-sm">
                      {lib.agents || ''}
                    </TableCell>
                    <TableCell>
                      <ChevronRight size={14} className="text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          </>
        )}
      </div>
      </div>

      {selectedIds.length > 0 && (
        <div className="flex justify-center gap-3 py-4 px-6 bg-background border-t border-border shrink-0 shadow-[0_-2px_8px_rgba(0,0,0,0.06)]">
          <Button variant="ghost" className="h-auto px-0 text-foreground hover:bg-transparent" onClick={() => setSelected({})}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={() => setShowDeleteConfirm(true)}>
            <Trash2 size={14} />
            Delete Libraries
          </Button>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={() => !deleting && setShowDeleteConfirm(false)}>
          <div
            className="w-full max-w-md rounded-xl border border-border bg-background p-6 shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-libraries-title"
            onClick={e => e.stopPropagation()}
          >
            <h3 id="delete-libraries-title" className="m-0 text-lg font-semibold text-foreground font-sans text-balance">
              Delete {selectedIds.length > 1 ? 'libraries' : 'library'}?
            </h3>
            <p className="mt-2 mb-0 text-sm text-muted-foreground leading-relaxed">
              {selectedIds.length > 1
                ? `This will permanently delete ${selectedIds.length} selected libraries. This action cannot be undone.`
                : 'This will permanently delete the selected library. This action cannot be undone.'}
            </p>
            <div className="mt-6 flex items-center justify-end gap-2">
              <Button
                variant="ghost"
                className="h-9"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button variant="destructive" className="h-9" onClick={handleRemoveSelected} disabled={deleting}>
                {deleting ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
