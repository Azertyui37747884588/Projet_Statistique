import { useEffect, useMemo, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { NavLink, useLocation } from 'react-router-dom'

// Correct Leaflet default marker paths in Vite
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
})

type PredPoint = {
  lat: number
  lng: number
  probability_percent: number
  risk_category: string
}

// Fonction pour créer une icône colorée selon le risque
const getMarkerIcon = (riskCategory: string) => {
  let color = '#3b82f6' // Bleu par défaut
  
  if (riskCategory.includes('Faible')) {
    color = '#10b981' // Vert
  } else if (riskCategory.includes('modéré')) {
    color = '#f59e0b' // Orange
  } else if (riskCategory.includes('Haut')) {
    color = '#ef4444' // Rouge
  }
  
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="32" height="32">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
  </svg>`
  
  return L.icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(svg)}`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  })
}

export default function Cartographie(){
  const loc = useLocation() as any
  // Allow receiving a prediction point via navigation state
  // Debug: afficher le state reçu
  console.log('Cartographie useLocation state:', loc.state)
  const rawIncoming = loc.state?.predPoint
  // Normaliser les formes entrantes: {lat,lng} ou {latitude,longitude}
  const incoming: PredPoint | undefined = rawIncoming ? {
    lat: typeof rawIncoming.lat === 'number' ? rawIncoming.lat : (typeof rawIncoming.latitude === 'number' ? rawIncoming.latitude : 48.8566),
    lng: typeof rawIncoming.lng === 'number' ? rawIncoming.lng : (typeof rawIncoming.longitude === 'number' ? rawIncoming.longitude : 2.3522),
    probability_percent: rawIncoming.probability_percent ?? rawIncoming.probability ?? 0,
    risk_category: rawIncoming.risk_category ?? rawIncoming.risk ?? 'Inconnu'
  } : undefined

  const [points, setPoints] = useState<PredPoint[]>(incoming ? [incoming] : [])

  // Charger les points depuis le localStorage au montage
  useEffect(() => {
    if (incoming) {
      // Ajouter le nouveau point
      setPoints(prev => {
        const updated = [incoming, ...prev.filter(p => 
          !(p.lat === incoming.lat && p.lng === incoming.lng)
        )]
        localStorage.setItem('cartographie_points', JSON.stringify(updated))
        return updated
      })
    } else {
      // Restaurer les points depuis le localStorage
      try {
        const saved = localStorage.getItem('cartographie_points')
        if (saved) {
          setPoints(JSON.parse(saved))
        }
      } catch (e) {
        console.error('Erreur lecture localStorage:', e)
      }
    }
  }, [incoming])

  const center = useMemo(()=>{
    if(points.length>0){
      return [points[0].lat, points[0].lng] as [number, number]
    }
    return [48.8566, 2.3522] as [number, number] // Paris par défaut
  }, [points])

  const clearPoints = () => {
    setPoints([])
    localStorage.removeItem('cartographie_points')
  }

  return (
    <div>
      <header style={{paddingTop:8, paddingBottom:0}}>
        <h2 style={{marginBottom:4}}>Cartographie des Prédictions</h2>
        <p style={{color:'#475569'}}>Visualisez les prédictions de risque de diabète sur une carte interactive.</p>
      </header>

      {points.length === 0 ? (
        <section className="card" style={{marginTop:12, textAlign:'center', padding:'32px'}}>
          <div style={{fontSize:40}}>📍</div>
          <h3>Aucune prédiction enregistrée</h3>
          <p>Effectuez une prédiction manuelle avec vos coordonnées géographiques pour voir les résultats sur la carte.</p>
          <NavLink to="/prediction" className="btn" style={{background:'#0f172a', borderColor:'#0f172a'}}>Faire une prédiction</NavLink>
        </section>
      ) : null}

      <section className="card" style={{marginTop:12}}>
        <div style={{height: '520px', borderRadius: 8, overflow:'hidden'}}>
          <MapContainer center={center} zoom={5} style={{height:'100%', width:'100%'}}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {points.map((p, idx)=> (
              <Marker key={idx} position={[p.lat, p.lng]} icon={getMarkerIcon(p.risk_category)}>
                <Popup>
                  <div style={{padding:'8px'}}>
                    <div><strong>Risque:</strong> {p.risk_category}</div>
                    <div><strong>Probabilité:</strong> {p.probability_percent}%</div>
                    <div><strong>Coord:</strong> {p.lat.toFixed(4)}, {p.lng.toFixed(4)}</div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </section>

      <section className="card" style={{marginTop:12}}>
        <h3>Historique des prédictions</h3>
        {points.length === 0 ? (
          <p style={{color:'#475569', marginTop:12}}>Aucune prédiction enregistrée</p>
        ) : (
          <div style={{marginTop:12}}>
            <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(250px, 1fr))', gap:12}}>
              {points.map((p, idx) => (
                <div key={idx} style={{border:'1px solid #e2e8f0', borderRadius:8, padding:12, backgroundColor:'#f9fafc'}}>
                  <div style={{marginBottom:8}}>
                    <span style={{
                      display:'inline-block',
                      padding:'4px 8px',
                      borderRadius:4,
                      fontSize:'0.875rem',
                      fontWeight:500,
                      backgroundColor: p.risk_category.includes('Faible') ? '#d1fae5' : 
                                       p.risk_category.includes('modéré') ? '#fed7aa' : '#fee2e2',
                      color: p.risk_category.includes('Faible') ? '#065f46' : 
                             p.risk_category.includes('modéré') ? '#92400e' : '#7f1d1d'
                    }}>
                      {p.risk_category}
                    </span>
                  </div>
                  <div style={{fontSize:'0.875rem', color:'#475569', marginBottom:4}}>
                    <strong>Probabilité:</strong> {p.probability_percent}%
                  </div>
                  <div style={{fontSize:'0.875rem', color:'#475569', marginBottom:4}}>
                    <strong>Latitude:</strong> {p.lat.toFixed(4)}
                  </div>
                  <div style={{fontSize:'0.875rem', color:'#475569'}}>
                    <strong>Longitude:</strong> {p.lng.toFixed(4)}
                  </div>
                </div>
              ))}
            </div>
            <button 
              onClick={clearPoints}
              style={{
                marginTop:16,
                padding:'8px 16px',
                backgroundColor:'#ef4444',
                color:'white',
                border:'none',
                borderRadius:6,
                cursor:'pointer',
                fontSize:'0.875rem'
              }}
            >
              Effacer l'historique
            </button>
          </div>
        )}
      </section>

      <section className="card" style={{marginTop:12}}>
        <h3>Comment utiliser la cartographie</h3>
        <ol style={{color:'#475569'}}>
          <li>Allez sur la page "Prédiction" pour entrer vos données de santé</li>
          <li>Ajoutez vos coordonnées géographiques (latitude et longitude)</li>
          <li>Cliquez sur "Prédire" pour calculer votre risque de diabète</li>
          <li>Vous serez redirigé automatiquement vers la cartographie avec votre marqueur</li>
          <li>Les marqueurs sont colorés selon le niveau de risque: 🟢 Faible | 🟠 Modéré | 🔴 Haut</li>
          <li>Cliquez sur les marqueurs pour voir les détails des prédictions</li>
        </ol>
      </section>
    </div>
  )
}
