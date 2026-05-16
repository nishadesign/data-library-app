import React, { useState, useEffect, useRef, useCallback } from 'react'
import { ChevronDown, Check, RotateCcw } from 'lucide-react'
import { ArrowUpRight, ErrorIcon } from '../../assets/icons'
import { Card } from '../ui/card'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '../ui/collapsible'
import { cn } from '@/lib/utils'

// =============================================================================
// STATUS CARD ANIMATION SHOWCASE
// =============================================================================

const FILE_COUNT = 3

const PIPELINE_TIMINGS = [
  { name: 'Uploading files', duration: 3000 },
  { name: 'Creating search index', duration: 3500, description: "Creating the framework that will organize and structure your data." },
  { name: 'Setting up retriever', duration: 3500, description: "Setting up the retriever that connects your agent to data sources." },
  { name: 'Building agent tool', duration: 3000, description: 'Creating tool so agent can use this data for context.' },
  { name: 'Indexing data', duration: 3500, description: "Chunking and organizing your data into an index, so the agent can quickly retrieve relevant information." },
]

function getReadyStepExtras(stepName) {
  const now = new Date()
  const refreshTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} hrs`
  
  switch (stepName) {
    case 'Uploading files':
      return { readyDescription: `${FILE_COUNT} out of ${FILE_COUNT} files uploaded` }
    case 'Creating search index':
      return { link: { label: 'Search Index', href: '#' } }
    case 'Setting up retriever':
      return { links: [{ label: 'Retriever', href: '#' }, { label: 'Test Retriever', href: '#' }] }
    case 'Building agent tool':
      return { link: { label: 'Agent tool', href: '#' } }
    case 'Indexing data':
      return { readyDescription: `Last refreshed: ${refreshTime}` }
    default:
      return {}
  }
}

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
  const isReady = status === 'ready'
  return (
    <div className="w-0.5 flex-1 relative overflow-hidden min-h-4 my-0">
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
  return 'Processing your data — this may take a few minutes. You can check back later.'
}

const INITIAL_STEPS = PIPELINE_TIMINGS.map(t => ({
  name: t.name,
  status: 'default',
  description: '',
}))

function StatusCardShowcase({ steps, open, setOpen }) {
  return (
    <div className="flex flex-col gap-4">
      <Collapsible open={open} onOpenChange={setOpen}>
        <Card className="overflow-hidden rounded-xl p-0 w-[800px] border-0 shadow-none">
          <CollapsibleTrigger className="flex items-center gap-2 py-4 px-6 cursor-pointer bg-transparent border-none w-full text-left font-sans hover:opacity-85">
            <span className={`flex items-center transition-transform duration-200 ${open ? 'rotate-0' : '-rotate-90'}`}>
              <ChevronDown size={12} />
            </span>
            <span className="text-[15px] font-bold text-foreground">Status</span>
          </CollapsibleTrigger>

          <CollapsibleContent className="overflow-hidden data-[state=open]:animate-[collapsible-down_280ms_cubic-bezier(0.16,1,0.3,1)] data-[state=closed]:animate-[collapsible-up_220ms_cubic-bezier(0.4,0,1,1)]">
            <div className="px-6 pb-6">
              <div className="flex flex-col pl-1">
                {steps.map((step, i) => (
                  <div className="flex gap-3 relative min-h-12" key={i}>
                    <div className="flex flex-col items-center w-5 shrink-0 relative">
                      <StepDot status={step.status} />
                      {i < steps.length - 1 && <StepConnector status={step.status} />}
                    </div>
                    <div className={`flex flex-col gap-0.5 min-w-0 flex-1 ${i === steps.length - 1 ? 'pb-0' : 'pb-8'}`}>
                      <span className="text-sm font-normal font-sans leading-5 truncate text-foreground">
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

                        {step.status === 'default' && (
                          <span className="text-sm font-sans leading-snug opacity-0 select-none">&nbsp;</span>
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
    </div>
  )
}

// =============================================================================
// MAIN SHOWCASE PAGE
// =============================================================================

export default function PortfolioShowcase() {
  const [steps, setSteps] = useState(INITIAL_STEPS)
  const [open, setOpen] = useState(true)
  const [isAnimating, setIsAnimating] = useState(false)
  const timeoutsRef = useRef([])

  const clearAllTimeouts = () => {
    timeoutsRef.current.forEach(id => clearTimeout(id))
    timeoutsRef.current = []
  }

  const addTimeout = (fn, delay) => {
    const id = setTimeout(fn, delay)
    timeoutsRef.current.push(id)
    return id
  }

  const runAnimation = useCallback(() => {
    if (isAnimating) return
    
    clearAllTimeouts()
    setIsAnimating(true)
    setSteps(INITIAL_STEPS)
    setOpen(true)

    let currentDelay = 500

    PIPELINE_TIMINGS.forEach((timing, stepIndex) => {
      addTimeout(() => {
        setSteps(prev => prev.map((s, i) => {
          if (i < stepIndex) {
            return { ...s, status: 'ready', description: '', ...getReadyStepExtras(s.name) }
          }
          if (i === stepIndex) {
            const desc = timing.name === 'Uploading files' 
              ? `0 out of ${FILE_COUNT} files uploaded`
              : timing.description || ''
            return { ...s, status: 'inProgress', description: desc }
          }
          return { ...s, status: 'default', description: '' }
        }))
      }, currentDelay)

      if (timing.name === 'Uploading files') {
        const perFileDelay = timing.duration / (FILE_COUNT + 1)
        for (let fileNum = 1; fileNum <= FILE_COUNT; fileNum++) {
          addTimeout(() => {
            setSteps(prev => prev.map((s, i) => {
              if (i === stepIndex) {
                return { ...s, description: `${fileNum} out of ${FILE_COUNT} files uploaded` }
              }
              return s
            }))
          }, currentDelay + (perFileDelay * fileNum))
        }
      }

      currentDelay += timing.duration

      addTimeout(() => {
        setSteps(prev => prev.map((s, i) => {
          if (i === stepIndex) {
            return { ...s, status: 'ready', description: '', ...getReadyStepExtras(s.name) }
          }
          return s
        }))
      }, currentDelay)

      currentDelay += 300
    })

    addTimeout(() => {
      setIsAnimating(false)
    }, currentDelay)
  }, [isAnimating])

  const resetAnimation = useCallback(() => {
    clearAllTimeouts()
    setIsAnimating(false)
    setSteps(INITIAL_STEPS)
    setOpen(true)
  }, [])

  useEffect(() => {
    return () => clearAllTimeouts()
  }, [])

  return (
    <div className="min-h-screen bg-white flex items-center justify-center relative">
      {/* Controls in top right */}
      <div className="absolute top-6 right-6 flex items-center gap-3">
        <button
          onClick={runAnimation}
          disabled={isAnimating}
          className={cn(
            "px-4 py-2 text-sm font-medium rounded-lg transition-all",
            isAnimating 
              ? "bg-muted text-muted-foreground cursor-not-allowed" 
              : "bg-primary text-primary-foreground hover:bg-primary/90"
          )}
        >
          {isAnimating ? 'Playing...' : 'Play Animation'}
        </button>
        <button
          onClick={resetAnimation}
          className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all"
        >
          <RotateCcw size={16} />
        </button>
      </div>

      <StatusCardShowcase steps={steps} open={open} setOpen={setOpen} />
    </div>
  )
}
