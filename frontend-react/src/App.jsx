import { Routes, Route } from 'react-router-dom'
import { SpeedInsights } from '@vercel/speed-insights/react'
import Layout from './components/Layout'
import Home from './pages/Home'
import RegistroEmpresa from './pages/RegistroEmpresa'
import Login from './pages/Login'
import Intermedio from './pages/Intermedio'
import PsicosocialEntorno from './pages/PsicosocialEntorno'
import PsicosocialTrabajo from './pages/PsicosocialTrabajo'
import Traumaticos from './pages/Traumaticos'
import ResultadosEntorno from './pages/ResultadosEntorno'
import ResultadosTrabajo from './pages/ResultadosTrabajo'
import ResultadosTraumaticos from './pages/ResultadosTraumaticos'
import './App.css'

function App() {
  return (
    <>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/registro" element={<RegistroEmpresa />} />
          <Route path="/login" element={<Login />} />
          <Route path="/intermedio" element={<Intermedio />} />
          <Route path="/psicosocial-entorno" element={<PsicosocialEntorno />} />
          <Route path="/psicosocial-trabajo" element={<PsicosocialTrabajo />} />
          <Route path="/traumaticos" element={<Traumaticos />} />
          <Route path="/resultados-entorno" element={<ResultadosEntorno />} />
          <Route path="/resultados-trabajo" element={<ResultadosTrabajo />} />
          <Route path="/resultados-traumaticos" element={<ResultadosTraumaticos />} />
        </Routes>
      </Layout>
      <SpeedInsights />
    </>
  )
}

export default App
