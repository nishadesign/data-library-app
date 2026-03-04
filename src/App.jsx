import React, { useState, useCallback } from 'react'
import GlobalHeader from './components/GlobalHeader/GlobalHeader'
import AppHeader from './components/AppHeader/AppHeader'
import Sidebar from './components/Sidebar/Sidebar'
import MainContent from './components/MainContent/MainContent'
import LibraryDetail from './components/LibraryDetail/LibraryDetail'
import LibraryView from './components/LibraryView/LibraryView'
import { Tabs, TabsContent } from './components/ui/tabs'
import { TooltipProvider } from './components/ui/tooltip'

export default function App() {
  const [activeTab, setActiveTab] = useState('dataLibraries')
  const [savedLibrary, setSavedLibrary] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [autoExpandStatusOnEnter, setAutoExpandStatusOnEnter] = useState(false)

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
    setAutoExpandStatusOnEnter(true)
    setActiveTab('libraryView')
  }, [])

  function handleViewLibrary(library) {
    setSavedLibrary(library)
    setAutoExpandStatusOnEnter(false)
    setActiveTab('libraryView')
  }

  function handleEditLibrary() {
    setActiveTab('newLibrary')
  }

  const handleLibraryUpdate = useCallback((updated) => {
    setSavedLibrary(prev => ({ ...prev, ...updated }))
  }, [])

  return (
    <TooltipProvider delayDuration={300}>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-screen w-screen overflow-hidden font-sans">
        <GlobalHeader />
        <AppHeader
          activeTab={activeTab}
          onTabChange={setActiveTab}
          libraryName={savedLibrary?.libraryName}
        />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <TabsContent value="dataLibraries" className="flex-1 h-full">
            <MainContent onNewLibrary={handleNewLibrary} onViewLibrary={handleViewLibrary} refreshKey={refreshKey} />
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
