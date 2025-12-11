import { NavLink, Route, Routes } from 'react-router-dom'
import Home from '../pages/Home'
import Upload from '../pages/Upload'
import Visualisation from '../pages/Visualisation'
import Tests from '../pages/Tests'
import Prediction from '../pages/Prediction'
import Cartographie from '../pages/Cartographie'
import logo from '../assets/logo.svg'

export default function App() {
  return (
    <div>
      <nav className="topbar">
        <div className="inner container">
          <div style={{display:'flex', alignItems:'center', gap:12}}>
            <img src={logo} alt="logo" width={28} height={28} />
            <strong>TTK StatTestIA</strong>
          </div>
          <div>
            <NavLink to="/" end>Accueil</NavLink>
            <NavLink to="/upload">Données</NavLink>
            <NavLink to="/visualisation">Visualisation</NavLink>
            <NavLink to="/tests">Tests</NavLink>
            <NavLink to="/prediction">Prédiction</NavLink>
            <NavLink to="/cartographie">Cartographie</NavLink>
          </div>
        </div>
      </nav>
      <main className="container">
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/upload" element={<Upload/>} />
          <Route path="/visualisation" element={<Visualisation/>} />
          <Route path="/tests" element={<Tests/>} />
          <Route path="/prediction" element={<Prediction/>} />
          <Route path="/cartographie" element={<Cartographie/>} />
        </Routes>
      </main>
    </div>
  )
}
