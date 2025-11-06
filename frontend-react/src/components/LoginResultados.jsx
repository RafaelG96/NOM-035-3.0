import { useState } from 'react'

function LoginResultados({ onLogin, onCancel, tipoFormulario = 'entorno' }) {
  const [formData, setFormData] = useState({
    nombreEmpresa: '',
    codigoAccesoResultados: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await onLogin(formData)
    } catch (err) {
      setError(err.message || 'Error al autenticar. Verifique sus credenciales.')
    } finally {
      setLoading(false)
    }
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
                  onClick={onCancel}
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
                    disabled={loading}
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
                    onChange={(e) => setFormData({...formData, codigoAccesoResultados: e.target.value})}
                    placeholder="Ingrese el código de acceso"
                    disabled={loading}
                  />
                  <small className="form-text text-muted">
                    Este código se proporcionó al registrar la empresa
                  </small>
                </div>

                {error && (
                  <div className="alert alert-danger">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {error}
                  </div>
                )}

                <div className="d-grid gap-2">
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Verificando...
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
                      onClick={onCancel}
                      disabled={loading}
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

