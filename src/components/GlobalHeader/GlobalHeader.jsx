import React from 'react'
import { Search, Settings, Bell, Moon, Sun } from 'lucide-react'
import { UserAvatar } from '../../assets/icons'
import salesforceIcon from '../../assets/salesforce-icon.png'

export default function GlobalHeader({ isDarkMode, onToggleDarkMode }) {
  return (
    <header className={`flex items-center h-11 border-b border-border px-4 box-border ${isDarkMode ? 'bg-global-header' : 'bg-background'}`}>
      <div className="flex items-center shrink-0">
        <img src={salesforceIcon} alt="Salesforce" className="h-7 w-auto" />
      </div>
      <div className="flex-1 flex justify-center px-6">
        <div className={`flex items-center gap-2 border border-input rounded-full px-4 py-[5px] w-80 max-w-full cursor-text hover:border-ring ${isDarkMode ? 'bg-background/95' : 'bg-background'}`}>
          <Search size={14} className="text-muted-foreground" />
          <span className="text-muted-foreground text-sm font-sans">Search...</span>
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button
          className={`relative bg-transparent border-none cursor-pointer p-1.5 rounded flex items-center justify-center transition-[color,background-color,transform] active:scale-[0.96] before:absolute before:inset-[-5px] before:content-[''] ${isDarkMode ? 'text-white/80 hover:text-white hover:bg-white/10' : 'text-muted-foreground hover:text-foreground hover:bg-surface-hover'}`}
          aria-label="Settings"
        >
          <Settings size={18} />
        </button>
        <button
          className={`relative bg-transparent border-none cursor-pointer p-1.5 rounded flex items-center justify-center transition-[color,background-color,transform] active:scale-[0.96] before:absolute before:inset-[-5px] before:content-[''] ${isDarkMode ? 'text-white/80 hover:text-white hover:bg-white/10' : 'text-muted-foreground hover:text-foreground hover:bg-surface-hover'}`}
          aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          onClick={() => onToggleDarkMode?.(!isDarkMode)}
        >
          {isDarkMode ? <Moon size={18} /> : <Sun size={18} />}
        </button>
        <button
          className={`relative bg-transparent border-none cursor-pointer p-1.5 rounded flex items-center justify-center transition-[color,background-color,transform] active:scale-[0.96] before:absolute before:inset-[-5px] before:content-[''] ${isDarkMode ? 'text-white/80 hover:text-white hover:bg-white/10' : 'text-muted-foreground hover:text-foreground hover:bg-surface-hover'}`}
          aria-label="Notifications"
        >
          <Bell size={18} />
        </button>
        <button
          className={`bg-transparent border-none cursor-pointer p-0.5 ml-1 flex items-center rounded-full transition-[box-shadow,transform] active:scale-[0.96] ${isDarkMode ? 'hover:shadow-[0_0_0_2px_rgba(255,255,255,0.25)]' : 'hover:shadow-[0_0_0_2px_rgba(0,0,0,0.1)]'}`}
          aria-label="User profile"
        >
          <UserAvatar size={28} />
        </button>
      </div>
    </header>
  )
}
