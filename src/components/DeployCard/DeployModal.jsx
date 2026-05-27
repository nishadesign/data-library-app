import React, { useEffect, useState } from 'react'
import { Button } from '../ui/button'
import { AgentAstroIcon } from '../../assets/icons'

const AGENTS = [
  {
    id: 'customer-support-agent',
    name: 'Customer Support Agent',
    description: 'Handles inbound support tickets and triages escalations.',
  },
  {
    id: 'sales-concierge',
    name: 'Sales Concierge',
    description: 'Pre-sales product questions and account routing.',
  },
  {
    id: 'internal-hr-bot',
    name: 'Internal HR Bot',
    description: 'Answers employee policy and benefits questions.',
  },
]

export default function DeployModal({ open, onClose, onDeploy, libraryName }) {
  const [selectedId, setSelectedId] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) {
      setSelectedId(null)
      setSubmitting(false)
    }
  }, [open])

  if (!open) return null

  async function handleConfirm() {
    if (!selectedId || submitting) return
    const agent = AGENTS.find(a => a.id === selectedId)
    if (!agent) return
    setSubmitting(true)
    try {
      await onDeploy({ agentId: agent.id, agentName: agent.name })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-xl border border-border bg-background shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="deploy-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
          <div>
            <h3 id="deploy-title" className="m-0 text-lg font-semibold text-foreground font-sans">
              Attach to an agent
            </h3>
            <p className="m-0 mt-1 text-sm text-muted-foreground">
              Choose an agent to make {libraryName ? <strong className="text-foreground">{libraryName}</strong> : 'this library'} available as a retriever tool.
            </p>
          </div>
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-2">
          {AGENTS.map(agent => {
            const selected = selectedId === agent.id
            return (
              <button
                key={agent.id}
                type="button"
                onClick={() => setSelectedId(agent.id)}
                className={`flex items-start gap-3 rounded-lg border px-4 py-3 text-left transition-colors cursor-pointer ${
                  selected
                    ? 'border-primary bg-primary/5'
                    : 'border-input bg-background hover:bg-secondary'
                }`}
                aria-pressed={selected}
              >
                <span
                  className={`mt-0.5 flex h-4 w-4 items-center justify-center rounded-full border ${
                    selected ? 'border-primary' : 'border-input'
                  }`}
                  aria-hidden="true"
                >
                  <span className={`h-2 w-2 rounded-full transition-opacity ${selected ? 'bg-primary opacity-100' : 'opacity-0'}`} />
                </span>
                <AgentAstroIcon size={20} className="text-primary shrink-0 mt-0.5" />
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-semibold text-foreground font-sans">{agent.name}</span>
                  <span className="text-sm text-muted-foreground font-sans leading-snug">{agent.description}</span>
                </div>
              </button>
            )
          })}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-border px-6 py-4">
          <Button variant="ghost" onClick={onClose} disabled={submitting}>Cancel</Button>
          <Button variant="brand" onClick={handleConfirm} disabled={!selectedId || submitting}>
            {submitting ? 'Deploying…' : 'Deploy →'}
          </Button>
        </div>
      </div>
    </div>
  )
}
