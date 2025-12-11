import { useEffect, useMemo, useState } from 'react'
import { getColumns, vizHistogram, vizBoxplot, vizScatter, vizLine, vizBar, getColumnValues } from '../scripts/api'
import type { Columns } from '../types'

export default function Visualisation(){
  const [columns, setColumns] = useState<Columns|null>(null)
  const [mainVar, setMainVar] = useState('')
  const [optVar, setOptVar] = useState('')
  const [activeTab, setActiveTab] = useState<'boxplot'|'hist'|'line'|'scatter'|'pie'|'bar'>('hist')
  const [images, setImages] = useState<{[k:string]: string}>({})
  const [err, setErr] = useState<string| null>(null)
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState<{[k:string]: number}|null>(null)

  useEffect(()=>{ (async()=> setColumns(await getColumns()))().catch(()=>{}) },[])

  const numeric = useMemo(()=> columns?.numeric ?? [], [columns])
  const categorical = useMemo(()=> columns?.categorical ?? [], [columns])
  const all = useMemo(()=> columns?.all ?? [], [columns])

  const computeStats = (values: number[]) => {
    if(!values.length) return null
    const sorted = [...values].sort((a,b)=>a-b)
    const mean = values.reduce((s,v)=>s+v,0)/values.length
    const median = sorted[Math.floor(sorted.length/2)]
    const min = sorted[0], max = sorted[sorted.length-1]
    const variance = values.reduce((s,v)=> s + Math.pow(v-mean,2), 0) / values.length
    const std = Math.sqrt(variance)
    const q1 = sorted[Math.floor(sorted.length*0.25)]
    const q3 = sorted[Math.floor(sorted.length*0.75)]
    return { mean, median, min, max, std, variance, q1, q3 }
  }

  const generate = async () => {
    if(!mainVar) { setErr('Choisissez au moins une variable principale'); return }
    setLoading(true); setErr(null)
    try{
      const next: {[k:string]: string} = {}

      // Histogramme (pour toutes variables — catégorielles ou numériques)
      if(all.includes(mainVar)){
        try{
          const h = await vizHistogram(mainVar)
          next['hist'] = `data:image/png;base64,${h.image_base64}`
        } catch(e:any){
          console.error('Histogram error:', e)
          setErr(prev => (prev? prev + ' | ' : '') + (e?.response?.data?.detail || 'Erreur histogramme'))
        }
      }

      // Boxplot : if mainVar is numeric -> simple boxplot; if mainVar is categorical and optVar numeric -> grouped boxplot
      try{
        if(numeric.includes(mainVar)){
          const b = optVar ? await vizBoxplot(mainVar, optVar) : await vizBoxplot(mainVar)
          next['boxplot'] = `data:image/png;base64,${b.image_base64}`
        } else if(optVar && numeric.includes(optVar)){
          // swap: y = optVar (numeric), x = mainVar (categorical)
          const b = await vizBoxplot(optVar, mainVar)
          next['boxplot'] = `data:image/png;base64,${b.image_base64}`
        }
      } catch(e:any){
        console.error('Boxplot error:', e)
        setErr(prev => (prev? prev + ' | ' : '') + (e?.response?.data?.detail || 'Erreur boxplot'))
      }

      // Scatter : si une variable optionnelle est fournie (Plotly backend acceptera catégoriel x / numérique y)
      if(optVar){
        try{
          console.log("Calling scatter with:", {x: mainVar, y: optVar})
          const s = await vizScatter(mainVar, optVar)
          next['scatter'] = `data:image/png;base64,${s.image_base64}`
        } catch(e:any){
          console.error('Scatter error:', e)
          setErr(prev => (prev ?? '') + ' | Scatter : ' + (e?.response?.data?.detail || e?.message || 'Erreur scatter'))
        }
      }

      // Camembert (anciennement 'line'): call backend line endpoint which now returns a pie chart for `y`.
      if(all.includes(mainVar)){
        try{
          console.log("Calling line(pie) with:", {y: mainVar, order_by: optVar || mainVar})
          const l = await vizLine(mainVar, optVar || mainVar)
          next['line'] = `data:image/png;base64,${l.image_base64}`
          // also expose under 'pie' key for UI convenience
          next['pie'] = `data:image/png;base64,${l.image_base64}`
        } catch(e:any){
          console.error('Line(pie) error:', e)
          setErr(prev => (prev ?? '') + ' | Pie : ' + (e?.response?.data?.detail || e?.message || 'Erreur camembert'))
        }
      }

      // Bar chart (categorical counts)
      try{
        if(all.includes(mainVar)){
          const br = await vizBar(mainVar, 20)
          next['bar'] = `data:image/png;base64,${br.image_base64}`
        }
      } catch(e:any){
        console.error('Bar error:', e)
      }

      setImages(next)

      // Calculer les stats descriptives côté client pour la variable principale
      try{
        const col = await getColumnValues(mainVar, 100000)
        const vals: number[] = (col.values || []).filter((v: any) => typeof v === 'number')
        const s = computeStats(vals)
        setStats(s)
      } catch(e){ setStats(null) }

      // Choix de l’onglet par priorité
      if(next[activeTab]) {
        // garder l'onglet courant si dispo
      } else if(next['boxplot']) setActiveTab('boxplot')
      else if(next['hist']) setActiveTab('hist')
      else if(next['pie']) setActiveTab('pie')
      else if(next['scatter']) setActiveTab('scatter')
    } catch(ex:any){ setErr(ex?.response?.data?.detail || 'Erreur lors de la génération') }
    finally { setLoading(false) }
  }

  return (
    <div>
      <header className="container" style={{paddingTop:8, paddingBottom:0}}>
        <h2 style={{marginBottom:4}}>Visualisation des données</h2>
        <p style={{color:'#475569'}}>Créez des graphiques interactifs pour explorer et comprendre vos données.</p>
      </header>

      <section className="container card" style={{marginTop:12}}>
        <h3>Sélectionnez vos variables</h3>
        <p className="mt-2" style={{color:'#64748b'}}>Choisissez les colonnes à visualiser</p>
        <div className="grid two mt-2">
          <div>
            <label className="label">Variable principale (série 1)</label>
            <select className="input" value={mainVar} onChange={e=> setMainVar(e.target.value)}>
              <option value="">Sélectionnez une variable</option>
              {all.map(c=> <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Variable optionnelle (série 2)</label>
            <select className="input" value={optVar} onChange={e=> setOptVar(e.target.value)}>
              <option value="">Sélectionnez une variable</option>
              {all.map(c=> <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div className="mt-3">
          <button className="btn" style={{background:'#0f172a', borderColor:'#0f172a', opacity: mainVar?1:.6}} onClick={generate} disabled={!mainVar || loading}>{loading? 'Génération...' : 'Générer les visualisations'}</button>
          <p style={{fontSize:'0.9em', color:'#64748b', marginTop:8}}>* La variable optionnelle est facultative</p>
        </div>
      </section>

      <section className="container" style={{marginTop:12, display:'grid', gap:16}}>
        <div className="card" style={{padding:'8px 8px'}}>
          <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
            <button
              className="btn"
              style={{background: activeTab==='boxplot'?'#0ea5e9':'#fff', color: activeTab==='boxplot'?'#fff':'#0f172a', borderColor:'#cbd5e1'}}
              onClick={async ()=> {
                if(!images['boxplot']){
                  await generate()
                }
                setActiveTab('boxplot')
              }}
            >Boîte à moustaches</button>

            <button
              className="btn"
              style={{background: activeTab==='hist'?'#0ea5e9':'#fff', color: activeTab==='hist'?'#fff':'#0f172a', borderColor:'#cbd5e1'}}
              onClick={async ()=> {
                if(!images['hist']){
                  await generate()
                }
                setActiveTab('hist')
              }}
            >Histogramme</button>

            <button
              className="btn"
              style={{background: activeTab==='pie'?'#0ea5e9':'#fff', color: activeTab==='pie'?'#fff':'#0f172a', borderColor:'#cbd5e1'}}
              onClick={async ()=> {
                if(!images['pie']){
                  await generate()
                }
                setActiveTab('pie')
              }}
            >Camembert</button>

            <button
              className="btn"
              style={{background: activeTab==='bar'?'#0ea5e9':'#fff', color: activeTab==='bar'?'#fff':'#0f172a', borderColor:'#cbd5e1'}}
              onClick={async ()=> {
                if(!images['bar']){
                  await generate()
                }
                setActiveTab('bar')
              }}
            >Barres</button>

            <button
              className="btn"
              style={{background: activeTab==='scatter'?'#0ea5e9':'#fff', color: activeTab==='scatter'?'#fff':'#0f172a', borderColor:'#cbd5e1'}}
              onClick={async ()=> {
                if(!images['scatter']){
                  await generate()
                }
                setActiveTab('scatter')
              }}
            >Nuage de points</button>
          </div>
        </div>

        <div className="card">
          <h3>Résultat</h3>
          {err && <p style={{color:'crimson'}} className="mt-2">{err}</p>}
          {images[activeTab] ? <img className="responsive mt-3" src={images[activeTab]} alt="visualisation"/> : <p className="mt-3">Aucune image</p>}
        </div>

        <div className="card">
          <h3>Statistiques descriptives</h3>
          {stats ? (
            <div className="grid two mt-2">
              <div>
                <div className="label">Moyenne</div>
                <div>{stats.mean.toFixed(3)}</div>
              </div>
              <div>
                <div className="label">Médiane</div>
                <div>{stats.median.toFixed(3)}</div>
              </div>
              <div>
                <div className="label">Min</div>
                <div>{stats.min.toFixed(3)}</div>
              </div>
              <div>
                <div className="label">Max</div>
                <div>{stats.max.toFixed(3)}</div>
              </div>
              <div>
                <div className="label">Écart-type</div>
                <div>{stats.std.toFixed(3)}</div>
              </div>
              <div>
                <div className="label">Variance</div>
                <div>{stats.variance.toFixed(3)}</div>
              </div>
              <div>
                <div className="label">Q1</div>
                <div>{stats.q1.toFixed(3)}</div>
              </div>
              <div>
                <div className="label">Q3</div>
                <div>{stats.q3.toFixed(3)}</div>
              </div>
            </div>
          ) : <p className="mt-2">Aucune statistique disponible</p>}
        </div>
      </section>
    </div>
  )
}
