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

  const accentClass =
    theme === 'danger'
      ? 'text-danger'
      : theme === 'warning'
      ? 'text-warning'
      : theme === 'info'
      ? 'text-info'
      : 'text-success'

  const iconName =
    theme === 'danger'
      ? 'exclamation-octagon-fill'
      : theme === 'warning'
      ? 'exclamation-triangle-fill'
      : theme === 'info'
      ? 'info-circle-fill'
      : 'heart-pulse-fill'

  const lines = message
    ? message.split('\n').map((line) => line.trim()).filter(Boolean)
    : []

  return (
    <>
      <div className="modal-backdrop fade show" style={{ zIndex: 1055 }}></div>
      <div
        className="modal fade show"
        style={{ display: 'block', zIndex: 1060 }}
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-dialog modal-dialog-centered modal-lg">
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
              <div className="d-flex gap-3 align-items-start">
                <div className={`flex-shrink-0 ${accentClass}`}>
                  <i className={`bi bi-${iconName} fs-1`}></i>
                </div>
                <div className="flex-grow-1">
                  {lines.length > 0 ? (
                    <ul className="mb-0 ps-3">
                      {lines.map((line, idx) => (
                        <li key={idx} className="mb-2">
                          {line}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mb-0">Sin información adicional.</p>
                  )}
                </div>
              </div>
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

