import React from 'react'
import { LayoutGrid } from 'lucide-react'
import { TabsList, TabsTrigger } from '../ui/tabs'

export default function AppHeader({ activeTab, onTabChange, libraryName }) {
  const showLibraryTab = activeTab === 'newLibrary' || activeTab === 'libraryView'

  return (
    <div className="flex items-center h-10 bg-background border-b border-border px-3 box-border">
      <div className="flex items-center gap-2 shrink-0">
        <button className="bg-transparent border-none cursor-pointer p-1 rounded flex items-center justify-center text-muted-foreground hover:bg-secondary" aria-label="App Launcher">
          <LayoutGrid size={18} />
        </button>
        <span className="text-sm font-bold text-foreground font-sans whitespace-nowrap">
          Agentforce Studio
        </span>
      </div>
      <TabsList className="ml-6 h-full">
        <TabsTrigger value="dataLibraries">
          Data Libraries
        </TabsTrigger>
        {showLibraryTab && (
          <TabsTrigger
            value={activeTab}
          >
            {activeTab === 'libraryView' && libraryName
              ? libraryName
              : 'New Library'}
          </TabsTrigger>
        )}
      </TabsList>
    </div>
  )
}
