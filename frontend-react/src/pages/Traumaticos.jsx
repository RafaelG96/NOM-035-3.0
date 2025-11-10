import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { traumaAPI } from '../services/api'
import TraumaticQuestionForm from '../components/TraumaticQuestionForm'
import FeedbackModal from '../components/FeedbackModal'

function Traumaticos() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [empresaNombre, setEmpresaNombre] = useState('')
  const [showCompanyModal, setShowCompanyModal] = useState(true)
  const [companyInput, setCompanyInput] = useState('')
  const [feedback, setFeedback] = useState({
    show: false,
    title: '',
    message: '',
    theme: 'primary',
    autoClose: 4000,
    afterClose: null
  })
  const handleFeedbackClose = () => {
    setFeedback(prev => {
      const callback = prev.afterClose
      if (callback) {
        setTimeout(callback, 0)
      }
      return { ...prev, show: false, afterClose: null }
    })
  }

  // Preguntas del formulario de eventos traumáticos según NOM-035
  // Sección I: Exposición a eventos traumáticos (preguntas 1-6)
  // Sección II: Recuerdos persistentes (preguntas 7-8)
  // Sección III: Esfuerzo por evitar (preguntas 9-15)
  // Sección IV: Afectación (preguntas 16-20)
  const questions = [
    // Sección I: Exposición a eventos traumáticos
    { id: 'pregunta1', number: 1, text: '¿Accidente que tenga como consecuencia la muerte, la pérdida de un miembro o una lesión grave?', required: true, section: 'I' },
    { id: 'pregunta2', number: 2, text: '¿Asaltos?', required: true, section: 'I' },
    { id: 'pregunta3', number: 3, text: '¿Actos violentos que derivaron en lesiones graves?', required: true, section: 'I' },
    { id: 'pregunta4', number: 4, text: '¿Secuestro?', required: true, section: 'I' },
    { id: 'pregunta5', number: 5, text: '¿Amenazas?', required: true, section: 'I' },
    { id: 'pregunta6', number: 6, text: '¿Cualquier otro que ponga en riesgo su vida o salud, y/o la de otras personas?', required: true, section: 'I' },
    
    // Sección II: Recuerdos persistentes sobre el acontecimiento (durante el último mes)
    { id: 'pregunta7', number: 7, text: '¿Ha tenido recuerdos recurrentes sobre el acontecimiento que le provocan malestares?', required: true, section: 'II' },
    { id: 'pregunta8', number: 8, text: '¿Ha tenido sueños de carácter recurrente sobre el acontecimiento, que le producen malestar?', required: true, section: 'II' },
    
    // Sección III: Esfuerzo por evitar circunstancias parecidas o asociadas al acontecimiento (durante el último mes)
    { id: 'pregunta9', number: 9, text: '¿Se ha esforzado por evitar todo tipo de sentimientos, conversaciones o situaciones que le puedan recordar el acontecimiento?', required: true, section: 'III' },
    { id: 'pregunta10', number: 10, text: '¿Se ha esforzado por evitar todo tipo de actividades, lugares o personas que motivan recuerdos del acontecimiento?', required: true, section: 'III' },
    { id: 'pregunta11', number: 11, text: '¿Ha tenido dificultad para recordar alguna parte importante del evento?', required: true, section: 'III' },
    { id: 'pregunta12', number: 12, text: '¿Ha disminuido su interés en sus actividades cotidianas?', required: true, section: 'III' },
    { id: 'pregunta13', number: 13, text: '¿Se ha sentido usted alejado o distante de los demás?', required: true, section: 'III' },
    { id: 'pregunta14', number: 14, text: '¿Ha notado que tiene dificultad para expresar sus sentimientos?', required: true, section: 'III' },
    { id: 'pregunta15', number: 15, text: '¿Ha tenido la impresión de que su vida se va a acortar, que va a morir antes que otras personas o que tiene un futuro limitado?', required: true, section: 'III' },
    
    // Sección IV: Afectación (durante el último mes)
    { id: 'pregunta16', number: 16, text: '¿Ha tenido usted dificultades para dormir?', required: true, section: 'IV' },
    { id: 'pregunta17', number: 17, text: '¿Ha estado particularmente irritable o le han dado arranques de coraje?', required: true, section: 'IV' },
    { id: 'pregunta18', number: 18, text: '¿Ha tenido dificultad para concentrarse?', required: true, section: 'IV' },
    { id: 'pregunta19', number: 19, text: '¿Ha estado nervioso o constantemente en alerta?', required: true, section: 'IV' },
    { id: 'pregunta20', number: 20, text: '¿Se ha sobresaltado fácilmente por cualquier cosa?', required: true, section: 'IV' }
  ]

  useEffect(() => {
    const storedEmpresaNombre = localStorage.getItem('empresaNombre')
    if (storedEmpresaNombre && storedEmpresaNombre.trim().length > 0) {
      const nombre = storedEmpresaNombre.trim()
      setEmpresaNombre(nombre)
      setCompanyInput(nombre)
      setShowCompanyModal(false)
    } else {
      setShowCompanyModal(true)
    }
  }, [])

  const handleCompanyModalSubmit = (e) => {
    e.preventDefault()
    const nombre = companyInput.trim()
    if (nombre.length >= 2) {
      setEmpresaNombre(nombre)
      localStorage.setItem('empresaNombre', nombre)
      setFeedback({
        show: true,
        title: 'Empresa registrada',
        message: `Se utilizará "${nombre}" para identificar tus respuestas.`,
        theme: 'info',
        autoClose: 2500,
        afterClose: null
      })
      setShowCompanyModal(false)
    } else {
      setFeedback({
        show: true,
        title: 'Nombre inválido',
        message: 'Ingresa al menos 2 caracteres para identificar tu empresa o continúa sin nombre.',
        theme: 'warning',
        autoClose: 3500,
        afterClose: null
      })
    }
  }

  const handleContinueWithoutCompany = () => {
    setEmpresaNombre('')
    setCompanyInput('')
    localStorage.removeItem('empresaNombre')
    setFeedback({
      show: true,
      title: 'Continuación sin empresa',
      message: 'Tus respuestas se guardarán como "Sin especificar". Puedes agregar el nombre más adelante.',
      theme: 'info',
      autoClose: 2500,
      afterClose: null
    })
    setShowCompanyModal(false)
  }

  const handleSubmit = async (formData) => {
    setLoading(true)

    try {
      // Convertir el formato de React al formato que espera el backend
      // El formulario de eventos traumáticos usa Sí/No directamente
      const respuestas = Object.keys(formData).map((key) => {
        const preguntaNum = key.replace('pregunta', '')
        // Convertir las respuestas de Sí/No a si/no (minúsculas)
        const respuesta = formData[key]
        const esSi = respuesta === 'Sí' || respuesta === 'Si' || respuesta === 'si'
        
        return {
          pregunta: `q${preguntaNum}`,
          respuesta: esSi ? 'si' : 'no'
        }
      })

      // El nombre de empresa es opcional pero recomendado
      // Si no se proporciona, el backend usará "Sin especificar"
      const empresaNombreTrimmed = empresaNombre ? empresaNombre.trim() : ''

      const data = {
        respuestas: respuestas
      }

      // Solo incluir empresa si se proporcionó
      if (empresaNombreTrimmed && empresaNombreTrimmed.length > 0) {
        data.empresa = empresaNombreTrimmed
        localStorage.setItem('empresaNombre', empresaNombreTrimmed)
      }

      const response = await traumaAPI.create(data)
      
      if (response.data && response.data.success) {
        const recomendaciones = response.data.recomendaciones || []
        const mensaje = [
          'Tus respuestas se enviaron correctamente.',
          'Recuerda acercarte a tu área de seguridad y salud laboral o a un profesional externo para recibir acompañamiento.',
          recomendaciones.length > 0 ? 'Recomendaciones:' : null,
          ...recomendaciones.map((rec) => `• ${rec}`)
        ].filter(Boolean).join('\n')

        setFeedback({
          show: true,
          title: '¡Gracias!',
          message: mensaje,
          theme: 'success',
          autoClose: 0,
          afterClose: () => {
            setEmpresaNombre('')
            setCompanyInput('')
            localStorage.removeItem('empresaNombre')
            setShowCompanyModal(true)
            navigate('/resultados-traumaticos')
          }
        })
      } else {
        throw new Error('No se recibió confirmación del servidor')
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.response?.data?.details || error.message || 'Error al enviar el formulario'
      setFeedback({
        show: true,
        title: 'Error al enviar',
        message: errorMessage,
        theme: 'danger',
        autoClose: 4000,
        afterClose: null
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-5">
      <FeedbackModal
        show={feedback.show}
        title={feedback.title}
        message={feedback.message}
        theme={feedback.theme}
        autoClose={feedback.autoClose}
        onClose={handleFeedbackClose}
      />
      {showCompanyModal && (
        <>
          <div className="modal-backdrop fade show" style={{ zIndex: 1080 }}></div>
          <div
            className="modal fade show"
            style={{ display: 'block', zIndex: 1090 }}
            tabIndex="-1"
            aria-modal="true"
            role="dialog"
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header bg-primary text-white">
                  <h5 className="modal-title mb-0">
                    <i className="bi bi-building me-2"></i>
                    ¿Para qué empresa respondes?
                  </h5>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={() => navigate('/')}
                    aria-label="Cerrar"
                  ></button>
                </div>
                <form onSubmit={handleCompanyModalSubmit}>
                  <div className="modal-body">
                    <p className="text-muted small">
                  El nombre de la empresa es opcional, pero facilita dar seguimiento a los resultados y
                  brindar apoyo oportuno a la organización. Si decides no continuar, haz clic en el botón de cerrar en la esquina superior derecha.
                    </p>
                    <label htmlFor="companyNameModal" className="form-label fw-semibold">
                      Nombre de la empresa
                    </label>
                    <input
                      id="companyNameModal"
                      type="text"
                      className="form-control"
                      value={companyInput}
                      onChange={(e) => setCompanyInput(e.target.value)}
                      placeholder="Ej. Empresa XYZ"
                      autoFocus
                    />
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={handleContinueWithoutCompany}
                    >
                      Continuar sin nombre
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Guardar y continuar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}

      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <h1 className="mb-0">Formulario de Eventos Traumáticos</h1>
        <div className="d-flex align-items-center gap-2">
          <span className={`badge ${empresaNombre ? 'bg-primary' : 'bg-secondary'} fs-6`}>
            Empresa: {empresaNombre || 'Sin especificar'}
          </span>
          <button
            type="button"
            className="btn btn-sm btn-outline-primary"
            onClick={() => {
              setCompanyInput(empresaNombre)
              setShowCompanyModal(true)
            }}
          >
            <i className="bi bi-pencil-square me-1"></i>
            {empresaNombre ? 'Cambiar' : 'Agregar'} nombre
          </button>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          <div className="alert alert-info mb-4">
            <h5 className="alert-heading">
              <i className="bi bi-info-circle me-2"></i>
              Información importante
            </h5>
            <p className="mb-0">
              Este formulario es opcional y se utiliza para identificar eventos traumáticos severos en el centro de trabajo.
              No requiere credenciales de acceso, solo el nombre de la empresa.
            </p>
          </div>

          {/* Formulario de preguntas (solo disponible cuando se cierra el modal) */}
          {!showCompanyModal && (
            <TraumaticQuestionForm 
              questions={questions} 
              onSubmit={handleSubmit}
              loading={loading}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default Traumaticos

