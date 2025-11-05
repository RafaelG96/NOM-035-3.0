import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { psicosocialAPI } from '../services/api'
import QuestionForm from '../components/QuestionForm'

function PsicosocialTrabajo() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [empresaId, setEmpresaId] = useState(null)
  const [empresaNombre, setEmpresaNombre] = useState('')

  // Preguntas del formulario psicosocial trabajo (versión simplificada - se puede expandir)
  const questions = [
    { id: 'pregunta1', number: 1, text: 'El espacio donde trabajo me permite realizar mis actividades de manera segura e higiénica', required: true },
    { id: 'pregunta2', number: 2, text: 'Mi trabajo me exige hacer mucho esfuerzo físico', required: true },
    { id: 'pregunta3', number: 3, text: 'Me preocupa sufrir un accidente en mi trabajo', required: true },
    { id: 'pregunta4', number: 4, text: 'Considero que las actividades que realizo son peligrosas', required: true },
    { id: 'pregunta5', number: 5, text: 'Por el tipo de trabajo que realizo, me preocupa enfermarme', required: true },
    { id: 'pregunta6', number: 6, text: 'Por la cantidad de trabajo que tengo debo quedarme tiempo adicional a mi turno', required: true },
    { id: 'pregunta7', number: 7, text: 'Por la cantidad de trabajo que tengo debo trabajar sin parar', required: true },
    { id: 'pregunta8', number: 8, text: 'Trabajo contra reloj', required: true },
    { id: 'pregunta9', number: 9, text: 'Mi trabajo exige que esté muy concentrado', required: true },
    { id: 'pregunta10', number: 10, text: 'Mi trabajo requiere que memorice mucha información', required: true },
    { id: 'pregunta11', number: 11, text: 'Mi trabajo exige tomar decisiones rápidas e importantes', required: true },
    { id: 'pregunta12', number: 12, text: 'Mi trabajo requiere que atienda varios asuntos al mismo tiempo', required: true },
    { id: 'pregunta13', number: 13, text: 'En mi trabajo soy responsable de cosas de mucho valor', required: true },
    { id: 'pregunta14', number: 14, text: 'Respondo por cosas de mi trabajo que no están bajo mi control', required: true },
    { id: 'pregunta15', number: 15, text: 'En mi trabajo cometo errores, no me doy cuenta sino hasta después', required: true },
    { id: 'pregunta16', number: 16, text: 'Mi trabajo es monótono', required: true },
    { id: 'pregunta17', number: 17, text: 'Trabajo horas extras más de tres veces por semana', required: true },
    { id: 'pregunta18', number: 18, text: 'Mi trabajo me exige laborar en días de descanso, festivos o fines de semana', required: true },
    { id: 'pregunta19', number: 19, text: 'Considero que en mi trabajo me piden cosas innecesarias', required: true },
    { id: 'pregunta20', number: 20, text: 'Puedo organizar mi tiempo de trabajo libremente', required: true },
    { id: 'pregunta21', number: 21, text: 'Debo atender asuntos de trabajo cuando estoy en mi casa', required: true },
    { id: 'pregunta22', number: 22, text: 'Pienso en las preocupaciones del trabajo cuando estoy en mi tiempo libre', required: true },
    { id: 'pregunta23', number: 23, text: 'Puedo decidir cuándo hacer pausas en mi trabajo', required: true },
    { id: 'pregunta24', number: 24, text: 'Puedo decidir la cantidad de trabajo que realizo durante el día', required: true },
    { id: 'pregunta25', number: 25, text: 'Puedo decidir cómo hacer mi trabajo', required: true },
    { id: 'pregunta26', number: 26, text: 'Puedo cambiar el orden de las actividades que realizo en mi trabajo', required: true },
    { id: 'pregunta27', number: 27, text: 'Me informan con antelación sobre cambios que ocurrirán en mi trabajo', required: true },
    { id: 'pregunta28', number: 28, text: 'Me explican claramente los objetivos de mi trabajo', required: true },
    { id: 'pregunta29', number: 29, text: 'Me informan con antelación sobre los cambios de horario o turno', required: true },
    { id: 'pregunta30', number: 30, text: 'Me informan con antelación sobre los cambios en las actividades, responsabilidades o funciones de mi trabajo', required: true },
    { id: 'pregunta31', number: 31, text: 'Recibo capacitación útil para hacer mi trabajo', required: true },
    { id: 'pregunta32', number: 32, text: 'Me informan sobre los riesgos de mi trabajo', required: true },
    { id: 'pregunta33', number: 33, text: 'Me explican qué hacer si me siento mal por el trabajo', required: true },
    { id: 'pregunta34', number: 34, text: 'Mi jefe ayuda a solucionar los problemas', required: true },
    { id: 'pregunta35', number: 35, text: 'Mi jefe tiene en cuenta mis puntos de vista y opiniones', required: true },
    { id: 'pregunta36', number: 36, text: 'Mi jefe permite que los trabajadores participen en las decisiones', required: true },
    { id: 'pregunta37', number: 37, text: 'Mi jefe mantiene comunicación constante con los trabajadores', required: true },
    { id: 'pregunta38', number: 38, text: 'Mi jefe ayuda a organizar mejor el trabajo', required: true },
    { id: 'pregunta39', number: 39, text: 'Cuando tengo problemas, mis compañeros me ayudan', required: true },
    { id: 'pregunta40', number: 40, text: 'Puedo confiar en mis compañeros de trabajo', required: true },
    { id: 'pregunta41', number: 41, text: 'Mis compañeros me tratan con respeto', required: true },
    { id: 'pregunta42', number: 42, text: 'Recibo reconocimientos por mi trabajo', required: true },
    { id: 'pregunta43', number: 43, text: 'Me pagan lo suficiente por las actividades que realizo', required: true },
    { id: 'pregunta44', number: 44, text: 'Tengo las mismas oportunidades de ser promovido que otros compañeros', required: true },
    { id: 'pregunta45', number: 45, text: 'En mi trabajo puedo expresarme libremente sin interrupciones', required: true },
    { id: 'pregunta46', number: 46, text: 'Recibo críticas constantes a mi persona y/o trabajo', required: true },
    { id: 'pregunta47', number: 47, text: 'Recibo burlas, calumnias, difamaciones, humillaciones, ridiculizaciones, como parte del trato frecuente en mi trabajo', required: true },
    { id: 'pregunta48', number: 48, text: 'Se ignora mi presencia o se me excluye de las reuniones de trabajo y/o en la toma de decisiones', required: true },
    { id: 'pregunta49', number: 49, text: 'Se manipulan las situaciones de trabajo para hacerme parecer un mal trabajador', required: true },
    { id: 'pregunta50', number: 50, text: 'Se sospecha frecuentemente del cumplimiento de mi trabajo sin motivo', required: true },
    { id: 'pregunta51', number: 51, text: 'Se vigila constantemente mi trabajo', required: true },
    { id: 'pregunta52', number: 52, text: 'Se presiona para que no ejerza mis derechos laborales establecidos por la ley', required: true },
    { id: 'pregunta53', number: 53, text: 'Se asignan actividades sin el material necesario para realizarlas', required: true },
    { id: 'pregunta54', number: 54, text: 'He presenciado actos de violencia en mi centro de trabajo', required: true }
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
    if (!empresaId) {
      alert('Por favor inicie sesión primero')
      return
    }

    setLoading(true)

    try {
      const data = {
        empresaId,
        preguntas: formData,
        timestamp: new Date().toISOString()
      }

      await psicosocialAPI.trabajo(data)
      alert('Formulario enviado exitosamente')
      navigate('/resultados-trabajo')
    } catch (error) {
      alert(error.message || 'Error al enviar el formulario')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">Cuestionario Psicosocial - Trabajo</h1>
        <div className="badge bg-primary fs-6">
          Empresa: {empresaNombre}
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
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

export default PsicosocialTrabajo

