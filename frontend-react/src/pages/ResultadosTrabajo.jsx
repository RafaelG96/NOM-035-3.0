import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { psicosocialAPI, empresaAPI } from '../services/api'
import PuntajesGrid from '../components/PuntajesGrid'
import DonutChart from '../components/DonutChart'

function ResultadosTrabajo() {
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
      const response = await empresaAPI.getConFormularioBasico()
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
      const response = await psicosocialAPI.getResultadosTrabajo(id)
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

  const determinarNivelRiesgoGeneral = (puntaje) => {
    if (puntaje >= 80) return 'Muy alto'
    if (puntaje >= 70) return 'Alto'
    if (puntaje >= 45) return 'Medio'
    if (puntaje >= 20) return 'Bajo'
    return 'Nulo o despreciable'
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
      'Muy alto': 'Se requiere análisis detallado y aplicación urgente de un Programa de intervención.',
      'Alto': 'Requiere intervención estructurada y campañas de sensibilización.',
      'Medio': 'Debe revisarse la política de prevención y aplicar programas organizacionales.',
      'Bajo': 'Se recomienda mayor difusión de políticas preventivas.',
      'Nulo o despreciable': 'No se requieren medidas adicionales.'
    }
    
    return recomendaciones[nivelRiesgo] || 'No se pudo determinar una recomendación para este nivel de riesgo'
  }

  // Convertir categorías y dominios del formato de trabajo al formato de PuntajesGrid
  const convertirCategoriasADict = (categorias) => {
    if (!categorias || !Array.isArray(categorias)) return {}
    const dict = {}
    categorias.forEach(cat => {
      if (cat.nombre && cat.puntaje !== undefined) {
        dict[cat.nombre] = cat.puntaje
      }
    })
    return dict
  }

  const convertirDominiosADict = (dominios) => {
    if (!dominios || !Array.isArray(dominios)) return {}
    const dict = {}
    dominios.forEach(dom => {
      if (dom.nombre && dom.puntaje !== undefined) {
        dict[dom.nombre] = dom.puntaje
      }
    })
    return dict
  }

  // Obtener nivel de categoría/dominio para trabajo
  const obtenerNivelPorCategoriaTrabajo = (nombre, puntaje) => {
    const rangos = {
      'Ambiente de trabajo': [3, 5, 7, 9],
      'Factores propios de la actividad': [10, 20, 30, 40],
      'Organización del tiempo de trabajo': [4, 8, 9, 12],
      'Liderazgo y relaciones en el trabajo': [10, 18, 28, 38],
      'Falta de control sobre el trabajo': [5, 10, 15, 20]
    }

    const limites = rangos[nombre]
    if (!limites) return 'Nulo o despreciable'

    if (puntaje < limites[0]) return 'Nulo o despreciable'
    if (puntaje < limites[1]) return 'Bajo'
    if (puntaje < limites[2]) return 'Medio'
    if (puntaje < limites[3]) return 'Alto'
    return 'Muy alto'
  }

  const obtenerNivelPorDominioTrabajo = (nombre, puntaje) => {
    const rangos = {
      'Condiciones en el ambiente de trabajo': [3, 5, 7, 9],
      'Carga de trabajo': [12, 18, 20, 24],
      'Falta de control y autonomía sobre el trabajo': [3, 5, 7, 9],
      'Limitada o nula posibilidad de desarrollo': [1, 2, 4, 6],
      'Limitada o inexistente capacitación': [1, 2, 4, 6],
      'Jornada de trabajo': [1, 2, 4, 6],
      'Interferencia en la relación trabajo-familia': [1, 2, 4, 6],
      'Liderazgo': [3, 5, 8, 11],
      'Relaciones en el trabajo': [5, 8, 11, 14],
      'Violencia': [7, 10, 13, 16],
      // Compatibilidad con nombres antiguos
      'Falta de control sobre el trabajo': [5, 8, 11, 14]
    }

    const limites = rangos[nombre]
    if (!limites) return 'Nulo o despreciable'

    if (puntaje < limites[0]) return 'Nulo o despreciable'
    if (puntaje < limites[1]) return 'Bajo'
    if (puntaje < limites[2]) return 'Medio'
    if (puntaje < limites[3]) return 'Alto'
    return 'Muy alto'
  }

  const obtenerMaximoCategoriaTrabajo = (nombre) => {
    // Máximos según la estructura de 46 preguntas del cuestionario de Trabajo
    // Cada pregunta puede tener máximo 4 puntos
    const maximos = {
      'Ambiente de trabajo': 12, // 3 preguntas × 4 = 12
      'Factores propios de la actividad': 52, // 13 preguntas × 4 = 52 (10 básicas + 3 condicionales 41-43)
      'Organización del tiempo de trabajo': 16, // 4 preguntas × 4 = 16 (2 jornada + 2 trabajo-familia)
      'Liderazgo y relaciones en el trabajo': 76, // 19 preguntas × 4 = 76 (5 liderazgo + 6 relaciones + 8 violencia)
      'Falta de control sobre el trabajo': 28 // 7 preguntas × 4 = 28 (3 control + 2 desarrollo + 2 capacitación)
    }
    return maximos[nombre] || 50
  }

  const obtenerMaximoDominioTrabajo = (nombre) => {
    // Máximos por dominio según la estructura de 46 preguntas
    // Cada pregunta puede tener máximo 4 puntos
    const maximos = {
      'Condiciones en el ambiente de trabajo': 12, // 3 preguntas × 4 = 12
      'Carga de trabajo': 52, // 13 preguntas × 4 = 52 (10 básicas + 3 condicionales 41-43)
      'Falta de control y autonomía sobre el trabajo': 12, // 3 preguntas × 4 = 12
      'Limitada o nula posibilidad de desarrollo': 8, // 2 preguntas × 4 = 8
      'Limitada o inexistente capacitación': 8, // 2 preguntas × 4 = 8
      'Jornada de trabajo': 8, // 2 preguntas × 4 = 8
      'Interferencia en la relación trabajo-familia': 8, // 2 preguntas × 4 = 8
      'Liderazgo': 20, // 5 preguntas × 4 = 20
      'Relaciones en el trabajo': 24, // 6 preguntas × 4 = 24 (3 básicas + 3 condicionales 44-46)
      'Violencia': 32 // 8 preguntas × 4 = 32
    }
    return maximos[nombre] || 30
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-10">
          <div className="card shadow-sm">
            <div className="card-header bg-white">
              <h1 className="h4 mb-0 text-primary">
                <i className="bi bi-chart-pie me-2"></i>Resultados Formulario Trabajo
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
                    No se encontraron empresas con formularios básicos registrados.
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
                  <button className="btn btn-primary" onClick={() => navigate('/psicosocial-trabajo')}>
                    Completar Formulario
                  </button>
                </div>
              )}

              {/* Mostrar resultados si existen */}
              {!loading && resultados && resultados.data && (() => {
                const { empresa, resultados: respuestas } = resultados.data

                if (!respuestas || respuestas.length === 0) {
                  return (
                    <div className="alert alert-info">
                      <h4>No se encontraron respuestas</h4>
                      <p>No se encontraron respuestas para esta empresa.</p>
                      <button className="btn btn-primary" onClick={() => navigate('/psicosocial-trabajo')}>
                        Completar Formulario
                      </button>
                    </div>
                  )
                }

                // Calcular estadísticas
                const totalEncuestas = respuestas.length
                const ultimaFecha = respuestas.reduce((latest, respuesta) => {
                  const fechaActual = new Date(respuesta.updatedAt || respuesta.createdAt)
                  return fechaActual > latest ? fechaActual : latest
                }, new Date(0))

                const totalPuntaje = respuestas.reduce((sum, respuesta) => sum + (respuesta.puntajeTotal || 0), 0)
                const promedioPuntaje = totalEncuestas > 0 ? (totalPuntaje / totalEncuestas).toFixed(2) : 0
                const nivelRiesgoGeneral = determinarNivelRiesgoGeneral(parseFloat(promedioPuntaje))

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
                    Actualizado: {formatDate(ultimaFecha)}
                  </span>
                </div>
              </div>

              {/* Resumen de la empresa */}
              <div className="row mb-4">
                <div className="col-md-4">
                  <div className="card card-summary h-100">
                    <div className="card-body text-center py-3">
                      <div className="icon-container bg-primary bg-opacity-10">
                        <i className="bi bi-clipboard-data text-primary fs-4"></i>
                      </div>
                      <h3 className="h6 text-muted mt-1 mb-1">Total Encuestas</h3>
                      <p className="h4 text-primary mb-0 fw-bold">{totalEncuestas}/{empresa?.cantidadEmpleados || 0}</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="card card-summary h-100">
                    <div className="card-body text-center py-3">
                      <div className="icon-container bg-info bg-opacity-10">
                        <i className="bi bi-star text-info fs-4"></i>
                      </div>
                      <h3 className="h6 text-muted mt-1 mb-1">Puntaje Promedio</h3>
                      <p className="h4 text-info mb-0 fw-bold">{promedioPuntaje}</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="card card-summary h-100">
                    <div className="card-body text-center py-3">
                      <div className="icon-container bg-warning bg-opacity-10">
                        <i className="bi bi-exclamation-triangle text-warning fs-4"></i>
                      </div>
                      <h3 className="h6 text-muted mt-1 mb-1">Nivel de Riesgo</h3>
                      <p className="h4 mb-0">
                        <span className={`badge ${getBadgeClass(nivelRiesgoGeneral)}`}>
                          {nivelRiesgoGeneral}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Necesidad de acción global */}
              {nivelRiesgoGeneral && (
                <div className="mb-4">
                  <div className="card">
                    <div className="card-header bg-white">
                      <h5 className="mb-0">
                        <i className="bi bi-exclamation-circle me-2"></i>
                        Necesidad de acción según nivel de riesgo
                      </h5>
                    </div>
                    <div className="card-body">
                      <div className={`accion-riesgo ${getAlertClass(nivelRiesgoGeneral)} p-3 rounded`}>
                        <h6 className="fw-bold mb-2">Nivel de riesgo: {nivelRiesgoGeneral}</h6>
                        <p className="mb-0">{obtenerRecomendaciones(nivelRiesgoGeneral)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Lista de respuestas */}
              <div className="row">
                {respuestas.map((respuesta, index) => {
                  const categoriasDict = convertirCategoriasADict(respuesta.categorias)
                  const dominiosDict = convertirDominiosADict(respuesta.dominios)

                  return (
                    <div key={respuesta._id || index} className="col-12 mb-4">
                      <div className="card card-respuesta">
                        <div className="card-header bg-white d-flex justify-content-between align-items-center">
                          <h5 className="mb-0">
                            <i className="bi bi-clipboard-data me-2 text-primary"></i>
                            Encuesta realizada el {formatDate(respuesta.createdAt)}
                          </h5>
                          <div>
                            <span className={`badge ${getBadgeClass(respuesta.nivelRiesgo)}`}>
                              {respuesta.nivelRiesgo || 'Nulo o despreciable'}
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
                                    {Object.keys(categoriasDict).length > 0 ? (
                                      <div className="donut-chart-grid">
                                        {Object.entries(categoriasDict).map(([nombre, valor], idx) => {
                                          const maximo = obtenerMaximoCategoriaTrabajo(nombre)
                                          const nivel = obtenerNivelPorCategoriaTrabajo(nombre, valor)
                                          
                                          return (
                                            <DonutChart
                                              key={`categoria-${idx}-${nombre}`}
                                              valor={valor}
                                              maximo={maximo}
                                              nombre={nombre}
                                              nivel={nivel}
                                              tipo="categoria"
                                            />
                                          )
                                        })}
                                      </div>
                                    ) : (
                                      <p className="text-muted small">No hay datos disponibles</p>
                                    )}
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
                                    {Object.keys(dominiosDict).length > 0 ? (
                                      <div className="donut-chart-grid">
                                        {Object.entries(dominiosDict).map(([nombre, valor], idx) => {
                                          const maximo = obtenerMaximoDominioTrabajo(nombre)
                                          const nivel = obtenerNivelPorDominioTrabajo(nombre, valor)
                                          
                                          return (
                                            <DonutChart
                                              key={`dominio-${idx}-${nombre}`}
                                              valor={valor}
                                              maximo={maximo}
                                              nombre={nombre}
                                              nivel={nivel}
                                              tipo="dominio"
                                            />
                                          )
                                        })}
                                      </div>
                                    ) : (
                                      <p className="text-muted small">No hay datos disponibles</p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Acción de riesgo */}
                          <div className={`accion-riesgo mt-3 p-3 rounded ${getAlertClass(respuesta.nivelRiesgo)}`}>
                            <h6 className="fw-bold mb-2">Necesidad de acción: {respuesta.nivelRiesgo || 'Nulo o despreciable'}</h6>
                            <p className="mb-0">{respuesta.recomendaciones || obtenerRecomendaciones(respuesta.nivelRiesgo)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
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

export default ResultadosTrabajo
