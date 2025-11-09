// resultados.js
// Variable global para almacenar los datos de respuestas
let datosRespuestasGlobales = null;

document.addEventListener('DOMContentLoaded', async () => {
  const empresaSelect = document.getElementById('empresaSelect');
  const loadingDiv = document.getElementById('loading');
  const resultadosContainer = document.getElementById('resultadosContainer');

  // 1. Cargar empresas con formulario completo
  try {
    loadingDiv.style.display = 'block';
    resultadosContainer.classList.add('d-none');

    // Cambiar la URL para usar la ruta de formulario completo
    const response = await fetch('http://localhost:3000/api/empresas/con-formulario-completo');
    if (!response.ok) throw new Error('Error al cargar empresas');
    const { data: empresas } = await response.json();

    empresaSelect.innerHTML = '<option value="" disabled selected>-- Seleccione una empresa --</option>';
    empresas.forEach(empresa => {
      const option = document.createElement('option');
      option.value = empresa._id;
      option.textContent = `${empresa.nombreEmpresa} (${empresa.cantidadEmpleados} empleados)`;
      empresaSelect.appendChild(option);
    });

  } catch (error) {
    console.error('Error:', error);
    empresaSelect.innerHTML = '<option value="" disabled>Error al cargar empresas</option>';
    mostrarMensajeError(error.message);
  } finally {
    loadingDiv.style.display = 'none';
  }

  // 2. Manejar selección de empresa
  empresaSelect.addEventListener('change', async () => {
    const empresaId = empresaSelect.value;
    if (!empresaId) return;

    try {
      loadingDiv.style.display = 'block';
      resultadosContainer.classList.add('d-none');

      const response = await fetch(`http://localhost:3000/api/psicosocial/entorno/empresa/${empresaId}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al cargar respuestas');
      }

      const { data } = await response.json();
      datosRespuestasGlobales = data; // Guardar datos para exportación Excel
      mostrarResultados(data);

    } catch (error) {
      console.error('Error:', error);
      mostrarMensajeError(error.message);
    } finally {
      loadingDiv.style.display = 'none';
    }
  });
});

// Mostrar resultados por empresa
async function mostrarResultados(data) {
  const { empresa, respuestas, resumen } = data;
  const resultadosContainer = document.getElementById('resultadosContainer');
  const respuestasList = document.getElementById('respuestasList');
  const nombreEmpresaSpan = document.getElementById('nombreEmpresa');
  const totalEncuestas = document.getElementById('totalEncuestas');
  const puntajePromedio = document.getElementById('puntajePromedio');
  const nivelRiesgo = document.getElementById('nivelRiesgo');
  const fechaActualizacion = document.getElementById('fechaActualizacion');
  const fechaUltimaEncuesta = document.getElementById('fechaUltimaEncuesta');

  if (!respuestas || respuestas.length === 0) {
    respuestasList.innerHTML = '<div class="alert alert-info">No se encontraron respuestas para esta empresa</div>';
    resultadosContainer.classList.remove('d-none');
    return;
  }

  // 1. Mostrar nombre de empresa
  nombreEmpresaSpan.textContent = empresa?.nombreEmpresa || 'Empresa no especificada';

  // 2. Mostrar datos resumidos
  totalEncuestas.textContent = resumen.progreso; // Mostrar progreso en formato "2/53"
  puntajePromedio.textContent = resumen.puntajePromedio;
  nivelRiesgo.innerHTML = `<span class="badge ${getBadgeClass(resumen.nivelRiesgo)}">${resumen.nivelRiesgo || 'Nulo'}</span>`;
  
  // 3. Formatear y mostrar fechas
  const formatDate = (dateString) => {
    if (!dateString) return '--/--/----';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  fechaActualizacion.textContent = formatDate(resumen.ultimaActualizacion);
  fechaUltimaEncuesta.textContent = formatDate(resumen.ultimaActualizacion);

  // 4. Mostrar necesidad de acción global
  mostrarAccionRiesgo(resumen.nivelRiesgo);

  // 5. Generar listado de respuestas
  respuestasList.innerHTML = respuestas.map(respuesta => {
    const fechaEncuesta = formatDate(respuesta.createdAt);
    const accion = obtenerRecomendaciones(respuesta.nivelRiesgo);
    
    return `
    <div class="card card-respuesta mb-4">
      <div class="card-header bg-white d-flex justify-content-between align-items-center">
        <h5 class="mb-0">
          <i class="fas fa-poll me-2 text-primary"></i>
          Encuesta realizada el ${fechaEncuesta}
        </h5>
        <div>
          <span class="badge ${getBadgeClass(respuesta.nivelRiesgo)}">
            ${respuesta.nivelRiesgo || 'Nulo'}
          </span>
          <span class="puntaje-display ms-2">
            <i class="fas fa-star text-warning"></i> ${respuesta.puntajeTotal || '0'}
          </span>
        </div>
      </div>
      
      <div class="card-body">
        <div class="container">
          <div class="row justify-content-center">
            <!-- Categorías -->
            <div class="col-md-6 mb-4">
              <div class="card">
                <div class="card-header bg-light">
                  <h6 class="mb-0 text-center"><i class="fas fa-layer-group me-2"></i>Puntajes por Categoría</h6>
                </div>
                <div class="card-body">
                  ${renderizarPuntajes(respuesta.puntajesPorCategoria, 50, 'categoria')}
                </div>
              </div>
            </div>

            <!-- Dominios -->
            <div class="col-md-6 mb-4">
              <div class="card">
                <div class="card-header bg-light">
                  <h6 class="mb-0 text-center"><i class="fas fa-sitemap me-2"></i>Puntajes por Dominio</h6>
                </div>
                <div class="card-body">
                  ${renderizarPuntajes(respuesta.puntajesPorDominio, 30, 'dominio')}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="accion-riesgo mt-3 p-3 rounded ${getAlertClass(respuesta.nivelRiesgo)}">
          <h6 class="fw-bold mb-2">Necesidad de acción: ${respuesta.nivelRiesgo || 'Nulo'}</h6>
          <p class="mb-0">${respuesta.recomendacion || accion.recomendacion}</p>
        </div>
        
        <!-- Botón y sección de respuestas detalladas -->
        <div class="text-center mt-3">
          <button class="btn btn-outline-primary toggle-respuestas" data-respuesta-id="${respuesta._id}">
            <i class="fas fa-list me-2"></i>Ver respuestas del formulario
          </button>
          
          <div id="detalle-respuestas-${respuesta._id}" class="mt-3" style="display: none;">
            <div class="card">
              <div class="card-header bg-light">
                <h6 class="mb-0"><i class="fas fa-list-check me-2"></i>Detalle completo de respuestas</h6>
              </div>
              <div class="card-body">
                <div class="table-responsive">
                  <table class="table table-sm table-hover">
                    <thead>
                      <tr>
                        <th>Pregunta</th>
                        <th>Respuesta</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${Object.entries(respuesta.preguntas || {}).map(([pregunta, respuestaPregunta]) => `
                        <tr>
                          <td class="fw-bold">${pregunta.replace('pregunta', 'Pregunta ')}</td>
                          <td>${respuestaPregunta}</td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    `;
}).join('');

// Agrega este código al final del archivo para manejar los clics en los botones
document.addEventListener('click', function(e) {
  if (e.target.classList.contains('toggle-respuestas') || e.target.closest('.toggle-respuestas')) {
    const button = e.target.classList.contains('toggle-respuestas') ? e.target : e.target.closest('.toggle-respuestas');
    const respuestaId = button.getAttribute('data-respuesta-id');
    const detalle = document.getElementById(`detalle-respuestas-${respuestaId}`);
    
    if (detalle.style.display === 'none') {
      detalle.style.display = 'block';
      button.innerHTML = '<i class="fas fa-eye-slash me-2"></i>Ocultar respuestas';
      button.classList.add('btn-primary');
      button.classList.remove('btn-outline-primary');
    } else {
      detalle.style.display = 'none';
      button.innerHTML = '<i class="fas fa-list me-2"></i>Ver respuestas del formulario';
      button.classList.add('btn-outline-primary');
      button.classList.remove('btn-primary');
    }
  }
});

  resultadosContainer.classList.remove('d-none');
}

// Evaluar nivel según puntaje promedio
function obtenerNivelRiesgoPorPuntaje(puntaje) {
  if (puntaje >= 90) return 'Muy alto';
  if (puntaje >= 75) return 'Alto';
  if (puntaje >= 50) return 'Medio';
  if (puntaje >= 25) return 'Bajo';
  return 'Nulo';
}

// Mensajes de acción por nivel
function obtenerRecomendaciones(nivelRiesgo) {
  const recomendaciones = {
    'Muy alto': 'Se requiere análisis detallado y aplicación urgente de un Programa de intervención.',
    'Alto': 'Requiere intervención estructurada y campañas de sensibilización.',
    'Medio': 'Debe revisarse la política de prevención y aplicar programas organizacionales.',
    'Bajo': 'Se recomienda mayor difusión de políticas preventivas.',
    'Nulo': 'No se requieren medidas adicionales.'
  };

  return {
    nivel: nivelRiesgo,
    recomendacion: recomendaciones[nivelRiesgo] || 'Sin recomendación definida.'
  };
}

// Mostrar bloque global de intervención
function mostrarAccionRiesgo(nivelRiesgo) {
  const accionContainer = document.getElementById('accionRiesgoContainer');
  const accionContent = document.getElementById('accionRiesgoContent');

  if (!nivelRiesgo) {
    accionContainer.classList.add('d-none');
    return;
  }

  const accion = obtenerRecomendaciones(nivelRiesgo);
  accionContent.innerHTML = `
    <div class="accion-riesgo ${getAlertClass(nivelRiesgo)} p-3 rounded">
      <h6 class="fw-bold mb-2">Nivel de riesgo: ${nivelRiesgo}</h6>
      <p class="mb-0">${accion.recomendacion}</p>
    </div>
  `;
  accionContainer.classList.remove('d-none');
}

// Clases de estilo para badges
function getBadgeClass(nivel) {
  if (!nivel) return 'bg-secondary';
  const lower = nivel.toLowerCase();
  if (lower.includes('muy alto')) return 'bg-danger';
  if (lower.includes('alto')) return 'bg-warning'; // Naranja para Alto
  if (lower.includes('medio')) return 'bg-warning text-dark';
  if (lower.includes('bajo')) return 'bg-success';
  return 'bg-secondary';
}

// Clases para alertas de riesgo
function getAlertClass(nivel) {
  if (!nivel) return 'bg-secondary';
  const lower = nivel.toLowerCase();
  if (lower.includes('muy alto') || lower.includes('alto')) return 'bg-danger text-white';
  if (lower.includes('medio')) return 'bg-warning text-dark';
  if (lower.includes('bajo')) return 'bg-success text-white';
  return 'bg-secondary text-white';
}

// Función para obtener rangos según tipo
function obtenerRangosParaTipo(nombre, tipo) {
  if (tipo === 'categoria') {
    const rangos = {
      'Ambiente de trabajo': [5, 9, 11, 14],
      'Factores propios de la actividad': [15, 30, 45, 80],
      'Organización del tiempo de trabajo': [5, 9, 11, 14],
      'Liderazgo y relaciones en el trabajo': [14, 29, 42, 58],
      'Entorno organizacional': [10, 14, 18, 23]
    };
    return rangos[nombre] || [0, 0, 0, 0];
  } else if (tipo === 'dominio') {
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
    };
    return rangos[nombre] || [0, 0, 0, 0];
  }
  return [0, 0, 0, 0];
}

// Función para obtener máximo según tipo
function obtenerMaximoParaTipo(nombre, tipo) {
  if (tipo === 'categoria') {
    const maximos = {
      'Ambiente de trabajo': 14,
      'Factores propios de la actividad': 80,
      'Organización del tiempo de trabajo': 14,
      'Liderazgo y relaciones en el trabajo': 58,
      'Entorno organizacional': 23
    };
    return maximos[nombre] || 50;
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
    };
    return maximos[nombre] || 30;
  }
  return 50;
}

// Función para obtener mensaje de acción según nivel
function obtenerMensajeAccion(nivel) {
  const mensajes = {
    'Nulo': { icon: 'check-circle', text: 'Monitoreo', color: 'text-success' },
    'Bajo': { icon: 'check-circle', text: 'Monitoreo', color: 'text-success' },
    'Medio': { icon: 'info-circle', text: 'Monitoreo continuo', color: 'text-info' },
    'Alto': { icon: 'exclamation-triangle', text: 'Requiere atención', color: 'text-warning' },
    'Muy alto': { icon: 'exclamation-circle', text: 'Acción urgente', color: 'text-danger' }
  };
  return mensajes[nivel] || { icon: 'info-circle', text: 'Revisar', color: 'text-secondary' };
}

// Función para crear donut chart
function crearDonutChart(canvasId, valor, maximo, nombre, nivel, tipo) {
  const porcentaje = Math.round((valor / maximo) * 100);
  const rangos = obtenerRangosParaTipo(nombre, tipo);
  const [rangoNulo, rangoBajo, rangoMedio, rangoAlto] = rangos;
  
  // Calcular porcentajes de cada segmento
  const pctNulo = (rangoNulo / maximo) * 100;
  const pctBajo = ((rangoBajo - rangoNulo) / maximo) * 100;
  const pctMedio = ((rangoMedio - rangoBajo) / maximo) * 100;
  const pctAlto = ((rangoAlto - rangoMedio) / maximo) * 100;
  const pctMuyAlto = ((maximo - rangoAlto) / maximo) * 100;
  
  // Colores para cada segmento
  const colores = ['#6c757d', '#198754', '#ffc107', '#ff8c00', '#dc3545']; // gris, verde, amarillo, naranja, rojo
  
  // Crear datos para el gráfico
  const data = [pctNulo, pctBajo, pctMedio, pctAlto, pctMuyAlto];
  
  const ctx = document.getElementById(canvasId).getContext('2d');
  
  return new Chart(ctx, {
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
      }
    },
    plugins: [{
      id: 'centeredText',
      beforeDraw: function(chart) {
        const ctx = chart.ctx;
        const centerX = chart.chartArea.left + (chart.chartArea.right - chart.chartArea.left) / 2;
        const centerY = chart.chartArea.top + (chart.chartArea.bottom - chart.chartArea.top) / 2;
        
        ctx.save();
        ctx.font = 'bold 24px Arial';
        
        // Color del texto según nivel
        let colorTexto = '#6c757d';
        if (nivel === 'Muy alto' || nivel === 'Alto') colorTexto = nivel === 'Muy alto' ? '#dc3545' : '#ff8c00';
        else if (nivel === 'Medio') colorTexto = '#ffc107';
        else if (nivel === 'Bajo' || nivel === 'Nulo') colorTexto = '#198754';
        
        ctx.fillStyle = colorTexto;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${porcentaje}%`, centerX, centerY);
        ctx.restore();
      }
    }]
  });
}

// Mostrar donut charts en lugar de barras
function renderizarPuntajes(puntajes, maxValue = 50, tipo = 'categoria') {
  if (!puntajes || Object.keys(puntajes).length === 0) {
    return '<p class="text-muted small">No hay datos disponibles</p>';
  }

  let html = '<div class="donut-chart-grid">';
  
  Object.entries(puntajes).forEach(([nombre, valor], index) => {
    let nivel;
    const maximo = obtenerMaximoParaTipo(nombre, tipo);
    
    if (tipo === 'categoria') {
      nivel = obtenerNivelPorCategoria(nombre, valor);
    } else if (tipo === 'dominio') {
      nivel = obtenerNivelPorDominio(nombre, valor);
    }

    const nivelClass = getNivelClass(nivel);
    const badgeClass = getBadgeClass(nivel);
    const mensajeAccion = obtenerMensajeAccion(nivel);
    const canvasId = `donutChart_${tipo}_${index}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    html += `
      <div class="donut-chart-wrapper" data-canvas-id="${canvasId}" data-valor="${valor}" data-maximo="${maximo}" data-nombre="${nombre}" data-nivel="${nivel}" data-tipo="${tipo}">
        <div class="donut-chart-container">
          <canvas id="${canvasId}"></canvas>
        </div>
        <div class="donut-chart-title">${nombre}</div>
        <div>
          <span class="badge ${badgeClass} donut-chart-badge" ${nivel === 'Alto' ? 'style="background-color: #ff8c00 !important; color: #fff !important;"' : ''}>${nivel}</span>
        </div>
        <div class="donut-chart-score">Puntaje: ${valor} / ${maximo}</div>
        <div class="donut-chart-action ${mensajeAccion.color}">
          <i class="fas fa-${mensajeAccion.icon}"></i> ${mensajeAccion.text}
        </div>
      </div>
    `;
  });
  
  html += '</div>';
  
  // Crear los gráficos después de que el HTML se haya insertado
  setTimeout(() => {
    document.querySelectorAll('[data-canvas-id]').forEach(wrapper => {
      const canvasId = wrapper.getAttribute('data-canvas-id');
      const valor = parseFloat(wrapper.getAttribute('data-valor'));
      const maximo = parseFloat(wrapper.getAttribute('data-maximo'));
      const nombre = wrapper.getAttribute('data-nombre');
      const nivel = wrapper.getAttribute('data-nivel');
      const tipo = wrapper.getAttribute('data-tipo');
      
      if (document.getElementById(canvasId)) {
        crearDonutChart(canvasId, valor, maximo, nombre, nivel, tipo);
      }
    });
  }, 200);
  
  return html;
}

// Formatear fechas en formato dd/mm/yyyy
function formatDate(date) {
  const d = new Date(date);
  if (isNaN(d)) return '--/--/----';
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

// Mostrar modal de error
function mostrarMensajeError(mensaje) {
  const modal = new bootstrap.Modal(document.getElementById('mensajeModal'));
  document.getElementById('modalTitulo').textContent = 'Error';
  document.getElementById('modalTitulo').className = 'modal-title text-danger';
  document.getElementById('modalMensaje').textContent = mensaje;
  modal.show();
}

function mostrarModalSinDatos(mensaje) {
  const modalTitulo = document.getElementById('modalTitulo');
  const modalMensaje = document.getElementById('modalMensaje');
  modalTitulo.textContent = 'Sin datos disponibles';
  modalMensaje.textContent = mensaje;
  const modal = new bootstrap.Modal(document.getElementById('mensajeModal'));
  modal.show();
}

// Ejemplo de uso cuando no hay datos:
function cargarEmpresas() {
  fetch('/api/empresas/con-formulario-completo')
    .then(res => res.json())
    .then(data => {
      if (!data || data.length === 0) {
        mostrarModalSinDatos('No hay empresas ni encuestas registradas en el sistema.');
        document.getElementById('loading').style.display = 'none';
        return;
      }
      // ...código para mostrar empresas...
    })
    .catch(err => {
      mostrarModalSinDatos('Error al cargar empresas.');
      document.getElementById('loading').style.display = 'none';
    });
}

function getNivelClass(nivel) {
  switch (nivel.toLowerCase()) {
    case 'nulo':
      return 'text-secondary'; // Gris
    case 'bajo':
      return 'text-success'; // Verde
    case 'medio':
      return 'text-warning'; // Amarillo
    case 'alto':
      return 'text-danger'; // Rojo
    case 'muy alto':
      return 'text-danger fw-bold'; // Rojo con negrita
    default:
      return 'text-muted'; // Por defecto
  }
}

function getBarColor(nivel) {
  switch (nivel.toLowerCase()) {
    case 'nulo':
      return 'bg-secondary'; // Gris
    case 'bajo':
      return 'bg-success'; // Verde
    case 'medio':
      return 'bg-warning'; // Amarillo
    case 'alto':
      return 'bg-danger'; // Rojo
    case 'muy alto':
      return 'bg-danger'; // Rojo (puede ser más intenso si se desea)
    default:
      return 'bg-secondary'; // Por defecto, gris
  }
}

function obtenerNivelPorCategoria(nombre, puntaje) {
  const rangos = {
    'Ambiente de trabajo': [5, 9, 11, 14],
    'Factores propios de la actividad': [15, 30, 45, 80],
    'Organización del tiempo de trabajo': [5, 9, 11, 14],
    'Liderazgo y relaciones en el trabajo': [14, 29, 42, 58],
    'Entorno organizacional': [10, 14, 18, 23]
  };

  const limites = rangos[nombre];
  if (!limites) return 'Nulo';

  if (puntaje < limites[0]) return 'Nulo';
  if (puntaje < limites[1]) return 'Bajo';
  if (puntaje < limites[2]) return 'Medio';
  if (puntaje < limites[3]) return 'Alto';
  return 'Muy alto';
}

function obtenerNivelPorDominio(nombre, puntaje) {
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
  };

  const limites = rangos[nombre];
  if (!limites) return 'Nulo';

  if (puntaje < limites[0]) return 'Nulo';
  if (puntaje < limites[1]) return 'Bajo';
  if (puntaje < limites[2]) return 'Medio';
  if (puntaje < limites[3]) return 'Alto';
  return 'Muy alto';
}

document.addEventListener("DOMContentLoaded", () => {
    const descargarPDFBtn = document.getElementById("descargarPDF");
    const confirmarDescargaPDFBtn = document.getElementById("confirmarDescargaPDF");
    const previsualizacionContenido = document.getElementById("previsualizacionContenido");
    const previsualizacionModal = document.getElementById("previsualizacionModal");

    // Mostrar previsualización en el modal
    descargarPDFBtn.addEventListener("click", () => {
        // Datos generales
        const empresa = document.getElementById("nombreEmpresa").textContent;
        const totalEncuestas = document.getElementById("totalEncuestas").textContent;
        const puntajePromedio = document.getElementById("puntajePromedio").textContent;
        const nivelRiesgo = document.getElementById("nivelRiesgo").textContent;
        const fechaActualizacion = document.getElementById("fechaActualizacion").textContent;

        // Validar si todas las encuestas están completas
        const [completadas, total] = totalEncuestas.split("/").map(Number);
        const faltanRespuestas = completadas < total;

        // Generar contenido de previsualización
        let html = `
            <h5>Datos Generales</h5>
            <ul>
                <li><strong>Empresa:</strong> ${empresa}</li>
                <li><strong>Total Encuestas:</strong> ${totalEncuestas}</li>
                <li><strong>Puntaje Promedio:</strong> ${puntajePromedio}</li>
                <li><strong>Nivel de Riesgo:</strong> ${nivelRiesgo}</li>
                <li><strong>Última Actualización:</strong> ${fechaActualizacion}</li>
            </ul>
            <h5>Encuestas</h5>
        `;

        // Encuestas individuales
        const respuestasList = document.querySelectorAll(".card-respuesta");
        respuestasList.forEach((respuesta, index) => {
            const fechaEncuesta = respuesta.querySelector(".card-header h5").textContent.trim();
            const puntajesPorCategoria = respuesta.querySelectorAll(".col-md-6:nth-child(1) .mb-3");
            const puntajesPorDominio = respuesta.querySelectorAll(".col-md-6:nth-child(2) .mb-3");

            html += `
                <h6>Encuesta ${index + 1}: ${fechaEncuesta}</h6>
                <p><strong>Puntajes por Categoría:</strong></p>
                <ul>
            `;

            puntajesPorCategoria.forEach((categoria) => {
                const nombre = categoria.querySelector("span:first-child").textContent;
                const valor = categoria.querySelector("span:last-child").textContent;
                html += `<li>${nombre}: ${valor}</li>`;
            });

            html += `
                </ul>
                <p><strong>Puntajes por Dominio:</strong></p>
                <ul>
            `;

            puntajesPorDominio.forEach((dominio) => {
                const nombre = dominio.querySelector("span:first-child").textContent;
                const valor = dominio.querySelector("span:last-child").textContent;
                html += `<li>${nombre}: ${valor}</li>`;
            });

            html += `</ul>`;
        });

        // Agregar mensaje si faltan respuestas
        if (faltanRespuestas) {
            html += `
                <div class="alert alert-warning mt-4">
                    <strong>Nota:</strong> No se puede descargar el PDF porque faltan respuestas por completar.
                </div>
            `;
            confirmarDescargaPDFBtn.disabled = true; // Deshabilitar el botón de descarga
        } else {
            confirmarDescargaPDFBtn.disabled = false; // Habilitar el botón de descarga
        }

        previsualizacionContenido.innerHTML = html;

        // Mostrar el modal
        const modal = new bootstrap.Modal(previsualizacionModal);
        modal.show();

        // Forzar eliminación del backdrop y la clase modal-open al cerrar el modal
        previsualizacionModal.addEventListener("hidden.bs.modal", () => {
            document.body.classList.remove("modal-open");
            const backdrop = document.querySelector(".modal-backdrop");
            if (backdrop) {
                backdrop.remove();
            }
        });
    });

    // Generar PDF al confirmar desde el modal
    confirmarDescargaPDFBtn.addEventListener("click", () => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Datos generales
        const empresa = document.getElementById("nombreEmpresa").textContent;
        const totalEncuestas = document.getElementById("totalEncuestas").textContent;
        const puntajePromedio = document.getElementById("puntajePromedio").textContent;
        const nivelRiesgo = document.getElementById("nivelRiesgo").textContent;
        const fechaActualizacion = document.getElementById("fechaActualizacion").textContent;

        doc.setFontSize(16);
        doc.text("Resultados de Encuestas", 10, 10);

        doc.setFontSize(12);
        doc.text(`Empresa: ${empresa}`, 10, 20);
        doc.text(`Total Encuestas: ${totalEncuestas}`, 10, 30);
        doc.text(`Puntaje Promedio: ${puntajePromedio}`, 10, 40);
        doc.text(`Nivel de Riesgo: ${nivelRiesgo}`, 10, 50);
        doc.text(`Última Actualización: ${fechaActualizacion}`, 10, 60);

        // Espaciado para las encuestas individuales
        let y = 80;

        // Encuestas individuales
        const respuestasList = document.querySelectorAll(".card-respuesta");
        respuestasList.forEach((respuesta, index) => {
            if (y > 270) {
                doc.addPage();
                y = 10;
            }

            const fechaEncuesta = respuesta.querySelector(".card-header h5").textContent.trim();
            const puntajesPorCategoria = respuesta.querySelectorAll(".col-md-6:nth-child(1) .mb-3");
            const puntajesPorDominio = respuesta.querySelectorAll(".col-md-6:nth-child(2) .mb-3");

            doc.setFontSize(14);
            doc.text(`Encuesta ${index + 1}: ${fechaEncuesta}`, 10, y);
            y += 10;

            doc.setFontSize(12);
            doc.text("Puntajes por Categoría:", 10, y);
            y += 10;

            puntajesPorCategoria.forEach((categoria) => {
                const nombre = categoria.querySelector("span:first-child").textContent;
                const valor = categoria.querySelector("span:last-child").textContent;

                doc.text(`- ${nombre}: ${valor}`, 10, y);
                y += 10;
            });

            doc.text("Puntajes por Dominio:", 10, y);
            y += 10;

            puntajesPorDominio.forEach((dominio) => {
                const nombre = dominio.querySelector("span:first-child").textContent;
                const valor = dominio.querySelector("span:last-child").textContent;

                doc.text(`- ${nombre}: ${valor}`, 10, y);
                y += 10;
            });

            y += 10; // Espaciado entre encuestas
        });

        // Guardar el PDF
        doc.save("Resultados.pdf");
    });
});

// Soluciona el problema de scroll al cerrar cualquier modal de Bootstrap
document.addEventListener('hidden.bs.modal', function () {
  document.body.style.overflow = '';
});

// Función para exportar a Excel
function exportarAExcel() {
  if (!datosRespuestasGlobales || !datosRespuestasGlobales.respuestas || datosRespuestasGlobales.respuestas.length === 0) {
    alert('No hay datos para exportar. Por favor, seleccione una empresa con respuestas.');
    return;
  }

  const { empresa, respuestas } = datosRespuestasGlobales;
  const nombreEmpresa = empresa?.nombreEmpresa || 'Empresa';

  // Crear un libro de trabajo
  const wb = XLSX.utils.book_new();

  // Hoja 1: Resumen General
  const resumenData = [
    ['REPORTE DE RESULTADOS - FORMULARIO PSICOSOCIAL ENTORNO'],
    ['Empresa', nombreEmpresa],
    ['Total Encuestas', respuestas.length],
    ['Puntaje Promedio', datosRespuestasGlobales.resumen?.puntajePromedio || '0'],
    ['Nivel de Riesgo', datosRespuestasGlobales.resumen?.nivelRiesgo || 'Nulo'],
    ['Fecha de Actualización', datosRespuestasGlobales.resumen?.ultimaActualizacion ? formatDate(datosRespuestasGlobales.resumen.ultimaActualizacion) : '--/--/----'],
    [],
    ['RESUMEN DE ENCUESTAS']
  ];

  const wsResumen = XLSX.utils.aoa_to_sheet(resumenData);
  XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen');

  // Hoja 2: Respuestas por Encuesta
  const respuestasData = [
    ['ID Encuesta', 'Fecha', 'Puntaje Total', 'Nivel de Riesgo', 'Recomendación']
  ];

  respuestas.forEach((respuesta, index) => {
    const fecha = formatDate(respuesta.createdAt);
    const recomendacion = respuesta.recomendacion || obtenerRecomendaciones(respuesta.nivelRiesgo).recomendacion;
    respuestasData.push([
      `Encuesta ${index + 1}`,
      fecha,
      respuesta.puntajeTotal || 0,
      respuesta.nivelRiesgo || 'Nulo',
      recomendacion
    ]);
  });

  const wsRespuestas = XLSX.utils.aoa_to_sheet(respuestasData);
  XLSX.utils.book_append_sheet(wb, wsRespuestas, 'Encuestas');

  // Hoja 3: Puntajes por Categoría
  const categoriasData = [
    ['ID Encuesta', 'Fecha', 'Categoría', 'Puntaje', 'Nivel']
  ];

  respuestas.forEach((respuesta, index) => {
    const fecha = formatDate(respuesta.createdAt);
    const puntajesPorCategoria = respuesta.puntajesPorCategoria || {};
    
    Object.entries(puntajesPorCategoria).forEach(([categoria, puntaje]) => {
      const nivel = obtenerNivelPorCategoria(categoria, puntaje);
      categoriasData.push([
        `Encuesta ${index + 1}`,
        fecha,
        categoria,
        puntaje,
        nivel
      ]);
    });
  });

  const wsCategorias = XLSX.utils.aoa_to_sheet(categoriasData);
  XLSX.utils.book_append_sheet(wb, wsCategorias, 'Categorías');

  // Hoja 4: Puntajes por Dominio
  const dominiosData = [
    ['ID Encuesta', 'Fecha', 'Dominio', 'Puntaje', 'Nivel']
  ];

  respuestas.forEach((respuesta, index) => {
    const fecha = formatDate(respuesta.createdAt);
    const puntajesPorDominio = respuesta.puntajesPorDominio || {};
    
    Object.entries(puntajesPorDominio).forEach(([dominio, puntaje]) => {
      const nivel = obtenerNivelPorDominio(dominio, puntaje);
      dominiosData.push([
        `Encuesta ${index + 1}`,
        fecha,
        dominio,
        puntaje,
        nivel
      ]);
    });
  });

  const wsDominios = XLSX.utils.aoa_to_sheet(dominiosData);
  XLSX.utils.book_append_sheet(wb, wsDominios, 'Dominios');

  // Hoja 5: Respuestas Detalladas por Pregunta
  const preguntasData = [
    ['ID Encuesta', 'Fecha', 'Pregunta', 'Respuesta']
  ];

  respuestas.forEach((respuesta, index) => {
    const fecha = formatDate(respuesta.createdAt);
    const preguntas = respuesta.preguntas || {};
    
    Object.entries(preguntas).forEach(([pregunta, respuestaPregunta]) => {
      preguntasData.push([
        `Encuesta ${index + 1}`,
        fecha,
        pregunta.replace('pregunta', 'Pregunta '),
        respuestaPregunta
      ]);
    });
  });

  const wsPreguntas = XLSX.utils.aoa_to_sheet(preguntasData);
  XLSX.utils.book_append_sheet(wb, wsPreguntas, 'Respuestas Detalladas');

  // Generar nombre de archivo
  const nombreArchivo = `Resultados_${nombreEmpresa.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;

  // Descargar el archivo
  XLSX.writeFile(wb, nombreArchivo);
}

// Event listener para el botón de descarga Excel
document.addEventListener('DOMContentLoaded', () => {
  const descargarExcelBtn = document.getElementById('descargarExcel');
  if (descargarExcelBtn) {
    descargarExcelBtn.addEventListener('click', exportarAExcel);
  }
});