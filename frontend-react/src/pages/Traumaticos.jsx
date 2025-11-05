import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { traumaAPI } from '../services/api'
import QuestionForm from '../components/QuestionForm'

function Traumaticos() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [empresaId, setEmpresaId] = useState(null)
  const [empresaNombre, setEmpresaNombre] = useState('')

  // Preguntas del formulario de eventos traumáticos
  const questions = [
    { id: 'pregunta1', number: 1, text: 'He sido testigo de accidentes mortales en mi centro de trabajo', required: true },
    { id: 'pregunta2', number: 2, text: 'He sido testigo de lesiones graves en mi centro de trabajo', required: true },
    { id: 'pregunta3', number: 3, text: 'He sido testigo de situaciones de robo o asalto en mi centro de trabajo', required: true },
    { id: 'pregunta4', number: 4, text: 'He sido víctima de robo o asalto en mi centro de trabajo', required: true },
    { id: 'pregunta5', number: 5, text: 'He sido testigo de actos violentos hacia algún compañero en mi centro de trabajo', required: true },
    { id: 'pregunta6', number: 6, text: 'He sido víctima de actos violentos en mi centro de trabajo', required: true },
    { id: 'pregunta7', number: 7, text: 'He sido testigo de amenazas graves en mi centro de trabajo', required: true },
    { id: 'pregunta8', number: 8, text: 'He sido víctima de amenazas graves en mi centro de trabajo', required: true },
    { id: 'pregunta9', number: 9, text: 'He sido testigo de situaciones que han puesto en riesgo mi vida en mi centro de trabajo', required: true },
    { id: 'pregunta10', number: 10, text: 'He sido víctima de situaciones que han puesto en riesgo mi vida en mi centro de trabajo', required: true }
  ]

  useEffect(() => {
    const storedEmpresaId = localStorage.getItem('empresaId')
    const storedEmpresaNombre = localStorage.getItem('empresaNombre')
    
    if (!storedEmpresaId || !storedEmpresaNombre) {
      alert('No se encontraron datos de autenticación. Por favor, inicie sesión nuevamente.')
      navigate('/intermedio')
      return
    }

    setEmpresaId(storedEmpresaId)
    setEmpresaNombre(storedEmpresaNombre)
  }, [navigate])

  const handleSubmit = async (formData) => {
    if (!empresaId || !empresaNombre) {
      alert('Por favor inicie sesión primero')
      return
    }

    setLoading(true)

    try {
      // Convertir el formato de React al formato que espera el backend
      const respuestas = Object.keys(formData).map((key) => {
        const preguntaNum = key.replace('pregunta', '')
        // Convertir las respuestas de React (Siempre, Casi siempre, etc.) a si/no
        const respuesta = formData[key]
        const esSi = respuesta === 'Siempre' || respuesta === 'Casi siempre'
        
        return {
          pregunta: `q${preguntaNum}`,
          respuesta: esSi ? 'si' : 'no'
        }
      })

      const data = {
        empresa: empresaNombre,
        respuestas: respuestas
      }

      await traumaAPI.create(data)
      alert('Formulario enviado exitosamente')
      navigate('/resultados-traumaticos')
    } catch (error) {
      alert(error.message || 'Error al enviar el formulario')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">Formulario de Eventos Traumáticos</h1>
        <div className="badge bg-primary fs-6">
          Empresa: {empresaNombre}
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
            </p>
          </div>

          <QuestionForm 
            questions={questions} 
            onSubmit={handleSubmit}
            loading={loading}
          />
        </div>
      </div>
    </div>
  )
}

export default Traumaticos

