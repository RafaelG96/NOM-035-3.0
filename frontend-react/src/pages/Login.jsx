import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { empresaAPI } from '../services/api'

function Login() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    nombreEmpresa: '',
    clave: ''
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await empresaAPI.verifyClave({
        nombreEmpresa: formData.nombreEmpresa,
        clave: formData.clave
      })

      if (response.data.success) {
        localStorage.setItem('empresaId', response.data.empresaId)
        localStorage.setItem('empresaNombre', formData.nombreEmpresa)
        localStorage.setItem('tipoFormulario', response.data.tipoFormulario || 'basico')
        
        const tipoFormulario = response.data.tipoFormulario || 'basico'
        if (tipoFormulario === 'completo') {
          navigate('/psicosocial-entorno')
        } else {
          navigate('/psicosocial-trabajo')
        }
      }
    } catch (error) {
      alert(error.message || 'Clave incorrecta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow">
            <div className="card-header bg-primary text-white">
              <h3 className="mb-0">Ingreso al Sistema</h3>
            </div>
            <div className="card-body p-4">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="nombreEmpresa" className="form-label">Nombre de la Empresa</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    id="nombreEmpresa" 
                    required
                    value={formData.nombreEmpresa}
                    onChange={(e) => setFormData({...formData, nombreEmpresa: e.target.value})}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="clave" className="form-label">Clave de Acceso</label>
                  <input 
                    type="password" 
                    className="form-control" 
                    id="clave" 
                    required
                    value={formData.clave}
                    onChange={(e) => setFormData({...formData, clave: e.target.value})}
                  />
                </div>
                <div className="d-grid">
                  <button 
                    type="submit" 
                    className="btn btn-primary btn-lg"
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
      </div>
    </div>
  )
}

export default Login

