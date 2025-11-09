import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { psicosocialAPI, empresaAPI } from '../services/api'
import PuntajesGrid from '../components/PuntajesGrid'
import LoginResultados from '../components/LoginResultados'
import jsPDF from 'jspdf'
import * as XLSX from 'xlsx'

const infoCategoriasEntorno = {
  'Ambiente de trabajo': 'Condiciones físicas y ambientales en el centro de trabajo (iluminación, ruido, higiene).',
  'Factores propios de la actividad': 'Características de las tareas como esfuerzo mental, responsabilidad y complejidad.',
  'Organización del tiempo de trabajo': 'Distribución de jornadas, turnos, horas extra y balance vida-trabajo.',
  'Liderazgo y relaciones en el trabajo': 'Calidad del liderazgo, apoyo de jefes y colaboración entre compañeros.',
  'Entorno organizacional': 'Prácticas de reconocimiento, sentido de pertenencia y comunicación institucional.'
}

const infoDominiosEntorno = {
  'Condiciones en el ambiente de trabajo': 'Aspectos físicos que pueden generar riesgos o incomodidad.',
  'Carga de trabajo': 'Cantidad de tareas, ritmo y presión por resultados.',
  'Falta de control y autonomía sobre el trabajo': 'Grado de participación y decisión sobre cómo ejecutar las actividades.',
  'Jornada de trabajo': 'Duración y distribución de las horas laborales, descansos y turnos.',
  'Interferencia en la relación trabajo-familia': 'Impacto del trabajo sobre responsabilidades y vida personal.',
  'Liderazgo': 'Estilo de dirección, claridad de instrucciones y apoyo del jefe.',
  'Relaciones en el trabajo': 'Ambiente social, comunicación y apoyo entre compañeros.',
  'Reconocimiento del desempeño': 'Prácticas de retroalimentación y reconocimiento por el trabajo realizado.',
  'Sentido de pertenencia': 'Identificación con la empresa y percepción de trato justo.',
  'Formación y capacitación': 'Oportunidades de desarrollo profesional y aprendizaje.'
}

const descripcionGenerica = 'Este indicador forma parte de los factores psicosociales evaluados por la NOM-035.';

function ResultadosEntorno() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [loadingEmpresas, setLoadingEmpresas] = useState(true)
  const [resultados, setResultados] = useState(null)
  const [empresas, setEmpresas] = useState([])
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState('')
  const [empresaId] = useState(localStorage.getItem('empresaId'))
  const [credenciales, setCredenciales] = useState(null)
  const [showLogin, setShowLogin] = useState(false)
  const [vistaActiva, setVistaActiva] = useState({})

  useEffect(() => {
    // Limpiar credenciales almacenadas al ingresar
    localStorage.removeItem('resultadosAuth')
    setCredenciales(null)
    setShowLogin(true)

    return () => {
      localStorage.removeItem('resultadosAuth')
    }
  }, [])

  useEffect(() => {
    // Verificar si hay credenciales guardadas
    if (!credenciales) {
      setShowLogin(true)
    } else {
      loadEmpresas()
    }
  }, [credenciales])

  useEffect(() => {
    if (empresaSeleccionada) {
      loadResultados(empresaSeleccionada)
    } else {
      setResultados(null)
    }
  }, [empresaSeleccionada])

  const loadEmpresas = async () => {
    if (!credenciales) return
    
    try {
      setLoadingEmpresas(true)
      const response = await empresaAPI.getConFormularioCompleto()
      let empresasData = []
      if (response.data && response.data.data) {
        empresasData = response.data.data
      } else if (response.data && Array.isArray(response.data)) {
        empresasData = response.data
      }
      
      // Filtrar solo la empresa que coincide con las credenciales autenticadas
      const empresaAutenticada = empresasData.find(emp => 
        emp.nombreEmpresa === credenciales.nombreEmpresa || 
        String(emp._id) === String(credenciales.empresaId)
      )
      
      if (empresaAutenticada) {
        setEmpresas([empresaAutenticada])
        setEmpresaSeleccionada(empresaAutenticada._id)
        console.log('Empresa autenticada encontrada:', {
          _id: empresaAutenticada._id,
          nombre: empresaAutenticada.nombreEmpresa
        })
      } else {
        // Si no se encuentra la empresa, puede ser que no tenga respuestas aún
        setEmpresas([])
        console.warn('No se encontró la empresa autenticada en la lista de empresas con respuestas')
      }
    } catch (error) {
      console.error('Error al cargar empresas:', error)
      if (error.response?.status === 401 || error.response?.status === 403) {
        // Si hay error de autenticación, cerrar sesión
        setCredenciales(null)
        localStorage.removeItem('resultadosAuth')
        setShowLogin(true)
      } else if (error.response?.status !== 404) {
        alert('Error al cargar las empresas: ' + (error.message || 'Error desconocido'))
      }
    } finally {
      setLoadingEmpresas(false)
    }
  }

  const handleLogin = async (formData) => {
    try {
      console.log('Intentando autenticar con:', {
        nombreEmpresa: formData.nombreEmpresa,
        tieneCodigo: !!formData.codigoAccesoResultados
      });
      
      // Verificar credenciales con el backend
      const response = await empresaAPI.verifyAccesoResultados(formData)
      
      if (response.data && response.data.success) {
        // Guardar credenciales en estado y localStorage
        const credencialesData = {
          nombreEmpresa: formData.nombreEmpresa,
          codigoAccesoResultados: formData.codigoAccesoResultados,
          empresaId: response.data.empresaId
        }
        console.log('Autenticación exitosa. Guardando credenciales:', {
          nombreEmpresa: credencialesData.nombreEmpresa,
          empresaId: credencialesData.empresaId
        });
        
        setCredenciales(credencialesData)
        localStorage.setItem('resultadosAuth', JSON.stringify(credencialesData))
        setShowLogin(false)
        // Cargar empresas después de autenticar
        loadEmpresas()
      } else {
        throw new Error('Credenciales inválidas')
      }
    } catch (error) {
      console.error('Error en handleLogin:', error);
      throw new Error(error.response?.data?.message || error.message || 'Error al verificar credenciales')
    }
  }

  const handleLogout = () => {
    setCredenciales(null)
    localStorage.removeItem('resultadosAuth')
    setResultados(null)
    setEmpresaSeleccionada('')
    setShowLogin(true)
  }

  const handleVistaCambio = (indice, vista) => {
    setVistaActiva(prev => ({
      ...prev,
      [indice]: vista
    }))
  }

  const loadResultados = async (id) => {
    if (!id) {
      console.warn('Advertencia: No se proporcionó ID de empresa para cargar resultados');
      return;
    }
    
    if (!credenciales) {
      console.error('Error: No hay credenciales disponibles. Redirigiendo al login.');
      setShowLogin(true);
      return;
    }
    
    console.log('Cargando resultados para empresa:', {
      empresaId: id,
      nombreEmpresa: credenciales.nombreEmpresa,
      tieneCodigo: !!credenciales.codigoAccesoResultados
    });
    
    try {
      setLoading(true)
      const response = await psicosocialAPI.getResultadosEntorno(id, credenciales)
      console.log('Resultados cargados exitosamente:', response.data)
      
      // Verificar estructura de respuesta
      if (response.data && response.data.data) {
        console.log('Estructura correcta - data.data:', response.data.data)
        setResultados(response.data)
      } else if (response.data && response.data.success) {
        console.log('Estructura con success:', response.data)
        setResultados(response.data)
      } else {
        console.warn('Estructura inesperada:', response.data)
        setResultados(response.data)
      }
    } catch (error) {
      console.error('Error al cargar resultados:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText
      })
      setResultados(null)
      
      // Si el error es de autenticación, mostrar login nuevamente
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.log('Error de autenticación, cerrando sesión');
        setCredenciales(null)
        localStorage.removeItem('resultadosAuth')
        setShowLogin(true)
        alert('Sesión expirada o credenciales inválidas. Por favor, ingrese nuevamente.')
      } else if (error.response?.status !== 404) {
        const errorMessage = error.response?.data?.message || error.message || 'Error desconocido'
        console.error('Error al cargar resultados:', errorMessage)
        alert('Error al cargar los resultados: ' + errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleEmpresaChange = (e) => {
    const selectedId = e.target.value
    const empresaSeleccionada = empresas.find(emp => emp._id === selectedId)
    
    console.log('Empresa seleccionada:', {
      selectedId,
      empresa: empresaSeleccionada,
      nombre: empresaSeleccionada?.nombreEmpresa
    })
    
    // Solo establecer si la empresa existe en la lista (ya que solo mostramos empresas con respuestas)
    if (selectedId && empresaSeleccionada) {
      setEmpresaSeleccionada(selectedId)
      // NO guardar en localStorage para resultados de entorno
      // El localStorage puede tener IDs de empresas sin respuestas
      // localStorage.setItem('empresaId', selectedId)
      console.log(`Empresa ${empresaSeleccionada.nombreEmpresa} seleccionada (ID: ${selectedId})`)
    } else {
      console.warn('Empresa seleccionada no encontrada en la lista:', selectedId)
      setEmpresaSeleccionada('')
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

  // Verificar si todos los formularios están completos
  const verificarFormulariosCompletos = () => {
    if (!resultados || !resultados.data) return false
    const { resumen, empresa } = resultados.data
    if (!resumen || !empresa) return false
    
    // Extraer completadas y total del formato "X/Y"
    const [completadas, total] = (resumen.progreso || '0/0').split('/').map(Number)
    return completadas >= total
  }

  // Función para descargar PDF
  const handleDescargarPDF = () => {
    if (!verificarFormulariosCompletos()) {
      alert('No se puede descargar el PDF. Debe completar todos los formularios primero.')
      return
    }

    if (!resultados || !resultados.data) {
      alert('No hay datos para exportar.')
      return
    }

    const { empresa, respuestas, resumen } = resultados.data
    const doc = new jsPDF()

    // Título
    doc.setFontSize(16)
    doc.text('Resultados de Encuestas - Entorno', 10, 10)

    // Datos generales
    doc.setFontSize(12)
    let y = 20
    doc.text(`Empresa: ${empresa?.nombreEmpresa || 'N/A'}`, 10, y)
    y += 10
    doc.text(`Total Encuestas: ${resumen?.progreso || '0/0'}`, 10, y)
    y += 10
    doc.text(`Puntaje Promedio: ${resumen?.puntajePromedio || 0}`, 10, y)
    y += 10
    doc.text(`Nivel de Riesgo: ${resumen?.nivelRiesgo || 'Nulo'}`, 10, y)
    y += 10
    doc.text(`Última Actualización: ${formatDate(resumen?.ultimaActualizacion)}`, 10, y)
    y += 15

    // Encuestas individuales
    respuestas.forEach((respuesta, index) => {
      if (y > 270) {
        doc.addPage()
        y = 10
      }

      doc.setFontSize(14)
      doc.text(`Encuesta ${index + 1}: ${formatDate(respuesta.createdAt)}`, 10, y)
      y += 10

      doc.setFontSize(12)
      doc.text(`Puntaje Total: ${respuesta.puntajeTotal || 0}`, 10, y)
      y += 10
      doc.text(`Nivel de Riesgo: ${respuesta.nivelRiesgo || 'Nulo'}`, 10, y)
      y += 10

      // Puntajes por Categoría
      doc.setFontSize(11)
      doc.text('Puntajes por Categoría:', 10, y)
      y += 8
      if (respuesta.puntajesPorCategoria) {
        Object.entries(respuesta.puntajesPorCategoria).forEach(([categoria, puntaje]) => {
          doc.text(`- ${categoria}: ${puntaje}`, 15, y)
          y += 7
        })
      }

      // Puntajes por Dominio
      doc.text('Puntajes por Dominio:', 10, y)
      y += 8
      if (respuesta.puntajesPorDominio) {
        Object.entries(respuesta.puntajesPorDominio).forEach(([dominio, puntaje]) => {
          doc.text(`- ${dominio}: ${puntaje}`, 15, y)
          y += 7
        })
      }

      y += 10
    })

    // Guardar PDF
    const nombreArchivo = `Resultados_Entorno_${empresa?.nombreEmpresa?.replace(/[^a-zA-Z0-9]/g, '_') || 'Empresa'}_${new Date().toISOString().split('T')[0]}.pdf`
    doc.save(nombreArchivo)
  }

  // Función para descargar Excel
  const handleDescargarExcel = () => {
    if (!verificarFormulariosCompletos()) {
      alert('No se puede descargar el Excel. Debe completar todos los formularios primero.')
      return
    }

    if (!resultados || !resultados.data) {
      alert('No hay datos para exportar.')
      return
    }

    const { empresa, respuestas, resumen } = resultados.data
    const wb = XLSX.utils.book_new()

    // Hoja 1: Resumen General
    const resumenData = [
      ['REPORTE DE RESULTADOS - FORMULARIO PSICOSOCIAL ENTORNO'],
      ['Empresa', empresa?.nombreEmpresa || 'N/A'],
      ['Total Encuestas', resumen?.progreso || '0/0'],
      ['Puntaje Promedio', resumen?.puntajePromedio || 0],
      ['Nivel de Riesgo', resumen?.nivelRiesgo || 'Nulo'],
      ['Fecha de Actualización', resumen?.ultimaActualizacion ? formatDate(resumen.ultimaActualizacion) : '--/--/----'],
      [],
      ['RESUMEN DE ENCUESTAS']
    ]

    const wsResumen = XLSX.utils.aoa_to_sheet(resumenData)
    XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen')

    // Hoja 2: Respuestas por Encuesta
    const respuestasData = [
      ['ID Encuesta', 'Fecha', 'Puntaje Total', 'Nivel de Riesgo', 'Recomendación']
    ]

    respuestas.forEach((respuesta, index) => {
      const fecha = formatDate(respuesta.createdAt)
      const recomendacion = respuesta.recomendacion || obtenerRecomendaciones(respuesta.nivelRiesgo)
      respuestasData.push([
        `Encuesta ${index + 1}`,
        fecha,
        respuesta.puntajeTotal || 0,
        respuesta.nivelRiesgo || 'Nulo',
        recomendacion
      ])
    })

    const wsRespuestas = XLSX.utils.aoa_to_sheet(respuestasData)
    XLSX.utils.book_append_sheet(wb, wsRespuestas, 'Encuestas')

    // Hoja 3: Puntajes por Categoría
    const categoriasData = [
      ['ID Encuesta', 'Fecha', 'Categoría', 'Puntaje']
    ]

    respuestas.forEach((respuesta, index) => {
      const fecha = formatDate(respuesta.createdAt)
      const puntajesPorCategoria = respuesta.puntajesPorCategoria || {}
      
      Object.entries(puntajesPorCategoria).forEach(([categoria, puntaje]) => {
        categoriasData.push([
          `Encuesta ${index + 1}`,
          fecha,
          categoria,
          puntaje
        ])
      })
    })

    const wsCategorias = XLSX.utils.aoa_to_sheet(categoriasData)
    XLSX.utils.book_append_sheet(wb, wsCategorias, 'Categorías')

    // Hoja 4: Puntajes por Dominio
    const dominiosData = [
      ['ID Encuesta', 'Fecha', 'Dominio', 'Puntaje']
    ]

    respuestas.forEach((respuesta, index) => {
      const fecha = formatDate(respuesta.createdAt)
      const puntajesPorDominio = respuesta.puntajesPorDominio || {}
      
      Object.entries(puntajesPorDominio).forEach(([dominio, puntaje]) => {
        dominiosData.push([
          `Encuesta ${index + 1}`,
          fecha,
          dominio,
          puntaje
        ])
      })
    })

    const wsDominios = XLSX.utils.aoa_to_sheet(dominiosData)
    XLSX.utils.book_append_sheet(wb, wsDominios, 'Dominios')

    // Hoja 5: Respuestas Detalladas por Pregunta
    const preguntasData = [
      ['ID Encuesta', 'Fecha', 'Pregunta', 'Respuesta']
    ]

    respuestas.forEach((respuesta, index) => {
      const fecha = formatDate(respuesta.createdAt)
      const preguntas = respuesta.preguntas || {}
      
      Object.entries(preguntas).forEach(([pregunta, respuestaPregunta]) => {
        preguntasData.push([
          `Encuesta ${index + 1}`,
          fecha,
          pregunta.replace('pregunta', 'Pregunta '),
          respuestaPregunta
        ])
      })
    })

    const wsPreguntas = XLSX.utils.aoa_to_sheet(preguntasData)
    XLSX.utils.book_append_sheet(wb, wsPreguntas, 'Respuestas Detalladas')

    // Generar nombre de archivo
    const nombreArchivo = `Resultados_Entorno_${empresa?.nombreEmpresa?.replace(/[^a-zA-Z0-9]/g, '_') || 'Empresa'}_${new Date().toISOString().split('T')[0]}.xlsx`

    // Descargar el archivo
    XLSX.writeFile(wb, nombreArchivo)
  }

  // Mostrar login si no hay credenciales
  if (showLogin) {
    return (
      <>
        <div className="container py-5" style={{ opacity: 0.3, pointerEvents: 'none' }}>
          <div className="row justify-content-center">
            <div className="col-lg-10">
              <div className="card shadow-sm">
                <div className="card-header bg-white">
                  <h1 className="h4 mb-0 text-primary">
                    <i className="bi bi-chart-pie me-2"></i>Resultados de Encuestas - Entorno
                  </h1>
                </div>
                <div className="card-body">
                  <p className="text-muted">Por favor, ingrese sus credenciales para acceder a los resultados.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <LoginResultados 
          onLogin={handleLogin}
          onCancel={() => navigate('/')}
          tipoFormulario="entorno"
        />
      </>
    )
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-10">
          <div className="card shadow-sm">
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
              <h1 className="h4 mb-0 text-primary">
                <i className="bi bi-chart-pie me-2"></i>Resultados de Encuestas - Entorno
              </h1>
              <button 
                className="btn btn-outline-danger btn-sm"
                onClick={handleLogout}
                title="Cerrar sesión"
              >
                <i className="bi bi-box-arrow-right me-2"></i>Cerrar Sesión
              </button>
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
                  <>
                    <select
                      id="empresaSelect"
                      className="form-select form-select-lg"
                      value={empresaSeleccionada}
                      onChange={handleEmpresaChange}
                      disabled={empresas.length === 1}
                    >
                      <option value="" disabled>-- Seleccione una empresa --</option>
                      {empresas.map((empresa) => (
                        <option key={empresa._id} value={empresa._id}>
                          {empresa.nombreEmpresa} ({empresa.cantidadEmpleados} empleados)
                        </option>
                      ))}
                    </select>
                    {empresas.length === 1 && credenciales && (
                      <small className="form-text text-muted">
                        <i className="bi bi-shield-check me-1 text-success"></i>
                        Mostrando resultados para: <strong>{credenciales.nombreEmpresa}</strong>
                      </small>
                    )}
                  </>
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

                // Debug: Log para verificar la estructura de datos
                console.log('Datos recibidos:', { empresa, respuestas, resumen })
                if (respuestas && respuestas.length > 0) {
                  console.log('Primera respuesta:', respuestas[0])
                  console.log('Puntajes por categoría:', respuestas[0]?.puntajesPorCategoria)
                  console.log('Puntajes por dominio:', respuestas[0]?.puntajesPorDominio)
                }

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

              {/* Botones Descargar PDF y Excel */}
              <div className="text-end mb-4">
                <button 
                  className="btn btn-danger me-2" 
                  onClick={handleDescargarPDF}
                  disabled={!verificarFormulariosCompletos()}
                  title={!verificarFormulariosCompletos() ? 'Debe completar todos los formularios para descargar el PDF' : ''}
                >
                  <i className="bi bi-file-pdf me-2"></i>Descargar PDF
                </button>
                <button 
                  className="btn btn-success" 
                  onClick={handleDescargarExcel}
                  disabled={!verificarFormulariosCompletos()}
                  title={!verificarFormulariosCompletos() ? 'Debe completar todos los formularios para descargar el Excel' : ''}
                >
                  <i className="bi bi-file-excel me-2"></i>Descargar Excel
                </button>
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
                          <div className="d-flex justify-content-center mb-3">
                            <div className="btn-group" role="group" aria-label="Vista de puntajes">
                              <button
                                type="button"
                                className={`btn btn-outline-primary btn-sm ${(vistaActiva[index] || 'categorias') === 'categorias' ? 'active' : ''}`}
                                onClick={() => handleVistaCambio(index, 'categorias')}
                              >
                                <i className="bi bi-layers me-1"></i>Categorías
                              </button>
                              <button
                                type="button"
                                className={`btn btn-outline-primary btn-sm ${vistaActiva[index] === 'dominios' ? 'active' : ''}`}
                                onClick={() => handleVistaCambio(index, 'dominios')}
                              >
                                <i className="bi bi-diagram-3 me-1"></i>Dominios
                              </button>
                            </div>
                          </div>
                          <div className="card h-100">
                            <div className="card-header bg-light text-center">
                              <h6 className="mb-0">
                                {(vistaActiva[index] || 'categorias') === 'categorias'
                                  ? <><i className="bi bi-layers me-2"></i>Puntajes por Categoría</>
                                  : <><i className="bi bi-diagram-3 me-2"></i>Puntajes por Dominio</>}
                              </h6>
                            </div>
                            <div className="card-body">
                              {(vistaActiva[index] || 'categorias') === 'categorias' ? (
                                respuesta.puntajesPorCategoria && Object.keys(respuesta.puntajesPorCategoria).length > 0 ? (
                                  <PuntajesGrid 
                                    puntajes={respuesta.puntajesPorCategoria} 
                                    tipo="categoria"
                                    infoMap={infoCategoriasEntorno}
                                    descripcionGenerica={descripcionGenerica}
                                  />
                                ) : (
                                  <div className="alert alert-warning">
                                    <p className="mb-0">No hay datos de categorías disponibles para esta respuesta.</p>
                                    <small>Puntaje total: {respuesta.puntajeTotal || 0}</small>
                                  </div>
                                )
                              ) : (
                                respuesta.puntajesPorDominio && Object.keys(respuesta.puntajesPorDominio).length > 0 ? (
                                  <PuntajesGrid 
                                    puntajes={respuesta.puntajesPorDominio} 
                                    tipo="dominio"
                                    infoMap={infoDominiosEntorno}
                                    descripcionGenerica={descripcionGenerica}
                                  />
                                ) : (
                                  <div className="alert alert-warning">
                                    <p className="mb-0">No hay datos de dominios disponibles para esta respuesta.</p>
                                    <small>Puntaje total: {respuesta.puntajeTotal || 0}</small>
                                  </div>
                                )
                              )}
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
