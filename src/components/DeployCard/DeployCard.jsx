import React, { useEffect, useState } from 'react'
import { ChevronDown, CheckCircle2 } from 'lucide-react'
import { Card } from '../ui/card'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '../ui/collapsible'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Tooltip, TooltipTrigger, TooltipContent } from '../ui/tooltip'
import { ArrowUpRight, AgentAstroIcon } from '../../assets/icons'
import DeployModal from './DeployModal'

function formatDeployedAt(iso) {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export default function DeployCard({
  defaultOpen = false,
  autoExpandSignal = 0,
  forceOpen = false,
  libraryName,
  deployment = null,
  ready = false,
  hasRunTests = false,
  readOnly = false,
  onDeploy,
  onUndeploy,
}) {
  const [open, setOpen] = useState(defaultOpen)
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmUndeployOpen, setConfirmUndeployOpen] = useState(false)

  useEffect(() => {
    if (autoExpandSignal > 0) setOpen(true)
  }, [autoExpandSignal])

  useEffect(() => {
    if (forceOpen) setOpen(true)
  }, [forceOpen])

  const isDeployed = !!deployment
  const canDeploy = !readOnly && ready && hasRunTests && !isDeployed

  let disabledReason = null
  if (readOnly) disabledReason = 'This is a read-only demo library.'
  else if (!ready) disabledReason = 'Finish processing your data before deploying.'
  else if (!hasRunTests) disabledReason = 'Run your test cases at least once before deploying.'

  async function handleDeploy(agent) {
    await onDeploy?.(agent)
    setModalOpen(false)
  }

  async function handleConfirmUndeploy() {
    await onUndeploy?.()
    setConfirmUndeployOpen(false)
  }

  return (
    <>
      <Collapsible open={open} onOpenChange={setOpen}>
        <Card className="mb-4 overflow-hidden rounded-xl p-0">
          <div className="flex items-center py-4 px-6">
            <CollapsibleTrigger className="flex items-center gap-2 flex-1 cursor-pointer bg-transparent border-none p-0 font-sans hover:opacity-85">
              <span className={`flex items-center transition-transform duration-200 ${open ? 'rotate-0' : '-rotate-90'}`}>
                <ChevronDown size={12} />
              </span>
              <span className="text-[15px] font-bold text-foreground">Deploy</span>
              {isDeployed && (
                <Badge variant="success" className="ml-2">
                  <CheckCircle2 size={12} />
                  Deployed
                </Badge>
              )}
            </CollapsibleTrigger>
          </div>

          <CollapsibleContent className="overflow-hidden data-[state=open]:animate-[collapsible-down_280ms_cubic-bezier(0.16,1,0.3,1)] data-[state=closed]:animate-[collapsible-up_220ms_cubic-bezier(0.4,0,1,1)]">
            <div className="px-6 pb-5">
              {isDeployed ? (
                <div className="flex flex-col gap-3">
                  <div className="flex items-start gap-3 rounded-lg border border-border bg-card px-4 py-3">
                    <AgentAstroIcon size={22} className="text-primary shrink-0 mt-0.5" />
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-sm font-semibold text-foreground font-sans">
                        Attached to {deployment.deployedTo?.agentName}
                      </span>
                      <span className="text-sm text-muted-foreground font-sans">
                        {formatDeployedAt(deployment.deployedAt)} · {deployment.deployedBy || 'Current User'}
                      </span>
                    </div>
                    <a href="#" className="text-sm text-primary font-sans no-underline inline-flex items-center gap-1 font-normal hover:underline shrink-0">
                      Open agent
                      <ArrowUpRight size={11} />
                    </a>
                  </div>
                  {!readOnly && (
                    <div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setConfirmUndeployOpen(true)}
                      >
                        Undeploy
                      </Button>
                    </div>
                  )}
                </div>
              ) : disabledReason ? (
                <p className="text-sm text-muted-foreground leading-[1.55] m-0 font-sans">
                  {disabledReason}
                </p>
              ) : (
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm text-foreground leading-[1.55] m-0 font-sans">
                    Attach this retriever to an agent so it can ground responses from {libraryName || 'this library'}.
                  </p>
                  {canDeploy ? (
                    <Button variant="brand" onClick={() => setModalOpen(true)}>
                      Deploy to agent
                      <ArrowUpRight size={11} />
                    </Button>
                  ) : (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="inline-flex">
                          <Button variant="brand" disabled>
                            Deploy to agent
                          </Button>
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>{disabledReason || 'Deploy unavailable'}</TooltipContent>
                    </Tooltip>
                  )}
                </div>
              )}
            </div>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      <DeployModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onDeploy={handleDeploy}
        libraryName={libraryName}
      />

      {confirmUndeployOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={() => setConfirmUndeployOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-xl border border-border bg-background shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="undeploy-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="border-b border-border px-6 py-5">
              <h3 id="undeploy-title" className="m-0 text-lg font-semibold text-foreground font-sans">
                Undeploy this library?
              </h3>
              <p className="m-0 mt-1 text-sm text-muted-foreground">
                {deployment?.deployedTo?.agentName} will no longer be able to retrieve from {libraryName || 'this library'} until you re-deploy.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4">
              <Button variant="ghost" onClick={() => setConfirmUndeployOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={handleConfirmUndeploy}>Undeploy</Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
