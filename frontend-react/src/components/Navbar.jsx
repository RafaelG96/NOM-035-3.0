import { Link } from 'react-router-dom'
import { useState } from 'react'

function Navbar() {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container">
          <Link className="navbar-brand d-flex align-items-center" to="/">
            <img 
              src="https://cdn-icons-png.flaticon.com/512/1570/1570887.png" 
              alt="Logo" 
              width="30" 
              height="30" 
              className="d-inline-block align-top me-2"
            />
            NOM-035
          </Link>
          <button 
            className="navbar-toggler" 
            type="button" 
            data-bs-toggle="collapse" 
            data-bs-target="#navbarNav"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <a className="nav-link" href="#que-es">¿Qué es?</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#objetivo">Objetivo</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#proteccion">Protección de datos</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#implementacion">Implementación</a>
              </li>
              <li className="nav-item">
                <a 
                  className="nav-link" 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault()
                    setShowModal(true)
                  }}
                >
                  Resultados
                </a>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Modal de resultados */}
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
            aria-labelledby="resultadosModalLabel"
            aria-modal="true"
          >
            <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title" id="resultadosModalLabel">Selecciona el tipo de resultados</h5>
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={() => setShowModal(false)}
                    aria-label="Cerrar"
                  ></button>
                </div>
                <div className="modal-body text-center">
                  <p>Elige el formulario cuyos resultados deseas consultar:</p>
                  <div className="d-grid gap-3">
                    <Link 
                      to="/resultados-entorno" 
                      className="btn btn-primary"
                      onClick={() => setShowModal(false)}
                    >
                      <i className="bi bi-building me-2"></i>Psicosocial Entorno
                    </Link>
                    <Link 
                      to="/resultados-trabajo" 
                      className="btn btn-secondary"
                      onClick={() => setShowModal(false)}
                    >
                      <i className="bi bi-briefcase me-2"></i>Psicosocial Trabajo
                    </Link>
                    <Link 
                      to="/resultados-traumaticos" 
                      className="btn btn-secondary"
                      onClick={() => setShowModal(false)}
                    >
                      <i className="bi bi-exclamation-triangle me-2"></i>Traumáticos
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}

export default Navbar

