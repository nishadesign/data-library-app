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

  function handleNewLibrary() {
    setActiveTab('newLibrary')
  }

  function handleBackToLibraries() {
    setActiveTab('dataLibraries')
  }

  const handleSaveLibrary = useCallback((libraryData) => {
    setSavedLibrary(libraryData)
    setActiveTab('libraryView')
  }, [])

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
          <TabsContent value="dataLibraries" className="flex-1">
            <MainContent onNewLibrary={handleNewLibrary} />
          </TabsContent>
          <TabsContent value="newLibrary" className="flex-1">
            <LibraryDetail
              onCancel={handleBackToLibraries}
              onSave={handleSaveLibrary}
            />
          </TabsContent>
          {savedLibrary && (
            <TabsContent value="libraryView" className="flex-1">
              <LibraryView
                library={savedLibrary}
                onEdit={handleEditLibrary}
                onLibraryUpdate={handleLibraryUpdate}
              />
            </TabsContent>
          )}
        </div>
      </Tabs>
    </TooltipProvider>
  )
}
