import { Link } from 'react-router-dom'
import { useEffect } from 'react'

function Home() {
  useEffect(() => {
    // Inicializar Bootstrap JS para los accordions
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js'
    script.async = true
    document.body.appendChild(script)
    return () => {
      document.body.removeChild(script)
    }
  }, [])

  return (
    <>
      {/* Hero Section */}
      <section className="hero-section text-center">
        <div className="container">
          <h1 className="display-4 fw-bold">NOM-035-STPS-2018</h1>
          <p className="lead">Factores de riesgo psicosocial en el trabajo - Identificación, análisis y prevención</p>
          <a href="#que-es" className="btn btn-light btn-lg mt-3">Conoce más</a>
        </div>
      </section>

      {/* Qué es la NOM-035 */}
      <section id="que-es" className="container mb-5 py-5">
        <div className="row">
          <div className="col-lg-8 mx-auto text-center">
            <h2 className="mb-4">¿Qué es la NOM-035?</h2>
            <p className="lead">La Norma Oficial Mexicana NOM-035-STPS-2018 es una regulación emitida por la Secretaría del Trabajo y Previsión Social (STPS) que establece los elementos para identificar, analizar y prevenir los factores de riesgo psicosocial en los centros de trabajo, así como para promover un entorno organizacional favorable.</p>
            <p>Esta norma entró en vigor el 23 de octubre de 2018 y su implementación se realizó de manera gradual:</p>
            
            <div className="row mt-4">
              <div className="col-md-4 mb-4">
                <div className="card h-100">
                  <div className="card-body">
                    <h5 className="card-title">Primera etapa</h5>
                    <p className="card-text">A partir del 23 de octubre de 2019 para empresas con más de 50 trabajadores.</p>
                  </div>
                </div>
              </div>
              <div className="col-md-4 mb-4">
                <div className="card h-100">
                  <div className="card-body">
                    <h5 className="card-title">Segunda etapa</h5>
                    <p className="card-text">A partir del 23 de octubre de 2020 para todas las empresas, independientemente de su tamaño.</p>
                  </div>
                </div>
              </div>
              <div className="col-md-4 mb-4">
                <div className="card h-100">
                  <div className="card-body">
                    <h5 className="card-title">Aplicación</h5>
                    <p className="card-text">Obligatoria para todos los centros de trabajo en México, incluyendo sector público y privado.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Objetivo */}
      <section id="objetivo" className="bg-light py-5">
        <div className="container">
          <div className="row">
            <div className="col-lg-8 mx-auto">
              <h2 className="text-center mb-4">Objetivo de la NOM-035</h2>
              <p>La norma busca establecer los elementos para identificar, analizar y prevenir los factores de riesgo psicosocial, así como para promover un entorno organizacional favorable en los centros de trabajo.</p>
              
              <div className="accordion mt-4" id="objetivosAccordion">
                <div className="accordion-item">
                  <h2 className="accordion-header">
                    <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne">
                      Factores de riesgo psicosocial
                    </button>
                  </h2>
                  <div id="collapseOne" className="accordion-collapse collapse show" data-bs-parent="#objetivosAccordion">
                    <div className="accordion-body">
                      <p>Identificar condiciones peligrosas en el trabajo que pueden provocar trastornos de ansiedad, estrés laboral o alteraciones del sueño.</p>
                      <ul>
                        <li>Cargas de trabajo excesivas</li>
                        <li>Jornadas laborales extendidas</li>
                        <li>Falta de control sobre el trabajo</li>
                        <li>Relaciones laborales negativas</li>
                        <li>Violencia laboral</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="accordion-item">
                  <h2 className="accordion-header">
                    <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTwo">
                      Entorno organizacional favorable
                    </button>
                  </h2>
                  <div id="collapseTwo" className="accordion-collapse collapse" data-bs-parent="#objetivosAccordion">
                    <div className="accordion-body">
                      <p>Promover condiciones que favorezcan el desarrollo de los trabajadores y la productividad:</p>
                      <ul>
                        <li>Claridad en funciones y responsabilidades</li>
                        <li>Participación en la toma de decisiones</li>
                        <li>Reconocimiento del desempeño</li>
                        <li>Respeto y equidad</li>
                        <li>Balance vida-trabajo</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Protección de datos */}
      <section id="proteccion" className="data-protection">
        <div className="container">
          <h2 className="text-center mb-5">Protección de Datos en la NOM-035</h2>
          <div className="row">
            <div className="col-md-6">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title"><i className="bi bi-shield-lock"></i> Confidencialidad</h5>
                  <p className="card-text">La NOM-035 establece que toda la información obtenida a través de los cuestionarios y evaluaciones debe ser manejada con estricta confidencialidad.</p>
                  <ul>
                    <li>Los resultados individuales no pueden ser compartidos con superiores jerárquicos</li>
                    <li>Solo personal autorizado puede acceder a los datos</li>
                    <li>Los datos deben ser anonimizados para análisis grupales</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title"><i className="bi bi-file-earmark-lock2"></i> Cumplimiento con la LFPDPPP</h5>
                  <p className="card-text">El tratamiento de datos personales debe cumplir con la Ley Federal de Protección de Datos Personales en Posesión de Particulares (LFPDPPP).</p>
                  <ul>
                    <li>Se debe obtener consentimiento informado de los trabajadores</li>
                    <li>Los datos deben ser utilizados únicamente para los fines establecidos</li>
                    <li>Se deben implementar medidas de seguridad adecuadas</li>
                    <li>Los trabajadores tienen derecho a acceder, rectificar y cancelar sus datos</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          <div className="row mt-4">
            <div className="col-12">
              <div className="alert alert-info mt-4">
                <h4><i className="bi bi-exclamation-triangle"></i> Consideraciones importantes</h4>
                <p>Los empleadores deben garantizar que la implementación de la NOM-035 no vulnere los derechos de privacidad de los trabajadores. Los cuestionarios no deben contener preguntas invasivas o que recaben información sensible (ideología, religión, preferencias sexuales, etc.).</p>
                <p>Los datos recabados deben ser almacenados de forma segura y eliminados una vez cumplido su propósito, salvo que exista una obligación legal de conservarlos.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Implementación */}
      <section id="implementacion" className="container py-5">
        <h2 className="text-center mb-5">Implementación de la NOM-035</h2>
        <div className="row">
          <div className="col-lg-6">
            <h4>Pasos para cumplir con la norma:</h4>
            <ol className="list-group list-group-numbered mb-4">
              <li className="list-group-item">Realizar una política de prevención de riesgos psicosociales</li>
              <li className="list-group-item">Identificar y analizar factores de riesgo psicosocial</li>
              <li className="list-group-item">Evaluar a los trabajadores (cuando aplique)</li>
              <li className="list-group-item">Implementar medidas de control y prevención</li>
              <li className="list-group-item">Capacitar a los trabajadores</li>
              <li className="list-group-item">Dar seguimiento a las medidas implementadas</li>
            </ol>
          </div>
          <div className="col-lg-6">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Sanciones por incumplimiento</h5>
                <p className="card-text">El no cumplimiento con la NOM-035 puede derivar en sanciones por parte de la STPS:</p>
                <table className="table table-bordered">
                  <thead className="table-dark">
                    <tr>
                      <th>Infracción</th>
                      <th>Sanción (UMA)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>No implementar la política</td>
                      <td>250 a 2,500</td>
                    </tr>
                    <tr>
                      <td>No realizar evaluaciones</td>
                      <td>250 a 5,000</td>
                    </tr>
                    <tr>
                      <td>No atender casos de violencia</td>
                      <td>500 a 5,000</td>
                    </tr>
                  </tbody>
                </table>
                <p className="text-muted"><small>* UMA = Unidad de Medida y Actualización (valor aproximado en 2023: $103.74 MXN)</small></p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sección de Registro */}
      <section id="registro" className="py-5 bg-primary text-white" style={{background: 'linear-gradient(135deg, #3a7bd5 0%, #00d2ff 100%)'}}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8 text-center">
              <h2 className="display-5 fw-bold mb-4">¡Implementa la NOM-035 en tu empresa!</h2>
              <p className="lead mb-5">Cumple con la normativa y protege el bienestar de tus colaboradores</p>
              
              <Link to="/intermedio" className="btn btn-light btn-lg px-5 py-3 fs-4 fw-bold shadow-lg" style={{borderRadius: '50px'}}>
                <i className="bi bi-building-check me-2"></i>Iniciar
              </Link>
              
              <div className="mt-4">
                <small className="d-block">Proceso 100% seguro y confidencial</small>
                <div className="mt-2">
                  <i className="bi bi-shield-lock fs-4 me-2"></i>
                  <i className="bi bi-file-earmark-lock fs-4 me-2"></i>
                  <i className="bi bi-person-check fs-4"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default Home

