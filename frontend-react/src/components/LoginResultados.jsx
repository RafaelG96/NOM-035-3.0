import { useState, useEffect, useMemo } from 'react'

function LoginResultados({ onLogin, onCancel, tipoFormulario = 'entorno' }) {
  const [formData, setFormData] = useState({
    nombreEmpresa: '',
    codigoAccesoResultados: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [lockoutSeconds, setLockoutSeconds] = useState(0)

  useEffect(() => {
    if (lockoutSeconds <= 0) return

    const interval = setInterval(() => {
      setLockoutSeconds((prev) => (prev <= 1 ? 0 : prev - 1))
    }, 1000)

    return () => clearInterval(interval)
  }, [lockoutSeconds])

  const isLocked = useMemo(() => lockoutSeconds > 0, [lockoutSeconds])

  const formatLockoutTime = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const remaining = seconds % 60
    return `${String(minutes).padStart(2, '0')}:${String(remaining).padStart(2, '0')}`
  }

  const resetState = () => {
    setError('')
    setLockoutSeconds(0)
    setLoading(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (isLocked) return

    const nombre = formData.nombreEmpresa.trim()
    const codigo = formData.codigoAccesoResultados.trim().toUpperCase()

    if (!nombre) {
      setError('Ingrese el nombre de la empresa para continuar.')
      return
    }

    if (!/^[A-Za-z0-9]{8}$/.test(codigo)) {
      setError('El código de acceso debe tener exactamente 8 caracteres alfanuméricos (letras y números, sin símbolos).')
      return
    }

    setLoading(true)
    setError('')

    try {
      await onLogin({
        nombreEmpresa: nombre,
        codigoAccesoResultados: codigo
      })
      resetState()
    } catch (err) {
      setError(err.message || 'Error al autenticar. Verifique sus credenciales.')
      setLockoutSeconds(30)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    resetState()
    if (onCancel) onCancel()
  }

  return (
    <>
      <div 
        className="modal-backdrop fade show" 
        style={{ 
          zIndex: 1040,
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.5)'
        }}
      ></div>
      <div 
        className="modal fade show" 
        style={{ 
          display: 'block', 
          zIndex: 1050,
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          overflow: 'auto'
        }} 
        tabIndex="-1"
        onClick={(e) => {
          // Solo cerrar si se hace click fuera del modal-content
          if (e.target === e.currentTarget && onCancel) {
            onCancel()
          }
        }}
      >
        <div 
          className="modal-dialog modal-dialog-centered" 
          onClick={(e) => e.stopPropagation()}
          style={{ pointerEvents: 'auto' }}
        >
          <div className="modal-content" style={{ pointerEvents: 'auto' }}>
            <div className="modal-header bg-primary text-white">
              <h5 className="modal-title">
                <i className="bi bi-shield-lock me-2"></i>
                Acceso a Resultados
              </h5>
              {onCancel && (
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={handleCancel}
                  aria-label="Cerrar"
                ></button>
              )}
            </div>
            <div className="modal-body">
              <div className="alert alert-info">
                <i className="bi bi-info-circle me-2"></i>
                Para acceder a los resultados, ingrese el <strong>nombre de la empresa</strong> tal como fue registrado y el <strong>código de acceso a resultados</strong>.
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="nombre-empresa-login" className="form-label">
                    <i className="bi bi-building me-2"></i>Nombre de la Empresa
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="nombre-empresa-login"
                    required
                    autoFocus
                    value={formData.nombreEmpresa}
                    onChange={(e) => setFormData({...formData, nombreEmpresa: e.target.value})}
                    placeholder="Ingrese el nombre exacto de la empresa"
                    disabled={loading || isLocked}
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="codigo-acceso-login" className="form-label">
                    <i className="bi bi-key me-2"></i>Código de Acceso a Resultados
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="codigo-acceso-login"
                    required
                    value={formData.codigoAccesoResultados}
                    onChange={(e) => {
                      const soloAlfanumerico = e.target.value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8)
                      setFormData({...formData, codigoAccesoResultados: soloAlfanumerico})
                    }}
                    placeholder="Ingrese 8 caracteres alfanuméricos"
                    disabled={loading || isLocked}
                    maxLength={8}
                    pattern="[A-Za-z0-9]{8}"
                  />
                  <small className="form-text text-muted">
                    Este código se proporcionó al registrar la empresa
                  </small>
                </div>

                {error && (
                  <div className={`alert ${isLocked ? 'alert-danger' : 'alert-info'}`}>
                    <div className="d-flex">
                      <i className="bi bi-exclamation-triangle me-2 fs-5"></i>
                      <div>
                        <strong>Acceso denegado.</strong>
                        <div className="small">{error}</div>
                        {isLocked ? (
                          <div className="mt-2">
                            Espere <strong>{formatLockoutTime(lockoutSeconds)}</strong> para volver a intentar.
                          </div>
                        ) : (
                          <div className="mt-2">
                            Ya puede intentar iniciar sesión nuevamente.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="d-grid gap-2">
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
                      <>
                        <i className="bi bi-hourglass-split me-2"></i>
                        Espere {formatLockoutTime(lockoutSeconds)}
                      </>
                    ) : (
                      <>
                        <i className="bi bi-box-arrow-in-right me-2"></i>
                        Acceder a Resultados
                      </>
                    )}
                  </button>
                  {onCancel && (
                    <button 
                      type="button" 
                      className="btn btn-secondary"
                      onClick={handleCancel}
                      disabled={loading || isLocked}
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default LoginResultados

