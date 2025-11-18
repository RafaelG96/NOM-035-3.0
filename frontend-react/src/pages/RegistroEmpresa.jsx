import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { empresaAPI } from '../services/api'
import jsPDF from 'jspdf'

function RegistroEmpresa() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    nombreEmpresa: '',
    cantidadEmpleados: '',
    clave: '',
    codigoAccesoResultados: ''
  })
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [modalData, setModalData] = useState(null)

  // Función helper para agregar texto con soporte UTF-8
  const addText = (doc, text, x, y) => {
    try {
      const textStr = String(text || '').trim()
      if (!textStr) return
      doc.text(textStr, x, y)
    } catch (error) {
      console.error('Error al agregar texto al PDF:', error)
      try {
        doc.text(String(text || '').normalize('NFD').replace(/[\u0300-\u036f]/g, ''), x, y)
      } catch (e) {
        console.error('Error en fallback:', e)
      }
    }
  }

  // Función para descargar PDF con las claves
  const handleDescargarClavesPDF = () => {
    if (!modalData) return

    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })

      // Función helper para dibujar rectángulo
      const drawRect = (x, y, width, height, fill = false, color = null) => {
        if (fill) {
          if (color) {
            doc.setFillColor(color[0], color[1], color[2])
          } else {
            doc.setFillColor(240, 240, 240)
          }
          doc.rect(x, y, width, height, 'F')
        }
        doc.setDrawColor(200, 200, 200)
        doc.setLineWidth(0.3)
        doc.rect(x, y, width, height)
      }

      // Encabezado azul
      doc.setFillColor(41, 128, 185)
      doc.rect(0, 0, 210, 35, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(20)
      doc.setFont(undefined, 'bold')
      const titleText = 'CREDENCIALES DE ACCESO - NOM-035'
      const titleWidth = doc.getTextWidth(titleText)
      addText(doc, titleText, (210 - titleWidth) / 2, 25)
      
      doc.setTextColor(0, 0, 0)
      doc.setFont(undefined, 'normal')
      let y = 50

      // Información de la Empresa
      drawRect(10, y, 190, 40, true)
      doc.setFontSize(14)
      doc.setFont(undefined, 'bold')
      addText(doc, 'INFORMACIÓN DE LA EMPRESA', 15, y + 8)
      
      doc.setFontSize(11)
      doc.setFont(undefined, 'normal')
      y += 12
      addText(doc, `Nombre: ${modalData.nombreEmpresa}`, 15, y)
      y += 8
      addText(doc, `Total de Empleados: ${modalData.cantidadEmpleados}`, 15, y)
      y += 8
      addText(doc, `Tipo de Formulario: ${modalData.formularioInfo.descripcion}`, 15, y)
      if (modalData.formularioInfo.requiereMuestra) {
        y += 8
        addText(doc, `Muestra Representativa: ${modalData.muestraRepresentativa} empleados`, 15, y)
      }
      
      y += 20

      // Clave de Acceso para Empleados
      drawRect(10, y, 190, 35, true, [220, 237, 200])
      doc.setFontSize(13)
      doc.setFont(undefined, 'bold')
      addText(doc, 'CLAVE DE ACCESO PARA EMPLEADOS', 15, y + 8)
      
      doc.setFontSize(10)
      doc.setFont(undefined, 'normal')
      y += 12
      addText(doc, 'Esta clave permite a los empleados acceder y completar los cuestionarios:', 15, y)
      y += 10
      
      // Caja destacada para la clave
      drawRect(15, y, 180, 12, true, [255, 255, 255])
      doc.setDrawColor(46, 125, 50)
      doc.setLineWidth(1)
      doc.rect(15, y, 180, 12)
      doc.setFontSize(18)
      doc.setFont(undefined, 'bold')
      doc.setTextColor(46, 125, 50)
      const claveWidth = doc.getTextWidth(modalData.clave)
      addText(doc, modalData.clave, (210 - claveWidth) / 2, y + 8.5)
      
      doc.setTextColor(0, 0, 0)
      doc.setFont(undefined, 'normal')
      y += 20

      // Código de Acceso a Resultados
      drawRect(10, y, 190, 40, true, [255, 243, 224])
      doc.setFontSize(13)
      doc.setFont(undefined, 'bold')
      addText(doc, 'CÓDIGO DE ACCESO A RESULTADOS', 15, y + 8)
      
      doc.setFontSize(10)
      doc.setFont(undefined, 'normal')
      y += 12
      addText(doc, 'Este código es necesario para acceder a los resultados y reportes:', 15, y)
      y += 10
      
      // Caja destacada para el código
      drawRect(15, y, 180, 12, true, [255, 255, 255])
      doc.setDrawColor(230, 126, 34)
      doc.setLineWidth(1)
      doc.rect(15, y, 180, 12)
      doc.setFontSize(18)
      doc.setFont(undefined, 'bold')
      doc.setTextColor(230, 126, 34)
      const codigoWidth = doc.getTextWidth(modalData.codigoAccesoResultados)
      addText(doc, modalData.codigoAccesoResultados, (210 - codigoWidth) / 2, y + 8.5)
      
      doc.setTextColor(0, 0, 0)
      doc.setFont(undefined, 'normal')
      y += 20

      // Advertencia importante
      drawRect(10, y, 190, 30, true, [255, 235, 238])
      doc.setDrawColor(211, 47, 47)
      doc.setLineWidth(0.5)
      doc.rect(10, y, 190, 30)
      doc.setFontSize(11)
      doc.setFont(undefined, 'bold')
      doc.setTextColor(211, 47, 47)
      addText(doc, '⚠️ IMPORTANTE', 15, y + 8)
      
      doc.setFontSize(9)
      doc.setFont(undefined, 'normal')
      doc.setTextColor(0, 0, 0)
      y += 10
      addText(doc, '• Guarde este documento en un lugar seguro', 15, y)
      y += 6
      addText(doc, '• No comparta el código de acceso a resultados con personal no autorizado', 15, y)
      y += 6
      addText(doc, '• Estos datos no se podrán modificar después de guardar', 15, y)

      // Pie de página
      y = 280
      doc.setFontSize(8)
      doc.setTextColor(128, 128, 128)
      const fecha = new Date().toLocaleDateString('es-MX', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
      addText(doc, `Documento generado el ${fecha}`, 15, y)
      addText(doc, 'Sistema NOM-035 - Evaluación Psicosocial', 110, y)

      // Guardar PDF
      const nombreArchivo = `Credenciales_${modalData.nombreEmpresa?.replace(/[^a-zA-Z0-9]/g, '_') || 'Empresa'}_${new Date().toISOString().split('T')[0]}.pdf`
      doc.save(nombreArchivo)
    } catch (error) {
      console.error('Error al generar PDF:', error)
      alert('Error al generar el PDF. Por favor, intente nuevamente.')
    }
  }

  const calcularMuestraRepresentativa = (N) => {
    const constante1 = 0.9604
    const constante2 = 0.0025
    const numerador = constante1 * N
    const denominador = (constante2 * (N - 1)) + constante1
    const n = numerador / denominador
    return Math.round(n)
  }

  const determinarFormularioRedireccion = (cantidadEmpleados) => {
    if (cantidadEmpleados >= 1 && cantidadEmpleados <= 50) {
      return {
        url: '/psicosocial-trabajo',
        requiereMuestra: false,
        descripcion: 'Formulario básico para empresas pequeñas (1-50 empleados)'
      }
    } else if (cantidadEmpleados >= 51) {
      return {
        url: '/psicosocial-entorno',
        requiereMuestra: true,
        descripcion: 'Formulario completo con muestra representativa (51+ empleados)'
      }
    }
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const cantidadEmpleados = parseInt(formData.cantidadEmpleados)
    const claveValida = /^\d{6}$/.test(formData.clave)
    const codigoValido = /^[A-Za-z0-9]{8}$/.test(formData.codigoAccesoResultados)
    
    if (!formData.nombreEmpresa || Number.isNaN(cantidadEmpleados) || cantidadEmpleados <= 0) {
      alert('Por favor complete todos los campos correctamente')
      setLoading(false)
      return
    }

    if (!claveValida) {
      alert('La clave de acceso para empleados debe contener exactamente 6 dígitos numéricos.')
      setLoading(false)
      return
    }

    if (!codigoValido) {
      alert('El código de acceso a resultados debe contener exactamente 8 caracteres alfanuméricos.')
      setLoading(false)
      return
    }

    const formularioInfo = determinarFormularioRedireccion(cantidadEmpleados)
    if (!formularioInfo) {
      alert('La cantidad de empleados debe ser mayor a 0')
      setLoading(false)
      return
    }

    let muestraRepresentativa = null
    if (formularioInfo.requiereMuestra) {
      muestraRepresentativa = calcularMuestraRepresentativa(cantidadEmpleados)
    }

    const requestData = {
      nombreEmpresa: formData.nombreEmpresa,
      cantidadEmpleados: cantidadEmpleados,
      clave: formData.clave,
      codigoAccesoResultados: formData.codigoAccesoResultados,
      tipoFormulario: formularioInfo.requiereMuestra ? 'completo' : 'basico'
    }

    if (formularioInfo.requiereMuestra) {
      requestData.muestraRepresentativa = muestraRepresentativa
    }

    try {
      console.log('📝 Intentando registrar empresa con datos:', requestData);
      console.log('🌐 URL de la API:', import.meta.env.VITE_API_URL || 'http://localhost:3000/api');
      
      const response = await empresaAPI.create(requestData)
      
      console.log('✅ Empresa registrada exitosamente:', response.data);
      
      // Guardar datos en localStorage
      const empresaId = response.data?._id || response.data?.data?._id || response.data?.id;
      if (empresaId) {
        localStorage.setItem('empresaId', empresaId);
        localStorage.setItem('empresaNombre', formData.nombreEmpresa);
        localStorage.setItem('empresaClave', formData.clave);
        localStorage.setItem('tipoFormulario', requestData.tipoFormulario);
        
        if (formularioInfo.requiereMuestra) {
          localStorage.setItem('muestraRepresentativa', muestraRepresentativa);
        }

        // Mostrar modal de éxito
        setModalData({
          nombreEmpresa: formData.nombreEmpresa,
          cantidadEmpleados: cantidadEmpleados,
          clave: formData.clave,
          codigoAccesoResultados: formData.codigoAccesoResultados,
          formularioInfo,
          muestraRepresentativa
        });
        setShowModal(true);
      } else {
        throw new Error('No se recibió el ID de la empresa en la respuesta');
      }
    } catch (error) {
      console.error('❌ Error al registrar empresa:', error);
      const errorMessage = error.message || error.details || 'Error al registrar la empresa';
      alert(`Error: ${errorMessage}\n\nRevisa la consola del navegador (F12) para más detalles.`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mt-5 pt-4">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card border-0 shadow">
            <div className="card-header bg-white py-3">
              <h2 className="h4 mb-0 text-dark d-flex align-items-center">
                <i className="bi bi-building text-primary me-3"></i>
                <span>Información de la Empresa</span>
              </h2>
              <p className="text-muted mb-0 mt-2">Complete los datos requeridos para continuar</p>
            </div>
            <div className="card-body p-4">
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="nombre-empresa" className="form-label">
                    <i className="bi bi-signature me-2"></i>Nombre de la empresa
                  </label>
                  <input 
                    type="text" 
                    className="form-control form-control-lg" 
                    id="nombre-empresa" 
                    required
                    value={formData.nombreEmpresa}
                    onChange={(e) => setFormData({...formData, nombreEmpresa: e.target.value})}
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="cantidad-empleados" className="form-label">
                    <i className="bi bi-people me-2"></i>Cantidad de empleados
                  </label>
                  <input 
                    type="number" 
                    className="form-control form-control-lg" 
                    id="cantidad-empleados" 
                    required
                    min="1"
                    value={formData.cantidadEmpleados}
                    onChange={(e) => setFormData({...formData, cantidadEmpleados: e.target.value})}
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="clave" className="form-label">
                    <i className="bi bi-key me-2"></i>Clave de acceso (Para empleados)
                  </label>
                  <input 
                    type="text" 
                    className="form-control form-control-lg" 
                    id="clave" 
                    required
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    value={formData.clave}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 6)
                      setFormData({...formData, clave: value})
                    }}
                  />
                  <small className="form-text text-muted">Ingrese 6 dígitos numéricos para que los empleados accedan al formulario.</small>
                </div>

                <div className="mb-4">
                  <label htmlFor="codigo-acceso-resultados" className="form-label">
                    <i className="bi bi-shield-lock me-2"></i>Código de acceso a resultados
                  </label>
                  <input 
                    type="text" 
                    className="form-control form-control-lg" 
                    id="codigo-acceso-resultados" 
                    required
                    pattern="[A-Za-z0-9]{8}"
                    maxLength={8}
                    value={formData.codigoAccesoResultados}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8)
                      setFormData({...formData, codigoAccesoResultados: value})
                    }}
                  />
                  <small className="form-text text-muted">Utilice 8 caracteres alfanuméricos. Guárdelo en un lugar seguro.</small>
                </div>
                
                <div className="d-grid mt-4">
                  <button 
                    type="submit" 
                    className="btn btn-primary btn-lg py-3"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Procesando...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-save me-2"></i>Guardar y Continuar
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="card border-0 mt-4">
            <div className="card-body p-4 text-center">
              <h5 className="mb-3 text-dark">
                <i className="bi bi-shield-lock me-2 text-primary"></i>Seguridad de Datos
              </h5>
              <p className="text-muted mb-0">
                Toda la información proporcionada está protegida bajo las normativas de protección de datos personales.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de éxito */}
      {showModal && modalData && (
        <>
          {/* Backdrop */}
          <div 
            className="modal-backdrop fade show" 
            onClick={() => {
              setShowModal(false)
              setModalData(null)
            }}
            style={{ zIndex: 1040 }}
          ></div>
          
          {/* Modal */}
          <div 
            className="modal fade show" 
            style={{ display: 'block', zIndex: 1050 }}
            tabIndex="-1"
            role="dialog"
            aria-labelledby="registroExitosoModalLabel"
            aria-modal="true"
          >
            <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
              <div className="modal-content">
                <div className="modal-header bg-success text-white">
                  <h5 className="modal-title" id="registroExitosoModalLabel">Registro Exitoso</h5>
                  <button 
                    type="button" 
                    className="btn-close btn-close-white" 
                    onClick={() => {
                      setShowModal(false)
                      setModalData(null)
                    }}
                    aria-label="Cerrar"
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="text-center mb-3">
                    <i className="bi bi-check-circle text-success" style={{ fontSize: '3rem' }}></i>
                  </div>
                  <div className="card border-success mb-3">
                    <div className="card-header bg-success text-white">
                      <i className="bi bi-building me-2"></i>Detalles de la Empresa
                    </div>
                    <div className="card-body">
                      <div className="alert alert-warning d-flex align-items-start" role="alert">
                        <i className="bi bi-exclamation-triangle-fill me-2 mt-1"></i>
                        <div>
                          <strong>Importante:</strong> después de guardar, estos datos no se podrán modificar. Verifique que toda la información sea correcta antes de continuar.
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-md-6 mb-2">
                          <small className="text-muted">Nombre</small>
                          <div className="fw-bold">{modalData.nombreEmpresa}</div>
                        </div>
                        <div className="col-md-6 mb-2">
                          <small className="text-muted">Total Empleados</small>
                          <div className="fw-bold">{modalData.cantidadEmpleados}</div>
                        </div>
                        <div className="col-md-6 mb-2">
                          <small className="text-muted">Tipo de Formulario</small>
                          <div className="fw-bold">{modalData.formularioInfo.descripcion}</div>
                        </div>
                        {modalData.formularioInfo.requiereMuestra && (
                          <div className="col-md-6 mb-2">
                            <small className="text-muted">Muestra Representativa</small>
                            <div className="fw-bold">{modalData.muestraRepresentativa} empleados</div>
                          </div>
                        )}
                        <div className="col-md-6 mb-2">
                          <small className="text-muted">Clave Asignada (Para empleados)</small>
                          <div className="fw-bold">
                            <code className="bg-light p-1 rounded">{modalData.clave}</code>
                          </div>
                        </div>
                        <div className="col-md-6 mb-2">
                          <small className="text-muted">Código de Acceso a Resultados</small>
                          <div className="fw-bold">
                            <code className="bg-light p-1 rounded">{modalData.codigoAccesoResultados}</code>
                          </div>
                          <small className="text-warning">
                            <i className="bi bi-exclamation-triangle me-1"></i>
                            Guarde este código para acceder a los resultados
                          </small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-danger"
                    onClick={handleDescargarClavesPDF}
                    title="Descargar credenciales en PDF"
                  >
                    <i className="bi bi-file-pdf me-2"></i>Descargar PDF
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary"
                    onClick={() => {
                      setShowModal(false)
                      setModalData(null)
                    }}
                  >
                    Regresar y Editar
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-primary"
                    onClick={() => {
                      setShowModal(false)
                      setModalData(null)
                      navigate('/intermedio')
                    }}
                  >
                    Confirmar y Continuar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default RegistroEmpresa

