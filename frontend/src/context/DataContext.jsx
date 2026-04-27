import { createContext, useContext, useState } from 'react'

const DataContext = createContext(null)

export function DataProvider({ children }) {
  const [appData, setAppData] = useState(null)

  return (
    <DataContext.Provider value={{ appData, setAppData }}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  return useContext(DataContext)
}
