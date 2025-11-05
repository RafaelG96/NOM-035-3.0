import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { traumaAPI } from '../services/api'

function ResultadosTraumaticos() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [resultados, setResultados] = useState(null)
  const [empresaId] = useState(localStorage.getItem('empresaId'))

  useEffect(() => {
    if (!empresaId) {
      navigate('/intermedio')
      return
    }

    loadResultados()
  }, [empresaId, navigate])

  const loadResultados = async () => {
    try {
      const empresaNombre = localStorage.getItem('empresaNombre')
      if (!empresaNombre) {
        alert('No se encontró el nombre de la empresa')
        setLoading(false)
        return
      }
      
      const response = await traumaAPI.getResultados(empresaNombre)
      setResultados(response.data)
    } catch (error) {
      console.error('Error al cargar resultados:', error)
      alert('Error al cargar los resultados')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    )
  }

  if (!resultados) {
    return (
      <div className="container py-5">
        <div className="alert alert-warning">
          <h4>No hay resultados disponibles</h4>
          <p>No se encontraron resultados para esta empresa.</p>
          <button className="btn btn-primary" onClick={() => navigate('/traumaticos')}>
            Completar Formulario
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-5">
      <h1 className="mb-4">Resultados de Eventos Traumáticos</h1>
      <div className="card shadow">
        <div className="card-body">
          <h5 className="card-title">Resultados del Cuestionario</h5>
          <pre className="bg-light p-3 rounded">
            {JSON.stringify(resultados, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}

export default ResultadosTraumaticos

