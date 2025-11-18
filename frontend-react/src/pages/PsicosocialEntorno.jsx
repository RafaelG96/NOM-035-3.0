import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { psicosocialAPI, empresaAPI } from '../services/api'
import QuestionForm from '../components/QuestionForm'
import FeedbackModal from '../components/FeedbackModal'
import { useFormLock } from '../context/FormLockContext.jsx'

function PsicosocialEntorno() {
  const navigate = useNavigate()
  const { lockForm, unlockForm } = useFormLock()
  const [showLogin, setShowLogin] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loginData, setLoginData] = useState({ nombreEmpresa: '', clave: '' })
  const [empresaId, setEmpresaId] = useState(null)
  const [empresaNombre, setEmpresaNombre] = useState('')
  const [servicioClientes, setServicioClientes] = useState('')
  const [esJefe, setEsJefe] = useState('')
  const [showClientesQuestions, setShowClientesQuestions] = useState(false)
  const [showJefeQuestions, setShowJefeQuestions] = useState(false)
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

  // Preguntas del formulario psicosocial entorno - 72 preguntas según NOM-035
  const questions = [
    { id: 'pregunta1', number: 1, text: 'El espacio donde trabajo me permite realizar mis actividades de manera segura e higiénica', required: true },
    { id: 'pregunta2', number: 2, text: 'Mi trabajo me exige hacer mucho esfuerzo físico', required: true },
    { id: 'pregunta3', number: 3, text: 'Me preocupa sufrir un accidente en mi trabajo', required: true },
    { id: 'pregunta4', number: 4, text: 'Considero que en mi trabajo se aplican las normas de seguridad y salud en el trabajo', required: true },
    { id: 'pregunta5', number: 5, text: 'Considero que las actividades que realizo son peligrosas', required: true },
    { id: 'pregunta6', number: 6, text: 'Por la cantidad de trabajo que tengo debo quedarme tiempo adicional a mi turno', required: true },
    { id: 'pregunta7', number: 7, text: 'Por la cantidad de trabajo que tengo debo trabajar sin parar', required: true },
    { id: 'pregunta8', number: 8, text: 'Considero que es necesario mantener un ritmo de trabajo acelerado', required: true },
    { id: 'pregunta9', number: 9, text: 'Mi trabajo exige que esté muy concentrado', required: true },
    { id: 'pregunta10', number: 10, text: 'Mi trabajo requiere que memorice mucha información', required: true },
    { id: 'pregunta11', number: 11, text: 'En mi trabajo tengo que tomar decisiones difíciles muy rápido', required: true },
    { id: 'pregunta12', number: 12, text: 'Mi trabajo exige que atienda varios asuntos al mismo tiempo', required: true },
    { id: 'pregunta13', number: 13, text: 'En mi trabajo soy responsable de cosas de mucho valor', required: true },
    { id: 'pregunta14', number: 14, text: 'Respondo ante mi jefe por los resultados de toda mi área de trabajo', required: true },
    { id: 'pregunta15', number: 15, text: 'En el trabajo me dan órdenes contradictorias', required: true },
    { id: 'pregunta16', number: 16, text: 'Considero que en mi trabajo me piden hacer cosas innecesarias', required: true },
    { id: 'pregunta17', number: 17, text: 'Trabajo horas extras más de tres veces a la semana', required: true },
    { id: 'pregunta18', number: 18, text: 'Mi trabajo me exige laborar en días de descanso, festivos o fines de semana', required: true },
    { id: 'pregunta19', number: 19, text: 'Considero que el tiempo en el trabajo es mucho y perjudica mis actividades familiares o personales', required: true },
    { id: 'pregunta20', number: 20, text: 'Debo atender asuntos de trabajo cuando estoy en casa', required: true },
    { id: 'pregunta21', number: 21, text: 'Pienso en las actividades familiares o personales cuando estoy en mi trabajo', required: true },
    { id: 'pregunta22', number: 22, text: 'Pienso que mis responsabilidades familiares afectan mi trabajo', required: true },
    { id: 'pregunta23', number: 23, text: 'Mi trabajo permite que desarrolle nuevas habilidades', required: true },
    { id: 'pregunta24', number: 24, text: 'En mi trabajo puedo aspirar a un mejor puesto', required: true },
    { id: 'pregunta25', number: 25, text: 'Durante mi jornada de trabajo puedo tomar pausas cuando las necesito', required: true },
    { id: 'pregunta26', number: 26, text: 'Puedo decidir cuánto trabajo realizo durante la jornada laboral', required: true },
    { id: 'pregunta27', number: 27, text: 'Puedo decidir la velocidad a la que realizo mis actividades en mi trabajo', required: true },
    { id: 'pregunta28', number: 28, text: 'Puedo cambiar el orden de las actividades que realizo en mi trabajo', required: true },
    { id: 'pregunta29', number: 29, text: 'Los cambios que se presentan en mi trabajo dificultan mi labor', required: true },
    { id: 'pregunta30', number: 30, text: 'Cuando se presentan cambios en mi trabajo se tienen en cuenta mis ideas o aportaciones', required: true },
    { id: 'pregunta31', number: 31, text: 'Me informan con claridad cuáles son mis funciones', required: true },
    { id: 'pregunta32', number: 32, text: 'Me explican claramente los resultados que debo obtener en mi trabajo', required: true },
    { id: 'pregunta33', number: 33, text: 'Me explican claramente los objetivos de mi trabajo', required: true },
    { id: 'pregunta34', number: 34, text: 'Me informan con quién puedo resolver problemas o asuntos de trabajo', required: true },
    { id: 'pregunta35', number: 35, text: 'Me permiten asistir a capacitaciones relacionadas con mi trabajo', required: true },
    { id: 'pregunta36', number: 36, text: 'Recibo capacitación útil para hacer mi trabajo', required: true },
    { id: 'pregunta37', number: 37, text: 'Mi jefe ayuda a organizar mejor el trabajo', required: true },
    { id: 'pregunta38', number: 38, text: 'Mi jefe tiene en cuenta mis puntos de vista y opiniones', required: true },
    { id: 'pregunta39', number: 39, text: 'Mi jefe me comunica a tiempo la información relacionada con el trabajo', required: true },
    { id: 'pregunta40', number: 40, text: 'La orientación que me da mi jefe me ayuda a realizar mejor mi trabajo', required: true },
    { id: 'pregunta41', number: 41, text: 'Mi jefe ayuda a solucionar los problemas que se presentan en el trabajo', required: true },
    { id: 'pregunta42', number: 42, text: 'Puedo confiar en mis compañeros de trabajo', required: true },
    { id: 'pregunta43', number: 43, text: 'Entre compañeros solucionamos los problemas de trabajo de forma respetuosa', required: true },
    { id: 'pregunta44', number: 44, text: 'En mi trabajo me hacen sentir parte del grupo', required: true },
    { id: 'pregunta45', number: 45, text: 'Cuando tenemos que realizar trabajo de equipo los compañeros colaboran', required: true },
    { id: 'pregunta46', number: 46, text: 'Mis compañeros de trabajo me ayudan cuando tengo dificultades', required: true },
    { id: 'pregunta47', number: 47, text: 'Me informan sobre lo que hago bien en mi trabajo', required: true },
    { id: 'pregunta48', number: 48, text: 'La forma como evalúan mi trabajo en mi centro de trabajo me ayuda a mejorar mi desempeño', required: true },
    { id: 'pregunta49', number: 49, text: 'En mi centro de trabajo me pagan a tiempo mi salario', required: true },
    { id: 'pregunta50', number: 50, text: 'El pago que recibo es el que merezco por el trabajo que realizo', required: true },
    { id: 'pregunta51', number: 51, text: 'Si obtengo los resultados esperados en mi trabajo me recompensan o reconocen', required: true },
    { id: 'pregunta52', number: 52, text: 'Las personas que hacen bien el trabajo pueden crecer laboralmente', required: true },
    { id: 'pregunta53', number: 53, text: 'Considero que mi trabajo es estable', required: true },
    { id: 'pregunta54', number: 54, text: 'En mi trabajo existe continua rotación de personal', required: true },
    { id: 'pregunta55', number: 55, text: 'Siento orgullo de laborar en este centro de trabajo', required: true },
    { id: 'pregunta56', number: 56, text: 'Me siento comprometido con mi trabajo', required: true },
    { id: 'pregunta57', number: 57, text: 'En mi trabajo puedo expresarme libremente sin interrupciones', required: true },
    { id: 'pregunta58', number: 58, text: 'Recibo críticas constantes a mi persona y/o trabajo', required: true },
    { id: 'pregunta59', number: 59, text: 'Recibo burlas, calumnias, difamaciones, humillaciones o ridiculizaciones', required: true },
    { id: 'pregunta60', number: 60, text: 'Se ignora mi presencia o se me excluye de las reuniones de trabajo y en la toma de decisiones', required: true },
    { id: 'pregunta61', number: 61, text: 'Se manipulan las situaciones de trabajo para hacerme parecer un mal trabajador', required: true },
    { id: 'pregunta62', number: 62, text: 'Se ignoran mis éxitos laborales y se atribuyen a otros trabajadores', required: true },
    { id: 'pregunta63', number: 63, text: 'Me bloquean o impiden las oportunidades que tengo para obtener ascenso o mejora en mi trabajo', required: true },
    { id: 'pregunta64', number: 64, text: 'He presenciado actos de violencia en mi centro de trabajo', required: true },
    { id: 'pregunta65', number: 65, text: 'Mi trabajo me exige atender clientes o usuarios muy enojados', required: false, conditional: 'servicioClientes' },
    { id: 'pregunta66', number: 66, text: 'Mi trabajo me exige atender personas muy necesitadas de ayuda o enfermas', required: false, conditional: 'servicioClientes' },
    { id: 'pregunta67', number: 67, text: 'Para hacer mi trabajo debo demostrar sentimientos distintos a los míos', required: false, conditional: 'servicioClientes' },
    { id: 'pregunta68', number: 68, text: 'Mi trabajo me exige atender situaciones de violencia', required: false, conditional: 'servicioClientes' },
    { id: 'pregunta69', number: 69, text: 'Comunican tarde los asuntos de trabajo', required: false, conditional: 'esJefe' },
    { id: 'pregunta70', number: 70, text: 'Dificultan el logro de los resultados del trabajo', required: false, conditional: 'esJefe' },
    { id: 'pregunta71', number: 71, text: 'Cooperan poco cuando se necesita', required: false, conditional: 'esJefe' },
    { id: 'pregunta72', number: 72, text: 'Ignoran las sugerencias para mejorar su trabajo', required: false, conditional: 'esJefe' }
  ]

  useEffect(() => {
    lockForm('Completa y envía el cuestionario antes de abandonar la página.')
    return () => {
      unlockForm()
    }
  }, [lockForm, unlockForm])

  useEffect(() => {
    const storedEmpresaId = localStorage.getItem('empresaId')
    const storedEmpresaNombre = localStorage.getItem('empresaNombre')
    
    if (storedEmpresaId && storedEmpresaNombre) {
      setEmpresaId(storedEmpresaId)
      setEmpresaNombre(storedEmpresaNombre)
      setShowLogin(false)
    } else {
      setFeedback({
        show: true,
        title: 'Sesión requerida',
        message: 'No se encontraron datos de autenticación. Por favor inicia sesión nuevamente.',
        theme: 'warning',
        autoClose: 3500,
        afterClose: () => navigate('/intermedio')
      })
      setShowLogin(true)
    }
  }, [navigate])

  useEffect(() => {
    setShowClientesQuestions(servicioClientes === 'Sí')
  }, [servicioClientes])

  useEffect(() => {
    setShowJefeQuestions(esJefe === 'Sí')
  }, [esJefe])

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await empresaAPI.verifyClave(loginData)
      if (response.data.success) {
        localStorage.setItem('empresaId', response.data.empresaId)
        localStorage.setItem('empresaNombre', loginData.nombreEmpresa)
        setEmpresaId(response.data.empresaId)
        setEmpresaNombre(loginData.nombreEmpresa)
        setShowLogin(false)
        setFeedback({
          show: true,
          title: 'Acceso exitoso',
          message: 'Bienvenido, ya puedes responder el cuestionario de Entorno.',
          theme: 'success',
          autoClose: 2500,
          afterClose: null
        })
      } else {
        setFeedback({
          show: true,
          title: 'Acceso denegado',
          message: 'Credenciales inválidas para el cuestionario. Verifica la información ingresada.',
          theme: 'danger',
          autoClose: 4000,
          afterClose: null
        })
      }
    } catch (error) {
      setFeedback({
        show: true,
        title: 'Error de autenticación',
        message: error.response?.data?.message || error.message || 'No pudimos verificar tus credenciales. Inténtalo más tarde.',
        theme: 'danger',
        autoClose: 4000,
        afterClose: null
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (formData) => {
    if (!empresaId) {
      setFeedback({
        show: true,
        title: 'Sesión requerida',
        message: 'Por favor inicia sesión antes de completar el cuestionario.',
        theme: 'danger',
        autoClose: 3500,
        afterClose: null
      })
      return
    }

    if (!servicioClientes || !esJefe) {
      setFeedback({
        show: true,
        title: 'Información faltante',
        message: 'Responde si brindas servicio a clientes y si eres jefe para continuar.',
        theme: 'warning',
        autoClose: 3500,
        afterClose: null
      })
      return
    }

    setLoading(true)

    try {
      const preguntas = {}
      Object.keys(formData).forEach(key => {
        if (key.startsWith('pregunta')) {
          preguntas[key] = formData[key]
        }
      })

      const preguntasObligatorias = []
      for (let i = 1; i <= 64; i++) {
        if (!preguntas[`pregunta${i}`]) {
          preguntasObligatorias.push(i)
        }
      }

      if (preguntasObligatorias.length > 0) {
        setFeedback({
          show: true,
          title: 'Respuestas incompletas',
          message: `Faltan respuestas obligatorias: ${preguntasObligatorias.join(', ')}`,
          theme: 'warning',
          autoClose: 4000,
          afterClose: null
        })
        setLoading(false)
        return
      }

      const data = {
        empresaId,
        servicioClientes: servicioClientes === 'Sí',
        esJefe: esJefe === 'Sí',
        preguntas,
        timestamp: new Date().toISOString()
      }

      await psicosocialAPI.entorno(data)
      unlockForm()
      setFeedback({
        show: true,
        title: '¡Gracias!',
        message: 'Tus respuestas se guardaron con éxito. Serás redirigido a los resultados.',
        theme: 'success',
        autoClose: 2500,
        afterClose: () => navigate('/resultados-entorno')
      })
    } catch (error) {
      setFeedback({
        show: true,
        title: 'Error al enviar',
        message: error.message || 'No se pudo registrar el cuestionario. Inténtalo más tarde.',
        theme: 'danger',
        autoClose: 4000,
        afterClose: null
      })
    } finally {
      setLoading(false)
    }
  }

  if (showLogin) {
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
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card shadow">
              <div className="card-header bg-primary text-white">
                <h2 className="text-center mb-0">Acceso al Cuestionario</h2>
              </div>
              <div className="card-body">
                <form onSubmit={handleLogin}>
                  <div className="mb-3">
                    <label htmlFor="nombre-empresa" className="form-label">Nombre de la empresa:</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      id="nombre-empresa" 
                      required
                      value={loginData.nombreEmpresa}
                      onChange={(e) => setLoginData({...loginData, nombreEmpresa: e.target.value})}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="clave" className="form-label">Clave:</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      id="clave" 
                      required
                      value={loginData.clave}
                      onChange={(e) => setLoginData({...loginData, clave: e.target.value})}
                    />
                  </div>
                  <div className="d-grid">
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Verificando...
                        </>
                      ) : (
                        'Ingresar'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">Cuestionario Psicosocial - Entorno</h1>
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
              // Solo mostrar preguntas condicionales si se cumple la condición
              if (q.conditional === 'servicioClientes') {
                return showClientesQuestions // Solo mostrar si servicioClientes === 'Sí'
              }
              if (q.conditional === 'esJefe') {
                return showJefeQuestions // Solo mostrar si esJefe === 'Sí'
              }
              // Las preguntas sin conditional siempre se muestran
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

export default PsicosocialEntorno

