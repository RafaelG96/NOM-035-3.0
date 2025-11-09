import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { psicosocialAPI } from '../services/api'
import QuestionForm from '../components/QuestionForm'

function PsicosocialTrabajo() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [empresaId, setEmpresaId] = useState(null)
  const [empresaNombre, setEmpresaNombre] = useState('')
  const [servicioClientes, setServicioClientes] = useState('')
  const [esJefe, setEsJefe] = useState('')
  const [showClientesQuestions, setShowClientesQuestions] = useState(false)
  const [showJefeQuestions, setShowJefeQuestions] = useState(false)

  // Preguntas del formulario psicosocial trabajo - 46 preguntas según NOM-035
  const questions = [
    { id: 'pregunta1', number: 1, text: 'Mi trabajo me exige hacer mucho esfuerzo físico', required: true },
    { id: 'pregunta2', number: 2, text: 'Me preocupa sufrir un accidente en mi trabajo', required: true },
    { id: 'pregunta3', number: 3, text: 'Considero que las actividades que realizo son peligrosas', required: true },
    { id: 'pregunta4', number: 4, text: 'Por la cantidad de trabajo que tengo debo quedarme tiempo adicional a mi turno', required: true },
    { id: 'pregunta5', number: 5, text: 'Por la cantidad de trabajo que tengo debo trabajar sin parar', required: true },
    { id: 'pregunta6', number: 6, text: 'Considero que es necesario mantener un ritmo de trabajo acelerado', required: true },
    { id: 'pregunta7', number: 7, text: 'Mi trabajo exige que esté muy concentrado', required: true },
    { id: 'pregunta8', number: 8, text: 'Mi trabajo requiere que memorice mucha información', required: true },
    { id: 'pregunta9', number: 9, text: 'Mi trabajo exige que atienda varios asuntos al mismo tiempo', required: true },
    { id: 'pregunta10', number: 10, text: 'En mi trabajo soy responsable de cosas de mucho valor', required: true },
    { id: 'pregunta11', number: 11, text: 'Respondo ante mi jefe por los resultados de toda mi área de trabajo', required: true },
    { id: 'pregunta12', number: 12, text: 'En mi trabajo me dan órdenes contradictorias', required: true },
    { id: 'pregunta13', number: 13, text: 'Considero que en mi trabajo me piden hacer cosas innecesarias', required: true },
    { id: 'pregunta14', number: 14, text: 'Trabajo horas extras más de tres veces a la semana', required: true },
    { id: 'pregunta15', number: 15, text: 'Mi trabajo me exige laborar en días de descanso, festivos o fines de semana', required: true },
    { id: 'pregunta16', number: 16, text: 'Considero que el tiempo en el trabajo es mucho y perjudica mis actividades familiares o personales', required: true },
    { id: 'pregunta17', number: 17, text: 'Pienso en las actividades familiares o personales cuando estoy en mi trabajo', required: true },
    { id: 'pregunta18', number: 18, text: 'Mi trabajo permite que desarrolle nuevas habilidades', required: true },
    { id: 'pregunta19', number: 19, text: 'En mi trabajo puedo aspirar a un mejor puesto', required: true },
    { id: 'pregunta20', number: 20, text: 'Durante mi jornada de trabajo puedo tomar pausas cuando las necesito', required: true },
    { id: 'pregunta21', number: 21, text: 'Puedo decidir la velocidad a la que realizo mis actividades en mi trabajo', required: true },
    { id: 'pregunta22', number: 22, text: 'Puedo cambiar el orden de las actividades que realizo en mi trabajo', required: true },
    { id: 'pregunta23', number: 23, text: 'Me informan con claridad cuáles son mis funciones', required: true },
    { id: 'pregunta24', number: 24, text: 'Me explican claramente los resultados que debo obtener en mi trabajo', required: true },
    { id: 'pregunta25', number: 25, text: 'Me informan con quién puedo resolver problemas o asuntos de trabajo', required: true },
    { id: 'pregunta26', number: 26, text: 'Me permiten asistir a capacitaciones relacionadas con mi trabajo', required: true },
    { id: 'pregunta27', number: 27, text: 'Recibo capacitación útil para hacer mi trabajo', required: true },
    { id: 'pregunta28', number: 28, text: 'Mi jefe tiene en cuenta mis puntos de vista y opiniones', required: true },
    { id: 'pregunta29', number: 29, text: 'Mi jefe ayuda a solucionar los problemas que se presentan en el trabajo', required: true },
    { id: 'pregunta30', number: 30, text: 'Puedo confiar en mis compañeros de trabajo', required: true },
    { id: 'pregunta31', number: 31, text: 'Cuando tenemos que realizar trabajo de equipo los compañeros colaboran', required: true },
    { id: 'pregunta32', number: 32, text: 'Mis compañeros de trabajo me ayudan cuando tengo dificultades', required: true },
    { id: 'pregunta33', number: 33, text: 'En mi trabajo puedo expresarme libremente sin interrupciones', required: true },
    { id: 'pregunta34', number: 34, text: 'Recibo críticas constantes a mi persona y/o trabajo', required: true },
    { id: 'pregunta35', number: 35, text: 'Recibo burlas, calumnias, difamaciones, humillaciones o ridiculizaciones', required: true },
    { id: 'pregunta36', number: 36, text: 'Se ignora mi presencia o se me excluye de las reuniones de trabajo y en la toma de decisiones', required: true },
    { id: 'pregunta37', number: 37, text: 'Se manipulan las situaciones de trabajo para hacerme parecer un mal trabajador', required: true },
    { id: 'pregunta38', number: 38, text: 'Se ignoran mis éxitos laborales y se atribuyen a otros trabajadores', required: true },
    { id: 'pregunta39', number: 39, text: 'Me bloquean o impiden las oportunidades que tengo para obtener ascenso o mejora en mi trabajo', required: true },
    { id: 'pregunta40', number: 40, text: 'He presenciado actos de violencia en mi centro de trabajo', required: true },
    // Preguntas condicionales - Solo si atiende clientes (41-43)
    { id: 'pregunta41', number: 41, text: 'Atiendo clientes o usuarios muy enojados', required: true, conditional: 'servicioClientes' },
    { id: 'pregunta42', number: 42, text: 'Mi trabajo me exige atender personas muy necesitadas de ayuda o enfermas', required: true, conditional: 'servicioClientes' },
    { id: 'pregunta43', number: 43, text: 'Para hacer mi trabajo debo demostrar sentimientos distintos a los míos', required: true, conditional: 'servicioClientes' },
    // Preguntas condicionales - Solo si es jefe (44-46)
    { id: 'pregunta44', number: 44, text: 'Comunican tarde los asuntos de trabajo', required: true, conditional: 'esJefe' },
    { id: 'pregunta45', number: 45, text: 'Dificultan el logro de los resultados del trabajo', required: true, conditional: 'esJefe' },
    { id: 'pregunta46', number: 46, text: 'Ignoran las sugerencias para mejorar su trabajo', required: true, conditional: 'esJefe' }
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

  useEffect(() => {
    setShowClientesQuestions(servicioClientes === 'Sí')
    setShowJefeQuestions(esJefe === 'Sí')
  }, [servicioClientes, esJefe])

  const handleSubmit = async (formData) => {
    if (!empresaId) {
      alert('Por favor inicie sesión primero')
      return
    }

    if (!servicioClientes || !esJefe) {
      alert('Por favor responda las preguntas sobre servicio a clientes y si es jefe')
      return
    }

    setLoading(true)

    try {
      // Construir objeto de preguntas igual al frontend anterior
      const preguntas = {}
      
      // Agregar preguntas 1-40 (obligatorias)
      for (let i = 1; i <= 40; i++) {
        if (formData[`pregunta${i}`]) {
          preguntas[`pregunta${i}`] = formData[`pregunta${i}`]
        }
      }

      // Agregar preguntas condicionales de clientes (41-43) solo si corresponde
      if (servicioClientes === 'Sí') {
        for (let i = 41; i <= 43; i++) {
          if (formData[`pregunta${i}`]) {
            preguntas[`pregunta${i}`] = formData[`pregunta${i}`]
          }
        }
      }

      // Agregar preguntas condicionales de jefe (44-46) solo si corresponde
      if (esJefe === 'Sí') {
        for (let i = 44; i <= 46; i++) {
          if (formData[`pregunta${i}`]) {
            preguntas[`pregunta${i}`] = formData[`pregunta${i}`]
          }
        }
      }

      const data = {
        empresaId,
        servicioClientes: servicioClientes === 'Sí',
        esJefe: esJefe === 'Sí',
        preguntas: preguntas,
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
          {/* Preguntas sobre servicio a clientes y jefe */}
          <div className="row mb-4">
            <div className="col-md-6 mb-3">
              <label className="form-label fw-bold">
                ¿Debe brindar servicio a clientes o usuarios?
                <span className="text-danger"> *</span>
              </label>
              <select
                className="form-select"
                value={servicioClientes}
                onChange={(e) => setServicioClientes(e.target.value)}
                required
              >
                <option value="">Seleccione una opción</option>
                <option value="Sí">Sí</option>
                <option value="No">No</option>
              </select>
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label fw-bold">
                ¿Es jefe de otros trabajadores?
                <span className="text-danger"> *</span>
              </label>
              <select
                className="form-select"
                value={esJefe}
                onChange={(e) => setEsJefe(e.target.value)}
                required
              >
                <option value="">Seleccione una opción</option>
                <option value="Sí">Sí</option>
                <option value="No">No</option>
              </select>
            </div>
          </div>

          <hr className="my-4" />

          <QuestionForm 
            questions={questions.filter(q => {
              // Filtrar preguntas condicionales según las respuestas
              if (q.conditional === 'servicioClientes') {
                return showClientesQuestions
              }
              if (q.conditional === 'esJefe') {
                return showJefeQuestions
              }
              return true
            })}
            onSubmit={handleSubmit}
            loading={loading}
          />
        </div>
      </div>
    </div>
  )
}

export default PsicosocialTrabajo

