import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { psicosocialAPI, empresaAPI } from '../services/api'
import QuestionForm from '../components/QuestionForm'

function PsicosocialEntorno() {
  const navigate = useNavigate()
  const [showLogin, setShowLogin] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loginData, setLoginData] = useState({ nombreEmpresa: '', clave: '' })
  const [empresaId, setEmpresaId] = useState(null)
  const [empresaNombre, setEmpresaNombre] = useState('')
  const [servicioClientes, setServicioClientes] = useState('')
  const [esJefe, setEsJefe] = useState('')
  const [showClientesQuestions, setShowClientesQuestions] = useState(false)

  // Preguntas del formulario psicosocial entorno - 72 preguntas según NOM-035
  const questions = [
    // Sección 1: Condiciones ambientales
    { id: 'pregunta1', number: 1, text: 'El espacio donde trabajo me permite realizar mis actividades de manera segura e higiénica', required: true },
    { id: 'pregunta2', number: 2, text: 'Mi trabajo me exige hacer mucho esfuerzo físico', required: true },
    { id: 'pregunta3', number: 3, text: 'Me preocupa sufrir un accidente en mi trabajo', required: true },
    { id: 'pregunta4', number: 4, text: 'Considero que las actividades que realizo son peligrosas', required: true },
    { id: 'pregunta5', number: 5, text: 'Por el tipo de trabajo que realizo, me preocupa enfermarme', required: true },
    
    // Sección 2: Cantidad y ritmo de trabajo
    { id: 'pregunta6', number: 6, text: 'Por la cantidad de trabajo que tengo debo quedarme tiempo adicional a mi turno', required: true },
    { id: 'pregunta7', number: 7, text: 'Por la cantidad de trabajo que tengo debo trabajar sin parar', required: true },
    { id: 'pregunta8', number: 8, text: 'Trabajo contra reloj', required: true },
    
    // Sección 3: Esfuerzo mental
    { id: 'pregunta9', number: 9, text: 'Mi trabajo exige que esté muy concentrado', required: true },
    { id: 'pregunta10', number: 10, text: 'Mi trabajo requiere que memorice mucha información', required: true },
    { id: 'pregunta11', number: 11, text: 'Mi trabajo exige tomar decisiones rápidas e importantes', required: true },
    { id: 'pregunta12', number: 12, text: 'Mi trabajo requiere que atienda varios asuntos al mismo tiempo', required: true },
    
    // Sección 4: Responsabilidades
    { id: 'pregunta13', number: 13, text: 'En mi trabajo soy responsable de cosas de mucho valor', required: true },
    { id: 'pregunta14', number: 14, text: 'Respondo por cosas de mi trabajo que no están bajo mi control', required: true },
    { id: 'pregunta15', number: 15, text: 'En mi trabajo cometo errores, no me doy cuenta sino hasta después', required: true },
    { id: 'pregunta16', number: 16, text: 'Mi trabajo es monótono', required: true },
    
    // Sección 5: Jornada de trabajo
    { id: 'pregunta17', number: 17, text: 'Trabajo horas extras más de tres veces por semana', required: true },
    { id: 'pregunta18', number: 18, text: 'Mi trabajo me exige laborar en días de descanso, festivos o fines de semana', required: true },
    { id: 'pregunta19', number: 19, text: 'Considero que en mi trabajo me piden cosas innecesarias', required: true },
    { id: 'pregunta20', number: 20, text: 'Puedo organizar mi tiempo de trabajo libremente', required: true },
    { id: 'pregunta21', number: 21, text: 'Debo atender asuntos de trabajo cuando estoy en mi casa', required: true },
    { id: 'pregunta22', number: 22, text: 'Pienso en las preocupaciones del trabajo cuando estoy en mi tiempo libre', required: true },
    
    // Sección 6: Decisiones
    { id: 'pregunta23', number: 23, text: 'Puedo decidir cuándo hacer pausas en mi trabajo', required: true },
    { id: 'pregunta24', number: 24, text: 'Puedo decidir la cantidad de trabajo que realizo durante el día', required: true },
    { id: 'pregunta25', number: 25, text: 'Puedo decidir cómo hacer mi trabajo', required: true },
    { id: 'pregunta26', number: 26, text: 'Puedo cambiar el orden de las actividades que realizo en mi trabajo', required: true },
    { id: 'pregunta27', number: 27, text: 'Me informan con antelación sobre cambios que ocurrirán en mi trabajo', required: true },
    { id: 'pregunta28', number: 28, text: 'Me explican claramente los objetivos de mi trabajo', required: true },
    
    // Sección 7: Cambios
    { id: 'pregunta29', number: 29, text: 'Me informan con antelación sobre los cambios de horario o turno', required: true },
    { id: 'pregunta30', number: 30, text: 'Me informan con antelación sobre los cambios en las actividades, responsabilidades o funciones de mi trabajo', required: true },
    
    // Sección 8: Capacitación
    { id: 'pregunta31', number: 31, text: 'Recibo capacitación útil para hacer mi trabajo', required: true },
    { id: 'pregunta32', number: 32, text: 'Me informan sobre los riesgos de mi trabajo', required: true },
    { id: 'pregunta33', number: 33, text: 'Me explican qué hacer si me siento mal por el trabajo', required: true },
    
    // Sección 9: Jefes
    { id: 'pregunta34', number: 34, text: 'Mi jefe ayuda a solucionar los problemas', required: true },
    { id: 'pregunta35', number: 35, text: 'Mi jefe tiene en cuenta mis puntos de vista y opiniones', required: true },
    { id: 'pregunta36', number: 36, text: 'Mi jefe permite que los trabajadores participen en las decisiones', required: true },
    { id: 'pregunta37', number: 37, text: 'Mi jefe mantiene comunicación constante con los trabajadores', required: true },
    { id: 'pregunta38', number: 38, text: 'Mi jefe ayuda a organizar mejor el trabajo', required: true },
    
    // Sección 10: Compañeros
    { id: 'pregunta39', number: 39, text: 'Cuando tengo problemas, mis compañeros me ayudan', required: true },
    { id: 'pregunta40', number: 40, text: 'Puedo confiar en mis compañeros de trabajo', required: true },
    { id: 'pregunta41', number: 41, text: 'Mis compañeros me tratan con respeto', required: true },
    
    // Sección 11: Desempeño
    { id: 'pregunta42', number: 42, text: 'Recibo reconocimientos por mi trabajo', required: true },
    { id: 'pregunta43', number: 43, text: 'Me pagan lo suficiente por las actividades que realizo', required: true },
    { id: 'pregunta44', number: 44, text: 'Tengo las mismas oportunidades de ser promovido que otros compañeros', required: true },
    
    // Sección 12: Violencia
    { id: 'pregunta45', number: 45, text: 'En mi trabajo puedo expresarme libremente sin interrupciones', required: true },
    { id: 'pregunta46', number: 46, text: 'Recibo críticas constantes a mi persona y/o trabajo', required: true },
    { id: 'pregunta47', number: 47, text: 'Recibo burlas, calumnias, difamaciones, humillaciones, ridiculizaciones, como parte del trato frecuente en mi trabajo', required: true },
    { id: 'pregunta48', number: 48, text: 'Se ignora mi presencia o se me excluye de las reuniones de trabajo y/o en la toma de decisiones', required: true },
    { id: 'pregunta49', number: 49, text: 'Se manipulan las situaciones de trabajo para hacerme parecer un mal trabajador', required: true },
    { id: 'pregunta50', number: 50, text: 'Se sospecha frecuentemente del cumplimiento de mi trabajo sin motivo', required: true },
    { id: 'pregunta51', number: 51, text: 'Se vigila constantemente mi trabajo', required: true },
    { id: 'pregunta52', number: 52, text: 'Se presiona para que no ejerza mis derechos laborales establecidos por la ley', required: true },
    { id: 'pregunta53', number: 53, text: 'Se asignan actividades sin el material necesario para realizarlas', required: true },
    { id: 'pregunta54', number: 54, text: 'He presenciado actos de violencia en mi centro de trabajo', required: true },
    
    // Sección 13: Atención a clientes y usuarios (55-72) - Condicionales
    { id: 'pregunta55', number: 55, text: 'Atiendo clientes o usuarios muy enojados', required: false, conditional: 'servicioClientes' },
    { id: 'pregunta56', number: 56, text: 'Mi trabajo me exige atender personas muy necesitadas de ayuda o enfermas', required: false, conditional: 'servicioClientes' },
    { id: 'pregunta57', number: 57, text: 'Por la atención a clientes o usuarios, necesito mantener un estado de ánimo positivo a pesar de los acontecimientos personales', required: false, conditional: 'servicioClientes' },
    { id: 'pregunta58', number: 58, text: 'Mi trabajo me exige demostrar sentimientos distintos a los reales', required: false, conditional: 'servicioClientes' },
    { id: 'pregunta59', number: 59, text: 'Mi trabajo me exige atender situaciones de usuarios o clientes que me asustan', required: false, conditional: 'servicioClientes' },
    { id: 'pregunta60', number: 60, text: 'Mi trabajo me exige atender situaciones de usuarios o clientes que me ponen en riesgo', required: false, conditional: 'servicioClientes' },
    { id: 'pregunta61', number: 61, text: 'Mi trabajo me exige atender situaciones de usuarios o clientes que me hacen enojar', required: false, conditional: 'servicioClientes' },
    { id: 'pregunta62', number: 62, text: 'Mi trabajo me exige atender situaciones de usuarios o clientes que me hacen sentir mal', required: false, conditional: 'servicioClientes' },
    { id: 'pregunta63', number: 63, text: 'Mi trabajo me exige atender situaciones de usuarios o clientes que me hacen sentir triste', required: false, conditional: 'servicioClientes' },
    { id: 'pregunta64', number: 64, text: 'Mi trabajo me exige atender situaciones de usuarios o clientes que me hacen sentir impotente', required: false, conditional: 'servicioClientes' },
    { id: 'pregunta65', number: 65, text: 'Mi trabajo me exige atender situaciones de usuarios o clientes que me hacen sentir frustrado', required: false, conditional: 'servicioClientes' },
    { id: 'pregunta66', number: 66, text: 'Mi trabajo me exige atender situaciones de usuarios o clientes que me hacen sentir asustado', required: false, conditional: 'servicioClientes' },
    { id: 'pregunta67', number: 67, text: 'Mi trabajo me exige atender situaciones de usuarios o clientes que me hacen sentir tenso', required: false, conditional: 'servicioClientes' },
    { id: 'pregunta68', number: 68, text: 'Mi trabajo me exige atender situaciones de usuarios o clientes que me hacen sentir nervioso', required: false, conditional: 'servicioClientes' },
    { id: 'pregunta69', number: 69, text: 'Mi trabajo me exige atender situaciones de usuarios o clientes que me hacen sentir ansioso', required: false, conditional: 'servicioClientes' },
    { id: 'pregunta70', number: 70, text: 'Mi trabajo me exige atender situaciones de usuarios o clientes que me hacen sentir preocupado', required: false, conditional: 'servicioClientes' },
    { id: 'pregunta71', number: 71, text: 'Mi trabajo me exige atender situaciones de usuarios o clientes que me hacen sentir agobiado', required: false, conditional: 'servicioClientes' },
    { id: 'pregunta72', number: 72, text: 'Mi trabajo me exige atender situaciones de usuarios o clientes que me hacen sentir abrumado', required: false, conditional: 'servicioClientes' }
  ]

  useEffect(() => {
    // Verificar si hay datos de empresa en localStorage
    const storedEmpresaId = localStorage.getItem('empresaId')
    const storedEmpresaNombre = localStorage.getItem('empresaNombre')
    
    if (storedEmpresaId && storedEmpresaNombre) {
      setEmpresaId(storedEmpresaId)
      setEmpresaNombre(storedEmpresaNombre)
      setShowLogin(false)
    } else {
      setShowLogin(true)
    }
  }, [])

  useEffect(() => {
    setShowClientesQuestions(servicioClientes === 'Sí')
  }, [servicioClientes])

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
      }
    } catch (error) {
      alert(error.message || 'Error al verificar las credenciales')
    } finally {
      setLoading(false)
    }
  }

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
      
      // Agregar preguntas 1-54 (obligatorias)
      for (let i = 1; i <= 54; i++) {
        if (formData[`pregunta${i}`]) {
          preguntas[`pregunta${i}`] = formData[`pregunta${i}`]
        }
      }

      // Agregar preguntas condicionales de clientes (55-72) solo si corresponde
      if (servicioClientes === 'Sí') {
        for (let i = 55; i <= 72; i++) {
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

      await psicosocialAPI.entorno(data)
      alert('Formulario enviado exitosamente')
      navigate('/resultados-entorno')
    } catch (error) {
      alert(error.message || 'Error al enviar el formulario')
    } finally {
      setLoading(false)
    }
  }

  if (showLogin) {
    return (
      <div className="container py-5">
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
              if (q.conditional === 'servicioClientes') {
                return showClientesQuestions
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

export default PsicosocialEntorno

