import { useEffect, useMemo, useState } from 'react'
import { getColumns, testFriedman, testKruskal, testKS, testMannWhitney, testSpearman, testChi2 } from '../scripts/api'
import type { Columns } from '../types'

function Result({data}:{data:any}){
  if(!data) return <p>Aucun résultat</p>
  // Spearman
  if(data.test === 'spearman' || data.test === 'spearman_corr'){
    const corr = (data.correlation ?? data.rho ?? 0)
    const p = data.p_value ?? data.p ?? 1
    const n = data.n ?? data.sample_size ?? 0
    const interp = data.interpretation ?? (p < 0.05 ? 'significatif' : 'non significatif')
    return (
      <div>
        <div style={{display:'flex', gap:24}}>
          <div>
            <div className="label">Coefficient rho</div>
            <div style={{fontSize:28, fontWeight:700}}>{corr.toFixed(4)}</div>
          </div>
          <div>
            <div className="label">Valeur p</div>
            <div style={{fontSize:28, fontWeight:700}}>{p.toExponential ? p.toExponential(4) : Number(p).toFixed(4)}</div>
          </div>
          <div>
            <div className="label">Taille échantillon</div>
            <div style={{fontSize:28, fontWeight:700}}>{n}</div>
          </div>
          <div style={{alignSelf:'center'}}>
            <div style={{background:'#111827', color:'white', padding:'6px 10px', borderRadius:8}}>{interp}</div>
          </div>
        </div>
        {data.note || data.details ? (
          <div style={{marginTop:12, color:'#475569'}}>
            <strong>Détails:</strong>
            <div>{data.note || data.details}</div>
          </div>
        ) : null}
      </div>
    )
  }

  // Mann-Whitney / KS / Kruskal / Friedman (generic)
  const p = data.p_value ?? data.p ?? null
  const stat = data.statistic ?? data.stat ?? null
  const interp = data.interpretation ?? (p !== null ? (p < 0.05 ? 'significatif' : 'non significatif') : '')
  return (
    <div>
      <div style={{display:'flex', gap:24}}>
        <div>
          <div className="label">Statistique</div>
          <div style={{fontSize:24, fontWeight:700}}>{stat ?? '-'}</div>
        </div>
        <div>
          <div className="label">Valeur p</div>
          <div style={{fontSize:24, fontWeight:700}}>{p !== null ? (p.toExponential ? p.toExponential(4) : Number(p).toFixed(4)) : '-'}</div>
        </div>
        <div>
          <div className="label">Taille</div>
          <div style={{fontSize:24, fontWeight:700}}>{data.n ?? data.total_n ?? data.n1 ?? '-'}</div>
        </div>
        <div style={{alignSelf:'center'}}>
          <div style={{background:'#111827', color:'white', padding:'6px 10px', borderRadius:8}}>{interp}</div>
        </div>
      </div>
      {data.note || data.details ? (
        <div style={{marginTop:12, color:'#475569'}}>
          <strong>Détails:</strong>
          <div>{data.note || data.details}</div>
        </div>
      ) : null}
    </div>
  )
}

type TestKey = 'spearman'|'friedman'|'kruskal'|'ks'|'mannwhitney'|'chi2'

const TEST_LABELS: Record<TestKey, string> = {
  spearman: 'Spearman',
  friedman: 'Friedman',
  kruskal: 'Kruskal-Wallis',
  ks: 'Kolmogorov-Smirnov',
  mannwhitney: 'Mann-Whitney'
  , chi2: 'Chi² de Pearson'
}

const TEST_DESC: Record<TestKey, string> = {
  spearman: "Corrélation de Spearman entre deux variables numériques.",
  friedman: "Test de Friedman pour données appariées (au moins trois mesures).",
  kruskal: "Test de Kruskal-Wallis pour comparer des groupes indépendants.",
  ks: "Test Kolmogorov-Smirnov pour comparer deux distributions.",
  mannwhitney: "Test de Mann-Whitney pour comparer deux échantillons indépendants."
  , chi2: "Test du Chi² d'indépendance entre deux variables catégorielles."
}

export default function Tests(){
  const [columns, setColumns] = useState<Columns|null>(null)
  const [active, setActive] = useState<TestKey>('spearman')
  const [res, setRes] = useState<any|null>(null)
  const [err, setErr] = useState<string| null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(()=>{ (async()=> setColumns(await getColumns()))().catch(()=>{}) },[])

  const options = useMemo(()=> {
    if(!columns) return []
    if(active === 'chi2') return columns.categorical ?? []
    return columns.numeric ?? []
  }, [columns, active])

  const run = async () => {
    const v1 = (document.getElementById('v1') as HTMLSelectElement).value
    const v2 = (document.getElementById('v2') as HTMLSelectElement).value
    if(!v1||!v2){ setErr(active === 'chi2' ? 'Veuillez choisir deux variables catégorielles' : 'Veuillez choisir deux variables numériques'); return }
    setLoading(true); setErr(null)
    try {
      switch(active){
        case 'spearman': setRes(await testSpearman(v1, v2)); break
        case 'mannwhitney': setRes(await testMannWhitney(v1, v2)); break
        case 'kruskal': setRes(await testKruskal(v1, v2)); break
        case 'ks': setRes(await testKS(v1, v2)); break
        case 'friedman': setRes(await testFriedman(v1, v2)); break
        case 'chi2': setRes(await testChi2(v1, v2)); break
      }
    } catch(ex:any){ setErr(ex?.response?.data?.detail || 'Erreur') }
    finally { setLoading(false) }
  }

  return (
    <div>
      <header className="container" style={{paddingTop:8, paddingBottom:0}}>
        <h2 style={{marginBottom:4}}>Tests statistiques non paramétriques</h2>
        <p style={{color:'#475569'}}>Sélectionnez un test et entrez vos données pour obtenir des résultats instantanés.</p>
      </header>

      <section className="container card" style={{marginTop:12}}>
        <h3 style={{display:'flex', alignItems:'center', gap:8}}>Choisissez votre test</h3>
        <p className="mt-2" style={{color:'#64748b'}}>Chaque test est adapté à des situations spécifiques. Consultez la description pour choisir le bon test.</p>

        <div className="grid two mt-2" style={{gap:12}}>
          <div className="card" style={{padding:0, overflow:'hidden'}}>
            {(['spearman','friedman'] as TestKey[]).map(k=> (
              <button key={k} className="input" style={{border:'none', borderRadius:0, textAlign:'left', padding:'12px 14px', background: active===k? '#e2e8f0':'#fff'}} onClick={()=> setActive(k)}>{TEST_LABELS[k]}</button>
            ))}
          </div>
          <div className="card" style={{padding:0, overflow:'hidden'}}>
            {(['kruskal','ks','mannwhitney','chi2'] as TestKey[]).map(k=> (
              <button key={k} className="input" style={{border:'none', borderRadius:0, textAlign:'left', padding:'12px 14px', background: active===k? '#e2e8f0':'#fff'}} onClick={()=> setActive(k)}>{TEST_LABELS[k]}</button>
            ))}
          </div>
        </div>

        <div className="card mt-3">
          <h4 style={{margin:'4px 0'}}>Test de {TEST_LABELS[active]}</h4>
          <p style={{color:'#64748b', margin:0}}>{TEST_DESC[active]}</p>
        </div>

        <div className="mt-3">
          <h4>Sélectionnez vos variables</h4>
          <p style={{color:'#64748b', marginTop:4}}>Choisissez deux variables à comparer</p>
          <div className="grid two mt-2">
            <div>
              <label className="label">Variable 1</label>
              <select id="v1" className="input">
                <option value="">Sélectionnez une variable</option>
                {options.map(c=> <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Variable 2</label>
              <select id="v2" className="input">
                <option value="">Sélectionnez une variable</option>
                {options.map(c=> <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="mt-3">
            <button className="btn" style={{width:'100%', background:'#0f172a', borderColor:'#0f172a'}} onClick={run} disabled={loading}>{loading? 'Calcul en cours...' : 'Calculer le test'}</button>
          </div>
          {err && <p style={{color:'crimson'}} className="mt-2">{err}</p>}
        </div>
      </section>

      <section className="container card" style={{marginTop:12}}>
        <h3>Résultat</h3>
        {res ? <Result data={res}/> : <p className="mt-2">Aucun résultat</p>}
      </section>
    </div>
  )
}
