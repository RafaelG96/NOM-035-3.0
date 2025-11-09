import { useEffect } from 'react'

const headerThemes = {
  success: 'bg-success text-white',
  danger: 'bg-danger text-white',
  warning: 'bg-warning text-dark',
  info: 'bg-info text-dark',
  primary: 'bg-primary text-white',
  secondary: 'bg-secondary text-white'
}

function FeedbackModal({ show = false, title = 'Aviso', message = '', theme = 'primary', onClose = () => {}, autoClose = 4000 }) {
  useEffect(() => {
    if (!show || !autoClose) return

    const timer = setTimeout(() => {
      onClose()
    }, autoClose)

    return () => clearTimeout(timer)
  }, [show, autoClose, onClose])

  if (!show) return null

  const headerClass = headerThemes[theme] || headerThemes.primary

  return (
    <>
      <div className="modal-backdrop fade show" style={{ zIndex: 1055 }}></div>
      <div
        className="modal fade show"
        style={{ display: 'block', zIndex: 1060 }}
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow-lg">
            <div className={`modal-header ${headerClass}`}>
              <h5 className="modal-title mb-0">{title}</h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={onClose}
                aria-label="Cerrar"
              ></button>
            </div>
            <div className="modal-body">
              <p className="mb-0">{message}</p>
            </div>
            <div className="modal-footer bg-light">
              <button
                type="button"
                className="btn btn-primary"
                onClick={onClose}
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default FeedbackModal

