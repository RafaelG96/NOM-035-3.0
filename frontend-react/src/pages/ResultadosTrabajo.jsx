import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { psicosocialAPI, empresaAPI } from '../services/api'
import PuntajesGrid from '../components/PuntajesGrid'
import LoginResultados from '../components/LoginResultados'
import jsPDF from 'jspdf'
import * as XLSX from 'xlsx'

function ResultadosTrabajo() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [loadingEmpresas, setLoadingEmpresas] = useState(true)
  const [resultados, setResultados] = useState(null)
  const [empresas, setEmpresas] = useState([])
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState('')
  const [empresaId] = useState(localStorage.getItem('empresaId'))
  const [credenciales, setCredenciales] = useState(null)
  const [showLogin, setShowLogin] = useState(false)

  useEffect(() => {
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
      const response = await empresaAPI.getConFormularioBasico()
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
      const response = await psicosocialAPI.getResultadosTrabajo(id, credenciales)
      console.log('Resultados cargados exitosamente:', response.data)
      setResultados(response.data)
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

  // Verificar si todos los formularios están completos
  const verificarFormulariosCompletos = () => {
    if (!resultados || !resultados.data) return false
    const { empresa, resultados: respuestas } = resultados.data
    if (!empresa || !respuestas || respuestas.length === 0) return false
    
    // Verificar si todas las encuestas están completas
    const totalEncuestas = respuestas.length
    const totalEmpleados = empresa.cantidadEmpleados || 0
    return totalEncuestas >= totalEmpleados
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

    const { empresa, resultados: respuestas } = resultados.data
    const doc = new jsPDF()

    // Calcular estadísticas
    const totalEncuestas = respuestas.length
    const totalPuntaje = respuestas.reduce((sum, respuesta) => sum + (respuesta.puntajeTotal || 0), 0)
    const promedioPuntaje = totalEncuestas > 0 ? (totalPuntaje / totalEncuestas).toFixed(2) : 0
    const nivelRiesgoGeneral = determinarNivelRiesgoGeneral(parseFloat(promedioPuntaje))

    // Título
    doc.setFontSize(16)
    doc.text('Resultados de Encuestas - Trabajo', 10, 10)

    // Datos generales
    doc.setFontSize(12)
    let y = 20
    doc.text(`Empresa: ${empresa?.nombreEmpresa || 'N/A'}`, 10, y)
    y += 10
    doc.text(`Total Encuestas: ${totalEncuestas}/${empresa?.cantidadEmpleados || 0}`, 10, y)
    y += 10
    doc.text(`Puntaje Promedio: ${promedioPuntaje}`, 10, y)
    y += 10
    doc.text(`Nivel de Riesgo: ${nivelRiesgoGeneral}`, 10, y)
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
      doc.text(`Nivel de Riesgo: ${respuesta.nivelRiesgo || 'Nulo o despreciable'}`, 10, y)
      y += 10

      // Puntajes por Categoría
      doc.setFontSize(11)
      doc.text('Puntajes por Categoría:', 10, y)
      y += 8
      if (respuesta.categorias && Array.isArray(respuesta.categorias)) {
        respuesta.categorias.forEach((categoria) => {
          doc.text(`- ${categoria.nombre}: ${categoria.puntaje}`, 15, y)
          y += 7
        })
      }

      // Puntajes por Dominio
      doc.text('Puntajes por Dominio:', 10, y)
      y += 8
      if (respuesta.dominios && Array.isArray(respuesta.dominios)) {
        respuesta.dominios.forEach((dominio) => {
          doc.text(`- ${dominio.nombre}: ${dominio.puntaje}`, 15, y)
          y += 7
        })
      }

      y += 10
    })

    // Guardar PDF
    const nombreArchivo = `Resultados_Trabajo_${empresa?.nombreEmpresa?.replace(/[^a-zA-Z0-9]/g, '_') || 'Empresa'}_${new Date().toISOString().split('T')[0]}.pdf`
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

    const { empresa, resultados: respuestas } = resultados.data
    const wb = XLSX.utils.book_new()

    // Calcular estadísticas
    const totalEncuestas = respuestas.length
    const totalPuntaje = respuestas.reduce((sum, respuesta) => sum + (respuesta.puntajeTotal || 0), 0)
    const promedioPuntaje = totalEncuestas > 0 ? (totalPuntaje / totalEncuestas).toFixed(2) : 0
    const nivelRiesgoGeneral = determinarNivelRiesgoGeneral(parseFloat(promedioPuntaje))
    const ultimaFecha = respuestas.reduce((latest, respuesta) => {
      const fechaActual = new Date(respuesta.updatedAt || respuesta.createdAt)
      return fechaActual > latest ? fechaActual : latest
    }, new Date(0))

    // Hoja 1: Resumen General
    const resumenData = [
      ['REPORTE DE RESULTADOS - FORMULARIO PSICOSOCIAL TRABAJO'],
      ['Empresa', empresa?.nombreEmpresa || 'N/A'],
      ['Total Encuestas', totalEncuestas],
      ['Total Empleados', empresa?.cantidadEmpleados || 0],
      ['Puntaje Promedio', promedioPuntaje],
      ['Nivel de Riesgo', nivelRiesgoGeneral],
      ['Fecha de Actualización', formatDate(ultimaFecha)],
      [],
      ['RESUMEN DE ENCUESTAS']
    ]

    const wsResumen = XLSX.utils.aoa_to_sheet(resumenData)
    XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen')

    // Hoja 2: Respuestas por Encuesta
    const respuestasData = [
      ['ID Encuesta', 'Fecha', 'Puntaje Total', 'Nivel de Riesgo']
    ]

    respuestas.forEach((respuesta, index) => {
      const fecha = formatDate(respuesta.createdAt)
      respuestasData.push([
        `Encuesta ${index + 1}`,
        fecha,
        respuesta.puntajeTotal || 0,
        respuesta.nivelRiesgo || 'Nulo o despreciable'
      ])
    })

    const wsRespuestas = XLSX.utils.aoa_to_sheet(respuestasData)
    XLSX.utils.book_append_sheet(wb, wsRespuestas, 'Encuestas')

    // Hoja 3: Puntajes por Categoría
    const categoriasData = [
      ['ID Encuesta', 'Fecha', 'Categoría', 'Puntaje', 'Nivel']
    ]

    respuestas.forEach((respuesta, index) => {
      const fecha = formatDate(respuesta.createdAt)
      const categorias = respuesta.categorias || []
      
      categorias.forEach((categoria) => {
        const nivel = obtenerNivelPorCategoriaTrabajo(categoria.nombre, categoria.puntaje)
        categoriasData.push([
          `Encuesta ${index + 1}`,
          fecha,
          categoria.nombre,
          categoria.puntaje,
          nivel
        ])
      })
    })

    const wsCategorias = XLSX.utils.aoa_to_sheet(categoriasData)
    XLSX.utils.book_append_sheet(wb, wsCategorias, 'Categorías')

    // Hoja 4: Puntajes por Dominio
    const dominiosData = [
      ['ID Encuesta', 'Fecha', 'Dominio', 'Puntaje', 'Nivel']
    ]

    respuestas.forEach((respuesta, index) => {
      const fecha = formatDate(respuesta.createdAt)
      const dominios = respuesta.dominios || []
      
      dominios.forEach((dominio) => {
        const nivel = obtenerNivelPorDominioTrabajo(dominio.nombre, dominio.puntaje)
        dominiosData.push([
          `Encuesta ${index + 1}`,
          fecha,
          dominio.nombre,
          dominio.puntaje,
          nivel
        ])
      })
    })

    const wsDominios = XLSX.utils.aoa_to_sheet(dominiosData)
    XLSX.utils.book_append_sheet(wb, wsDominios, 'Dominios')

    // Hoja 5: Respuestas Detalladas por Pregunta
    const preguntasData = [
      ['ID Encuesta', 'Fecha', 'Pregunta', 'Respuesta', 'Valor Numérico']
    ]

    respuestas.forEach((respuesta, index) => {
      const fecha = formatDate(respuesta.createdAt)
      const preguntas = respuesta.preguntas || {}
      
      Object.entries(preguntas).forEach(([pregunta, respuestaPregunta]) => {
        if (pregunta.startsWith('pregunta')) {
          // Convertir valor a numérico
          let valorNumerico = 0
          if (typeof respuestaPregunta === 'boolean') {
            valorNumerico = respuestaPregunta ? 1 : 0
          } else if (typeof respuestaPregunta === 'number') {
            valorNumerico = respuestaPregunta
          } else if (typeof respuestaPregunta === 'string') {
            const valoresMap = {
              'Siempre': 0,
              'Casi siempre': 1,
              'Algunas veces': 2,
              'Casi nunca': 3,
              'Nunca': 4,
              'Sí': 1,
              'No': 0
            }
            valorNumerico = valoresMap[respuestaPregunta] !== undefined ? valoresMap[respuestaPregunta] : 0
          }

          preguntasData.push([
            `Encuesta ${index + 1}`,
            fecha,
            pregunta.replace('pregunta', 'Pregunta '),
            typeof respuestaPregunta === 'boolean' ? (respuestaPregunta ? 'Sí' : 'No') : respuestaPregunta,
            valorNumerico
          ])
        }
      })
    })

    const wsPreguntas = XLSX.utils.aoa_to_sheet(preguntasData)
    XLSX.utils.book_append_sheet(wb, wsPreguntas, 'Respuestas Detalladas')

    // Generar nombre de archivo
    const nombreArchivo = `Resultados_Trabajo_${empresa?.nombreEmpresa?.replace(/[^a-zA-Z0-9]/g, '_') || 'Empresa'}_${new Date().toISOString().split('T')[0]}.xlsx`

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
                    <i className="bi bi-chart-pie me-2"></i>Resultados Formulario Trabajo
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
          tipoFormulario="trabajo"
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
                <i className="bi bi-chart-pie me-2"></i>Resultados Formulario Trabajo
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
                <div className="col-md-3">
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
                <div className="col-md-3">
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
                <div className="col-md-3">
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
                <div className="col-md-3">
                  <div className="card card-summary h-100">
                    <div className="card-body text-center py-3">
                      <div className="icon-container bg-success bg-opacity-10">
                        <i className="bi bi-calendar text-success fs-4"></i>
                      </div>
                      <h3 className="h6 text-muted mt-1 mb-1">Última Actualización</h3>
                      <p className="small mb-0">{formatDate(ultimaFecha)}</p>
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
                                      <PuntajesGrid 
                                        puntajes={categoriasDict} 
                                        tipo="categoria"
                                      />
                                    ) : (
                                      <div className="alert alert-warning">
                                        <p className="mb-0">No hay datos de categorías disponibles para esta respuesta.</p>
                                        <small>Puntaje total: {respuesta.puntajeTotal || 0}</small>
                                      </div>
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
                                      <PuntajesGrid 
                                        puntajes={dominiosDict} 
                                        tipo="dominio"
                                      />
                                    ) : (
                                      <div className="alert alert-warning">
                                        <p className="mb-0">No hay datos de dominios disponibles para esta respuesta.</p>
                                        <small>Puntaje total: {respuesta.puntajeTotal || 0}</small>
                                      </div>
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
