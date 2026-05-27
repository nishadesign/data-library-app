import React, { useEffect, useMemo, useState } from 'react'
import { Button } from '../ui/button'
import { Checkbox } from '../ui/checkbox'
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

export default function DeployModal({ open, onClose, onDeploy, libraryName, attachedAgentIds = [] }) {
  const [selectedIds, setSelectedIds] = useState(() => new Set(attachedAgentIds))
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      setSelectedIds(new Set(attachedAgentIds))
      setSubmitting(false)
    }
  }, [open, attachedAgentIds])

  const newlySelectedAgents = useMemo(() => (
    AGENTS.filter(agent => selectedIds.has(agent.id) && !attachedAgentIds.includes(agent.id))
  ), [selectedIds, attachedAgentIds])

  if (!open) return null

  function toggleAgent(id) {
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  async function handleConfirm() {
    if (newlySelectedAgents.length === 0 || submitting) return
    setSubmitting(true)
    try {
      await onDeploy(newlySelectedAgents.map(a => ({ agentId: a.id, agentName: a.name })))
    } finally {
      setSubmitting(false)
    }
  }

  const buttonLabel = submitting
    ? 'Deploying…'
    : newlySelectedAgents.length > 1
      ? `Deploy to ${newlySelectedAgents.length} agents →`
      : 'Deploy →'

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
              Attach to agents
            </h3>
            <p className="m-0 mt-1 text-sm text-muted-foreground">
              Select one or more agents to make {libraryName ? <strong className="text-foreground">{libraryName}</strong> : 'this library'} available as a retriever tool.
            </p>
          </div>
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-2">
          {AGENTS.map(agent => {
            const selected = selectedIds.has(agent.id)
            const alreadyAttached = attachedAgentIds.includes(agent.id)
            return (
              <label
                key={agent.id}
                className={`flex items-start gap-3 rounded-lg border px-4 py-3 text-left transition-colors cursor-pointer ${
                  selected
                    ? 'border-primary bg-primary/5'
                    : 'border-input bg-background hover:bg-secondary'
                }`}
              >
                <Checkbox
                  checked={selected}
                  onCheckedChange={() => toggleAgent(agent.id)}
                  disabled={alreadyAttached}
                  aria-label={`Select ${agent.name}`}
                  className="mt-0.5"
                />
                <AgentAstroIcon size={20} className="text-primary shrink-0 mt-0.5" />
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-sm font-semibold text-foreground font-sans">{agent.name}</span>
                  <span className="text-sm text-muted-foreground font-sans leading-snug">{agent.description}</span>
                </div>
                {alreadyAttached && (
                  <span className="text-xs font-sans text-muted-foreground shrink-0 self-center">Already attached</span>
                )}
              </label>
            )
          })}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-border px-6 py-4">
          <Button variant="ghost" onClick={onClose} disabled={submitting}>Cancel</Button>
          <Button variant="brand" onClick={handleConfirm} disabled={newlySelectedAgents.length === 0 || submitting}>
            {buttonLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
