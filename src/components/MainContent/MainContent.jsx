import React, { useState, useEffect } from 'react'
import { Search, Filter, ChevronDown, CloudCog, Database, ArrowUpDown, ChevronRight, Trash2 } from 'lucide-react'
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

export default function MainContent({ onNewLibrary, onViewLibrary, refreshKey }) {
  const [libraries, setLibraries] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState({})
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    api.listLibraries()
      .then(setLibraries)
      .catch(() => setLibraries([]))
      .finally(() => setLoading(false))
  }, [refreshKey])

  const hasLibraries = libraries.length > 0

  const filteredLibraries = libraries.filter(lib => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (
      lib.libraryName?.toLowerCase().includes(q) ||
      lib.status?.toLowerCase().includes(q) ||
      lib.apiName?.toLowerCase().includes(q)
    )
  })

  const selectedIds = Object.keys(selected).filter(id => selected[id])
  const allSelected = filteredLibraries.length > 0 && filteredLibraries.every(l => selected[l.id])

  function toggleSelect(id) {
    setSelected(prev => ({ ...prev, [id]: !prev[id] }))
  }

  function toggleSelectAll() {
    if (allSelected) {
      setSelected({})
    } else {
      const next = {}
      filteredLibraries.forEach(l => { next[l.id] = true })
      setSelected(next)
    }
  }

  async function handleRemoveSelected() {
    for (const id of selectedIds) {
      try { await api.deleteLibrary(id) } catch {}
    }
    setSelected({})
    api.listLibraries().then(setLibraries).catch(() => setLibraries([]))
  }

  return (
    <main className="flex-1 h-full bg-background flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto min-h-0">
      {/* Title Bar */}
      <div className="flex items-center justify-between py-3 px-6 border-b border-border shrink-0">
        <div className="flex items-center gap-2.5">
          <Database size={22} className="text-primary" />
          <h1 className="text-lg font-bold text-foreground m-0 font-sans">Data Libraries</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 border border-input rounded-full px-3 py-[5px] bg-background w-[180px] focus-within:border-ring focus-within:ring-1 focus-within:ring-ring">
            <Search size={14} className="text-muted-foreground" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="border-none outline-none text-sm font-sans text-foreground flex-1 bg-transparent placeholder:text-muted-foreground"
            />
          </div>
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

      <div className="py-7 px-6">
        <h2 className="text-xl font-bold text-foreground m-0 mb-2 font-sans">
          Quick start by adding data, we'll handle the rest!
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed m-0 mb-6 font-sans">
          After you add your data, we'll read it, prepare it for search, and make sure your agent can use it reliably. You can track progress at each step and review the results before going live.
          <br />
          <a href="#" className="inline-flex items-center gap-1 text-primary no-underline text-sm font-normal hover:underline">
            Learn more in help
            <ArrowUpRight size={11} className="text-primary" />
          </a>
        </p>

        {/* Library list table */}
        {hasLibraries && (
          <div className="mb-8 border border-border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-9 text-center">
                    <Checkbox aria-label="Select all" checked={allSelected} onChange={toggleSelectAll} />
                  </TableHead>
                  <TableHead><span className="flex items-center gap-1">Name <ArrowUpDown size={10} className="text-muted-foreground" /></span></TableHead>
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
                        onChange={() => toggleSelect(lib.id)}
                      />
                    </TableCell>
                    <TableCell className="font-normal">{lib.libraryName}</TableCell>
                    <TableCell>Files</TableCell>
                    <TableCell>
                      <StatusIndicator status={lib.status} />
                    </TableCell>
                    <TableCell>{lib.files?.[0]?.uploadedBy || 'orgfarm-epic'}</TableCell>
                    <TableCell>{formatDate(lib.createdAt)}</TableCell>
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
        )}

        {/* Data source cards — only show when no libraries exist */}
        {!hasLibraries && (
          <div className="grid grid-cols-[repeat(4,minmax(0,1fr))] gap-3 max-[900px]:grid-cols-2">
            <DataSourceCard
              icon={<img src={filesIcon} alt="Files" width={28} height={28} />}
              label="Upload Files"
              onClick={onNewLibrary}
            />
            <DataSourceCard
              icon={<img src={articleIcon} alt="Articles" width={28} height={28} />}
              label="Add Knowledge Articles"
            />
            <DataSourceCard
              icon={<img src={websiteIcon} alt="Websites" width={28} height={28} />}
              label="Search Websites"
            />
            <DataSourceCard
              icon={<img src={retrieverCardIcon} alt="Retrievers" width={28} height={28} />}
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
      </div>
      </div>

      {selectedIds.length > 0 && (
        <div className="flex justify-center gap-3 py-4 px-6 bg-background border-t border-border shrink-0 shadow-[0_-2px_8px_rgba(0,0,0,0.06)]">
          <Button variant="ghost" className="h-auto px-0 text-foreground hover:bg-transparent" onClick={() => setSelected({})}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleRemoveSelected}>
            <Trash2 size={14} />
            Delete Libraries
          </Button>
        </div>
      )}
    </main>
  )
}
