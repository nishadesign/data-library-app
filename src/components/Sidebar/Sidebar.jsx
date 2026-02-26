import React from 'react'
import { Home, CircleUser, Database, PanelLeftClose } from 'lucide-react'

export default function Sidebar() {
  return (
    <aside className="w-[180px] min-w-[180px] bg-sidebar border-r border-sidebar-border flex flex-col justify-between overflow-y-auto box-border">
      <nav className="flex flex-col pt-2">
        <button className="flex items-center gap-2.5 py-[9px] pr-3 pl-4 text-[13px] font-normal text-sidebar-foreground font-sans bg-transparent border-none cursor-pointer text-left w-full box-border border-l-4 border-l-transparent hover:bg-surface-hover">
          <Home size={18} />
          <span>Home</span>
        </button>

        <div className="pt-4 pb-1 pl-5 pr-4">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide font-sans">
            Build
          </span>
        </div>

        <button className="flex items-center gap-2.5 py-[9px] pr-3 pl-4 text-[13px] font-normal text-sidebar-foreground font-sans bg-transparent border-none cursor-pointer text-left w-full box-border border-l-4 border-l-transparent hover:bg-surface-hover">
          <CircleUser size={18} />
          <span>Agents</span>
        </button>

        <button className="flex items-center gap-2.5 py-[9px] pr-3 pl-4 text-[13px] font-semibold text-sidebar-accent-foreground font-sans bg-sidebar-accent border-none cursor-pointer text-left w-full box-border border-l-4 border-l-primary-active hover:bg-primary-hover">
          <Database size={18} className="text-white" />
          <span>Data Libraries</span>
        </button>
      </nav>

      <button className="flex items-center gap-2 py-3 px-4 text-[13px] text-muted-foreground font-sans bg-transparent border-none border-t border-t-border cursor-pointer w-full text-left hover:bg-surface-hover">
        <PanelLeftClose size={16} />
        <span>Collapse</span>
      </button>
    </aside>
  )
}
