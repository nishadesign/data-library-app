import React from 'react'
import { Home, CircleUser, Database, PanelLeftClose, PanelLeftOpen } from 'lucide-react'

export default function Sidebar({ collapsed = false, onToggle }) {
  const navButtonBase = collapsed
    ? 'flex items-center justify-center py-[9px] px-2 text-sm font-normal text-sidebar-foreground font-sans bg-transparent border-none cursor-pointer text-left w-full box-border border-l-4 border-l-transparent hover:bg-surface-hover'
    : 'flex items-center gap-2.5 py-[9px] pr-3 pl-4 text-sm font-normal text-sidebar-foreground font-sans bg-transparent border-none cursor-pointer text-left w-full box-border border-l-4 border-l-transparent hover:bg-surface-hover'

  const activeButtonBase = collapsed
    ? 'flex items-center justify-center py-[9px] px-2 text-sm font-semibold text-sidebar-accent-foreground font-sans bg-sidebar-accent border-none cursor-pointer text-left w-full box-border border-l-4 border-l-primary hover:bg-[#daeaf8]'
    : 'flex items-center gap-2.5 py-[9px] pr-3 pl-4 text-sm font-semibold text-sidebar-accent-foreground font-sans bg-sidebar-accent border-none cursor-pointer text-left w-full box-border border-l-4 border-l-primary hover:bg-[#daeaf8]'

  return (
    <aside className={`${collapsed ? 'w-[64px] min-w-[64px]' : 'w-[180px] min-w-[180px]'} bg-sidebar border-r border-sidebar-border flex flex-col justify-between overflow-y-auto box-border transition-[width,min-width] duration-200 ease-out`}>
      <nav className="flex flex-col pt-2">
        <button className={navButtonBase} aria-label="Home">
          <Home size={18} />
          {!collapsed && <span>Home</span>}
        </button>

        {!collapsed && (
          <div className="pt-4 pb-1 pl-5 pr-4">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide font-sans">
              Build
            </span>
          </div>
        )}

        <button className={navButtonBase} aria-label="Agents">
          <CircleUser size={18} />
          {!collapsed && <span>Agents</span>}
        </button>

        <button className={activeButtonBase} aria-label="Data Libraries">
          <Database size={18} className="text-primary" />
          {!collapsed && <span>Data Libraries</span>}
        </button>
      </nav>

      <button
        className={`${collapsed ? 'justify-center px-2' : 'gap-2 px-4'} flex items-center py-3 text-sm text-muted-foreground font-sans bg-transparent border-none border-t border-t-border cursor-pointer w-full text-left hover:bg-surface-hover`}
        onClick={onToggle}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
        {!collapsed && <span>Collapse</span>}
      </button>
    </aside>
  )
}
