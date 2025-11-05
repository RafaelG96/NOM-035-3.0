import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { empresaAPI } from '../services/api'

function RegistroEmpresa() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    nombreEmpresa: '',
    cantidadEmpleados: '',
    clave: ''
  })
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [modalData, setModalData] = useState(null)

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
    
    if (!formData.nombreEmpresa || !formData.clave || cantidadEmpleados <= 0) {
      alert('Por favor complete todos los campos correctamente')
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
                    <i className="bi bi-key me-2"></i>Clave de acceso
                  </label>
                  <input 
                    type="text" 
                    className="form-control form-control-lg" 
                    id="clave" 
                    required
                    value={formData.clave}
                    onChange={(e) => setFormData({...formData, clave: e.target.value})}
                  />
                  <small className="form-text text-muted">Clave proporcionada por el administrador</small>
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
              navigate('/intermedio')
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
                      navigate('/intermedio')
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
                          <small className="text-muted">Clave Asignada</small>
                          <div className="fw-bold">
                            <code className="bg-light p-1 rounded">{modalData.clave}</code>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-primary"
                    onClick={() => {
                      setShowModal(false)
                      setModalData(null)
                      navigate('/intermedio')
                    }}
                  >
                    Aceptar
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

