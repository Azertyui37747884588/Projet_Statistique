import { useState } from 'react'
import { predictManual } from '../scripts/api'
import { useNavigate } from 'react-router-dom'

export default function Prediction(){
  const navigate = useNavigate()
  const [payload, setPayload] = useState({
    age: 40,
    bmi: 25,
    systolic_bp: 120,
    glucose_fasting: 100,
    hba1c: 5.5,
    family_history: 0,
    latitude: 48.8566,
    longitude: 2.3522,
  })
  const [res, setRes] = useState<any|null>(null)
  const [err, setErr] = useState<string| null>(null)

  const onChange = (k: keyof typeof payload) => (e: any) => {
    const isBool = k === 'family_history'
    const val = isBool ? (e.target.checked ? 1 : 0) : Number(e.target.value)
    setPayload(p=>({ ...p, [k]: val }))
  }

  const onSubmit = async () => {
    try{
      const r = await predictManual({
        age: payload.age,
        bmi: payload.bmi,
        systolic_bp: payload.systolic_bp,
        glucose_fasting: payload.glucose_fasting,
        hba1c: payload.hba1c,
        family_history: payload.family_history,
        latitude: payload.latitude,
        longitude: payload.longitude,
      })
      setRes(r); setErr(null)
      // Debug: afficher la réponse reçue du backend
      console.log('predictManual response:', r)
      // Préparer le point à envoyer à la cartographie en normalisant les clés
      const point = {
        lat: typeof r.latitude === 'number' ? r.latitude : payload.latitude,
        lng: typeof r.longitude === 'number' ? r.longitude : payload.longitude,
        probability_percent: r.probability_percent ?? r.probability ?? null,
        risk_category: r.risk_category ?? r.result ?? 'Inconnu'
      }
      // Redirection automatique vers la cartographie avec le point et le risque
      console.log('navigating to /cartographie with state:', point)
      navigate('/cartographie', { state: { predPoint: point } })
    } catch(ex:any){ setErr(ex?.response?.data?.detail || 'Erreur'); setRes(null) }
  }

  return (
    <div>
      <header style={{paddingTop:8, paddingBottom:0}}>
        <h2 style={{marginBottom:4}}>Prédiction manuelle</h2>
        <p style={{color:'#475569'}}>Entrez vos données pour calculer votre risque de diabète.</p>
      </header>

      <div className="grid two" style={{marginTop:12, gap:24}}>
        {/* Section 1 : Paramètres de santé */}
        <section className="card">
          <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:12}}>
            <span style={{fontSize:24}}>⚕️</span>
            <div>
              <h3 style={{margin:'0 0 4px'}}>Paramètres de santé</h3>
              <p style={{margin:0, color:'#64748b', fontSize:'0.875rem'}}>Entrez vos données médicales</p>
            </div>
          </div>

          <div style={{display:'grid', gap:16}}>
            <div>
              <label className="label">Âge (années)</label>
              <input className="input" type="number" placeholder="Ex: 45" value={payload.age} onChange={onChange('age')}/>
            </div>
            <div>
              <label className="label">IMC (kg/m²)</label>
              <input className="input" type="number" step="0.1" placeholder="Ex: 25.5" value={payload.bmi} onChange={onChange('bmi')}/>
            </div>
            <div>
              <label className="label">Pression artérielle systolique (mmHg)</label>
              <input className="input" type="number" placeholder="Ex: 120" value={payload.systolic_bp} onChange={onChange('systolic_bp')}/>
            </div>
            <div>
              <label className="label">Glucose à jeun (mg/dL)</label>
              <input className="input" type="number" placeholder="Ex: 100" value={payload.glucose_fasting} onChange={onChange('glucose_fasting')}/>
            </div>
            <div>
              <label className="label">Insuline (μU/mL)</label>
              <input className="input" type="number" step="0.1" placeholder="Ex: 80" value={payload.hba1c} onChange={onChange('hba1c')}/>
            </div>
            <div style={{display:'flex', alignItems:'center', gap:12, padding:'12px', backgroundColor:'#f8fafc', borderRadius:8}}>
              <input id="fam" type="checkbox" checked={payload.family_history===1} onChange={onChange('family_history')} style={{cursor:'pointer'}}/>
              <label htmlFor="fam" style={{cursor:'pointer', margin:0}}>Antécédents familiaux de diabète</label>
            </div>
          </div>
        </section>

        {/* Section 2 : Localisation géographique */}
        <section className="card">
          <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:12}}>
            <span style={{fontSize:24}}>📍</span>
            <div>
              <h3 style={{margin:'0 0 4px'}}>Localisation géographique</h3>
              <p style={{margin:0, color:'#64748b', fontSize:'0.875rem'}}>Entrez vos coordonnées pour afficher votre prédiction sur la carte</p>
            </div>
          </div>

          <div style={{display:'grid', gap:16}}>
            <div>
              <label className="label">Latitude</label>
              <input className="input" type="number" step="0.0001" placeholder="Ex: 48.8566 (Paris)" value={payload.latitude} onChange={onChange('latitude')}/>
            </div>
            <div>
              <label className="label">Longitude</label>
              <input className="input" type="number" step="0.0001" placeholder="Ex: 2.3522 (Paris)" value={payload.longitude} onChange={onChange('longitude')}/>
            </div>
            <div style={{backgroundColor:'#f0f9ff', border:'1px solid #bfdbfe', borderRadius:8, padding:12}}>
              <p style={{margin:0, fontSize:'0.875rem', color:'#1e40af'}}>
                <strong>Astuce :</strong> Vous pouvez trouver vos coordonnées sur Google Maps en cliquant droit sur un emplacement et en copiant les coordonnées.
              </p>
            </div>

            <button className="btn" style={{background:'#111827', borderColor:'#111827', width:'100%', padding:'12px', fontSize:'1rem', fontWeight:500}} onClick={onSubmit}>
              Calculer le risque de diabète
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
