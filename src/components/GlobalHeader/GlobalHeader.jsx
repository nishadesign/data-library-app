import React from 'react'
import { Search, Settings, Bell } from 'lucide-react'
import { UserAvatar } from '../../assets/icons'
import salesforceIcon from '../../assets/salesforce-icon.png'

export default function GlobalHeader() {
  return (
    <header className="flex items-center h-11 bg-sidebar border-b border-border px-4 box-border">
      <div className="flex items-center shrink-0">
        <img src={salesforceIcon} alt="Salesforce" className="h-7 w-auto" />
      </div>
      <div className="flex-1 flex justify-center px-6">
        <div className="flex items-center gap-2 bg-background border border-input rounded px-4 py-[5px] w-80 max-w-full cursor-text hover:border-ring">
          <Search size={14} className="text-muted-foreground" />
          <span className="text-muted-foreground text-sm font-sans">Search...</span>
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button className="bg-transparent border-none cursor-pointer p-1.5 rounded flex items-center justify-center text-muted-foreground hover:bg-surface-hover" aria-label="Settings">
          <Settings size={18} />
        </button>
        <button className="bg-transparent border-none cursor-pointer p-1.5 rounded flex items-center justify-center text-muted-foreground hover:bg-surface-hover" aria-label="Notifications">
          <Bell size={18} />
        </button>
        <button className="bg-transparent border-none cursor-pointer p-0.5 ml-1 flex items-center rounded-full hover:shadow-[0_0_0_2px_rgba(0,0,0,0.1)]" aria-label="User profile">
          <UserAvatar size={28} />
        </button>
      </div>
    </header>
  )
}
