import { useState } from 'react'
import DonutChart from './DonutChart'

function PuntajesGrid({ puntajes, tipo = 'categoria', infoMap = {}, descripcionGenerica = 'Indicador contemplado en la NOM-035.' }) {
  const [detallesAbiertos, setDetallesAbiertos] = useState({})

  if (!puntajes || Object.keys(puntajes).length === 0) {
    return <p className="text-muted small">No hay datos disponibles</p>
  }

  const toggleDetalle = (nombre) => {
    setDetallesAbiertos(prev => ({
      ...prev,
      [nombre]: !prev[nombre]
    }))
  }

  const obtenerMaximoParaTipo = (nombre, tipo) => {
    if (tipo === 'categoria') {
      // Máximos según la estructura de 72 preguntas del cuestionario de Entorno
      // Cada pregunta puede tener máximo 4 puntos
      const maximos = {
        'Ambiente de trabajo': 20, // 5 preguntas × 4 = 20
        'Factores propios de la actividad': 100, // 25 preguntas × 4 = 100 (11 básicas + 4 condicionales de Carga de trabajo + 10 de Falta de control)
        'Organización del tiempo de trabajo': 16, // 4 preguntas × 4 = 16 (2 jornada + 4 trabajo-familia)
        'Liderazgo y relaciones en el trabajo': 72, // 18 preguntas × 4 = 72 (9 liderazgo + 9 relaciones + 8 violencia)
        'Entorno organizacional': 40 // 10 preguntas × 4 = 40 (6 reconocimiento + 4 pertenencia)
      }
      return maximos[nombre] || 50
    } else if (tipo === 'dominio') {
      // Máximos por dominio según la estructura de 72 preguntas
      // Cada pregunta puede tener máximo 4 puntos
      const maximos = {
        'Condiciones en el ambiente de trabajo': 20, // 5 preguntas × 4 = 20
        'Carga de trabajo': 60, // 15 preguntas × 4 = 60 (11 básicas + 4 condicionales 65-68)
        'Falta de control sobre el trabajo': 40, // 10 preguntas × 4 = 40
        'Jornada de trabajo': 8, // 2 preguntas × 4 = 8
        'Interferencia en la relación trabajo-familia': 16, // 4 preguntas × 4 = 16
        'Liderazgo': 36, // 9 preguntas × 4 = 36
        'Relaciones en el trabajo': 36, // 9 preguntas × 4 = 36 (5 básicas + 4 condicionales 69-72)
        'Violencia': 32, // 8 preguntas × 4 = 32
        'Reconocimiento del desempeño': 24, // 6 preguntas × 4 = 24
        'Insuficiente sentido de pertenencia e inestabilidad': 16 // 4 preguntas × 4 = 16
      }
      return maximos[nombre] || 30
    }
    return 50
  }

  const obtenerNivelPorCategoria = (nombre, puntaje) => {
    const rangos = {
      'Ambiente de trabajo': [5, 9, 11, 14],
      'Factores propios de la actividad': [15, 30, 45, 80],
      'Organización del tiempo de trabajo': [5, 9, 11, 14],
      'Liderazgo y relaciones en el trabajo': [14, 29, 42, 58],
      'Entorno organizacional': [10, 14, 18, 23]
    }

    const limites = rangos[nombre]
    if (!limites) return 'Nulo'

    if (puntaje < limites[0]) return 'Nulo'
    if (puntaje < limites[1]) return 'Bajo'
    if (puntaje < limites[2]) return 'Medio'
    if (puntaje < limites[3]) return 'Alto'
    return 'Muy alto'
  }

  const obtenerNivelPorDominio = (nombre, puntaje) => {
    const rangos = {
      'Condiciones en el ambiente de trabajo': [5, 9, 11, 14],
      'Carga de trabajo': [15, 21, 27, 37],
      'Falta de control sobre el trabajo': [11, 16, 21, 25],
      'Jornada de trabajo': [1, 4, 6, 9],
      'Interferencia en la relación trabajo-familia': [4, 8, 11, 14],
      'Liderazgo': [9, 12, 16, 21],
      'Relaciones en el trabajo': [10, 13, 17, 21],
      'Violencia': [7, 10, 13, 16],
      'Reconocimiento del desempeño': [10, 14, 18, 23],
      'Insuficiente sentido de pertenencia e inestabilidad': [4, 8, 10, 12]
    }

    const limites = rangos[nombre]
    if (!limites) return 'Nulo'

    if (puntaje < limites[0]) return 'Nulo'
    if (puntaje < limites[1]) return 'Bajo'
    if (puntaje < limites[2]) return 'Medio'
    if (puntaje < limites[3]) return 'Alto'
    return 'Muy alto'
  }

  return (
    <div className="donut-chart-grid">
      {Object.entries(puntajes).map(([nombre, valor], index) => {
        const maximo = obtenerMaximoParaTipo(nombre, tipo)
        const nivel = tipo === 'categoria' 
          ? obtenerNivelPorCategoria(nombre, valor)
          : obtenerNivelPorDominio(nombre, valor)
        
        return (
          <div key={`${tipo}-${index}-${nombre}`} className="donut-chart-card">
            <DonutChart
              valor={valor}
              maximo={maximo}
              nombre={nombre}
              nivel={nivel}
              tipo={tipo}
            />
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm px-3 mt-3"
              onClick={() => toggleDetalle(nombre)}
            >
              <i className={`bi ${detallesAbiertos[nombre] ? 'bi-chevron-up' : 'bi-chevron-down'} me-2`}></i>
              {detallesAbiertos[nombre] ? 'Ocultar detalles' : 'Ver detalles'}
            </button>
            {detallesAbiertos[nombre] && (
              <div className="card shadow-sm border-primary mt-3">
                <div className="card-body py-3">
                  <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-2">
                    <h6 className="card-title mb-2 mb-md-0">
                      <i className="bi bi-info-circle me-2 text-primary"></i>
                      {nombre}
                    </h6>
                    <div className="d-flex align-items-center gap-2">
                      <span className="badge bg-primary-subtle text-primary border border-primary">
                        Puntaje: {valor} / {maximo}
                      </span>
                      <span className="badge bg-secondary-subtle text-secondary border border-secondary">
                        Nivel: {nivel}
                      </span>
                    </div>
                  </div>
                  <p className="card-text small mb-0 text-muted">
                    {infoMap[nombre] || descripcionGenerica}
                  </p>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default PuntajesGrid

