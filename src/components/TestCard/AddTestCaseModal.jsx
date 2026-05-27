import React, { useEffect, useRef, useState } from 'react'
import { Check, Pencil, FileSpreadsheet, Sparkles, Upload, ArrowLeft, Loader2 } from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Label } from '../ui/label'
import { AgentAstroIcon } from '../../assets/icons'

function generateId(prefix = 'test') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function parseTags(input) {
  return input
    .split(',')
    .map(tag => tag.trim())
    .filter(Boolean)
}

function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter(Boolean)
  if (lines.length === 0) return []

  function splitRow(row) {
    const cells = []
    let current = ''
    let inQuotes = false
    for (let i = 0; i < row.length; i++) {
      const char = row[i]
      if (char === '"') {
        if (inQuotes && row[i + 1] === '"') {
          current += '"'
          i++
        } else {
          inQuotes = !inQuotes
        }
      } else if (char === ',' && !inQuotes) {
        cells.push(current)
        current = ''
      } else {
        current += char
      }
    }
    cells.push(current)
    return cells.map(cell => cell.trim())
  }

  const header = splitRow(lines[0]).map(cell => cell.toLowerCase())
  const findIndex = (...names) => header.findIndex(h => names.includes(h))
  const qIdx = findIndex('question', 'query', 'utterance')
  const sIdx = findIndex('expected sources', 'sources', 'expected source')
  const aIdx = findIndex('expected answer', 'answer', 'reference answer')
  const tIdx = findIndex('tags', 'tag', 'category')

  const startIdx = qIdx === -1 ? 0 : 1
  if (qIdx === -1) {
    return lines.map(line => {
      const cells = splitRow(line)
      return {
        question: cells[0] || '',
        expectedSources: cells[1] ? cells[1].split('|').map(s => s.trim()).filter(Boolean) : [],
        expectedAnswer: cells[2] || '',
        tags: cells[3] ? cells[3].split('|').map(s => s.trim()).filter(Boolean) : [],
      }
    }).filter(row => row.question)
  }

  return lines.slice(startIdx).map(line => {
    const cells = splitRow(line)
    return {
      question: qIdx >= 0 ? (cells[qIdx] || '') : '',
      expectedSources: sIdx >= 0 && cells[sIdx]
        ? cells[sIdx].split('|').map(s => s.trim()).filter(Boolean)
        : [],
      expectedAnswer: aIdx >= 0 ? (cells[aIdx] || '') : '',
      tags: tIdx >= 0 && cells[tIdx]
        ? cells[tIdx].split('|').map(s => s.trim()).filter(Boolean)
        : [],
    }
  }).filter(row => row.question)
}

const AGENT_GENERATED_TEMPLATES = [
  {
    question: 'What policies cover refunds and returns?',
    expectedAnswer: 'returns within 30 days',
    tags: ['policy', 'agent-generated'],
  },
  {
    question: 'Summarize the main risks called out across these documents.',
    expectedAnswer: 'risk',
    tags: ['summary', 'agent-generated'],
  },
  {
    question: 'Which document defines the SLA for support response times?',
    expectedAnswer: 'SLA',
    tags: ['policy', 'agent-generated'],
  },
  {
    question: 'List the steps a customer follows to escalate an unresolved issue.',
    expectedAnswer: 'escalation',
    tags: ['workflow', 'agent-generated'],
  },
  {
    question: 'What edge cases are explicitly out of scope?',
    expectedAnswer: 'out of scope',
    tags: ['edge-case', 'agent-generated'],
  },
]

export default function AddTestCaseModal({
  open,
  onClose,
  onSubmit,
  libraryFiles = [],
  initialValue = null,
}) {
  const isEditing = !!initialValue
  const [mode, setMode] = useState(null)
  const [question, setQuestion] = useState('')
  const [expectedSources, setExpectedSources] = useState([])
  const [expectedAnswer, setExpectedAnswer] = useState('')
  const [tagInput, setTagInput] = useState('')
  const [csvText, setCsvText] = useState('')
  const [csvError, setCsvError] = useState('')
  const [csvPreview, setCsvPreview] = useState([])
  const [agentRunning, setAgentRunning] = useState(false)
  const [agentSuggestions, setAgentSuggestions] = useState([])
  const [agentSelected, setAgentSelected] = useState(new Set())
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (!open) return
    setCsvText('')
    setCsvError('')
    setCsvPreview([])
    setAgentRunning(false)
    setAgentSuggestions([])
    setAgentSelected(new Set())

    if (isEditing && initialValue) {
      setMode('manual')
      setQuestion(initialValue.question || '')
      setExpectedSources(initialValue.expectedSources || [])
      setExpectedAnswer(initialValue.expectedAnswer || '')
      setTagInput((initialValue.tags || []).join(', '))
    } else {
      setMode(null)
      setQuestion('')
      setExpectedSources([])
      setExpectedAnswer('')
      setTagInput('')
    }
  }, [open, isEditing, initialValue])

  if (!open) return null

  function toggleSource(name) {
    setExpectedSources(prev => (
      prev.includes(name) ? prev.filter(s => s !== name) : [...prev, name]
    ))
  }

  function handleManualSubmit() {
    if (!question.trim()) return
    onSubmit([{
      id: initialValue?.id || generateId(),
      question: question.trim(),
      expectedSources,
      expectedAnswer: expectedAnswer.trim(),
      tags: parseTags(tagInput),
      lastResult: initialValue?.lastResult,
    }])
  }

  function handleCsvTextChange(value) {
    setCsvText(value)
    if (!value.trim()) {
      setCsvPreview([])
      setCsvError('')
      return
    }
    try {
      const rows = parseCsv(value)
      if (rows.length === 0) {
        setCsvPreview([])
        setCsvError('No valid rows detected. Make sure each row has at least a question.')
      } else {
        setCsvPreview(rows)
        setCsvError('')
      }
    } catch (err) {
      setCsvPreview([])
      setCsvError('Could not parse this content as CSV.')
    }
  }

  function handleFilePick(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    const reader = new FileReader()
    reader.onload = (e) => handleCsvTextChange(String(e.target?.result || ''))
    reader.onerror = () => setCsvError('Could not read this file.')
    reader.readAsText(file)
  }

  function handleCsvImport() {
    if (csvPreview.length === 0) return
    const cases = csvPreview.map(row => ({
      id: generateId(),
      question: row.question,
      expectedSources: row.expectedSources,
      expectedAnswer: row.expectedAnswer,
      tags: row.tags,
    }))
    onSubmit(cases)
  }

  async function runAgent() {
    setAgentRunning(true)
    setAgentSuggestions([])
    await new Promise(r => setTimeout(r, 1400))
    const fileNames = libraryFiles.map(f => f.name)
    const suggestions = AGENT_GENERATED_TEMPLATES.map((tpl, idx) => {
      const expectedSources = fileNames.length > 0
        ? [fileNames[idx % fileNames.length]]
        : []
      return {
        id: generateId('suggestion'),
        question: tpl.question,
        expectedSources,
        expectedAnswer: tpl.expectedAnswer,
        tags: tpl.tags,
      }
    })
    setAgentSuggestions(suggestions)
    setAgentSelected(new Set(suggestions.map(s => s.id)))
    setAgentRunning(false)
  }

  function toggleAgentSuggestion(id) {
    setAgentSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function handleAgentImport() {
    const cases = agentSuggestions
      .filter(s => agentSelected.has(s.id))
      .map(({ id: _id, ...rest }) => ({ ...rest, id: generateId() }))
    if (cases.length === 0) return
    onSubmit(cases)
  }

  const headerTitle = isEditing
    ? 'Edit test case'
    : mode === null
      ? 'Add test cases'
      : mode === 'manual'
        ? 'Manual test case'
        : mode === 'csv'
          ? 'Import from CSV'
          : 'Generate with Testing Center agent'

  const headerSubtitle = isEditing
    ? 'Update the question, expected sources, or reference answer.'
    : mode === null
      ? 'Choose how you want to add cases to your test set.'
      : mode === 'manual'
        ? 'Define a question, expected sources, and reference answer.'
        : mode === 'csv'
          ? 'Paste CSV content or upload a .csv file with columns: question, expected sources, expected answer, tags.'
          : 'Let the Testing Center agent draft questions based on your library files. Review and pick which to add.'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-xl border border-border bg-background shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-test-case-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
          <div className="flex items-start gap-3 min-w-0">
            {!isEditing && mode !== null && (
              <button
                type="button"
                onClick={() => setMode(null)}
                aria-label="Back to options"
                className="mt-0.5 inline-flex items-center justify-center rounded-full p-1 text-muted-foreground hover:bg-secondary cursor-pointer"
              >
                <ArrowLeft size={16} />
              </button>
            )}
            <div className="min-w-0">
              <h3 id="add-test-case-title" className="m-0 text-lg font-semibold text-foreground font-sans">
                {headerTitle}
              </h3>
              <p className="m-0 mt-1 text-sm text-muted-foreground">
                {headerSubtitle}
              </p>
            </div>
          </div>
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </div>

        <div className="max-h-[70vh] overflow-auto px-6 py-5">
          {mode === null && !isEditing && (
            <div className="flex flex-col gap-3">
              <ModeOption
                icon={<Pencil size={18} className="text-primary" />}
                title="Manually input a query"
                description="Write a single test case by hand — question, expected sources, and reference answer."
                onClick={() => setMode('manual')}
              />
              <ModeOption
                icon={<FileSpreadsheet size={18} className="text-primary" />}
                title="Import a .csv file"
                description="Paste CSV content or upload a file. Columns: question, expected sources, expected answer, tags."
                onClick={() => setMode('csv')}
              />
              <ModeOption
                icon={<AgentAstroIcon size={18} className="text-primary" />}
                title="Generate with Testing Center agent"
                description="The agent drafts test cases for you based on the files in this library. You review and pick what to add."
                onClick={() => setMode('agent')}
                accent
              />
            </div>
          )}

          {mode === 'manual' && (
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="testQuestion">Question</Label>
                <Input
                  id="testQuestion"
                  value={question}
                  onChange={e => setQuestion(e.target.value)}
                  placeholder="e.g., What is our refund policy SLA?"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label>Expected source files</Label>
                {libraryFiles.length === 0 ? (
                  <span className="text-sm text-muted-foreground">No files in this library yet.</span>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {libraryFiles.map(file => {
                      const selected = expectedSources.includes(file.name)
                      return (
                        <button
                          key={file.id}
                          type="button"
                          onClick={() => toggleSource(file.name)}
                          className={`inline-flex items-center gap-1 rounded-2xl px-3 py-0.5 text-sm font-medium font-sans transition-colors border cursor-pointer ${
                            selected
                              ? 'bg-[var(--status-ready-bg)] text-[var(--status-ready-text)] border-transparent'
                              : 'bg-background text-foreground border-input hover:bg-secondary'
                          }`}
                          aria-pressed={selected}
                        >
                          {selected ? <Check size={12} /> : <span className="w-3 inline-block" />}
                          <span className="truncate max-w-[200px]">{file.name}</span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="testExpectedAnswer">Expected answer (optional)</Label>
                <Textarea
                  id="testExpectedAnswer"
                  value={expectedAnswer}
                  onChange={e => setExpectedAnswer(e.target.value)}
                  placeholder="A reference phrase or keyword the grounded response should contain."
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="testTags">Tags (comma-separated)</Label>
                <Input
                  id="testTags"
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  placeholder="e.g., policy, edge-case"
                />
              </div>
            </div>
          )}

          {mode === 'csv' && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-muted-foreground font-sans">
                  Paste CSV below or upload a file.
                </span>
                <Button variant="neutral" onClick={() => fileInputRef.current?.click()}>
                  <Upload size={12} />
                  Upload .csv
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  onChange={handleFilePick}
                />
              </div>
              <Textarea
                value={csvText}
                onChange={e => handleCsvTextChange(e.target.value)}
                placeholder={'question,expected sources,expected answer,tags\n"What is our SLA?",refund_policy.pdf,"5 business days",policy'}
                className="min-h-[140px] font-mono text-xs"
              />
              {csvError && (
                <span className="text-sm text-[var(--status-failed-text)] font-sans">{csvError}</span>
              )}
              {csvPreview.length > 0 && (
                <div className="rounded-md border border-border bg-card px-3 py-2">
                  <span className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide font-sans mb-2">
                    Preview ({csvPreview.length} test case{csvPreview.length === 1 ? '' : 's'})
                  </span>
                  <ul className="m-0 pl-4 flex flex-col gap-1 text-sm text-foreground font-sans">
                    {csvPreview.slice(0, 6).map((row, idx) => (
                      <li key={idx} className="truncate">
                        {row.question}
                        {row.expectedSources.length > 0 && (
                          <span className="text-muted-foreground"> · sources: {row.expectedSources.join(', ')}</span>
                        )}
                      </li>
                    ))}
                    {csvPreview.length > 6 && (
                      <li className="text-muted-foreground">…and {csvPreview.length - 6} more.</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          )}

          {mode === 'agent' && (
            <div className="flex flex-col gap-4">
              {agentSuggestions.length === 0 && !agentRunning && (
                <div className="rounded-lg border border-dashed border-input px-6 py-8 flex flex-col items-center justify-center gap-3 text-center">
                  <AgentAstroIcon size={28} className="text-primary" />
                  <span className="text-sm font-semibold text-foreground font-sans">Testing Center agent</span>
                  <span className="text-sm text-muted-foreground font-sans max-w-md">
                    The agent will scan {libraryFiles.length || 'your'} file{libraryFiles.length === 1 ? '' : 's'} and draft a starter set of test cases — common questions, edge cases, and summary checks.
                  </span>
                  <Button variant="brand" onClick={runAgent} className="mt-2">
                    <Sparkles size={12} />
                    Generate test cases
                  </Button>
                </div>
              )}

              {agentRunning && (
                <div className="rounded-lg border border-border bg-card px-6 py-8 flex flex-col items-center justify-center gap-3 text-center">
                  <Loader2 size={20} className="text-primary animate-spin" />
                  <span className="text-sm text-foreground font-sans">Drafting test cases from your library files…</span>
                </div>
              )}

              {agentSuggestions.length > 0 && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground font-sans">
                      {agentSelected.size} of {agentSuggestions.length} selected
                    </span>
                    <Button variant="link" onClick={runAgent}>
                      <Sparkles size={12} />
                      Regenerate
                    </Button>
                  </div>
                  <ul className="flex flex-col gap-2 m-0 p-0 list-none">
                    {agentSuggestions.map(s => {
                      const checked = agentSelected.has(s.id)
                      return (
                        <li key={s.id}>
                          <button
                            type="button"
                            onClick={() => toggleAgentSuggestion(s.id)}
                            aria-pressed={checked}
                            className={`flex items-start gap-3 rounded-lg border px-4 py-3 text-left w-full transition-colors cursor-pointer ${
                              checked ? 'border-primary bg-primary/5' : 'border-input bg-background hover:bg-secondary'
                            }`}
                          >
                            <span
                              className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                                checked ? 'border-primary bg-primary text-primary-foreground' : 'border-input'
                              }`}
                              aria-hidden="true"
                            >
                              {checked && <Check size={11} />}
                            </span>
                            <div className="flex flex-col gap-0.5 min-w-0">
                              <span className="text-sm font-semibold text-foreground font-sans">{s.question}</span>
                              <span className="text-xs text-muted-foreground font-sans">
                                {s.expectedSources.length > 0 ? `Expected source: ${s.expectedSources.join(', ')}` : 'No expected source'} · tags: {s.tags.join(', ')}
                              </span>
                            </div>
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                </>
              )}
            </div>
          )}
        </div>

        {mode !== null && (
          <div className="flex items-center justify-end gap-3 border-t border-border px-6 py-4">
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            {mode === 'manual' && (
              <Button variant="brand" onClick={handleManualSubmit} disabled={!question.trim()}>
                {isEditing ? 'Save changes' : 'Add test case'}
              </Button>
            )}
            {mode === 'csv' && (
              <Button variant="brand" onClick={handleCsvImport} disabled={csvPreview.length === 0}>
                Import {csvPreview.length > 0 ? `${csvPreview.length} case${csvPreview.length === 1 ? '' : 's'}` : ''}
              </Button>
            )}
            {mode === 'agent' && (
              <Button
                variant="brand"
                onClick={handleAgentImport}
                disabled={agentSuggestions.length === 0 || agentSelected.size === 0}
              >
                Add {agentSelected.size > 0 ? agentSelected.size : ''} test case{agentSelected.size === 1 ? '' : 's'}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function ModeOption({ icon, title, description, onClick, accent = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-start gap-3 rounded-lg border px-4 py-3 text-left transition-colors cursor-pointer ${
        accent
          ? 'border-input bg-background hover:bg-primary/5 hover:border-primary'
          : 'border-input bg-background hover:bg-secondary'
      }`}
    >
      <span className="mt-0.5 shrink-0">{icon}</span>
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-sm font-semibold text-foreground font-sans">{title}</span>
        <span className="text-sm text-muted-foreground font-sans leading-snug">{description}</span>
      </div>
    </button>
  )
}
