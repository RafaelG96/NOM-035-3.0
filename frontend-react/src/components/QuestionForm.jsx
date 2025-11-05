import { useState } from 'react'

function QuestionForm({ questions, onSubmit, loading = false }) {
  const [formData, setFormData] = useState({})
  const [errors, setErrors] = useState({})

  const handleChange = (questionId, value) => {
    setFormData(prev => ({
      ...prev,
      [questionId]: value
    }))
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
    
    // Validar que todas las preguntas requeridas estén respondidas
    const newErrors = {}
    questions.forEach(q => {
      if (q.required && !formData[q.id]) {
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
    { value: 'Siempre', label: 'Siempre' },
    { value: 'Casi siempre', label: 'Casi siempre' },
    { value: 'Algunas veces', label: 'Algunas veces' },
    { value: 'Casi nunca', label: 'Casi nunca' },
    { value: 'Nunca', label: 'Nunca' }
  ]

  return (
    <form onSubmit={handleSubmit}>
      {questions.map((question) => (
        <div key={question.id} className="mb-4">
          <label className="form-label fw-bold">
            {question.number}. {question.text}
            {question.required && <span className="text-danger"> *</span>}
          </label>
          <select
            className={`form-select ${errors[question.id] ? 'is-invalid' : ''}`}
            value={formData[question.id] || ''}
            onChange={(e) => handleChange(question.id, e.target.value)}
            required={question.required}
          >
            <option value="">Seleccione una opción</option>
            {options.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {errors[question.id] && (
            <div className="invalid-feedback">{errors[question.id]}</div>
          )}
        </div>
      ))}
      
      <div className="d-grid gap-2 d-md-flex justify-content-md-end mt-4">
        <button 
          type="submit" 
          className="btn btn-primary btn-lg"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2"></span>
              Enviando...
            </>
          ) : (
            'Enviar Respuestas'
          )}
        </button>
      </div>
    </form>
  )
}

export default QuestionForm

