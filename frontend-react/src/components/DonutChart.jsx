import { useEffect, useRef } from 'react'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  DoughnutController
} from 'chart.js'

// Registrar elementos necesarios para gráficos doughnut
ChartJS.register(DoughnutController, ArcElement, Tooltip, Legend)

function DonutChart({ valor, maximo, nombre, nivel, tipo }) {
  const canvasRef = useRef(null)
  const chartRef = useRef(null)
  const canvasIdRef = useRef(`canvas-${Math.random().toString(36).substr(2, 9)}`)

  // Función para obtener rangos según tipo
  const obtenerRangosParaTipo = (nombre, tipo) => {
    if (tipo === 'categoria') {
      // Rangos para formulario de entorno
      const rangosEntorno = {
        'Ambiente de trabajo': [5, 9, 11, 14],
        'Factores propios de la actividad': [15, 30, 45, 80],
        'Organización del tiempo de trabajo': [5, 9, 11, 14],
        'Liderazgo y relaciones en el trabajo': [14, 29, 42, 58],
        'Entorno organizacional': [10, 14, 18, 23]
      }
      // Rangos para formulario de trabajo
      const rangosTrabajo = {
        'Ambiente de trabajo': [3, 5, 7, 9],
        'Factores propios de la actividad': [10, 20, 30, 40],
        'Organización del tiempo de trabajo': [4, 8, 9, 12],
        'Liderazgo y relaciones en el trabajo': [10, 18, 28, 38],
        'Falta de control sobre el trabajo': [5, 10, 15, 20]
      }
      return rangosEntorno[nombre] || rangosTrabajo[nombre] || [0, 0, 0, 0]
    } else if (tipo === 'dominio') {
      // Rangos para formulario de entorno
      const rangosEntorno = {
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
      // Rangos para formulario de trabajo
      const rangosTrabajo = {
        'Condiciones en el ambiente de trabajo': [3, 5, 7, 9],
        'Carga de trabajo': [12, 18, 20, 24],
        'Falta de control sobre el trabajo': [5, 8, 11, 14],
        'Jornada de trabajo': [1, 2, 4, 9],
        'Interferencia en la relación trabajo-familia': [1, 2, 4, 9],
        'Liderazgo': [3, 5, 8, 11],
        'Relaciones en el trabajo': [5, 8, 11, 14],
        'Violencia': [7, 10, 13, 16]
      }
      return rangosEntorno[nombre] || rangosTrabajo[nombre] || [0, 0, 0, 0]
    }
    return [0, 0, 0, 0]
  }

  useEffect(() => {
    if (!canvasRef.current) return

    // Destruir gráfico anterior si existe antes de crear uno nuevo
    if (chartRef.current) {
      try {
        chartRef.current.destroy()
      } catch (error) {
        console.warn('Error al destruir chart anterior:', error)
      }
      chartRef.current = null
    }

    const porcentaje = Math.round((valor / maximo) * 100)
    const rangos = obtenerRangosParaTipo(nombre, tipo)
    const [rangoNulo, rangoBajo, rangoMedio, rangoAlto] = rangos
    
    // Calcular porcentajes de cada segmento
    const pctNulo = (rangoNulo / maximo) * 100
    const pctBajo = ((rangoBajo - rangoNulo) / maximo) * 100
    const pctMedio = ((rangoMedio - rangoBajo) / maximo) * 100
    const pctAlto = ((rangoAlto - rangoMedio) / maximo) * 100
    const pctMuyAlto = ((maximo - rangoAlto) / maximo) * 100
    
    // Colores para cada segmento
    const colores = ['#6c757d', '#198754', '#ffc107', '#ff8c00', '#dc3545'] // gris, verde, amarillo, naranja, rojo
    
    // Crear datos para el gráfico
    const data = [pctNulo, pctBajo, pctMedio, pctAlto, pctMuyAlto]

    // Color del texto según nivel
    let colorTexto = '#6c757d'
    if (nivel === 'Muy alto' || nivel === 'Alto') {
      colorTexto = nivel === 'Muy alto' ? '#dc3545' : '#ff8c00'
    } else if (nivel === 'Medio') {
      colorTexto = '#ffc107'
    } else if (nivel === 'Bajo' || nivel === 'Nulo' || nivel === 'Nulo o despreciable') {
      colorTexto = '#198754'
    }

    // Verificar que el canvas aún existe antes de crear el chart
    if (!canvasRef.current) return

    try {
      // Crear nuevo gráfico
      const ctx = canvasRef.current.getContext('2d')
      chartRef.current = new ChartJS(ctx, {
        type: 'doughnut',
        data: {
          datasets: [{
            data: data,
            backgroundColor: colores,
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '70%',
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              enabled: false
            }
          },
          animation: {
            animateRotate: true,
            animateScale: false
          }
        },
        plugins: [{
          id: 'centeredText',
          beforeDraw: (chart) => {
            const ctx = chart.ctx
            const centerX = chart.chartArea.left + (chart.chartArea.right - chart.chartArea.left) / 2
            const centerY = chart.chartArea.top + (chart.chartArea.bottom - chart.chartArea.top) / 2
            
            ctx.save()
            ctx.font = 'bold 24px Arial'
            ctx.fillStyle = colorTexto
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText(`${porcentaje}%`, centerX, centerY)
            ctx.restore()
          }
        }]
      })
    } catch (error) {
      console.error('Error al crear chart:', error)
    }

    // Cleanup: destruir chart cuando el componente se desmonte o cambien las dependencias
    return () => {
      if (chartRef.current) {
        try {
          chartRef.current.destroy()
        } catch (error) {
          console.warn('Error al destruir chart en cleanup:', error)
        }
        chartRef.current = null
      }
    }
  }, [valor, maximo, nombre, nivel, tipo])

  const getBadgeClass = (nivel) => {
    if (!nivel) return 'bg-secondary'
    const lower = nivel.toLowerCase()
    if (lower.includes('muy alto')) return 'bg-danger'
    if (lower.includes('alto')) return 'bg-warning'
    if (lower.includes('medio')) return 'bg-warning text-dark'
    if (lower.includes('bajo')) return 'bg-success'
    return 'bg-secondary'
  }

  const obtenerMensajeAccion = (nivel) => {
    const mensajes = {
      'Nulo': { icon: 'check-circle', text: 'Monitoreo', color: 'text-success' },
      'Nulo o despreciable': { icon: 'check-circle', text: 'Monitoreo', color: 'text-success' },
      'Bajo': { icon: 'check-circle', text: 'Monitoreo', color: 'text-success' },
      'Medio': { icon: 'info-circle', text: 'Monitoreo continuo', color: 'text-info' },
      'Alto': { icon: 'exclamation-triangle', text: 'Requiere atención', color: 'text-warning' },
      'Muy alto': { icon: 'exclamation-circle', text: 'Acción urgente', color: 'text-danger' }
    }
    return mensajes[nivel] || { icon: 'info-circle', text: 'Revisar', color: 'text-secondary' }
  }

  const mensajeAccion = obtenerMensajeAccion(nivel)
  const badgeStyle = nivel === 'Alto' ? { backgroundColor: '#ff8c00', color: '#fff' } : {}

  return (
    <div className="donut-chart-wrapper">
      <div className="donut-chart-container">
        <canvas ref={canvasRef} id={canvasIdRef.current}></canvas>
      </div>
      <div className="donut-chart-title">{nombre}</div>
      <div>
        <span className={`badge ${getBadgeClass(nivel)} donut-chart-badge`} style={badgeStyle}>
          {nivel}
        </span>
      </div>
      <div className="donut-chart-score">Puntaje: {valor} / {maximo}</div>
      <div className={`donut-chart-action ${mensajeAccion.color}`}>
        <i className={`bi bi-${mensajeAccion.icon}`}></i> {mensajeAccion.text}
      </div>
    </div>
  )
}

export default DonutChart

