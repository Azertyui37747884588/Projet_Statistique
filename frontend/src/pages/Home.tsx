import { NavLink } from 'react-router-dom'

function Feature({icon, title, desc}:{icon:string; title:string; desc:string}){
  return (
    <div className="card" style={{textAlign:'center', padding:'24px'}}>
      <div style={{width:48,height:48, margin:'0 auto 12px', borderRadius:12, background:'#f1f5f9', display:'grid',placeItems:'center'}}>
        <span style={{fontSize:20}}>{icon}</span>
      </div>
      <h4 style={{margin:'8px 0 6px'}}>{title}</h4>
      <p style={{color:'#475569'}}>{desc}</p>
    </div>
  )
}

export default function Home(){
  return (
    <div className="home-page">
      {/* Hero */}
      <section style={{padding:'48px 0 24px'}}>
        <div className="container" style={{textAlign:'center'}}>
          <h1 style={{fontSize:48, lineHeight:1.05, margin:0}}>Plateforme<br/>Interactive de Tests<br/>Non Paramétriques</h1>
          <p style={{marginTop:16, fontSize:20, color:'#475569'}}>Analysez, visualisez et interprétez<br/>vos données en toute simplicité.</p>
          <div className="card" style={{maxWidth:900, margin:'24px auto 0'}}>
            <p style={{margin:0, color:'#334155'}}>Ce projet vise à concevoir une plateforme web interactive permettant d'effectuer,
              visualiser et interpréter des tests statistiques non paramétriques à partir de données réelles.</p>
          </div>
          <blockquote style={{maxWidth:900, margin:'24px auto 0', textAlign:'center', color:'#475569'}}>
            <span style={{borderLeft:'3px solid #0f172a', paddingLeft:12, display:'inline-block'}}>
              "L'intelligence sans méthode égare, la méthode sans intelligence fige ; la statistique donne l'équilibre des deux."
            </span>
          </blockquote>
          <div style={{marginTop:24}}>
            <NavLink to="/upload" className="btn">Commencer l'analyse</NavLink>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{background:'#f1f5f9', padding:'32px 0'}}>
        <div className="container">
          <h2 style={{textAlign:'center', fontSize:32, margin:'0 0 24px'}}>Fonctionnalités principales</h2>
          <div className="grid two" style={{gap:24}}>
            <Feature icon="4E4" title="Téléversement facile" desc="Importez vos fichiers CSV en quelques clics et visualisez vos données instantanément."/>
            <Feature icon="9EA" title="Tests statistiques" desc="Accédez aux tests non paramétriques : Kruskal-Wallis, Spearman, Kolmogorov-Smirnov, Friedman."/>
            <Feature icon="4C8" title="Visualisation interactive" desc="Explorez vos résultats avec des graphiques : boxplots, histogrammes et plus encore."/>
            <Feature icon="4A1" title="Interprétation automatique" desc="Obtenez des explications claires et des recommandations basées sur vos résultats."/>
            <Feature icon="" title="Résultats rapides" desc="Exécutez les analyses en quelques secondes via l'API FastAPI."/>
            <Feature icon="4C4" title="Export des données" desc="Récupérez vos sorties et figures au format image Base64 ou JSON."/>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section style={{padding:'32px 0'}}>
        <div className="container" style={{textAlign:'center'}}>
          <h3 style={{fontSize:28, margin:0}}>Prêt à analyser vos données ?</h3>
          <p style={{color:'#475569', marginTop:8}}>Commencez dès maintenant avec notre plateforme intuitive et puissante.</p>
          <div style={{display:'flex', gap:12, justifyContent:'center', marginTop:12, flexWrap:'wrap'}}>
            <NavLink to="/upload" className="btn" style={{background:'#ffffff', color:'#0f172a', borderColor:'#cbd5e1'}}>Téléverser des données</NavLink>
            <NavLink to="/tests" className="btn">Explorer les tests</NavLink>
          </div>
        </div>
      </section>

      {/* Info backend */}
      <section className="card container" style={{marginTop:12}}>
        <h4>Backend</h4>
        <p className="mt-2">Assurez-vous que le backend FastAPI tourne sur http://127.0.0.1:8000</p>
      </section>
    </div>
  )
}
