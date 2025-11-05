import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { empresaAPI } from '../services/api'

function Intermedio() {
  const navigate = useNavigate()
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    empresaNombre: '',
    claveAcceso: ''
  })
  const [loading, setLoading] = useState(false)

  const handleEmpleadoSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await empresaAPI.verifyClave({
        nombreEmpresa: formData.empresaNombre,
        clave: formData.claveAcceso
      })

      if (response.data.success) {
        // Guardar datos en localStorage
        localStorage.setItem('empresaId', response.data.empresaId)
        localStorage.setItem('empresaNombre', formData.empresaNombre)
        localStorage.setItem('tipoFormulario', response.data.tipoFormulario || 'basico')
        
        // Redirigir según el tipo de formulario
        const tipoFormulario = response.data.tipoFormulario || 'basico'
        if (tipoFormulario === 'completo') {
          navigate('/psicosocial-entorno')
        } else {
          navigate('/psicosocial-trabajo')
        }
      }
    } catch (error) {
      alert(error.message || 'Error al verificar las credenciales')
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
                    onClick={() => setShowModal(false)}
                    aria-label="Cerrar"
                  ></button>
                </div>
                <form onSubmit={handleEmpleadoSubmit}>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label htmlFor="empresaNombre" className="form-label">Nombre de la Empresa</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        id="empresaNombre" 
                        required
                        value={formData.empresaNombre}
                        onChange={(e) => setFormData({...formData, empresaNombre: e.target.value})}
                        autoFocus
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
                        onChange={(e) => setFormData({...formData, claveAcceso: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button 
                      type="button" 
                      className="btn btn-secondary" 
                      onClick={() => setShowModal(false)}
                    >
                      Cancelar
                    </button>
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
                        'Ingresar'
                      )}
                    </button>
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

