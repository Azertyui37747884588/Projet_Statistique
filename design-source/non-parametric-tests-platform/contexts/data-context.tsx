"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

interface PredictionMarker {
  id: string
  latitude: number
  longitude: number
  diabetesRisk: number
  timestamp: Date
  patientData: {
    age: number
    bmi: number
    glucose: number
    bloodPressure: number
    insulin: number
  }
}

interface DataContextType {
  headers: string[]
  data: any[][]
  setUploadedData: (headers: string[], data: any[][]) => void
  clearData: () => void
  hasData: boolean
  predictionMarkers: PredictionMarker[]
  addPredictionMarker: (marker: Omit<PredictionMarker, "id" | "timestamp">) => void
  clearMarkers: () => void
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export function DataProvider({ children }: { children: ReactNode }) {
  const [headers, setHeaders] = useState<string[]>([])
  const [data, setData] = useState<any[][]>([])
  const [predictionMarkers, setPredictionMarkers] = useState<PredictionMarker[]>([])

  const setUploadedData = (newHeaders: string[], newData: any[][]) => {
    setHeaders(newHeaders)
    setData(newData)
  }

  const clearData = () => {
    setHeaders([])
    setData([])
  }

  const addPredictionMarker = (marker: Omit<PredictionMarker, "id" | "timestamp">) => {
    const newMarker: PredictionMarker = {
      ...marker,
      id: `marker-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    }
    setPredictionMarkers((prev) => [...prev, newMarker])
  }

  const clearMarkers = () => {
    setPredictionMarkers([])
  }

  const hasData = headers.length > 0 && data.length > 0

  return (
    <DataContext.Provider
      value={{
        headers,
        data,
        setUploadedData,
        clearData,
        hasData,
        predictionMarkers,
        addPredictionMarker,
        clearMarkers,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider")
  }
  return context
}
