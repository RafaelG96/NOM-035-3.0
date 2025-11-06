import { useState, useEffect } from 'react'
import { traumaAPI } from '../services/api'

function ResultadosTraumaticos() {
  const [loading, setLoading] = useState(false)
  const [loadingEmpresas, setLoadingEmpresas] = useState(true)
  const [resultados, setResultados] = useState([])
  const [empresas, setEmpresas] = useState([])
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState('')
  const [mostrarTodos, setMostrarTodos] = useState(false)

  useEffect(() => {
    loadEmpresas()
  }, [])

  useEffect(() => {
    if (mostrarTodos) {
      loadTodosResultados()
    } else if (empresaSeleccionada) {
      loadResultados(empresaSeleccionada)
    } else {
      setResultados([])
    }
  }, [empresaSeleccionada, mostrarTodos])

  const loadEmpresas = async () => {
    try {
      setLoadingEmpresas(true)
      const response = await traumaAPI.getEmpresas()
      if (response.data && response.data.data) {
        setEmpresas(response.data.data)
      } else if (response.data && Array.isArray(response.data)) {
        setEmpresas(response.data)
      }
    } catch (error) {
      console.error('Error al cargar empresas:', error)
      // Si no hay empresas, mostrar mensaje pero no error fatal
      if (error.response?.status !== 404) {
        alert('Error al cargar las empresas: ' + (error.message || 'Error desconocido'))
      }
    } finally {
      setLoadingEmpresas(false)
    }
  }

  const loadResultados = async (empresaNombre) => {
    if (!empresaNombre) return
    
    try {
      setLoading(true)
      const response = await traumaAPI.getResultados(empresaNombre)
      if (response.data && response.data.data) {
        setResultados(response.data.data)
      } else if (response.data && Array.isArray(response.data)) {
        setResultados(response.data)
      } else {
        setResultados([])
      }
    } catch (error) {
      console.error('Error al cargar resultados:', error)
      alert('Error al cargar los resultados: ' + (error.message || 'Error desconocido'))
      setResultados([])
    } finally {
      setLoading(false)
    }
  }

  const loadTodosResultados = async () => {
    try {
      setLoading(true)
      // Obtener todos los resultados sin filtrar por empresa
      const response = await traumaAPI.getResultados()
      if (response.data && response.data.data) {
        setResultados(response.data.data)
      } else if (response.data && Array.isArray(response.data)) {
        setResultados(response.data)
      } else {
        setResultados([])
      }
    } catch (error) {
      console.error('Error al cargar todos los resultados:', error)
      alert('Error al cargar los resultados: ' + (error.message || 'Error desconocido'))
      setResultados([])
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    if (isNaN(date)) return '--/--/----'
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">Resultados de Eventos Traumáticos</h1>
      </div>

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h5 className="card-title mb-3">
            <i className="bi bi-funnel me-2"></i>
            Filtrar Resultados
          </h5>
          
          <div className="row g-3">
            <div className="col-md-6">
              <label htmlFor="empresaSelect" className="form-label">
                Seleccionar empresa (opcional)
              </label>
              <select
                id="empresaSelect"
                className="form-select"
                value={empresaSeleccionada}
                onChange={(e) => {
                  setEmpresaSeleccionada(e.target.value)
                  setMostrarTodos(false)
                }}
                disabled={loadingEmpresas}
              >
                <option value="">-- Seleccione una empresa --</option>
                {empresas.map((empresa, index) => (
                  <option key={index} value={empresa}>
                    {empresa}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-6 d-flex align-items-end">
              <button
                type="button"
                className={`btn ${mostrarTodos ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => {
                  setMostrarTodos(true)
                  setEmpresaSeleccionada('')
                }}
                disabled={loading}
              >
                <i className="bi bi-list-ul me-2"></i>
                Mostrar Todos los Resultados
              </button>
            </div>
          </div>
        </div>
      </div>

      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      )}

      {!loading && resultados.length === 0 && (empresaSeleccionada || mostrarTodos) && (
        <div className="alert alert-info">
          <h5>
            <i className="bi bi-info-circle me-2"></i>
            No hay resultados disponibles
          </h5>
          <p className="mb-0">
            {empresaSeleccionada 
              ? `No se encontraron resultados para la empresa "${empresaSeleccionada}".`
              : 'No se encontraron resultados en el sistema.'}
          </p>
        </div>
      )}

      {!loading && resultados.length > 0 && (
        <div className="card shadow-sm">
          <div className="card-header bg-primary text-white">
            <h5 className="mb-0">
              <i className="bi bi-clipboard-data me-2"></i>
              Resultados ({resultados.length} {resultados.length === 1 ? 'encuesta' : 'encuestas'})
            </h5>
          </div>
          <div className="card-body">
            <div className="row">
              {resultados.map((resultado, index) => (
                <div key={resultado._id || index} className="col-12 mb-4">
                  <div className="card">
                    <div className="card-header bg-light d-flex justify-content-between align-items-center">
                      <h6 className="mb-0">
                        <i className="bi bi-calendar me-2"></i>
                        Encuesta realizada el {formatDate(resultado.createdAt)}
                      </h6>
                      <div>
                        <span className="badge bg-info me-2">
                          {resultado.empresa || 'Sin especificar'}
                        </span>
                        <span className="badge bg-secondary">
                          {resultado.identificadorAnonimo}
                        </span>
                      </div>
                    </div>
                    <div className="card-body">
                      <h6 className="mb-3">Respuestas del formulario</h6>
                      <div className="table-responsive">
                        <table className="table table-sm table-hover">
                          <thead>
                            <tr>
                              <th>Pregunta</th>
                              <th>Respuesta</th>
                            </tr>
                          </thead>
                          <tbody>
                            {resultado.respuestas && resultado.respuestas.map((respuesta, rIndex) => (
                              <tr key={rIndex}>
                                <td className="fw-bold">{respuesta.pregunta}</td>
                                <td>
                                  <span className={`badge ${respuesta.respuesta === 'si' ? 'bg-danger' : 'bg-success'}`}>
                                    {respuesta.respuesta === 'si' ? 'Sí' : 'No'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {resultado.requiereEvaluacion && (
                        <div className="mt-3">
                          <h6 className="text-warning">
                            <i className="bi bi-exclamation-triangle me-2"></i>
                            Requiere Evaluación
                          </h6>
                          <ul className="list-group">
                            {resultado.razonesEvaluacion && resultado.razonesEvaluacion.map((razon, rIndex) => (
                              <li key={rIndex} className="list-group-item">
                                {razon}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {!resultado.requiereEvaluacion && (
                        <div className="mt-3">
                          <span className="badge bg-success">
                            <i className="bi bi-check-circle me-2"></i>
                            No requiere evaluación
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {!loading && !empresaSeleccionada && !mostrarTodos && (
        <div className="alert alert-light border">
          <h5>
            <i className="bi bi-info-circle me-2"></i>
            Seleccione una empresa o muestre todos los resultados
          </h5>
          <p className="mb-0">
            Para ver los resultados, seleccione una empresa del menú desplegable o haga clic en "Mostrar Todos los Resultados".
          </p>
        </div>
      )}
    </div>
  )
}

export default ResultadosTraumaticos
