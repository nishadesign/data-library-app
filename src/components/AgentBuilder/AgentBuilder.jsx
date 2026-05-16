import React, { useState, useRef, useEffect } from 'react'
import { 
  ChevronRight, X, Upload, Loader2, Pencil, Trash2, Moon, Sun
} from 'lucide-react'
import { cn } from '@/lib/utils'

function DotMatrixLoader({ className, animate = true, darkMode = false }) {
  // 6-phase snake path (45 steps)
  const phase1 = [0, 1, 2, 5, 4, 3, 6, 7, 8];
  const phase2 = [5, 2, 1, 4, 7, 6, 3, 0];
  const phase3 = [1, 4, 7, 8, 5, 2];
  const phase4 = [1, 0, 3, 4, 5, 8, 7, 6];
  const phase5 = [3, 0, 1, 4, 7, 8, 5, 2];
  const phase6 = [1, 4, 7, 6, 3, 0];
  const fullPath = [...phase1, ...phase2, ...phase3, ...phase4, ...phase5, ...phase6];
  const totalSteps = fullPath.length;

  const getOpacity = (dotIndex, step) => {
    const tailLength = 4;
    const headBright = 1;
    const tailFade = 0.5;
    const dim = 0.15;

    for (let t = 0; t < tailLength; t++) {
      const checkStep = ((step - t) + totalSteps) % totalSteps;
      if (fullPath[checkStep] === dotIndex) {
        if (t === 0) return headBright;
        const fadeAmount = (t / tailLength) * (headBright - tailFade);
        return Math.max(headBright - fadeAmount, tailFade);
      }
    }
    return dim;
  };

  // Generate keyframes for each dot
  const keyframes = Array.from({ length: 9 }, (_, dotIndex) => {
    const frames = [];
    for (let step = 0; step < totalSteps; step++) {
      const pct = ((step / totalSteps) * 100).toFixed(2);
      const opacity = getOpacity(dotIndex, step).toFixed(2);
      frames.push(`${pct}% { opacity: ${opacity}; }`);
    }
    frames.push(`100% { opacity: ${getOpacity(dotIndex, 0).toFixed(2)}; }`);
    return frames.join(' ');
  });

  const staticOpacity = 0.4;

  return (
    <div className={cn("grid grid-cols-3 gap-[1.5px]", className)}>
      {[...Array(9)].map((_, i) => (
        <div
          key={i}
          className="w-[3.5px] h-[3.5px] rounded-full"
          style={{
            backgroundColor: darkMode ? '#a0a0a0' : '#545454',
            opacity: animate ? 0.15 : staticOpacity,
            animation: animate ? `dotSnake${i} 6s ease-in-out infinite` : 'none'
          }}
        />
      ))}
      {animate && (
        <style>{`
          ${keyframes.map((kf, i) => `@keyframes dotSnake${i} { ${kf} }`).join('\n')}
        `}</style>
      )}
    </div>
  );
}

function FileIcon({ className }) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M7.5 1H3C2.44772 1 2 1.44772 2 2V10C2 10.5523 2.44772 11 3 11H9C9.55228 11 10 10.5523 10 10V3.5L7.5 1Z" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M7 1V4H10" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function DownArrowIcon({ className }) {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path fillRule="evenodd" clipRule="evenodd" d="M2.27822 3.15384H7.72438C7.87822 3.15384 7.98592 3.35384 7.86284 3.4923L5.2013 6.75384C5.10899 6.87692 4.90899 6.87692 4.81669 6.75384L2.12438 3.4923C2.01669 3.35384 2.10899 3.15384 2.27822 3.15384Z" fill="currentColor"/>
    </svg>
  )
}

function RetrieverIcon({ className, disabled, darkMode = false }) {
  const bgColor = disabled 
    ? (darkMode ? "#4a4a4a" : "#c9c9c9") 
    : (darkMode ? "#a0a0a0" : "#5c5c5c")
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect width="14" height="14" rx="4" fill={bgColor}/>
      <path d="M7.252 2.80005C7.32626 2.80005 7.39748 2.82955 7.44999 2.88206C7.5025 2.93457 7.532 3.00579 7.532 3.08005V5.04005C7.52374 5.13838 7.53679 5.23733 7.57025 5.33015C7.60372 5.42298 7.65681 5.50749 7.72592 5.57792C7.79502 5.64836 7.87851 5.70305 7.97068 5.73828C8.06285 5.77351 8.16153 5.78844 8.26 5.78205H10.22C10.2943 5.78205 10.3655 5.81155 10.418 5.86406C10.4705 5.91657 10.5 5.98779 10.5 6.06205V10.36C10.4964 10.5817 10.4067 10.7933 10.25 10.95C10.0932 11.1068 9.88166 11.1964 9.66 11.2H4.34C4.11834 11.1964 3.90677 11.1068 3.75002 10.95C3.59326 10.7933 3.5036 10.5817 3.5 10.36V3.64005C3.5036 3.41839 3.59326 3.20682 3.75002 3.05007C3.90677 2.89331 4.11834 2.80365 4.34 2.80005H7.252ZM8.568 7.00005H5.446C5.42376 7.00122 5.40223 7.00827 5.3836 7.02048C5.36497 7.03268 5.34991 7.04961 5.33995 7.06953C5.32999 7.08944 5.32549 7.11165 5.3269 7.13387C5.32832 7.1561 5.3356 7.17755 5.348 7.19605L6.706 8.79205C6.74936 8.84299 6.77405 8.90719 6.776 8.97405V9.98205C6.776 10.0118 6.7878 10.0402 6.8088 10.0612C6.82981 10.0822 6.8583 10.094 6.888 10.094H7.098C7.11214 10.0942 7.12614 10.0913 7.13904 10.0855C7.15195 10.0797 7.16345 10.0712 7.17276 10.0606C7.18207 10.0499 7.18897 10.0374 7.19298 10.0239C7.19699 10.0103 7.19802 9.99604 7.196 9.98205V8.97405C7.19681 8.93958 7.20468 8.90564 7.21912 8.87434C7.23357 8.84303 7.25429 8.81503 7.28 8.79205L8.652 7.19605C8.66409 7.17852 8.67155 7.15821 8.67366 7.13702C8.67578 7.11582 8.67249 7.09444 8.6641 7.07486C8.65571 7.05529 8.64249 7.03816 8.62569 7.02508C8.60888 7.01199 8.58904 7.00338 8.568 7.00005ZM8.442 2.80005C8.49834 2.7999 8.55291 2.81974 8.596 2.85605L10.444 4.70405C10.4836 4.75076 10.5036 4.81093 10.5 4.87205C10.5001 4.9254 10.4799 4.9768 10.4435 5.0158C10.4071 5.05481 10.3572 5.07849 10.304 5.08205H8.82C8.66392 5.07498 8.51635 5.00887 8.40718 4.8971C8.29801 4.78533 8.23539 4.63625 8.232 4.48005V2.99605C8.23556 2.94282 8.25924 2.89293 8.29825 2.85653C8.33725 2.82012 8.38865 2.79993 8.442 2.80005Z" fill="white"/>
    </svg>
  )
}

export default function AgentBuilder({ stage = 1 }) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [filesExpanded, setFilesExpanded] = useState(true)
  const [pillMenuOpen, setPillMenuOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('agentBuilderDarkMode') === 'true'
    }
    return false
  })
  const fileInputRef = useRef(null)
  const pillMenuRef = useRef(null)

  // Persist dark mode preference
  useEffect(() => {
    localStorage.setItem('agentBuilderDarkMode', darkMode)
  }, [darkMode])

  // Close pill menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (pillMenuRef.current && !pillMenuRef.current.contains(e.target)) {
        setPillMenuOpen(false)
      }
    }
    if (pillMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [pillMenuOpen])

  const addFilesWithUpload = (files) => {
    const newFiles = Array.from(files).map((f, i) => ({ 
      name: f.name, 
      size: f.size, 
      uploading: true,
      id: Date.now() + i
    }))
    setUploadedFiles(prev => [...prev, ...newFiles])
    
    // Simulate upload completion with random delays
    newFiles.forEach((file) => {
      const randomDelay = 800 + Math.random() * 2000
      setTimeout(() => {
        setUploadedFiles(prev => 
          prev.map(f => f.id === file.id ? { ...f, uploading: false } : f)
        )
      }, randomDelay)
    })
  }

  const handleFileSelect = (e) => {
    const files = e.target.files
    if (files?.length) {
      addFilesWithUpload(files)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    const files = e.dataTransfer.files
    if (files?.length) {
      addFilesWithUpload(files)
    }
  }

  const removeFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const isAnyFileUploading = uploadedFiles.some(f => f.uploading)
  const [isPillProcessing, setIsPillProcessing] = useState(false)
  const [isPillReady, setIsPillReady] = useState(false)
  const prevUploadingRef = useRef(false)

  useEffect(() => {
    const wasUploading = prevUploadingRef.current
    
    if (wasUploading && !isAnyFileUploading && uploadedFiles.length > 0) {
      setIsPillProcessing(true)
      
      const processingTimer = setTimeout(() => {
        setIsPillProcessing(false)
        setIsPillReady(true)
        setFilesExpanded(false)
      }, 6000)
      
      prevUploadingRef.current = isAnyFileUploading
      return () => clearTimeout(processingTimer)
    }
    
    prevUploadingRef.current = isAnyFileUploading
  }, [isAnyFileUploading, uploadedFiles.length])
  
  const isPillInProgress = isAnyFileUploading || isPillProcessing

  return (
    <div className={cn(
      "flex flex-col items-center min-h-screen w-full transition-colors duration-200",
      darkMode ? "bg-[#1a1a1a]" : "bg-white"
    )}>
      {/* Dark mode toggle */}
      <button
        onClick={() => setDarkMode(!darkMode)}
        className={cn(
          "fixed top-4 right-4 p-2 rounded-lg transition-colors duration-200",
          darkMode 
            ? "bg-[#2a2a2a] hover:bg-[#333] text-[#e0e0e0]" 
            : "bg-[#f3f3f3] hover:bg-[#e5e5e5] text-[#5c5c5c]"
        )}
      >
        {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>

      {/* Canvas */}
      <div className="flex flex-col gap-8 items-center max-w-[900px] w-full px-12 pt-24">
        {/* Context section */}
        <div 
          className="flex flex-col gap-2 items-start w-full"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            multiple
            accept=".pdf,.html,.txt"
            onChange={handleFileSelect}
          />
          
          {/* Context heading */}
          <div className="flex flex-col gap-2 items-start w-full">
            <div className="flex gap-2 items-start max-w-[800px] rounded w-full">
              <div className="flex gap-0 h-4 items-center justify-end pt-0.5 shrink-0 w-11" />
              <div className="flex flex-1 flex-col gap-1 items-start min-w-px">
                <div className="flex gap-1 items-center w-full">
                  <p className={cn(
                    "font-semibold leading-[22px] text-base whitespace-nowrap transition-colors duration-200",
                    darkMode ? "text-[#e0e0e0]" : "text-[#2e2e2e]"
                  )}>
                    Context
                  </p>
                </div>
              </div>
              <div className="flex gap-0 items-center size-4" />
            </div>
          </div>

          {/* Drop zone or Add files link or File tree */}
          {uploadedFiles.length > 0 ? (
            <div className="flex flex-col items-start max-w-[800px] w-full">
              {/* Pill row with expand/collapse */}
              <div className="flex gap-2 items-center w-full">
                <div className="flex items-center justify-end shrink-0 w-11">
                  <button 
                    onClick={() => setFilesExpanded(!filesExpanded)}
                    className={cn(
                      "relative flex items-center justify-center size-5 rounded active:scale-[0.96] transition-transform before:absolute before:inset-[-10px] before:content-['']",
                      darkMode ? "hover:bg-white/10" : "hover:bg-black/5"
                    )}
                  >
                    <ChevronRight className={cn(
                      "w-3.5 h-3.5 transition-transform duration-200 ease-[cubic-bezier(0.2,0,0,1)]",
                      darkMode ? "text-[#a0a0a0]" : "text-[#5c5c5c]",
                      filesExpanded && "rotate-90"
                    )} />
                  </button>
                </div>
                <div className="flex flex-1 gap-2 items-center min-w-px">
                  {/* Pill */}
                  <div 
                    ref={pillMenuRef}
                    className={cn(
                      "relative flex items-center gap-2 px-3 py-1 rounded-full transition-[border-color,background-color,box-shadow] duration-150 ease-[cubic-bezier(0.2,0,0,1)]",
                      isPillInProgress 
                        ? darkMode 
                          ? "border border-solid border-[#4a4a4a] bg-[#1a1a1a]"
                          : "border border-solid border-[#c9c9c9] bg-white"
                        : darkMode
                          ? "border border-solid border-[#3a3a3a] bg-[#2a2a2a] hover:bg-[#333] shadow-[0_1px_2px_rgba(0,0,0,0.2)]"
                          : "border border-solid border-[#e5e5e5] bg-[#f3f3f3] hover:bg-[#ebebeb] shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
                    )}
                  >
                    {isPillReady ? (
                      <RetrieverIcon className="w-3.5 h-3.5 shrink-0" darkMode={darkMode} />
                    ) : (
                      <DotMatrixLoader className="w-3.5 h-3.5 shrink-0" animate={true} darkMode={darkMode} />
                    )}
                    <span 
                      className={cn(
                        "text-[13px] leading-[18px] font-medium transition-colors duration-300",
                        isPillInProgress 
                          ? darkMode ? "text-[#6a6a6a]" : "text-[#939393]"
                          : darkMode ? "text-[#e0e0e0]" : "text-[#2e2e2e]"
                      )}
                    >
                      {isAnyFileUploading ? "uploading files" : isPillProcessing ? "indexing files" : "files library"}
                    </span>
                    <button 
                      className={cn(
                        "relative flex items-center justify-center rounded active:scale-[0.96] transition-transform before:absolute before:inset-[-8px] before:content-['']",
                        darkMode ? "hover:bg-white/10" : "hover:bg-black/10"
                      )}
                      onClick={() => setPillMenuOpen(!pillMenuOpen)}
                    >
                      <DownArrowIcon className={darkMode ? "text-[#a0a0a0]" : "text-[#5c5c5c]"} />
                    </button>
                    {pillMenuOpen && (
                      <div className={cn(
                        "absolute top-full right-0 mt-1 rounded-lg py-1 min-w-[140px] z-50",
                        darkMode 
                          ? "bg-[#2a2a2a] border border-[#3a3a3a] shadow-[0_4px_12px_rgba(0,0,0,0.4)]"
                          : "bg-white border border-[#e5e5e5] shadow-[0_4px_12px_rgba(0,0,0,0.1)]"
                      )}>
                        <button 
                          className={cn(
                            "w-full px-3 py-1.5 text-left text-[13px] transition-colors flex items-center gap-2",
                            darkMode 
                              ? "text-[#e0e0e0] hover:bg-[#333]"
                              : "text-[#2e2e2e] hover:bg-[#f3f3f3]"
                          )}
                          onClick={() => {
                            console.log('Edit Action clicked')
                            setPillMenuOpen(false)
                          }}
                        >
                          <Pencil className={cn("w-3.5 h-3.5", darkMode ? "text-[#a0a0a0]" : "text-[#5c5c5c]")} />
                          Edit Action
                        </button>
                        <button 
                          className={cn(
                            "w-full px-3 py-1.5 text-left text-[13px] transition-colors flex items-center gap-2",
                            darkMode 
                              ? "text-[#e0e0e0] hover:bg-[#333]"
                              : "text-[#2e2e2e] hover:bg-[#f3f3f3]"
                          )}
                          onClick={() => {
                            console.log('Delete Action clicked')
                            setPillMenuOpen(false)
                          }}
                        >
                          <Trash2 className={cn("w-3.5 h-3.5", darkMode ? "text-[#a0a0a0]" : "text-[#5c5c5c]")} />
                          Delete Action
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* File tree with curved connectors */}
              <div 
                className={cn(
                  "flex flex-col items-start w-full ml-[60px] mt-1 overflow-hidden transition-[max-height] duration-300",
                  filesExpanded 
                    ? "max-h-[500px] ease-out" 
                    : "max-h-0 ease-in"
                )}
              >
                {uploadedFiles.map((file, index) => (
                  <div 
                    key={file.id || index} 
                    className={cn(
                      "flex items-center w-full group h-[26px] transition-opacity duration-150",
                      filesExpanded 
                        ? "opacity-100 ease-out" 
                        : "opacity-0 ease-in"
                    )}
                    style={{
                      transitionDelay: filesExpanded 
                        ? `${index * 30}ms` 
                        : `${(uploadedFiles.length - 1 - index) * 20}ms`
                    }}
                  >
                    <svg 
                      width="24" 
                      height="26" 
                      viewBox="0 0 24 26" 
                      fill="none" 
                      className="shrink-0"
                      style={{ marginLeft: '-1px' }}
                    >
                      <path 
                        d="M4 0 V9 Q4 13 8 13 H24 M4 13 V26"
                        stroke={darkMode ? "#3a3a3a" : "#d9d9d9"}
                        strokeWidth="1" 
                        fill="none"
                        strokeLinecap="round"
                      />
                    </svg>
                    
                    {file.uploading ? (
                      <Loader2 className={cn("w-4 h-4 animate-spin shrink-0", darkMode ? "text-[#6a6a6a]" : "text-[#939393]")} />
                    ) : (
                      <FileIcon className={cn("w-4 h-4 shrink-0", darkMode ? "text-[#6a6a6a]" : "text-[#939393]")} />
                    )}
                    <span className={cn(
                      "text-[13px] leading-[22px] ml-1.5 transition-colors duration-300",
                      file.uploading 
                        ? darkMode ? "text-[#6a6a6a]" : "text-[#939393]"
                        : darkMode ? "text-[#a0a0a0]" : "text-[#5c5c5c]"
                    )}>
                      {file.name}
                    </span>
                    {!file.uploading && (
                      <button 
                        onClick={() => removeFile(index)}
                        className={cn(
                          "ml-1 opacity-0 group-hover:opacity-100 flex items-center justify-center size-4 rounded active:scale-[0.96] transition-opacity duration-200",
                          darkMode ? "hover:bg-white/10" : "hover:bg-black/5"
                        )}
                      >
                        <X className={cn("w-3 h-3", darkMode ? "text-[#6a6a6a]" : "text-[#939393]")} />
                      </button>
                    )}
                  </div>
                ))}
                {/* Add files row or inline drop zone */}
                {isDragging ? (
                  <div 
                    className={cn(
                      "flex items-center w-full transition-opacity duration-150",
                      filesExpanded 
                        ? "opacity-100 ease-out" 
                        : "opacity-0 ease-in"
                    )}
                    style={{
                      transitionDelay: filesExpanded 
                        ? `${uploadedFiles.length * 30}ms` 
                        : '0ms'
                    }}
                  >
                    <svg 
                      width="24" 
                      height="38" 
                      viewBox="0 0 24 38" 
                      fill="none" 
                      className="shrink-0"
                      style={{ marginLeft: '-1px' }}
                    >
                      <path 
                        d="M4 0 V15 Q4 19 8 19 H24"
                        stroke={darkMode ? "#3a3a3a" : "#d9d9d9"}
                        strokeWidth="1" 
                        fill="none"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className={cn(
                      "flex flex-1 items-center justify-center py-2 px-4 rounded-lg border-2 border-dashed gap-2",
                      darkMode ? "border-[#4a4a4a] bg-[#2a2a2a]/50" : "border-[#c9c9c9] bg-white/50"
                    )}>
                      <Upload className={cn("w-3.5 h-3.5", darkMode ? "text-[#808080]" : "text-[#757575]")} />
                      <span className={cn("text-[13px]", darkMode ? "text-[#808080]" : "text-[#757575]")}>Drop files here</span>
                    </div>
                  </div>
                ) : (
                  <div 
                    className={cn(
                      "flex items-center w-full h-[26px] transition-opacity duration-150",
                      filesExpanded 
                        ? "opacity-100 ease-out" 
                        : "opacity-0 ease-in"
                    )}
                    style={{
                      transitionDelay: filesExpanded 
                        ? `${uploadedFiles.length * 30}ms` 
                        : '0ms'
                    }}
                  >
                    <svg 
                      width="24" 
                      height="26" 
                      viewBox="0 0 24 26" 
                      fill="none" 
                      className="shrink-0"
                      style={{ marginLeft: '-1px' }}
                    >
                      <path 
                        d="M4 0 V9 Q4 13 8 13 H24"
                        stroke={darkMode ? "#3a3a3a" : "#d9d9d9"}
                        strokeWidth="1" 
                        fill="none"
                        strokeLinecap="round"
                      />
                    </svg>
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className={cn(
                        "text-[13px] leading-[22px] ml-1.5 underline decoration-dotted underline-offset-2 hover:decoration-solid transition-colors",
                        darkMode 
                          ? "text-[#808080] hover:text-[#e0e0e0]"
                          : "text-[#757575] hover:text-[#2e2e2e]"
                      )}
                    >
                      Add files
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : isDragging ? (
            <div className="flex gap-2 items-start max-w-[800px] rounded w-full">
              <div className="flex gap-0 items-center justify-end pt-0.5 shrink-0 w-11" />
              <div className={cn(
                "flex flex-1 flex-col items-center justify-center py-6 px-4 rounded-lg border-2 border-dashed transition-all duration-200 gap-1.5",
                darkMode ? "border-[#4a4a4a] bg-[#2a2a2a]/50" : "border-[#c9c9c9] bg-white/50"
              )}>
                <div className="flex items-center gap-2">
                  <Upload className={cn("w-4 h-4", darkMode ? "text-[#e0e0e0]" : "text-[#2e2e2e]")} />
                  <p className={cn("font-medium text-sm", darkMode ? "text-[#e0e0e0]" : "text-[#2e2e2e]")}>Drop files here</p>
                </div>
                <p className={cn("text-xs", darkMode ? "text-[#808080]" : "text-[#757575]")}>Accepts .pdf, .html, and .txt</p>
              </div>
              <div className="flex gap-0 items-center size-4" />
            </div>
          ) : (
            <div className="flex gap-2 items-center max-w-[800px] rounded w-full">
              <div className="flex items-center justify-end shrink-0 w-11" />
              <p className={cn("font-normal text-[13px] whitespace-nowrap", darkMode ? "text-[#808080]" : "text-[#757575]")}>
                Add{' '}
                <button 
                  className={cn(
                    "underline decoration-dotted underline-offset-2 cursor-pointer hover:decoration-solid focus:outline-none focus:decoration-solid transition-colors",
                    darkMode 
                      ? "text-[#808080] hover:text-[#e0e0e0] focus:text-[#e0e0e0] active:text-[#fff]"
                      : "text-[#757575] hover:text-[#2e2e2e] focus:text-[#2e2e2e] active:text-[#181818]"
                  )}
                  onClick={() => fileInputRef.current?.click()}
                >
                  files
                </button>
                {' '}or{' '}
                <button 
                  className={cn(
                    "underline decoration-dotted underline-offset-2 cursor-pointer hover:decoration-solid focus:outline-none focus:decoration-solid transition-colors",
                    darkMode 
                      ? "text-[#808080] hover:text-[#e0e0e0] focus:text-[#e0e0e0] active:text-[#fff]"
                      : "text-[#757575] hover:text-[#2e2e2e] focus:text-[#2e2e2e] active:text-[#181818]"
                  )}
                  onClick={() => console.log('Add knowledge articles clicked')}
                >
                  knowledge articles
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
