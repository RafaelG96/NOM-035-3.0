import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { empresaAPI } from '../services/api'

function Intermedio() {
  const navigate = useNavigate()
  const [showModal, setShowModal] = useState(false)
  const [errorInfo, setErrorInfo] = useState(null)
  const [lockoutSeconds, setLockoutSeconds] = useState(0)
  const [formData, setFormData] = useState({
    empresaNombre: '',
    claveAcceso: ''
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (lockoutSeconds <= 0) {
      return
    }

    const intervalId = setInterval(() => {
      setLockoutSeconds((prev) => (prev <= 1 ? 0 : prev - 1))
    }, 1000)

    return () => clearInterval(intervalId)
  }, [lockoutSeconds])

  const isLocked = useMemo(() => lockoutSeconds > 0, [lockoutSeconds])

  const formatLockoutTime = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`
  }

  const handleEmpleadoSubmit = async (e) => {
    e.preventDefault()
    if (isLocked) return

    const nombreEmpresa = formData.empresaNombre.trim()
    const claveAcceso = formData.claveAcceso.trim()

    if (!/^\d{6}$/.test(claveAcceso)) {
      setErrorInfo('La clave de acceso debe contener exactamente 6 dígitos numéricos.')
      return
    }

    if (!nombreEmpresa) {
      setErrorInfo('Ingrese el nombre de la empresa para continuar.')
      return
    }

    setLoading(true)
    setErrorInfo(null)

    try {
      const response = await empresaAPI.verifyClave({
        nombreEmpresa,
        clave: claveAcceso
      })

      if (response.data.success) {
        // Guardar datos en localStorage
        localStorage.setItem('empresaId', response.data.empresaId)
        localStorage.setItem('empresaNombre', nombreEmpresa)
        localStorage.setItem('tipoFormulario', response.data.tipoFormulario || 'basico')
        setErrorInfo(null)
        setLockoutSeconds(0)
        
        // Redirigir según el tipo de formulario
        const tipoFormulario = response.data.tipoFormulario || 'basico'
        if (tipoFormulario === 'completo') {
          navigate('/psicosocial-entorno')
        } else {
          navigate('/psicosocial-trabajo')
        }
      }
    } catch (error) {
      setErrorInfo(error.response?.data?.message || error.message || 'Las credenciales proporcionadas no son correctas.')
      setLockoutSeconds(30)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 text-center mb-5">
          <h1 className="display-4 fw-bold">Bienvenido al Sistema</h1>
          <p className="lead">Por favor seleccione su tipo de acceso</p>
        </div>
        
        <div className="col-md-5 mb-4">
          <div 
            className="card card-option p-4 text-center h-100" 
            style={{ cursor: 'pointer' }}
            onClick={() => navigate('/registro')}
          >
            <div className="icon-container mb-3">
              <i className="bi bi-building fs-1 text-primary"></i>
            </div>
            <h3>Registrar Empresa</h3>
            <p className="text-muted">Si eres el representante de una empresa y deseas registrarla en nuestro sistema.</p>
            <button className="btn btn-primary mt-3">Registrar Empresa</button>
          </div>
        </div>
        
        <div className="col-md-5 offset-md-1 mb-4">
          <div 
            className="card card-option p-4 text-center h-100" 
            style={{ cursor: 'pointer' }}
            onClick={() => setShowModal(true)}
          >
            <div className="icon-container mb-3">
              <i className="bi bi-person-badge fs-1 text-success"></i>
            </div>
            <h3>Ingresar como Empleado</h3>
            <p className="text-muted">Si ya tienes credenciales de acceso como empleado de una empresa registrada.</p>
            <button className="btn btn-success mt-3">Acceso Empleado</button>
          </div>
        </div>

        <div className="col-12 text-center mt-3">
          <button 
            className="btn btn-outline-secondary"
            onClick={() => navigate('/traumaticos')}
          >
            Formulario Eventos Traumáticos (Opcional)
          </button>
        </div>
      </div>

      {/* Modal para Ingreso de Empleado */}
      {showModal && (
        <>
          {/* Backdrop */}
          <div 
            className="modal-backdrop fade show" 
            onClick={() => setShowModal(false)}
            style={{ zIndex: 1040 }}
          ></div>
          
          {/* Modal */}
          <div 
            className="modal fade show" 
            style={{ display: 'block', zIndex: 1050 }}
            tabIndex="-1"
            role="dialog"
            aria-labelledby="empleadoModalLabel"
            aria-modal="true"
          >
            <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title" id="empleadoModalLabel">Ingreso de Empleado</h5>
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={() => {
                      setShowModal(false)
                      setErrorInfo(null)
                      setLockoutSeconds(0)
                    }}
                    aria-label="Cerrar"
                  ></button>
                </div>
                <form onSubmit={handleEmpleadoSubmit}>
                  <div className="modal-body">
                    {errorInfo && (
                      <div className={`alert ${isLocked ? 'alert-danger' : 'alert-info'} d-flex align-items-start`} role="alert">
                        <i className="bi bi-exclamation-triangle-fill me-2 fs-5"></i>
                        <div>
                          <strong>Error al iniciar sesión.</strong>
                          <div className="small">
                            {errorInfo}
                          </div>
                          {isLocked ? (
                            <div className="mt-2">
                              Espere <strong>{formatLockoutTime(lockoutSeconds)}</strong> para volver a intentarlo.
                            </div>
                          ) : (
                            <div className="mt-2">
                              Ya puede intentar iniciar sesión nuevamente.
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    <div className="mb-3">
                      <label htmlFor="empresaNombre" className="form-label">Nombre de la Empresa</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        id="empresaNombre" 
                        required
                        value={formData.empresaNombre}
                        onChange={(e) => setFormData({ ...formData, empresaNombre: e.target.value })}
                        autoFocus
                        disabled={loading || isLocked}
                        placeholder="Ingrese el nombre registrado"
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="claveAcceso" className="form-label">Clave de Acceso</label>
                      <input 
                        type="password" 
                        className="form-control" 
                        id="claveAcceso" 
                        required
                        value={formData.claveAcceso}
                        onChange={(e) => {
                          const soloDigitos = e.target.value.replace(/\D/g, '').slice(0, 6)
                          setFormData({ ...formData, claveAcceso: soloDigitos })
                        }}
                        inputMode="numeric"
                        maxLength={6}
                        pattern="\d{6}"
                        placeholder="Ingrese 6 dígitos"
                        disabled={loading || isLocked}
                      />
                      <small className="form-text text-muted">
                        La clave debe tener exactamente 6 dígitos (0-9).
                      </small>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button 
                      type="button" 
                      className="btn btn-secondary" 
                      onClick={() => {
                        setShowModal(false)
                        setErrorInfo(null)
                        setLockoutSeconds(0)
                      }}
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      disabled={loading || isLocked}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Verificando...
                        </>
                      ) : isLocked ? (
                        `Espere ${formatLockoutTime(lockoutSeconds)}`
                      ) : (
                        'Ingresar'
                      )}
                    </button>
                    {isLocked && (
                      <div className="w-100 mt-2 text-muted small">
                        Podrá intentar nuevamente en {formatLockoutTime(lockoutSeconds)}.
                      </div>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default Intermedio

