import React, { useState, useCallback, useEffect } from 'react'
import GlobalHeader from './components/GlobalHeader/GlobalHeader'
import AppHeader from './components/AppHeader/AppHeader'
import Sidebar from './components/Sidebar/Sidebar'
import MainContent from './components/MainContent/MainContent'
import LibraryDetail from './components/LibraryDetail/LibraryDetail'
import LibraryView from './components/LibraryView/LibraryView'
import { Tabs, TabsContent } from './components/ui/tabs'
import { TooltipProvider } from './components/ui/tooltip'

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window === 'undefined') return false
    const savedTheme = window.localStorage.getItem('data-library-theme')
    if (savedTheme === 'dark') return true
    if (savedTheme === 'light') return false
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
  })
  const [activeTab, setActiveTab] = useState('dataLibraries')
  const [savedLibrary, setSavedLibrary] = useState(null)
  const [libraryOverrides, setLibraryOverrides] = useState({})
  const [refreshKey, setRefreshKey] = useState(0)
  const [autoExpandStatusOnEnter, setAutoExpandStatusOnEnter] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true)

  function handleNewLibrary() {
    setActiveTab('newLibrary')
  }

  function handleBackToLibraries() {
    setActiveTab('dataLibraries')
    setRefreshKey(k => k + 1)
    setAutoExpandStatusOnEnter(false)
  }

  const handleSaveLibrary = useCallback((libraryData) => {
    setSavedLibrary(libraryData)
    if (libraryData?.id) {
      setLibraryOverrides(prev => ({ ...prev, [libraryData.id]: libraryData }))
    }
    setAutoExpandStatusOnEnter(true)
    setActiveTab('libraryView')
  }, [])

  function handleViewLibrary(library) {
    const nextLibrary = library?.id && libraryOverrides[library.id]
      ? { ...library, ...libraryOverrides[library.id] }
      : library
    setSavedLibrary(nextLibrary)
    setAutoExpandStatusOnEnter(Boolean(nextLibrary?.isDemo && nextLibrary?.demoState === 'ready'))
    setActiveTab('libraryView')
  }

  function handleEditLibrary() {
    setActiveTab('newLibrary')
  }

  const handleLibraryUpdate = useCallback((updated) => {
    setSavedLibrary(prev => {
      const next = { ...prev, ...updated }
      if (next?.id) {
        setLibraryOverrides(overrides => ({ ...overrides, [next.id]: next }))
      }
      return next
    })
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode)
    window.localStorage.setItem('data-library-theme', isDarkMode ? 'dark' : 'light')
  }, [isDarkMode])

  return (
    <TooltipProvider delayDuration={300}>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-screen w-screen overflow-hidden font-sans">
        <GlobalHeader
          isDarkMode={isDarkMode}
          onToggleDarkMode={setIsDarkMode}
        />
        <AppHeader
          activeTab={activeTab}
          onTabChange={setActiveTab}
          libraryName={savedLibrary?.libraryName}
        />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(prev => !prev)} />
          <TabsContent value="dataLibraries" className="flex-1 h-full">
            <MainContent
              onNewLibrary={handleNewLibrary}
              onViewLibrary={handleViewLibrary}
              refreshKey={refreshKey}
              libraryOverrides={libraryOverrides}
            />
          </TabsContent>
          <TabsContent value="newLibrary" className="flex-1 h-full">
            <LibraryDetail
              onCancel={handleBackToLibraries}
              onSave={handleSaveLibrary}
            />
          </TabsContent>
          {savedLibrary && (
            <TabsContent value="libraryView" className="flex-1 h-full">
              <LibraryView
                library={savedLibrary}
                onEdit={handleEditLibrary}
                onLibraryUpdate={handleLibraryUpdate}
                onCancel={handleBackToLibraries}
                autoExpandStatusOnEnter={autoExpandStatusOnEnter}
              />
            </TabsContent>
          )}
        </div>
      </Tabs>
    </TooltipProvider>
  )
}
