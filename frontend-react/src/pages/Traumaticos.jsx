import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { traumaAPI } from '../services/api'
import TraumaticQuestionForm from '../components/TraumaticQuestionForm'

function Traumaticos() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [empresaNombre, setEmpresaNombre] = useState('')
  const [showCompanyForm, setShowCompanyForm] = useState(true)

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
    // Intentar obtener el nombre de la empresa del localStorage (opcional)
    const storedEmpresaNombre = localStorage.getItem('empresaNombre')
    if (storedEmpresaNombre) {
      setEmpresaNombre(storedEmpresaNombre)
      setShowCompanyForm(false)
    }
  }, [])

  const handleCompanySubmit = (e) => {
    e.preventDefault()
    const nombre = e.target.companyName.value.trim()
    if (nombre && nombre.length >= 2) {
      console.log('✅ Nombre de empresa establecido:', nombre)
      setEmpresaNombre(nombre)
      setShowCompanyForm(false)
    } else {
      alert('Por favor ingrese un nombre de empresa válido (mínimo 2 caracteres)')
    }
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
      }

      console.log('📤 Enviando datos al backend:', {
        empresa: data.empresa || '(no proporcionado)',
        cantidadRespuestas: data.respuestas.length,
        respuestas: data.respuestas
      })

      const response = await traumaAPI.create(data)
      
      console.log('✅ Respuesta del backend:', response.data)
      
      if (response.data && response.data.success) {
        alert('Formulario enviado exitosamente')
        navigate('/resultados-traumaticos')
      } else {
        throw new Error('No se recibió confirmación del servidor')
      }
    } catch (error) {
      console.error('❌ Error al enviar formulario:', error)
      const errorMessage = error.response?.data?.error || error.response?.data?.details || error.message || 'Error al enviar el formulario'
      alert(`Error: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">Formulario de Eventos Traumáticos</h1>
        {empresaNombre && (
          <div className="badge bg-primary fs-6">
            Empresa: {empresaNombre}
          </div>
        )}
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

          {/* Formulario de identificación de empresa (solo si no hay nombre) */}
          {showCompanyForm && (
            <div className="card border-primary mb-4">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">
                  <i className="bi bi-building me-2"></i>
                  Identificación de Empresa (Opcional)
                </h5>
              </div>
              <div className="card-body">
                <form onSubmit={handleCompanySubmit}>
                  <div className="mb-3">
                    <label htmlFor="companyName" className="form-label">
                      Nombre de la empresa <span className="text-muted">(opcional)</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="companyName"
                      name="companyName"
                      placeholder="Ingrese el nombre de su empresa (opcional)"
                    />
                    <small className="form-text text-muted">
                      <i className="bi bi-info-circle me-1"></i>
                      El nombre de la empresa es opcional pero recomendado para poder ver y filtrar los resultados posteriormente.
                      Puede continuar sin proporcionarlo si lo desea.
                    </small>
                  </div>
                  <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-primary">
                      <i className="bi bi-check-circle me-2"></i>
                      Continuar con nombre
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-outline-secondary"
                      onClick={() => {
                        setEmpresaNombre('')
                        setShowCompanyForm(false)
                      }}
                    >
                      <i className="bi bi-arrow-right me-2"></i>
                      Continuar sin nombre
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Formulario de preguntas (siempre disponible, nombre de empresa es opcional) */}
          {!showCompanyForm && (
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

