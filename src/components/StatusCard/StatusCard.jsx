import React, { useEffect, useRef, useState } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { ArrowUpRight, ErrorIcon } from '../../assets/icons'
import { Card } from '../ui/card'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '../ui/collapsible'

function StepDot({ status }) {
  const dotStyles = {
    default: 'border-2 border-input bg-background',
    inProgress: 'bg-success/30',
    ready: 'bg-success',
    error: 'bg-transparent',
  }
  const isInProgress = status === 'inProgress'
  const isReady = status === 'ready'
  const isError = status === 'error'

  return (
    <div className={`w-5 h-5 rounded-full shrink-0 flex items-center justify-center relative z-[1] transition-[background-color,border-color,box-shadow,transform,opacity] duration-250 ease-[cubic-bezier(0.22,1,0.36,1)] ${dotStyles[status] || dotStyles.default}`}>
      <span className={`absolute inset-0 rounded-full bg-success/30 animate-pulse-ring transition-opacity duration-250 ease-[cubic-bezier(0.22,1,0.36,1)] ${isInProgress ? 'opacity-100' : 'opacity-0'}`} />
      <span className={`absolute inset-0 flex items-center justify-center transition-[opacity,transform] duration-250 ease-[cubic-bezier(0.22,1,0.36,1)] ${isInProgress ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
        <span className="w-2.5 h-2.5 rounded-full bg-success" />
      </span>
      <Check className={`text-white transition-[opacity,transform] duration-250 ease-[cubic-bezier(0.22,1,0.36,1)] ${isReady ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`} size={12} strokeWidth={3} />
      <span className={`absolute inset-0 flex items-center justify-center transition-[opacity,transform] duration-250 ease-[cubic-bezier(0.22,1,0.36,1)] ${isError ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
        <ErrorIcon className="text-destructive" size={20} />
      </span>
    </div>
  )
}

function StepConnector({ status }) {
  const connectorSpacing = 'min-h-4 my-0'
  const isReady = status === 'ready'

  return (
    <div className={`w-0.5 flex-1 relative overflow-hidden ${connectorSpacing}`}>
      <div className="absolute inset-0 bg-[repeating-linear-gradient(to_bottom,var(--input)_0px,var(--input)_3px,transparent_3px,transparent_7px)]" />
      <div className={`absolute inset-0 origin-top bg-success rounded-sm will-change-transform transition-[opacity,transform] duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] delay-75 ${isReady ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0'}`} />
    </div>
  )
}

function getStatusDescription(steps) {
  const allDefault = steps.every(s => s.status === 'default')
  if (allDefault) return 'Add data and we will take care of the processing.'
  const allReady = steps.every(s => s.status === 'ready')
  if (allReady) return 'All done! Your data is indexed and ready for agents to use.'
  const hasError = steps.some(s => s.status === 'error')
  if (hasError) return 'Something went wrong during processing. You can retry the failed step.'
  return 'Processing your data — this may take a few minutes. You can check back later.'
}

export default function StatusCard({ steps, defaultOpen = false }) {
  const [open, setOpen] = useState(false)
  const hasCompletedOnceRef = useRef(false)

  useEffect(() => {
    if (!defaultOpen || hasCompletedOnceRef.current) return
    const frame = window.requestAnimationFrame(() => setOpen(true))
    return () => window.cancelAnimationFrame(frame)
  }, [defaultOpen])

  useEffect(() => {
    const allReady = steps.length > 0 && steps.every(s => s.status === 'ready')
    const hasError = steps.some(s => s.status === 'error')

    if (allReady) {
      hasCompletedOnceRef.current = true
    }

    if (hasError) {
      setOpen(true)
    }
  }, [steps])

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card className="mb-4 overflow-hidden rounded-xl p-0">
        <CollapsibleTrigger className="flex items-center gap-2 py-4 px-6 cursor-pointer bg-transparent border-none w-full text-left font-sans hover:opacity-85">
          <span className={`flex items-center transition-transform duration-200 ${open ? 'rotate-0' : '-rotate-90'}`}>
            <ChevronDown size={12} />
          </span>
          <span className="text-[15px] font-bold text-foreground">Status</span>
        </CollapsibleTrigger>

        <CollapsibleContent className="overflow-hidden data-[state=open]:animate-[collapsible-down_280ms_cubic-bezier(0.16,1,0.3,1)] data-[state=closed]:animate-[collapsible-up_220ms_cubic-bezier(0.4,0,1,1)]">
          <div className="px-6 pb-6">
            <p className="text-sm text-muted-foreground leading-[1.55] m-0 mb-6 font-sans">
              {getStatusDescription(steps)}
            </p>

            <div className="flex flex-col pl-1">
              {steps.map((step, i) => (
                <div className="flex gap-3 relative min-h-12" key={i}>
                  <div className="flex flex-col items-center w-5 shrink-0 relative">
                    <StepDot status={step.status} />
                    {i < steps.length - 1 && <StepConnector status={step.status} />}
                  </div>
                  <div className={`flex flex-col gap-0.5 min-w-0 flex-1 ${i === steps.length - 1 ? 'pb-0' : 'pb-4'}`}>
                    <span className={`text-sm font-normal font-sans leading-5 truncate transition-colors duration-250 ease-[cubic-bezier(0.22,1,0.36,1)] ${step.status === 'error' ? 'text-destructive' : 'text-foreground'}`}>
                      {step.name}
                    </span>
                    <div className="min-h-4 flex items-center min-w-0">
                      {step.status === 'inProgress' && step.description && (
                        <span className="text-sm font-sans leading-snug truncate text-transparent bg-clip-text bg-[length:200%_100%] bg-[linear-gradient(90deg,var(--muted-foreground)_35%,var(--input)_48%,var(--border)_50%,var(--input)_52%,var(--muted-foreground)_65%)] animate-shimmer">
                          {step.description}
                        </span>
                      )}

                      {step.status === 'ready' && step.readyDescription && (
                        <span className="text-sm text-muted-foreground font-sans leading-snug truncate">
                          {step.readyDescription}
                        </span>
                      )}

                      {step.status === 'ready' && step.links && (
                        <div className="flex items-center gap-3 min-w-0 overflow-hidden">
                          {step.links.map((link, li) => (
                            <a key={li} href={link.href || '#'} className="text-sm text-primary font-sans no-underline inline-flex items-center gap-1 font-normal hover:underline truncate">
                              {link.label}
                              <ArrowUpRight size={11} />
                            </a>
                          ))}
                        </div>
                      )}

                      {step.status === 'ready' && step.link && !step.links && (
                        <a href={step.link.href || '#'} className="text-sm text-primary font-sans no-underline inline-flex items-center gap-1 font-normal hover:underline truncate">
                          {step.link.label}
                          <ArrowUpRight size={11} />
                        </a>
                      )}

                      {step.status === 'error' && (
                        <div className="flex items-center gap-2 min-w-0">
                          {step.description && (
                            <span className="text-sm text-muted-foreground font-sans leading-snug truncate">{step.description}</span>
                          )}
                          {step.onRetry && (
                            <button className="text-sm text-primary font-sans font-semibold bg-transparent border-none cursor-pointer p-0 hover:underline shrink-0" onClick={step.onRetry}>
                              {step.retryLabel || 'Retry'}
                            </button>
                          )}
                        </div>
                      )}

                      {step.status === 'default' && (
                        <span className="text-sm font-sans leading-snug opacity-0 select-none" aria-hidden="true">&nbsp;</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}
