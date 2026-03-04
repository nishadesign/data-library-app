import React, { useState } from 'react'
import { ChevronDown, Check, Ban } from 'lucide-react'
import { ArrowUpRight } from '../../assets/icons'
import { Card } from '../ui/card'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '../ui/collapsible'

function StepDot({ status }) {
  const dotStyles = {
    default: 'border-2 border-input bg-background',
    inProgress: 'bg-success animate-pulse-ring',
    ready: 'bg-success',
    error: 'bg-destructive',
  }

  return (
    <div className={`w-5 h-5 rounded-full shrink-0 flex items-center justify-center relative z-[1] ${dotStyles[status] || dotStyles.default}`}>
      {status === 'inProgress' && <div className="w-2 h-2 rounded-full bg-white/55" />}
      {status === 'ready' && <span className="flex items-center justify-center"><Check size={12} className="text-white" strokeWidth={2.5} /></span>}
      {status === 'error' && <span className="flex items-center justify-center"><Ban size={12} className="text-white" strokeWidth={2} /></span>}
    </div>
  )
}

function StepConnector({ status }) {
  const connectorStyles = {
    default: 'bg-[repeating-linear-gradient(to_bottom,var(--input)_0px,var(--input)_3px,transparent_3px,transparent_7px)]',
    inProgress: 'bg-[repeating-linear-gradient(to_bottom,var(--input)_0px,var(--input)_3px,transparent_3px,transparent_7px)]',
    ready: 'bg-success rounded-sm',
    error: 'bg-[repeating-linear-gradient(to_bottom,var(--input)_0px,var(--input)_3px,transparent_3px,transparent_7px)]',
  }

  return <div className={`w-0.5 flex-1 min-h-5 my-1 ${connectorStyles[status] || connectorStyles.default}`} />
}

export default function StatusCard({ steps, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card className="mb-4 overflow-hidden p-0">
        <CollapsibleTrigger className="flex items-center gap-2 py-4 px-6 cursor-pointer bg-transparent border-none w-full text-left font-sans hover:opacity-85">
          <span className={`flex items-center transition-transform duration-200 ${open ? 'rotate-0' : '-rotate-90'}`}>
            <ChevronDown size={12} />
          </span>
          <span className="text-[15px] font-bold text-foreground">Status</span>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-6 pb-6">
            <p className="text-sm text-foreground leading-[1.55] m-0 mb-6 font-sans">
              Data processing may take several minutes. You can check back later! If you add or
              update data in your this library, your search index will automatically refresh.
            </p>

            <div className="flex flex-col pl-1">
              {steps.map((step, i) => (
                <div className="flex gap-4 relative min-h-12" key={i}>
                  <div className="flex flex-col items-center w-5 shrink-0 relative">
                    <StepDot status={step.status} />
                    {i < steps.length - 1 && <StepConnector status={step.status} />}
                  </div>
                  <div className="pb-4 flex flex-col gap-0.5 min-w-0">
                    <span className={`text-sm font-normal font-sans leading-5 ${step.status === 'error' ? 'text-destructive' : 'text-foreground'}`}>
                      {step.name}
                    </span>

                    {step.status === 'inProgress' && step.description && (
                      <span className="text-sm font-sans leading-snug text-transparent bg-clip-text bg-[length:200%_100%] bg-[linear-gradient(90deg,var(--muted-foreground)_35%,var(--input)_48%,var(--border)_50%,var(--input)_52%,var(--muted-foreground)_65%)] animate-shimmer">{step.description}</span>
                    )}

                    {step.status === 'ready' && step.readyDescription && (
                      <span className="text-sm text-muted-foreground font-sans leading-snug">
                        {step.readyDescription}
                      </span>
                    )}

                    {step.status === 'ready' && step.links && (
                      <div className="flex items-center gap-3">
                        {step.links.map((link, li) => (
                          <a key={li} href={link.href || '#'} className="text-sm text-primary font-sans no-underline inline-flex items-center gap-1 font-normal hover:underline">
                            {link.label}
                            <ArrowUpRight size={11} />
                          </a>
                        ))}
                      </div>
                    )}

                    {step.status === 'ready' && step.link && !step.links && (
                      <a href={step.link.href || '#'} className="text-sm text-primary font-sans no-underline inline-flex items-center gap-1 font-normal hover:underline">
                        {step.link.label}
                        <ArrowUpRight size={11} />
                      </a>
                    )}

                    {step.status === 'error' && (
                      <div className="flex items-center gap-2">
                        {step.description && (
                          <span className="text-sm text-muted-foreground font-sans leading-snug">{step.description}</span>
                        )}
                        {step.onRetry && (
                          <button className="text-sm text-primary font-sans font-semibold bg-transparent border-none cursor-pointer p-0 hover:underline" onClick={step.onRetry}>
                            Retry
                          </button>
                        )}
                      </div>
                    )}
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
