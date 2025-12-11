import { useEffect, useState } from 'react'
import { getColumns, getPreview, setTarget, uploadCSV } from '../scripts/api'
import type { Columns } from '../types'

export default function Upload(){
  const [file, setFile] = useState<File|null>(null)
  const [columns, setColumns] = useState<Columns|null>(null)
  const [preview, setPreview] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string| null>(null)
  const [drag, setDrag] = useState(false)

  const refresh = async () => {
    try {
      const cols = await getColumns();
      setColumns(cols)
      const prev = await getPreview(10)
      setPreview(prev.head || [])
    } catch(e){ /* ignore until data uploaded */ }
  }

  useEffect(()=>{ refresh() },[])

  const onUpload = async () => {
    if(!file) return
    setLoading(true); setError(null)
    try {
      const res = await uploadCSV(file)
      await refresh()
    } catch(e: any){ setError(e?.response?.data?.detail || 'Erreur upload') }
    finally { setLoading(false) }
  }

  const onSetTarget = async (t: string) => {
    await setTarget(t || null)
    await refresh()
  }

  return (
    <div>
      <header className="container" style={{paddingTop:8, paddingBottom:0}}>
        <h2 style={{marginBottom:4}}>Téléversement de données</h2>
        <p style={{color:'#475569'}}>Importez vos fichiers CSV pour commencer l'analyse statistique.</p>
      </header>

      <section className="container card" style={{marginTop:12}}>
        <h3>Importer un fichier</h3>
        <p className="mt-2" style={{color:'#475569'}}>Formats acceptés : CSV (max 10 MB)</p>

        <div
          className={`dropzone mt-3 ${drag? 'drag':''}`}
          onDragOver={e=>{ e.preventDefault(); setDrag(true) }}
          onDragLeave={()=> setDrag(false)}
          onDrop={e=>{ e.preventDefault(); setDrag(false); if(e.dataTransfer.files?.length){ setFile(e.dataTransfer.files[0]) } }}
        >
          <div style={{textAlign:'center'}}>
            <div style={{width:56, height:56, borderRadius:28, background:'#f1f5f9', display:'grid', placeItems:'center', margin:'0 auto 8px'}}>⬆️</div>
            <div style={{fontWeight:600}}>Glissez-déposez votre fichier ici</div>
            <div style={{color:'#64748b'}}>ou cliquez pour parcourir</div>
            <div className="mt-2">
              <label className="btn" style={{background:'#0f172a', borderColor:'#0f172a'}}>
                Sélectionner un fichier
                <input type="file" accept=".csv" style={{display:'none'}} onChange={e=>setFile(e.target.files?.[0]||null)} />
              </label>
              {file && <span className="badge" style={{marginLeft:8}}>{file.name}</span>}
            </div>
          </div>
        </div>

        <div className="mt-3">
          <button className="btn" onClick={onUpload} disabled={loading || !file}>{loading? 'Téléversement...' : 'Envoyer'}</button>
          {error && <p style={{color:'crimson'}} className="mt-2">{error}</p>}
        </div>

        {columns && columns.all?.length>0 && (
          <div className="mt-4">
            <label className="label">Cible (optionnelle)</label>
            <select className="input" value={columns.target||''} onChange={e=>onSetTarget(e.target.value)}>
              <option value="">(aucune)</option>
              {columns.all.map(c=> <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        )}
      </section>

      {preview && preview.length > 0 ? (
        <section className="container card" style={{marginTop:12}}>
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
            <div>
              <h3 style={{marginBottom:4}}>Aperçu des données</h3>
              <div style={{color:'#475569'}}>Affichage des 10 premières lignes</div>
            </div>
            <div>
              <span className="badge">{columns?.all?.length || 0} colonnes</span>
            </div>
          </div>
          <div className="mt-3" style={{overflow:'auto', maxHeight: 420}}>
            <table className="table">
              <thead>
                <tr>
                  {preview[0] && Object.keys(preview[0]).map(k=> <th key={k}>{k}</th>)}
                </tr>
              </thead>
              <tbody>
                {preview.map((row, i)=> (
                  <tr key={i}>
                    {Object.entries(row).map(([k, v])=> <td key={k}>{String(v)}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        <section className="container card" style={{marginTop:12}}>
          <h3>Aperçu des données</h3>
          <p style={{color:'#475569'}}>Aucun aperçu disponible — téléversez un fichier pour afficher un aperçu automatique.</p>
        </section>
      )}
    </div>
  )
}
