import React, { useState, useCallback, useEffect } from 'react'
import { Hash, ChevronRight, ChevronDown, Zap, FileText, X, Check, Loader2 } from 'lucide-react'
import { RetrieverPill } from '../ui/retriever-pill'
import { cn } from '@/lib/utils'

const EXISTING_ACTIONS = [
  { id: 1, label: 'Get Hotel Amenities' },
  { id: 2, label: 'Lookup Hotel Codes' },
  { id: 3, label: 'Lookup Hotel Booking' },
]

const INSTRUCTIONS = [
  'You are a hotel summary assistant for Marriott. If the provided information is not available, apologize and end the conversation.',
  'Ask the customer if they are interested in amenities at a currently booked hotel or another hotel that isn\'t booked yet.',
  'Be polite and patient with their requests.',
]

export default function AgentBuilderDemo() {
  const [processingFiles, setProcessingFiles] = useState([])
  const [isCollapsing, setIsCollapsing] = useState(false)
  const [retriever, setRetriever] = useState(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }, [])

  const addFilesToRetriever = useCallback((newFileNames) => {
    const newFiles = newFileNames.map((name, idx) => ({
      id: crypto.randomUUID(),
      name,
      status: 'processing',
    }))
    
    setProcessingFiles(newFiles)

    newFiles.forEach((file, idx) => {
      setTimeout(() => {
        setProcessingFiles(prev => 
          prev.map(f => f.id === file.id ? { ...f, status: 'done' } : f)
        )
      }, 1000 + idx * 800)
    })

    const totalTime = 1000 + (newFiles.length - 1) * 800 + 600
    setTimeout(() => {
      setIsCollapsing(true)
    }, totalTime)

    setTimeout(() => {
      setProcessingFiles([])
      setIsCollapsing(false)
      setRetriever(prev => {
        const existingFiles = prev?.files || []
        const allFiles = [...existingFiles, ...newFileNames]
        return {
          status: 'ready',
          files: allFiles,
        }
      })
    }, totalTime + 500)
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    const validFiles = files.filter(file => 
      file.name.endsWith('.pdf') || 
      file.name.endsWith('.html') || 
      file.name.endsWith('.txt')
    )

    if (validFiles.length > 0) {
      const fileNames = validFiles.map(f => f.name)
      addFilesToRetriever(fileNames)
    }
  }, [addFilesToRetriever])

  const handlePlaceholderClick = useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.pdf,.html,.txt'
    input.multiple = true
    input.onchange = (e) => {
      const files = Array.from(e.target.files || [])
      if (files.length > 0) {
        const fileNames = files.map(f => f.name)
        addFilesToRetriever(fileNames)
      }
    }
    input.click()
  }, [addFilesToRetriever])

  const handleRemoveFile = useCallback((fileName) => {
    setRetriever(prev => {
      if (!prev) return null
      const newFiles = prev.files.filter(f => f !== fileName)
      if (newFiles.length === 0) return null
      return { ...prev, files: newFiles }
    })
  }, [])

  const handleRemoveRetriever = useCallback(() => {
    setRetriever(null)
    setIsExpanded(false)
  }, [])

  return (
    <div className="flex-1 h-full overflow-auto bg-background">
      <div className="max-w-4xl mx-auto py-10 px-8">
        {/* Topic Header */}
        <div className="flex items-start gap-3 mb-8">
          <div className="flex items-center justify-center w-6 h-6 rounded bg-primary text-primary-foreground shrink-0 mt-1">
            <Hash className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-semibold text-foreground leading-8">
              Hotel Amenities Summary
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Provides summary information about hotel properties.
            </p>
          </div>
        </div>

        {/* Instructions Section */}
        <div className="mb-8">
          <h2 className="text-base font-semibold text-foreground mb-2">
            Instructions
          </h2>
          <div className="flex gap-2 mb-3">
            <div className="w-[3px] bg-muted-foreground/40 rounded-full shrink-0" />
            <p className="text-sm text-muted-foreground italic">
              Guidelines the agent follows to craft its reply and choose when to invoke actions.
            </p>
          </div>
          <ul className="space-y-2 ml-1">
            {INSTRUCTIONS.map((instruction, i) => (
              <li key={i} className="flex gap-2 text-sm text-foreground">
                <span className="text-muted-foreground">•</span>
                <span>{instruction}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Actions Section */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <h2 className="text-base font-semibold text-foreground mb-3">
            Actions
          </h2>
          
          <div className="space-y-2">
            {/* Existing Actions */}
            {EXISTING_ACTIONS.map(action => (
              <div key={action.id} className="flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                <RetrieverPill 
                  variant="default" 
                  label={action.label}
                  icon={Zap}
                />
              </div>
            ))}

            {/* Processing files (individual rows before collapse) */}
            {processingFiles.length > 0 && (
              <div 
                className="space-y-2"
                style={{
                  opacity: isCollapsing ? 0 : 1,
                  transform: isCollapsing ? 'scale(0.95) translateY(-8px)' : 'scale(1) translateY(0)',
                  maxHeight: isCollapsing ? '0px' : '500px',
                  transition: 'opacity 400ms cubic-bezier(0.2, 0, 0, 1), transform 400ms cubic-bezier(0.2, 0, 0, 1), max-height 400ms cubic-bezier(0.2, 0, 0, 1)',
                  overflow: 'hidden',
                }}
              >
                {processingFiles.map((file, idx) => (
                  <div 
                    key={file.id}
                    className="flex items-center gap-2"
                    style={{
                      opacity: 1,
                      transform: 'translateX(0)',
                      animation: `file-row-enter 300ms cubic-bezier(0.2, 0, 0, 1) ${idx * 100}ms both`,
                    }}
                  >
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    <div 
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full text-xs px-2 py-1 border",
                        file.status === 'done' 
                          ? "bg-[var(--status-ready-bg)] border-[var(--status-ready-text)]/30 text-[var(--status-ready-text)]"
                          : "bg-muted border-border text-muted-foreground"
                      )}
                      style={{
                        transition: 'background-color 300ms ease, border-color 300ms ease, color 300ms ease',
                      }}
                    >
                      <span className="relative w-3.5 h-3.5 flex items-center justify-center">
                        {file.status === 'processing' ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Check 
                            className="w-3.5 h-3.5"
                            style={{
                              animation: 'check-pop 300ms cubic-bezier(0.2, 0, 0, 1)',
                            }}
                          />
                        )}
                      </span>
                      <span>{file.name}</span>
                    </div>
                    {file.status === 'done' && (
                      <span 
                        className="text-xs text-[var(--status-ready-text)]"
                        style={{
                          opacity: 0,
                          animation: 'fade-in 200ms ease 100ms forwards',
                        }}
                      >
                        Indexed
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Retriever (single tool for all files - shown after collapse) */}
            {retriever && (
              <div 
                className="space-y-1"
                style={{
                  opacity: 1,
                  transform: 'translateX(0)',
                  animation: 'retriever-enter 400ms cubic-bezier(0.2, 0, 0, 1)',
                }}
              >
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="relative w-5 h-5 flex items-center justify-center text-muted-foreground hover:text-foreground rounded-sm before:absolute before:inset-[-8px] before:content-['']"
                    style={{ transition: 'color 150ms ease' }}
                  >
                    <ChevronRight 
                      className="w-4 h-4"
                      style={{
                        transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                        transition: 'transform 200ms cubic-bezier(0.2, 0, 0, 1)',
                      }}
                    />
                  </button>
                  <RetrieverPill 
                    variant="ready"
                    label="Topic Context Retriever"
                    showChevron={true}
                  />
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {retriever.files.length} file{retriever.files.length > 1 ? 's' : ''}
                  </span>
                  <button
                    onClick={handleRemoveRetriever}
                    className="relative w-5 h-5 flex items-center justify-center text-muted-foreground hover:text-destructive rounded hover:bg-destructive/10 before:absolute before:inset-[-6px] before:content-[''] active:scale-[0.96]"
                    style={{ transition: 'color 150ms ease, background-color 150ms ease, transform 100ms ease' }}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                
                {/* Expanded file list */}
                <div 
                  className="ml-6 pl-4 border-l-2 border-border overflow-hidden"
                  style={{
                    maxHeight: isExpanded ? '500px' : '0px',
                    opacity: isExpanded ? 1 : 0,
                    transition: 'max-height 300ms cubic-bezier(0.2, 0, 0, 1), opacity 200ms ease',
                    paddingTop: isExpanded ? '4px' : '0px',
                    paddingBottom: isExpanded ? '4px' : '0px',
                  }}
                >
                  <div className="space-y-1">
                    {retriever.files.map((fileName, idx) => (
                      <div 
                        key={idx} 
                        className="flex items-center gap-2 group"
                        style={{
                          opacity: isExpanded ? 1 : 0,
                          transform: isExpanded ? 'translateY(0)' : 'translateY(-4px)',
                          transition: 'opacity 200ms ease, transform 200ms cubic-bezier(0.2, 0, 0, 1)',
                          transitionDelay: isExpanded ? `${idx * 50}ms` : '0ms',
                        }}
                      >
                        <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{fileName}</span>
                        <button
                          onClick={() => handleRemoveFile(fileName)}
                          className="relative w-4 h-4 flex items-center justify-center text-muted-foreground hover:text-destructive rounded opacity-0 group-hover:opacity-100 before:absolute before:inset-[-8px] before:content-[''] active:scale-[0.96]"
                          style={{ transition: 'color 150ms ease, opacity 150ms ease, transform 100ms ease' }}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Drop Zone Placeholder */}
            <div 
              className={cn(
                "flex items-center gap-2 p-3 rounded-lg border-2 border-dashed transition-all duration-200 mt-3",
                isDragOver 
                  ? "border-primary bg-primary/5" 
                  : "border-border hover:border-muted-foreground/50"
              )}
            >
              <Zap className="w-4 h-4 text-muted-foreground" />
              <RetrieverPill 
                variant="placeholder" 
                label={isDragOver ? "Drop to add context" : retriever ? "Drop more files" : "Drop files for agent context"}
                showChevron={false}
                onClick={handlePlaceholderClick}
              />
              <span className="text-xs text-muted-foreground ml-2">
                (.pdf, .html, .txt)
              </span>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div className="mt-10 p-4 rounded-lg bg-muted/50 border border-border">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Demo: </span>
            Drop files above to see them indexed into a single retriever tool. All files in a topic share one retriever that the agent uses to search across all indexed content.
          </p>
        </div>
      </div>
    </div>
  )
}
