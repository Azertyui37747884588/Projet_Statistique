"use client"

import { useData } from "@/contexts/data-context"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface VariableSelectorProps {
  label: string
  value: string
  onChange: (value: string) => void
  id: string
  description?: string
}

export function VariableSelector({ label, value, onChange, id, description }: VariableSelectorProps) {
  const { headers, hasData } = useData()

  if (!hasData) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Aucune donnée disponible. Veuillez d'abord téléverser un fichier dans la section{" "}
          <a href="/upload" className="underline font-medium">
            Téléversement
          </a>
          .
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={id}>
          <SelectValue placeholder="Sélectionnez une variable" />
        </SelectTrigger>
        <SelectContent>
          {headers.map((header, index) => (
            <SelectItem key={index} value={index.toString()}>
              {header}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
