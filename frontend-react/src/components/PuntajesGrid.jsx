import DonutChart from './DonutChart'

function PuntajesGrid({ puntajes, tipo = 'categoria' }) {
  if (!puntajes || Object.keys(puntajes).length === 0) {
    return <p className="text-muted small">No hay datos disponibles</p>
  }

  const obtenerMaximoParaTipo = (nombre, tipo) => {
    if (tipo === 'categoria') {
      const maximos = {
        'Ambiente de trabajo': 14,
        'Factores propios de la actividad': 80,
        'Organización del tiempo de trabajo': 14,
        'Liderazgo y relaciones en el trabajo': 58,
        'Entorno organizacional': 23
      }
      return maximos[nombre] || 50
    } else if (tipo === 'dominio') {
      const maximos = {
        'Condiciones en el ambiente de trabajo': 14,
        'Carga de trabajo': 37,
        'Falta de control sobre el trabajo': 25,
        'Jornada de trabajo': 9,
        'Interferencia en la relación trabajo-familia': 14,
        'Liderazgo': 21,
        'Relaciones en el trabajo': 21,
        'Violencia': 16,
        'Reconocimiento del desempeño': 23,
        'Insuficiente sentido de pertenencia e inestabilidad': 12
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
          <DonutChart
            key={`${tipo}-${index}-${nombre}`}
            valor={valor}
            maximo={maximo}
            nombre={nombre}
            nivel={nivel}
            tipo={tipo}
          />
        )
      })}
    </div>
  )
}

export default PuntajesGrid

