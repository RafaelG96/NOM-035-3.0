import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { psicosocialAPI, empresaAPI } from '../services/api'
import PuntajesGrid from '../components/PuntajesGrid'

function ResultadosEntorno() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [loadingEmpresas, setLoadingEmpresas] = useState(true)
  const [resultados, setResultados] = useState(null)
  const [empresas, setEmpresas] = useState([])
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState('')
  const [empresaId] = useState(localStorage.getItem('empresaId'))

  useEffect(() => {
    loadEmpresas()
    // Si hay empresaId en localStorage, usarlo como selección predeterminada
    if (empresaId) {
      setEmpresaSeleccionada(empresaId)
      loadResultados(empresaId)
    }
  }, [])

  useEffect(() => {
    if (empresaSeleccionada) {
      loadResultados(empresaSeleccionada)
    } else {
      setResultados(null)
    }
  }, [empresaSeleccionada])

  const loadEmpresas = async () => {
    try {
      setLoadingEmpresas(true)
      const response = await empresaAPI.getConFormularioCompleto()
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

  const loadResultados = async (id) => {
    if (!id) return
    
    try {
      setLoading(true)
      const response = await psicosocialAPI.getResultadosEntorno(id)
      setResultados(response.data)
    } catch (error) {
      console.error('Error al cargar resultados:', error)
      setResultados(null)
      if (error.response?.status !== 404) {
        alert('Error al cargar los resultados: ' + (error.message || 'Error desconocido'))
      }
    } finally {
      setLoading(false)
    }
  }

  const handleEmpresaChange = (e) => {
    const selectedId = e.target.value
    setEmpresaSeleccionada(selectedId)
    if (selectedId) {
      localStorage.setItem('empresaId', selectedId)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return '--/--/----'
    const date = new Date(dateString)
    return date.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const getBadgeClass = (nivel) => {
    if (!nivel) return 'bg-secondary'
    const lower = nivel.toLowerCase()
    if (lower.includes('muy alto')) return 'bg-danger'
    if (lower.includes('alto')) return 'bg-warning'
    if (lower.includes('medio')) return 'bg-warning text-dark'
    if (lower.includes('bajo')) return 'bg-success'
    return 'bg-secondary'
  }

  const getAlertClass = (nivel) => {
    if (!nivel) return 'bg-secondary'
    const lower = nivel.toLowerCase()
    if (lower.includes('muy alto') || lower.includes('alto')) return 'bg-danger text-white'
    if (lower.includes('medio')) return 'bg-warning text-dark'
    if (lower.includes('bajo')) return 'bg-success text-white'
    return 'bg-secondary text-white'
  }

  const obtenerRecomendaciones = (nivelRiesgo) => {
    const recomendaciones = {
      'Muy alto': 'Se requiere realizar el análisis de cada categoría y dominio para establecer las acciones de intervención apropiadas, mediante un Programa de intervención que deberá incluir evaluaciones específicas. Y contemplar campañas de sensibilización, revisar la política de prevención de riesgos psicosociales y programas para la prevención de los factores de riesgo psicosocial, la promoción de un entorno organizacional favorable y la prevención de la violencia laboral, así como reforzar su aplicación y difusión.',
      'Alto': 'Se requiere realizar un análisis de cada categoría y dominio, de manera que se puedan determinar las acciones de intervención apropiadas a través de un Programa de intervención, que podrá incluir una evaluación específica y deberá incluir una campaña de sensibilización, revisar la política de prevención de riesgos psicosociales y programas para la prevención de los factores de riesgo psicosocial, la promoción de un entorno organizacional favorable y la prevención de la violencia laboral, así como reforzar su aplicación y difusión.',
      'Medio': 'Se requiere revisar la política de prevención de riesgos psicosociales y programas para la prevención de los factores de riesgo psicosocial, la promoción de un entorno organizacional favorable y la prevención de la violencia laboral, así como reforzar su aplicación y difusión, mediante un Programa de intervención.',
      'Bajo': 'Es necesario una mayor difusión de la política de prevención de riesgos psicosociales y programas para la prevención de los factores de riesgo psicosocial, la promoción de un entorno organizacional favorable y la prevención de la violencia laboral.',
      'Nulo': 'El riesgo resulta despreciable por lo que no se requiere medidas adicionales.'
    }
    
    return recomendaciones[nivelRiesgo] || 'No se pudo determinar una recomendación para este nivel de riesgo'
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-10">
          <div className="card shadow-sm">
            <div className="card-header bg-white">
              <h1 className="h4 mb-0 text-primary">
                <i className="bi bi-chart-pie me-2"></i>Resultados de Encuestas - Entorno
              </h1>
            </div>
            <div className="card-body">
              {/* Selector de empresa */}
              <div className="mb-4">
                <label htmlFor="empresaSelect" className="form-label fw-bold">Seleccione una empresa:</label>
                {loadingEmpresas ? (
                  <div className="text-center py-3">
                    <div className="spinner-border spinner-border-sm text-primary" role="status">
                      <span className="visually-hidden">Cargando empresas...</span>
                    </div>
                    <p className="mt-2 text-muted small">Cargando empresas disponibles...</p>
                  </div>
                ) : (
                  <select
                    id="empresaSelect"
                    className="form-select form-select-lg"
                    value={empresaSeleccionada}
                    onChange={handleEmpresaChange}
                  >
                    <option value="" disabled>-- Seleccione una empresa --</option>
                    {empresas.map((empresa) => (
                      <option key={empresa._id} value={empresa._id}>
                        {empresa.nombreEmpresa} ({empresa.cantidadEmpleados} empleados)
                      </option>
                    ))}
                  </select>
                )}
                {!loadingEmpresas && empresas.length === 0 && (
                  <div className="alert alert-info mt-3">
                    <i className="bi bi-info-circle me-2"></i>
                    No se encontraron empresas con formularios completos registrados.
                  </div>
                )}
              </div>

              {/* Loading de resultados */}
              {loading && empresaSeleccionada && (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                  </div>
                  <p className="mt-3 text-muted">Buscando datos, un momento por favor...</p>
                </div>
              )}

              {/* Resultados */}
              {!loading && empresaSeleccionada && (!resultados || !resultados.data) && (
                <div className="alert alert-warning">
                  <h4>No hay resultados disponibles</h4>
                  <p>No se encontraron resultados para esta empresa.</p>
                  <button className="btn btn-primary" onClick={() => navigate('/psicosocial-entorno')}>
                    Completar Formulario
                  </button>
                </div>
              )}

              {/* Mostrar resultados si existen */}
              {!loading && resultados && resultados.data && (() => {
                const { empresa, respuestas, resumen } = resultados.data

                if (!respuestas || respuestas.length === 0) {
                  return (
                    <div className="alert alert-info">
                      <h4>No se encontraron respuestas</h4>
                      <p>No se encontraron respuestas para esta empresa.</p>
                      <button className="btn btn-primary" onClick={() => navigate('/psicosocial-entorno')}>
                        Completar Formulario
                      </button>
                    </div>
                  )
                }

                return (
                  <div>
                    {/* Información de la empresa */}
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="h5 mb-0">
                  <i className="bi bi-building me-2"></i>
                  Resultados para: <span className="text-primary">{empresa?.nombreEmpresa || 'Empresa no especificada'}</span>
                </h2>
                <div>
                  <span className="badge bg-info text-dark">
                    <i className="bi bi-clock me-1"></i>
                    Actualizado: {formatDate(resumen?.ultimaActualizacion)}
                  </span>
                </div>
              </div>

              {/* Resumen de la empresa */}
              <div className="row mb-4">
                <div className="col-md-3">
                  <div className="card card-summary h-100">
                    <div className="card-body text-center py-3">
                      <div className="icon-container bg-primary bg-opacity-10">
                        <i className="bi bi-clipboard-data text-primary fs-4"></i>
                      </div>
                      <h3 className="h6 text-muted mt-1 mb-1">Total Encuestas</h3>
                      <p className="h4 text-primary mb-0 fw-bold">{resumen?.progreso || '0/0'}</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card card-summary h-100">
                    <div className="card-body text-center py-3">
                      <div className="icon-container bg-info bg-opacity-10">
                        <i className="bi bi-star text-info fs-4"></i>
                      </div>
                      <h3 className="h6 text-muted mt-1 mb-1">Puntaje Promedio</h3>
                      <p className="h4 text-info mb-0 fw-bold">{resumen?.puntajePromedio || 0}</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card card-summary h-100">
                    <div className="card-body text-center py-3">
                      <div className="icon-container bg-warning bg-opacity-10">
                        <i className="bi bi-exclamation-triangle text-warning fs-4"></i>
                      </div>
                      <h3 className="h6 text-muted mt-1 mb-1">Nivel de Riesgo</h3>
                      <p className="h4 mb-0">
                        <span className={`badge ${getBadgeClass(resumen?.nivelRiesgo)}`}>
                          {resumen?.nivelRiesgo || 'Nulo'}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card card-summary h-100">
                    <div className="card-body text-center py-3">
                      <div className="icon-container bg-success bg-opacity-10">
                        <i className="bi bi-calendar text-success fs-4"></i>
                      </div>
                      <h3 className="h6 text-muted mt-1 mb-1">Última Actualización</h3>
                      <p className="small mb-0">{formatDate(resumen?.ultimaActualizacion)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Necesidad de acción global */}
              {resumen?.nivelRiesgo && (
                <div className="mb-4">
                  <div className="card">
                    <div className="card-header bg-white">
                      <h5 className="mb-0">
                        <i className="bi bi-exclamation-circle me-2"></i>
                        Necesidad de acción según nivel de riesgo
                      </h5>
                    </div>
                    <div className="card-body">
                      <div className={`accion-riesgo ${getAlertClass(resumen.nivelRiesgo)} p-3 rounded`}>
                        <h6 className="fw-bold mb-2">Nivel de riesgo: {resumen.nivelRiesgo}</h6>
                        <p className="mb-0">{obtenerRecomendaciones(resumen.nivelRiesgo)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Lista de respuestas */}
              <div className="row">
                {respuestas.map((respuesta, index) => (
                  <div key={respuesta._id || index} className="col-12 mb-4">
                    <div className="card card-respuesta">
                      <div className="card-header bg-white d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">
                          <i className="bi bi-clipboard-data me-2 text-primary"></i>
                          Encuesta realizada el {formatDate(respuesta.createdAt)}
                        </h5>
                        <div>
                          <span className={`badge ${getBadgeClass(respuesta.nivelRiesgo)}`}>
                            {respuesta.nivelRiesgo || 'Nulo'}
                          </span>
                          <span className="puntaje-display ms-2">
                            <i className="bi bi-star text-warning"></i> {respuesta.puntajeTotal || '0'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="card-body">
                        <div className="container">
                          <div className="row justify-content-center">
                            {/* Categorías */}
                            <div className="col-md-6 mb-4">
                              <div className="card">
                                <div className="card-header bg-light">
                                  <h6 className="mb-0 text-center">
                                    <i className="bi bi-layers me-2"></i>Puntajes por Categoría
                                  </h6>
                                </div>
                                <div className="card-body">
                                  <PuntajesGrid 
                                    puntajes={respuesta.puntajesPorCategoria} 
                                    tipo="categoria"
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Dominios */}
                            <div className="col-md-6 mb-4">
                              <div className="card">
                                <div className="card-header bg-light">
                                  <h6 className="mb-0 text-center">
                                    <i className="bi bi-diagram-3 me-2"></i>Puntajes por Dominio
                                  </h6>
                                </div>
                                <div className="card-body">
                                  <PuntajesGrid 
                                    puntajes={respuesta.puntajesPorDominio} 
                                    tipo="dominio"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Acción de riesgo */}
                        <div className={`accion-riesgo mt-3 p-3 rounded ${getAlertClass(respuesta.nivelRiesgo)}`}>
                          <h6 className="fw-bold mb-2">Necesidad de acción: {respuesta.nivelRiesgo || 'Nulo'}</h6>
                          <p className="mb-0">{respuesta.recomendacion || obtenerRecomendaciones(respuesta.nivelRiesgo)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
                  </div>
                )
              })()}

              <div className="mt-4 text-center">
                <button className="btn btn-outline-primary" onClick={() => navigate('/')}>
                  <i className="bi bi-arrow-left me-2"></i>Volver al inicio
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResultadosEntorno
