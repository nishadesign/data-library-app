import React, { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown, Plus, Play, Trash2, MoreHorizontal, Pencil, RotateCcw, ArrowRight } from 'lucide-react'
import { Card } from '../ui/card'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '../ui/collapsible'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../ui/table'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '../ui/dropdown-menu'
import AddTestCaseModal from './AddTestCaseModal'
import { runTestSet, runSingleTestCase } from './runTestSet'

function resultBadge(testCase, runningId) {
  if (runningId === testCase.id) {
    return <Badge variant="inProgress">Running…</Badge>
  }
  if (!testCase.lastResult) {
    return <Badge variant="outline">Not run</Badge>
  }
  if (testCase.lastResult.status === 'pass') {
    return <Badge variant="success">Pass</Badge>
  }
  return <Badge variant="destructive">Fail</Badge>
}

function formatRunAt(iso) {
  if (!iso) return '—'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'
  const now = new Date()
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
  return date.toLocaleDateString()
}

export default function TestCard({
  disabled = false,
  disabledMessage = 'Test cases will be available once your data is indexed.',
  defaultOpen = false,
  autoExpandSignal = 0,
  forceOpen = false,
  testCases = [],
  libraryFiles = [],
  onTestCasesChange,
  onFirstPass,
  readOnly = false,
}) {
  const [open, setOpen] = useState(defaultOpen)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCase, setEditingCase] = useState(null)
  const [runningId, setRunningId] = useState(null)
  const [batchRunning, setBatchRunning] = useState(false)
  const [expandedRowId, setExpandedRowId] = useState(null)
  const cancelRef = useRef({ current: false })
  const firstPassFiredRef = useRef(false)

  useEffect(() => {
    if (autoExpandSignal > 0) setOpen(true)
  }, [autoExpandSignal])

  useEffect(() => {
    if (forceOpen) setOpen(true)
  }, [forceOpen])

  useEffect(() => {
    return () => { cancelRef.current.current = true }
  }, [])

  const stats = useMemo(() => {
    const total = testCases.length
    const passed = testCases.filter(tc => tc.lastResult?.status === 'pass').length
    const failed = testCases.filter(tc => tc.lastResult?.status === 'fail').length
    const notRun = total - passed - failed
    return { total, passed, failed, notRun }
  }, [testCases])

  function openAddModal() {
    setEditingCase(null)
    setModalOpen(true)
  }

  function openEditModal(testCase) {
    setEditingCase(testCase)
    setModalOpen(true)
  }

  function handleSubmitCase(submitted) {
    const incoming = Array.isArray(submitted) ? submitted : [submitted]
    let next = [...testCases]
    for (const testCase of incoming) {
      const idx = next.findIndex(tc => tc.id === testCase.id)
      if (idx >= 0) {
        next[idx] = testCase
      } else {
        next.push(testCase)
      }
    }
    onTestCasesChange?.(next)
    setModalOpen(false)
    setEditingCase(null)
  }

  function handleDeleteCase(id) {
    onTestCasesChange?.(testCases.filter(tc => tc.id !== id))
    if (expandedRowId === id) setExpandedRowId(null)
  }

  function handleRowClick(id) {
    setExpandedRowId(prev => (prev === id ? null : id))
  }

  async function handleRunAll() {
    if (testCases.length === 0 || batchRunning) return
    setBatchRunning(true)
    cancelRef.current.current = false
    let working = testCases.map(tc => ({ ...tc }))

    await runTestSet({
      testCases: working,
      libraryFiles,
      cancelRef: cancelRef.current,
      onCaseStart: (id) => setRunningId(id),
      onCaseFinish: (id, result) => {
        working = working.map(tc => (tc.id === id ? { ...tc, lastResult: result } : tc))
        onTestCasesChange?.(working)
        if (!firstPassFiredRef.current && result.status === 'pass') {
          firstPassFiredRef.current = true
          onFirstPass?.()
        }
      },
    })

    setRunningId(null)
    setBatchRunning(false)
  }

  async function handleRunSingle(testCase) {
    if (runningId || batchRunning) return
    setRunningId(testCase.id)
    await new Promise(r => setTimeout(r, 600 + Math.random() * 400))
    const result = runSingleTestCase(testCase, libraryFiles)
    const next = testCases.map(tc => (tc.id === testCase.id ? { ...tc, lastResult: result } : tc))
    onTestCasesChange?.(next)
    if (!firstPassFiredRef.current && result.status === 'pass') {
      firstPassFiredRef.current = true
      onFirstPass?.()
    }
    setRunningId(null)
  }

  const isInteractive = !disabled && !readOnly
  const runAllDisabled = !isInteractive || testCases.length === 0 || batchRunning

  return (
    <>
      <Collapsible open={open} onOpenChange={setOpen}>
        <Card className="mb-6 overflow-hidden rounded-xl p-0">
          <div className="flex items-center py-4 px-6">
            <CollapsibleTrigger className="flex items-center gap-2 flex-1 cursor-pointer bg-transparent border-none p-0 font-sans hover:opacity-85">
              <span className={`flex items-center transition-transform duration-200 ${open ? 'rotate-0' : '-rotate-90'}`}>
                <ChevronDown size={12} />
              </span>
              <span className="text-[15px] font-bold text-foreground">Test</span>
              {!disabled && testCases.length > 0 && (
                <span className="ml-2 text-sm text-muted-foreground font-normal">
                  {stats.passed}/{stats.total} passed
                </span>
              )}
            </CollapsibleTrigger>
            {!disabled && (
              <div className="flex items-center gap-3">
                <Button variant="neutral" onClick={openAddModal} disabled={readOnly}>
                  <Plus size={12} />
                  Add test case
                </Button>
                <Button variant="brand" onClick={handleRunAll} disabled={runAllDisabled}>
                  <Play size={12} />
                  {batchRunning ? 'Running…' : 'Run all'}
                </Button>
              </div>
            )}
          </div>

          <CollapsibleContent className="overflow-hidden data-[state=open]:animate-[collapsible-down_280ms_cubic-bezier(0.16,1,0.3,1)] data-[state=closed]:animate-[collapsible-up_220ms_cubic-bezier(0.4,0,1,1)]">
            <div className="px-6 pb-5">
              {disabled ? (
                <p className="text-sm text-muted-foreground leading-[1.55] m-0 font-sans">
                  {disabledMessage}
                </p>
              ) : testCases.length === 0 ? (
                <div className="border border-dashed border-input rounded-lg px-6 py-10 flex flex-col items-center justify-center gap-2 text-center">
                  <span className="text-sm font-semibold text-foreground font-sans">No test cases yet</span>
                  <span className="text-sm text-muted-foreground font-sans max-w-md">
                    Add test cases to evaluate how well the retriever surfaces the right files and grounds responses.
                  </span>
                  <Button variant="brand" onClick={openAddModal} className="mt-3" disabled={readOnly}>
                    <Plus size={12} />
                    Add your first test case
                  </Button>
                </div>
              ) : (
                <>
                  <div className="border border-border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Question</TableHead>
                          <TableHead>Expected sources</TableHead>
                          <TableHead>Tags</TableHead>
                          <TableHead className="w-[120px]">Result</TableHead>
                          <TableHead className="w-[120px]">Last run</TableHead>
                          <TableHead className="w-9 text-center" />
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {testCases.map(testCase => {
                          const isExpanded = expandedRowId === testCase.id
                          const result = testCase.lastResult
                          return (
                            <React.Fragment key={testCase.id}>
                              <TableRow
                                className="cursor-pointer"
                                data-state={isExpanded ? 'selected' : undefined}
                                onClick={() => handleRowClick(testCase.id)}
                              >
                                <TableCell className="max-w-[260px]">
                                  <span className="block truncate text-sm text-foreground">{testCase.question}</span>
                                </TableCell>
                                <TableCell>
                                  <div className="flex flex-wrap gap-1">
                                    {(testCase.expectedSources || []).length === 0 ? (
                                      <span className="text-sm text-muted-foreground">—</span>
                                    ) : (
                                      (testCase.expectedSources || []).map(name => (
                                        <span key={name} className="inline-flex items-center rounded-2xl bg-secondary px-2 py-0.5 text-xs text-secondary-foreground font-sans">
                                          {name}
                                        </span>
                                      ))
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex flex-wrap gap-1">
                                    {(testCase.tags || []).length === 0 ? (
                                      <span className="text-sm text-muted-foreground">—</span>
                                    ) : (
                                      (testCase.tags || []).map(tag => (
                                        <span key={tag} className="inline-flex items-center rounded-2xl border border-input px-2 py-0.5 text-xs text-foreground font-sans">
                                          {tag}
                                        </span>
                                      ))
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>{resultBadge(testCase, runningId)}</TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                  {formatRunAt(result?.runAt)}
                                </TableCell>
                                <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <button
                                        className="bg-transparent border-none cursor-pointer p-0.5 flex items-center justify-center rounded-full text-muted-foreground hover:bg-secondary"
                                        aria-label="Actions"
                                      >
                                        <MoreHorizontal size={16} />
                                      </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => handleRunSingle(testCase)} disabled={readOnly || !!runningId || batchRunning}>
                                        <RotateCcw size={14} />
                                        Run this test
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => openEditModal(testCase)} disabled={readOnly}>
                                        <Pencil size={14} />
                                        Edit
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem
                                        className="text-destructive focus:text-destructive"
                                        onClick={() => handleDeleteCase(testCase.id)}
                                        disabled={readOnly}
                                      >
                                        <Trash2 size={14} />
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>
                              {isExpanded && (
                                <TableRow data-state="selected">
                                  <TableCell colSpan={6} className="bg-muted">
                                    <TestCaseDetail
                                      testCase={testCase}
                                      onRerun={() => handleRunSingle(testCase)}
                                      isRunning={runningId === testCase.id}
                                      readOnly={readOnly}
                                    />
                                  </TableCell>
                                </TableRow>
                              )}
                            </React.Fragment>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <span className="text-sm text-muted-foreground font-sans">
                      {stats.passed} / {stats.total} passed
                      {stats.failed > 0 && <span className="text-[var(--status-failed-text)]"> · {stats.failed} failed</span>}
                      {stats.notRun > 0 && <span> · {stats.notRun} not run</span>}
                    </span>
                  </div>
                </>
              )}
            </div>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      <AddTestCaseModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingCase(null) }}
        onSubmit={handleSubmitCase}
        libraryFiles={libraryFiles}
        initialValue={editingCase}
      />
    </>
  )
}

function TestCaseDetail({ testCase, onRerun, isRunning, readOnly }) {
  const result = testCase.lastResult
  const expectedSources = testCase.expectedSources || []
  const retrievedNames = (result?.retrievedChunks || []).map(c => c.fileName)
  const matchedSources = expectedSources.filter(name => retrievedNames.includes(name))
  const missingSources = expectedSources.filter(name => !retrievedNames.includes(name))

  return (
    <div className="py-4 px-2 flex flex-col gap-4">
      <div>
        <span className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide font-sans mb-1">Question</span>
        <span className="text-sm text-foreground font-sans">{testCase.question}</span>
      </div>

      {!result ? (
        <div className="rounded-md border border-dashed border-input px-4 py-6 text-center text-sm text-muted-foreground">
          This test case has not been run yet.
          {!readOnly && (
            <div className="mt-3">
              <Button variant="brand" onClick={onRerun} disabled={isRunning}>
                <Play size={12} />
                Run this test
              </Button>
            </div>
          )}
        </div>
      ) : (
        <>
          {expectedSources.length > 0 && (
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-md bg-[var(--status-failed-bg)] px-3 py-2">
                <span className="block text-xs font-semibold text-[var(--status-failed-text)] uppercase tracking-wide font-sans mb-1">Expected (missing from results)</span>
                {missingSources.length === 0 ? (
                  <span className="text-sm text-[var(--status-failed-text)] font-sans">All expected sources were retrieved.</span>
                ) : (
                  <ul className="m-0 pl-4 text-sm text-[var(--status-failed-text)] font-mono">
                    {missingSources.map(name => <li key={name}>- {name}</li>)}
                  </ul>
                )}
              </div>
              <div className="rounded-md bg-[var(--status-ready-bg)] px-3 py-2">
                <span className="block text-xs font-semibold text-[var(--status-ready-text)] uppercase tracking-wide font-sans mb-1">Retrieved (matched expected)</span>
                {matchedSources.length === 0 ? (
                  <span className="text-sm text-[var(--status-ready-text)] font-sans">No expected sources matched.</span>
                ) : (
                  <ul className="m-0 pl-4 text-sm text-[var(--status-ready-text)] font-mono">
                    {matchedSources.map(name => <li key={name}>+ {name}</li>)}
                  </ul>
                )}
              </div>
            </div>
          )}

          <div>
            <span className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide font-sans mb-2">Top retrieved chunks</span>
            {(result.retrievedChunks || []).length === 0 ? (
              <span className="text-sm text-muted-foreground">No chunks scored above the relevance threshold.</span>
            ) : (
              <div className="flex flex-col gap-2">
                {result.retrievedChunks.map((chunk, idx) => (
                  <div key={idx} className="rounded-md border border-border bg-background px-3 py-2 flex items-start gap-3">
                    <span className="inline-flex items-center justify-center min-w-[44px] h-5 rounded-2xl bg-secondary text-xs font-mono text-secondary-foreground">
                      {chunk.score.toFixed(2)}
                    </span>
                    <div className="flex flex-col gap-1 min-w-0">
                      <span className="text-xs font-semibold text-foreground font-sans truncate">{chunk.fileName}</span>
                      <span className="text-sm text-muted-foreground font-sans leading-snug">{chunk.snippet}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <span className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide font-sans mb-1">Grounded answer</span>
            <span className="text-sm text-foreground font-sans leading-relaxed">{result.groundedAnswer}</span>
          </div>

          {result.failureReasons?.length > 0 && (
            <div className="rounded-md border border-[var(--status-failed-text)]/20 bg-[var(--status-failed-bg)] px-3 py-2">
              <span className="block text-xs font-semibold text-[var(--status-failed-text)] uppercase tracking-wide font-sans mb-1">Why this failed</span>
              <ul className="m-0 pl-4 text-sm text-[var(--status-failed-text)] font-sans">
                {result.failureReasons.map((reason, idx) => <li key={idx}>{reason}</li>)}
              </ul>
            </div>
          )}

          {!readOnly && (
            <div>
              <Button variant="link" onClick={onRerun} disabled={isRunning}>
                <ArrowRight size={12} />
                Re-run this test
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
