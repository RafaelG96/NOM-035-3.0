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

  const sectionDetails = {
    'I': {
      title: sectionTitles['I'],
      description: 'Marca "Sí" si has vivido alguno de los eventos listados con motivo de tu trabajo. Si respondes "No" a todos, no es necesario continuar con las secciones siguientes.',
      color: 'primary',
      icon: 'exclamation-octagon'
    },
    'II': {
      title: sectionTitles['II'],
      description: 'Responde únicamente si marcaste al menos un "Sí" en la Sección I. Se refiere a recuerdos recurrentes del acontecimiento durante el último mes.',
      color: 'secondary',
      icon: 'clock-history'
    },
    'III': {
      title: sectionTitles['III'],
      description: 'Responde si has tratado de evitar sentimientos, actividades o lugares que te recuerdan el acontecimiento.',
      color: 'secondary',
      icon: 'slash-circle'
    },
    'IV': {
      title: sectionTitles['IV'],
      description: 'Indica si has tenido afectaciones recientes relacionadas con el acontecimiento.',
      color: 'secondary',
      icon: 'heart-pulse'
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {Object.keys(questionsBySection).map((section) => {
        const detail = sectionDetails[section] || {}
        const sectionQuestions = questionsBySection[section]
        const isVisible = showSections[section]

        return (
          <div key={section} className="mb-4">
            <div className={`card border-${detail.color || 'primary'} shadow-sm`}>
              <div className={`card-header bg-${detail.color || 'primary'} text-white d-flex align-items-center justify-content-between`}>
                <div>
                  <h5 className="mb-1">
                    <i className={`bi bi-${detail.icon || 'info-circle'} me-2`}></i>
                    {detail.title}
                  </h5>
                  {detail.description && (
                    <p className="mb-0 small text-white-75">
                      {detail.description}
                    </p>
                  )}
                </div>
                <span className={`badge ${isVisible ? 'bg-light text-dark' : 'bg-dark'}`}>
                  {isVisible ? 'Disponible' : 'Completa la sección anterior'}
                </span>
              </div>
              <div className="card-body">
                {isVisible ? (
                  <div className="list-group list-group-flush">
                    {sectionQuestions.map((question) => (
                      <div key={question.id} className="list-group-item px-0">
                        <div className="row align-items-center">
                          <div className="col-md-9">
                            <label className="fw-semibold mb-2 d-block">
                              {question.number}. {question.text}
                              {question.required && <span className="text-danger"> *</span>}
                            </label>
                          </div>
                          <div className="col-md-3">
                            <div className="btn-group w-100" role="group">
                              {options.map(opt => (
                                <div key={opt.value} className="flex-grow-1">
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
                                    className={`btn w-100 ${opt.value === 'Sí' ? 'btn-outline-success' : 'btn-outline-danger'}`}
                                    htmlFor={`${question.id}-${opt.value}`}
                                  >
                                    <i className={`bi bi-${opt.value === 'Sí' ? 'check-circle' : 'x-circle'} me-1`}></i>
                                    {opt.label}
                                  </label>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                        {errors[question.id] && (
                          <div className="text-danger small mt-2">{errors[question.id]}</div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="alert alert-light border mb-0">
                    <i className="bi bi-info-circle me-2"></i>
                    Completa la Sección I con al menos una respuesta "Sí" para habilitar esta sección.
                  </div>
                )}
              </div>
            </div>
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

