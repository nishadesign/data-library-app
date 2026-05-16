import React from 'react'
import { Home, CircleUser, Database, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { AgentAstroIcon } from '../../assets/icons'
import { cn } from '@/lib/utils'

export default function Sidebar({ collapsed = false, onToggle, activeTab, onTabChange }) {
  const navButtonBase = collapsed
    ? 'flex items-center justify-center py-2 px-1 text-sm font-normal text-sidebar-foreground font-sans bg-transparent border-none cursor-pointer text-left w-full box-border border-l-2 border-l-transparent hover:bg-surface-hover transition-[background-color,transform] active:scale-[0.96]'
    : 'flex items-center gap-2.5 py-[9px] pr-3 pl-4 text-sm font-normal text-sidebar-foreground font-sans bg-transparent border-none cursor-pointer text-left w-full box-border border-l-4 border-l-transparent hover:bg-surface-hover transition-[background-color,transform] active:scale-[0.96]'

  const activeButtonBase = collapsed
    ? 'flex items-center justify-center py-2 px-1 text-sm font-semibold text-sidebar-accent-foreground font-sans bg-sidebar-accent border-none cursor-pointer text-left w-full box-border border-l-2 border-l-primary hover:bg-primary-light transition-[background-color,transform] active:scale-[0.96]'
    : 'flex items-center gap-2.5 py-[9px] pr-3 pl-4 text-sm font-semibold text-sidebar-accent-foreground font-sans bg-sidebar-accent border-none cursor-pointer text-left w-full box-border border-l-4 border-l-primary hover:bg-primary-light transition-[background-color,transform] active:scale-[0.96]'

  const isDataLibraries = activeTab === 'dataLibraries' || activeTab === 'newLibrary' || activeTab === 'libraryView'

  return (
    <aside className={`${collapsed ? 'w-[48px] min-w-[48px]' : 'w-[180px] min-w-[180px]'} bg-sidebar border-r border-sidebar-border flex flex-col justify-between overflow-y-auto box-border transition-[width,min-width] duration-200 ease-out`}>
      <nav className="flex flex-col pt-2">
        <button className={navButtonBase} aria-label="Home">
          <Home size={18} />
          {!collapsed && <span>Home</span>}
        </button>


        <button 
          className={navButtonBase} 
          aria-label="Agent Builder"
          onClick={() => window.open('/agent-builder.html', '_blank')}
        >
          <AgentAstroIcon size={18} />
          {!collapsed && <span>Agents</span>}
        </button>

        <button 
          className={cn(isDataLibraries ? activeButtonBase : navButtonBase)} 
          aria-label="Data Libraries"
          onClick={() => onTabChange?.('dataLibraries')}
        >
          <Database size={18} className={isDataLibraries ? 'text-primary' : ''} />
          {!collapsed && <span>Data Libraries</span>}
        </button>
      </nav>

      <button
        className={`${collapsed ? 'justify-center px-1' : 'gap-2 px-4'} flex items-center py-3 text-sm text-muted-foreground font-sans bg-transparent border-none border-t border-t-border cursor-pointer w-full text-left hover:bg-surface-hover transition-[background-color,transform] active:scale-[0.96]`}
        onClick={onToggle}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
        {!collapsed && <span>Collapse</span>}
      </button>
    </aside>
  )
}
