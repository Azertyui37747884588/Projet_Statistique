import axios from 'axios'

export const API_BASE = 'http://127.0.0.1:8000'

export const api = axios.create({ baseURL: API_BASE })

// Data routes
export const uploadCSV = async (file: File) => {
  const form = new FormData();
  form.append('file', file)
  const { data } = await api.post('/data/upload', form, { headers: { 'Content-Type': 'multipart/form-data' }})
  return data
}

export const setTarget = async (target: string|null) => {
  const form = new FormData();
  if (target) form.append('target', target)
  const { data } = await api.post('/data/set-target', form)
  return data
}

export const getColumns = async () => {
  try {
    const { data } = await api.get('/data/columns')
    if ((data as any)?.error) return { all: [], numeric: [], categorical: [], target: null }
    return data
  } catch {
    return { all: [], numeric: [], categorical: [], target: null }
  }
}
export const getPreview = async (n=10) => {
  try {
    const { data } = await api.get('/data/preview', { params: { n }})
    return data
  } catch {
    return { head: [] }
  }
}

export const getColumnValues = async (varName: string, n?: number) => {
  try {
    const { data } = await api.get('/data/column-values', { params: { var: varName, n }})
    return data
  } catch {
    return { values: [] }
  }
}

// Visualisations
export const vizHistogram = async (varName: string, bins=30) => (await api.get('/visualisation/histogram', { params: { var: varName, bins }})).data
export const vizBoxplot = async (y: string, x?: string) => {
  const params: any = { y }
  if (x) params.x = x
  return (await api.get('/visualisation/boxplot', { params })).data
}
export const vizScatter = async (x: string, y: string, hue?: string) => (await api.get('/visualisation/scatter', { params: { x, y, hue }})).data
export const vizLine = async (y: string, order_by: string) => (await api.get('/visualisation/line', { params: { y, order_by }})).data
export const vizKDE = async (varName: string) => (await api.get('/visualisation/kde', { params: { var: varName }})).data
export const vizBar = async (cat: string, topk=10) => (await api.get('/visualisation/bar', { params: { cat, topk }})).data

// Tests
export const testSpearman = async (var1: string, var2: string) => (await api.post('/stats/spearman', { var1, var2 })).data
export const testMannWhitney = async (var1: string, var2: string) => (await api.post('/stats/mannwhitney', { var1, var2 })).data
export const testKruskal = async (var1: string, var2: string) => (await api.post('/stats/kruskal', { var1, var2 })).data
export const testFriedman = async (var1: string, var2: string) => (await api.post('/stats/friedman', { var1, var2 })).data
export const testKS = async (var1: string, var2: string) => (await api.post('/stats/ks', { var1, var2 })).data
export const testChi2 = async (var1: string, var2: string) => (await api.post('/stats/chi2', { var1, var2 })).data

// Prediction
export const predictManual = async (payload: {
  age: number; bmi: number; systolic_bp: number; glucose_fasting: number; hba1c: number; family_history: number; latitude?: number; longitude?: number;
}) => (await api.post('/prediction/manual', payload)).data
