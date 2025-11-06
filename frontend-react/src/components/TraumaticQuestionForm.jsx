import { useState, useEffect } from 'react'

function TraumaticQuestionForm({ questions, onSubmit, loading = false }) {
  const [formData, setFormData] = useState({})
  const [errors, setErrors] = useState({})
  const [showSections, setShowSections] = useState({
    I: true,
    II: false,
    III: false,
    IV: false
  })

  // Función para verificar si hay alguna respuesta "Sí" en la Sección I
  const checkSectionIResponses = (currentFormData) => {
    const sectionIQuestions = questions.filter(q => q.section === 'I')
    let hasAnyYes = false
    
    // Verificar cada pregunta de la Sección I
    for (const question of sectionIQuestions) {
      const value = currentFormData[question.id]
      if (value === 'Sí' || value === 'Si' || value === 'si') {
        hasAnyYes = true
        break
      }
    }

    // Actualizar las secciones visibles
    setShowSections(prev => {
      const newState = {
        I: true, // Sección I siempre visible
        II: hasAnyYes,
        III: hasAnyYes,
        IV: hasAnyYes
      }
      
      // Solo actualizar si hay cambios para evitar re-renders innecesarios
      if (prev.II !== newState.II || prev.III !== newState.III || prev.IV !== newState.IV) {
        return newState
      }
      return prev
    })
  }

  // Verificar cuando cambia el formData
  useEffect(() => {
    checkSectionIResponses(formData)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData])

  const handleChange = (questionId, value) => {
    const updatedFormData = {
      ...formData,
      [questionId]: value
    }
    
    setFormData(updatedFormData)
    
    // Si es una pregunta de la Sección I, verificar inmediatamente
    const question = questions.find(q => q.id === questionId)
    if (question && question.section === 'I') {
      // Verificar inmediatamente con los nuevos datos
      checkSectionIResponses(updatedFormData)
    }
    
    // Limpiar error cuando se responde
    if (errors[questionId]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[questionId]
        return newErrors
      })
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Validar que todas las preguntas requeridas de las secciones visibles estén respondidas
    const newErrors = {}
    const visibleSections = Object.keys(showSections).filter(section => showSections[section])
    
    questions.forEach(q => {
      if (q.required && visibleSections.includes(q.section) && !formData[q.id]) {
        newErrors[q.id] = 'Esta pregunta es obligatoria'
      }
    })

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    onSubmit(formData)
  }

  const options = [
    { value: 'Sí', label: 'Sí' },
    { value: 'No', label: 'No' }
  ]

  // Agrupar preguntas por sección
  const questionsBySection = questions.reduce((acc, question) => {
    const section = question.section || 'I'
    if (!acc[section]) {
      acc[section] = []
    }
    acc[section].push(question)
    return acc
  }, {})

  const sectionTitles = {
    'I': 'Sección I: Exposición a eventos traumáticos',
    'II': 'Sección II: Recuerdos persistentes sobre el acontecimiento (durante el último mes)',
    'III': 'Sección III: Esfuerzo por evitar circunstancias parecidas o asociadas al acontecimiento (durante el último mes)',
    'IV': 'Sección IV: Afectación (durante el último mes)'
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="alert alert-info mb-4">
        <p className="mb-0">
          <i className="bi bi-info-circle me-2"></i>
          Marque con "Sí" o "No" según corresponda a cada pregunta. Si todas las respuestas en la Sección I son "No", no es necesario completar las demás secciones.
        </p>
      </div>

      {Object.keys(questionsBySection).map((section) => {
        const sectionQuestions = questionsBySection[section]
        const isVisible = showSections[section]
        
        return (
          <div key={section} className={`mb-4 ${!isVisible ? 'd-none' : ''}`}>
            <h5 className="mb-3 text-primary border-bottom pb-2">
              {sectionTitles[section]}
            </h5>
            
            {sectionQuestions.map((question) => (
              <div key={question.id} className="card mb-3">
                <div className="card-body">
                  <label className="form-label fw-bold mb-3 d-block">
                    {question.number}. {question.text}
                    {question.required && <span className="text-danger"> *</span>}
                  </label>
                  <div className="btn-group" role="group">
                    {options.map(opt => (
                      <div key={opt.value}>
                        <input
                          className="btn-check"
                          type="radio"
                          name={question.id}
                          id={`${question.id}-${opt.value}`}
                          value={opt.value}
                          checked={formData[question.id] === opt.value}
                          onChange={(e) => handleChange(question.id, e.target.value)}
                          required={question.required && isVisible}
                          autoComplete="off"
                        />
                        <label 
                          className={`btn btn-outline-${opt.value === 'Sí' ? 'success' : 'danger'}`}
                          htmlFor={`${question.id}-${opt.value}`}
                        >
                          <i className={`bi bi-${opt.value === 'Sí' ? 'check-circle' : 'x-circle'} me-1`}></i>
                          {opt.label}
                        </label>
                      </div>
                    ))}
                  </div>
                  {errors[question.id] && (
                    <div className="text-danger small mt-2">{errors[question.id]}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      })}
      
      <div className="d-flex justify-content-between mt-4">
        <button 
          type="button"
          className="btn btn-outline-secondary"
          onClick={() => {
            setFormData({})
            setErrors({})
            setShowSections({ I: true, II: false, III: false, IV: false })
          }}
        >
          <i className="bi bi-arrow-counterclockwise me-2"></i>
          Reiniciar
        </button>
        <button 
          type="submit" 
          className="btn btn-primary btn-lg"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2"></span>
              Evaluando...
            </>
          ) : (
            <>
              <i className="bi bi-check-circle me-2"></i>
              Evaluar
            </>
          )}
        </button>
      </div>
    </form>
  )
}

export default TraumaticQuestionForm

