import { useState, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import { Card } from '../ui/card'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '../ui/collapsible'
import { RetrieverIcon, ArrowUpRight } from '../../assets/icons'

export default function AgentToolCard({ libraryName, defaultOpen = false, autoExpandSignal = 0, forceOpen = false, agentToolReady = false }) {
  const [open, setOpen] = useState(defaultOpen)

  useEffect(() => {
    if (autoExpandSignal > 0) {
      setOpen(true)
    }
  }, [autoExpandSignal])

  useEffect(() => {
    if (forceOpen) {
      setOpen(true)
    }
  }, [forceOpen])

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card className="mb-6 overflow-hidden rounded-xl p-0">
        <CollapsibleTrigger className="flex items-center gap-2 py-4 px-6 cursor-pointer bg-transparent border-none w-full text-left font-sans hover:opacity-85">
          <span className={`flex items-center transition-transform duration-200 ${open ? 'rotate-0' : '-rotate-90'}`}>
            <ChevronDown size={12} />
          </span>
          <span className="text-[15px] font-bold text-foreground">Agent Tool</span>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-6 pb-5">
            {agentToolReady ? (
              <>
                <p className="text-sm text-foreground leading-[1.55] m-0 mb-3 font-sans">
                  To use this data, simply @agent-tool in the Topic
                </p>
                <a href="#" className="inline-flex items-center gap-2 text-sm text-primary font-sans font-normal no-underline hover:underline">
                  <RetrieverIcon size={18} />
                  Get information from {libraryName}
                  <ArrowUpRight size={11} />
                </a>
              </>
            ) : (
              <p className="text-sm text-muted-foreground leading-[1.55] m-0 font-sans">
                Agent tool will be created after you add data to this library.
              </p>
            )}
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}
