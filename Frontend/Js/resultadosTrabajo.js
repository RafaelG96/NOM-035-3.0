// Variable global para almacenar los datos de respuestas
let datosRespuestasTrabajoGlobales = null;

document.addEventListener('DOMContentLoaded', async () => {
  const empresaSelect = document.getElementById('empresaSelect');
  const loadingDiv = document.getElementById('loading');
  const resultadosContainer = document.getElementById('resultadosContainer');
  const respuestasList = document.getElementById('respuestasList');
  const puntajePromedioElement = document.getElementById('puntajePromedio');
  const totalEncuestasElement = document.getElementById('totalEncuestas');
  const fechaUltimaActualizacionElement = document.getElementById('fechaUltimaActualizacion');
  const nombreEmpresaElement = document.getElementById('nombreEmpresa');
  const nivelRiesgoElement = document.getElementById('nivelRiesgo');
  const accionRiesgoContainer = document.getElementById('accionRiesgoContainer');
  const accionRiesgoContent = document.getElementById('accionRiesgoContent');

  // Cargar empresas al cargar la página
  try {
    loadingDiv.style.display = 'block';
    const response = await fetch('http://localhost:3000/api/empresas/con-formulario-basico');
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al cargar empresas');
    }

    const { data: empresas } = await response.json();

    if (!empresas || empresas.length === 0) {
      empresaSelect.innerHTML = '<option value="" disabled>No hay empresas disponibles</option>';
      mostrarModalSinDatos('No hay empresas ni encuestas registradas en el sistema.');
      return;
    }

    empresaSelect.innerHTML = '<option value="" selected disabled>-- Seleccione una empresa --</option>';
    empresas.forEach(empresa => {
      const option = document.createElement('option');
      option.value = empresa._id;
      option.textContent = `${empresa.nombreEmpresa} (${empresa.cantidadEmpleados} empleados)`;
      option.dataset.nombre = empresa.nombreEmpresa;
      empresaSelect.appendChild(option);
    });
  } catch (error) {
    console.error('Error al cargar empresas:', error);
    mostrarModalSinDatos(error.message || 'Error al cargar empresas');
  } finally {
    loadingDiv.style.display = 'none';
  }

  // Manejar selección de empresa
  empresaSelect.addEventListener('change', async () => {
    const empresaId = empresaSelect.value;
    const empresaNombre = empresaSelect.options[empresaSelect.selectedIndex]?.dataset.nombre;
    
    if (!empresaId) return;

    try {
      loadingDiv.style.display = 'block';
      resultadosContainer.classList.add('d-none');
      nombreEmpresaElement.textContent = empresaNombre || 'Empresa seleccionada';

      const response = await fetch(`http://localhost:3000/api/psicosocial/trabajo/empresa/${empresaId}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al cargar respuestas');
      }

      const { data } = await response.json();
      datosRespuestasTrabajoGlobales = data; // Guardar datos para exportación Excel
      mostrarResultadosTrabajo(data);

    } catch (error) {
      console.error('Error:', error);
      mostrarMensajeError(error.message);
    } finally {
      loadingDiv.style.display = 'none';
    }
  });
});

// Mostrar resultados del formulario de trabajo
function mostrarResultadosTrabajo(data) {
  if (!data || !data.resultados || !data.empresa) {
    mostrarModalSinDatos('Datos incompletos o no disponibles para esta empresa.');
    return;
  }

  const resultados = data.resultados;
  const cantidadEmpleados = data.empresa.cantidadEmpleados;
  const resultadosContainer = document.getElementById('resultadosContainer');
  const respuestasList = document.getElementById('respuestasList');

  respuestasList.innerHTML = '';

  if (resultados.length === 0) {
    mostrarModalSinDatos('No se encontraron respuestas para esta empresa.');
    resultadosContainer.classList.remove('d-none');
    return;
  }

  // Calcular estadísticas
  const totalEncuestas = resultados.length;
  const ultimaFecha = resultados.reduce((latest, respuesta) => {
    const fechaActual = new Date(respuesta.updatedAt || respuesta.createdAt);
    return fechaActual > latest ? fechaActual : latest;
  }, new Date(0));

  const totalPuntaje = resultados.reduce((sum, respuesta) => sum + (respuesta.puntajeTotal || 0), 0);
  const promedioPuntaje = (totalPuntaje / totalEncuestas).toFixed(2);
  const nivelRiesgoGeneral = determinarNivelRiesgoGeneral(promedioPuntaje);

  // Mostrar estadísticas
  document.getElementById('totalEncuestas').textContent = `${totalEncuestas}/${cantidadEmpleados}`;
  document.getElementById('fechaUltimaActualizacion').textContent = formatDate(ultimaFecha);
  document.getElementById('puntajePromedio').textContent = promedioPuntaje;
  document.getElementById('nivelRiesgo').innerHTML = `<span class="badge ${getBadgeClass(nivelRiesgoGeneral)}">${nivelRiesgoGeneral}</span>`;
  mostrarRecomendacionesRiesgo(nivelRiesgoGeneral);

  // Renderizar las respuestas individuales
  respuestasList.innerHTML = resultados.map(respuesta => {
    const fechaEncuesta = formatDate(respuesta.createdAt);
    const categoriasHTML = renderizarCategorias(respuesta.categorias || []);
    const dominiosHTML = renderizarDominios(respuesta.dominios || []);

    return `
      <div class="card card-respuesta mb-4">
        <div class="card-header bg-white d-flex justify-content-between align-items-center">
          <h5 class="mb-0">
            <i class="fas fa-poll me-2 text-primary"></i>
            Encuesta realizada el ${fechaEncuesta}
          </h5>
          <div>
            <span class="badge ${getBadgeClass(respuesta.nivelRiesgo)}">${respuesta.nivelRiesgo}</span>
            <span class="puntaje-display ms-2">
              <i class="fas fa-star text-warning"></i> ${respuesta.puntajeTotal || '0'}
            </span>
          </div>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-6">
              ${categoriasHTML}
            </div>
            <div class="col-md-6">
              ${dominiosHTML}
            </div>
          </div>
          <button class="btn btn-outline-primary btn-sm mt-3" onclick="mostrarDetallePreguntas(this)" 
            data-preguntas='${JSON.stringify(respuesta.preguntas)}'>
            <i class="fas fa-list me-2"></i>Ver respuestas del formulario
          </button>
        </div>
      </div>
    `;
  }).join('');

  resultadosContainer.classList.remove('d-none');
}

// Función global para mostrar el detalle de preguntas (debe estar en el ámbito global)
window.mostrarDetallePreguntas = function(button) {
  const preguntasJSON = button.getAttribute('data-preguntas');
  let preguntasObj;

  try {
    preguntasObj = JSON.parse(preguntasJSON);
  } catch (error) {
    console.error('Error al parsear las preguntas:', error);
    alert('No se pudieron cargar las respuestas del formulario.');
    return;
  }

  // Convertir el objeto de preguntas en un array para mostrarlo
  const preguntasArray = Object.entries(preguntasObj)
    .filter(([key]) => key.startsWith('pregunta'))
    .map(([key, value]) => ({
      numero: key.replace('pregunta', ''),
      respuesta: convertirValorARespuesta(value),
      valor: convertirValorANumerico(value)
    }));

  if (preguntasArray.length === 0) {
    alert('No hay respuestas disponibles para mostrar.');
    return;
  }

  const modalBody = document.getElementById('modalBody');
  modalBody.innerHTML = `
    <div class="table-responsive">
      <table class="table table-striped table-hover">
        <thead>
          <tr>
            <th>Pregunta</th>
            <th>Respuesta</th>
            <th>Valor</th>
          </tr>
        </thead>
        <tbody>
          ${preguntasArray.map(pregunta => `
            <tr>
              <td>${pregunta.numero}</td>
              <td><span class="badge ${getRespuestaClass(pregunta.respuesta)}">${pregunta.respuesta}</span></td>
              <td>${pregunta.valor}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;

  const modal = new bootstrap.Modal(document.getElementById('detallePreguntasModal'));
  modal.show();
}

// Funciones auxiliares para el modal de preguntas
function convertirValorARespuesta(value) {
  if (typeof value === 'boolean') return value ? 'Sí' : 'No';
  if (typeof value === 'number') return value.toString();
  if (!value) return 'No respondida';
  
  // Mapear respuestas textuales
  const respuestasMap = {
    'Siempre': 'Siempre',
    'Casi siempre': 'Casi siempre',
    'Algunas veces': 'Algunas veces',
    'Casi nunca': 'Casi nunca',
    'Nunca': 'Nunca'
  };
  return respuestasMap[value] || value;
}

function convertirValorANumerico(value) {
  if (typeof value === 'boolean') return value ? 1 : 0;
  if (typeof value === 'number') return value;
  if (!value) return 0;
  
  // Mapear respuestas textuales a valores numéricos
  const valoresMap = {
    'Siempre': 0,
    'Casi siempre': 1,
    'Algunas veces': 2,
    'Casi nunca': 3,
    'Nunca': 4
  };
  return valoresMap[value] !== undefined ? valoresMap[value] : 0;
}

function getRespuestaClass(respuesta) {
  const lower = respuesta.toLowerCase();
  if (lower.includes('siempre') || lower === 'sí') return 'bg-danger';
  if (lower.includes('casi siempre')) return 'bg-warning text-dark';
  if (lower.includes('algunas veces')) return 'bg-info text-dark';
  if (lower.includes('casi nunca') || lower === 'no') return 'bg-success';
  return 'bg-secondary';
}

// Función para determinar nivel de riesgo basado en puntaje y tipo
const determinarNivel = (puntaje, tipo) => {
    const umbrales = {
        // Categorías
        'Ambiente de trabajo': [3, 5, 7, 9],
        'Factores propios de la actividad': [10, 20, 30, 40],
        'Organización del tiempo de trabajo': [4, 8, 9, 12],
        'Liderazgo y relaciones en el trabajo': [10, 18, 28, 38],
        
        // Dominios
        'Condiciones en el ambiente de trabajo': [3, 5, 7, 9],
        'Carga de trabajo': [12, 18, 20, 24],  // Corregido según imagen (12-18-20-24)
        'Falta de control sobre el trabajo': [5, 8, 11, 14],
        'Jornada de trabajo': [1, 2, 4, 9],
        'Interferencia en la relación trabajo-familia': [1, 2, 4, 9],
        'Liderazgo': [3, 5, 8, 11],
        'Relaciones en el trabajo': [5, 8, 11, 14],
        'Violencia': [7, 10, 13, 16],
        
        'total': [20, 45, 70, 90]
    };

    const limites = umbrales[tipo] || umbrales['total'];
    if (puntaje < limites[0]) return 'Nulo o despreciable';
    if (puntaje < limites[1]) return 'Bajo';
    if (puntaje < limites[2]) return 'Medio';
    if (puntaje < limites[3]) return 'Alto';
    return 'Muy alto';
};

// Estructura jerárquica actualizada con todos los dominios
const ESTRUCTURA = {
    "Ambiente de trabajo": {
        "Condiciones en el ambiente de trabajo": {
            "Condiciones peligrosas e inseguras": [2],
            "Condiciones deficientes e insalubres": [1],
            "Trabajos peligrosos": [3]
        }
    },
    "Factores propios de la actividad": {
        "Carga de trabajo": {
            "Cargas cuantitativas": [4, 9],
            "Ritmos de trabajo acelerado": [5, 6],
            "Carga mental": [7, 8],
            "Cargas psicológicas emocionales": [41, 42, 43],
            "Cargas de alta responsabilidad": [10, 11],
            "Cargas contradictorias o inconsistentes": [12, 13]
        }
    },
    "Organización del tiempo de trabajo": {
        "Jornada de trabajo": {
            "Jornadas de trabajo extensas": [14, 15]
        },
        "Interferencia en la relación trabajo-familia": {
            "Influencia del trabajo fuera del centro laboral": [16],
            "Influencia de las responsabilidades familiares": [17]
        }
    },
    "Liderazgo y relaciones en el trabajo": {
        "Liderazgo": {
            "Escasa claridad de funciones": [23, 24, 25],
            "Características del liderazgo": [28, 29]
        },
        "Relaciones en el trabajo": {
            "Relaciones sociales en el trabajo": [30, 31, 32],
            "Deficiente relación con los colaboradores que supervisa": [44, 45, 46]
        },
        "Violencia": {
            "Violencia laboral": [33, 34, 35, 36, 37, 38, 39, 40]
        }
    },
    "Falta de control sobre el trabajo": {
        "Falla de control sobre el trabajo": {
            "Falla de control sobre el trabajo": [18, 19, 20, 21, 22]
        },
        "Límite de posibilidad de desarrollo": {
            "Límite inexistente de capacitación": [26, 27]
        }
    }
};

// Función para obtener rangos de categorías
function obtenerRangosCategoria(nombre) {
  const rangos = {
    'Ambiente de trabajo': [3, 5, 7, 9],
    'Factores propios de la actividad': [10, 20, 30, 40],
    'Organización del tiempo de trabajo': [4, 8, 9, 12],
    'Liderazgo y relaciones en el trabajo': [10, 18, 28, 38],
    'Falta de control sobre el trabajo': [5, 10, 15, 20]
  };
  return rangos[nombre] || [0, 0, 0, 0];
}

// Función para obtener máximo de categorías
function obtenerMaximoCategoria(nombre) {
  const maximos = {
    'Ambiente de trabajo': 9,
    'Factores propios de la actividad': 40,
    'Organización del tiempo de trabajo': 12,
    'Liderazgo y relaciones en el trabajo': 38,
    'Falta de control sobre el trabajo': 20
  };
  return maximos[nombre] || 50;
}

// Función para obtener mensaje de acción según nivel
function obtenerMensajeAccionTrabajo(nivel) {
  const mensajes = {
    'Nulo o despreciable': { icon: 'check-circle', text: 'Monitoreo', color: 'text-success' },
    'Bajo': { icon: 'check-circle', text: 'Monitoreo', color: 'text-success' },
    'Medio': { icon: 'info-circle', text: 'Monitoreo continuo', color: 'text-info' },
    'Alto': { icon: 'exclamation-triangle', text: 'Requiere atención', color: 'text-warning' },
    'Muy alto': { icon: 'exclamation-circle', text: 'Acción urgente', color: 'text-danger' }
  };
  return mensajes[nivel] || { icon: 'info-circle', text: 'Revisar', color: 'text-secondary' };
}

// Función para crear donut chart
function crearDonutChartTrabajo(canvasId, valor, maximo, nombre, nivel, tipo) {
  const porcentaje = Math.round((valor / maximo) * 100);
  const rangos = tipo === 'categoria' ? obtenerRangosCategoria(nombre) : obtenerRangosDominio(nombre);
  const [rangoNulo, rangoBajo, rangoMedio, rangoAlto] = rangos;
  
  // Calcular porcentajes de cada segmento
  const pctNulo = (rangoNulo / maximo) * 100;
  const pctBajo = ((rangoBajo - rangoNulo) / maximo) * 100;
  const pctMedio = ((rangoMedio - rangoBajo) / maximo) * 100;
  const pctAlto = ((rangoAlto - rangoMedio) / maximo) * 100;
  const pctMuyAlto = ((maximo - rangoAlto) / maximo) * 100;
  
  // Colores para cada segmento
  const colores = ['#6c757d', '#198754', '#ffc107', '#ff8c00', '#dc3545'];
  
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
        else if (nivel === 'Bajo' || nivel === 'Nulo o despreciable') colorTexto = '#198754';
        
        ctx.fillStyle = colorTexto;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${porcentaje}%`, centerX, centerY);
        ctx.restore();
      }
    }]
  });
}

// Actualizar las funciones de renderizado para usar donut charts
function renderizarCategorias(categorias) {
  const PUNTAJES_MAXIMOS_CATEGORIAS = {
    'Ambiente de trabajo': 9,
    'Factores propios de la actividad': 40,
    'Organización del tiempo de trabajo': 12,
    'Liderazgo y relaciones en el trabajo': 38,
    'Falta de control sobre el trabajo': 20
  };

  let html = '<div class="donut-chart-grid">';

  categorias
    .filter(cat => PUNTAJES_MAXIMOS_CATEGORIAS[cat.nombre])
    .forEach((cat, index) => {
      const nivel = determinarNivelCategoria(cat.puntaje, cat.nombre);
      const maximo = obtenerMaximoCategoria(cat.nombre);
      const badgeClass = getBadgeClass(nivel);
      const mensajeAccion = obtenerMensajeAccionTrabajo(nivel);
      const canvasId = `donutChart_categoria_${index}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      html += `
        <div class="donut-chart-wrapper" data-canvas-id="${canvasId}" data-valor="${cat.puntaje}" data-maximo="${maximo}" data-nombre="${cat.nombre}" data-nivel="${nivel}" data-tipo="categoria">
          <div class="donut-chart-container">
            <canvas id="${canvasId}"></canvas>
          </div>
          <div class="donut-chart-title">${cat.nombre}</div>
          <div>
            <span class="badge ${badgeClass} donut-chart-badge" ${nivel === 'Alto' ? 'style="background-color: #ff8c00 !important; color: #fff !important;"' : ''}>${nivel}</span>
          </div>
          <div class="donut-chart-score">Puntaje: ${cat.puntaje} / ${maximo}</div>
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
      
      if (document.getElementById(canvasId) && tipo === 'categoria') {
        crearDonutChartTrabajo(canvasId, valor, maximo, nombre, nivel, tipo);
      }
    });
  }, 200);

  return `
    <div class="card card-section mb-4">
      <div class="card-header bg-light">
        <h6 class="mb-0 text-primary">Categorías</h6>
      </div>
      <div class="card-body">
        ${html || '<p class="text-muted small">No hay datos de categorías disponibles</p>'}
      </div>
    </div>
  `;
}

// Función para obtener rangos de dominios
function obtenerRangosDominio(nombre) {
  const rangos = {
    'Condiciones en el ambiente de trabajo': [3, 5, 7, 9],
    'Carga de trabajo': [12, 18, 20, 24],
    'Cargas psicológicas emocionales': [3, 6, 9, 12],
    'Jornada de trabajo': [1, 2, 4, 9],
    'Interferencia en la relación trabajo-familia': [1, 2, 4, 9],
    'Liderazgo': [5, 10, 15, 20], // 5 preguntas × 4 puntos máximo = 20 puntos máximo
    'Relaciones en el trabajo': [5, 8, 11, 14],
    'Violencia': [7, 10, 13, 16],
    'Falta de control y autonomía sobre el trabajo': [3, 6, 9, 12],
    'Limitada o nula posibilidad de desarrollo': [2, 4, 6, 8],
    'Limitada o inexistente capacitación': [2, 4, 6, 8]
  };
  return rangos[nombre] || [0, 0, 0, 0];
}

// Función para obtener máximo de dominios
function obtenerMaximoDominio(nombre) {
  const maximos = {
    'Condiciones en el ambiente de trabajo': 9,
    'Carga de trabajo': 24,
    'Cargas psicológicas emocionales': 12,
    'Jornada de trabajo': 9,
    'Interferencia en la relación trabajo-familia': 9,
    'Liderazgo': 20, // 5 preguntas × 4 puntos máximo = 20 puntos máximo
    'Relaciones en el trabajo': 14,
    'Violencia': 16,
    'Falta de control y autonomía sobre el trabajo': 12,
    'Limitada o nula posibilidad de desarrollo': 8,
    'Limitada o inexistente capacitación': 8
  };
  return maximos[nombre] || 30;
}

function renderizarDominios(dominios) {
  const PUNTAJES_MAXIMOS_DOMINIOS = {
    'Condiciones en el ambiente de trabajo': 9,
    'Carga de trabajo': 24,
    'Cargas psicológicas emocionales': 12,
    'Jornada de trabajo': 9,
    'Interferencia en la relación trabajo-familia': 9,
    'Liderazgo': 20, // Corregido: 5 preguntas × 4 puntos máximo = 20 puntos máximo
    'Relaciones en el trabajo': 14,
    'Violencia': 16,
    'Falta de control y autonomía sobre el trabajo': 12,
    'Limitada o nula posibilidad de desarrollo': 8,
    'Limitada o inexistente capacitación': 8
  };

  let html = '<div class="donut-chart-grid">';

  dominios
    .filter(dom => PUNTAJES_MAXIMOS_DOMINIOS[dom.nombre])
    .forEach((dom, index) => {
      const nivel = determinarNivelDominio(dom.puntaje, dom.nombre);
      const maximo = obtenerMaximoDominio(dom.nombre);
      const badgeClass = getBadgeClass(nivel);
      const mensajeAccion = obtenerMensajeAccionTrabajo(nivel);
      const canvasId = `donutChart_dominio_${index}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      html += `
        <div class="donut-chart-wrapper" data-canvas-id="${canvasId}" data-valor="${dom.puntaje}" data-maximo="${maximo}" data-nombre="${dom.nombre}" data-nivel="${nivel}" data-tipo="dominio">
          <div class="donut-chart-container">
            <canvas id="${canvasId}"></canvas>
          </div>
          <div class="donut-chart-title">${dom.nombre}</div>
          <div>
            <span class="badge ${badgeClass} donut-chart-badge" ${nivel === 'Alto' ? 'style="background-color: #ff8c00 !important; color: #fff !important;"' : ''}>${nivel}</span>
          </div>
          <div class="donut-chart-score">Puntaje: ${dom.puntaje} / ${maximo}</div>
          <div class="donut-chart-action ${mensajeAccion.color}">
            <i class="fas fa-${mensajeAccion.icon}"></i> ${mensajeAccion.text}
          </div>
          <p class="small text-muted mt-2 mb-0">${getInterpretacionDominio(dom.nombre, dom.puntaje)}</p>
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
      
      if (document.getElementById(canvasId) && tipo === 'dominio') {
        crearDonutChartTrabajo(canvasId, valor, maximo, nombre, nivel, tipo);
      }
    });
  }, 200);

  return `
    <div class="card card-section mb-4">
      <div class="card-header bg-light">
        <h6 class="mb-0 text-primary">Dominios</h6>
      </div>
      <div class="card-body">
        ${html || '<p class="text-muted small">No hay datos de dominios disponibles</p>'}
      </div>
    </div>
  `;
}

// Mostrar recomendaciones según nivel de riesgo
function mostrarRecomendacionesRiesgo(nivelRiesgo) {
  const recomendaciones = {
    'Muy alto': `
      <div class="alert alert-danger">
        <h5 class="alert-heading"><i class="fas fa-exclamation-triangle me-2"></i>Riesgo Muy Alto</h5>
        <p>Se requiere intervención inmediata. Las condiciones psicosociales representan un peligro significativo para la salud de los trabajadores.</p>
        <ul>
          <li>Realizar evaluación detallada con especialistas</li>
          <li>Implementar medidas correctivas urgentes</li>
          <li>Monitoreo constante de la situación</li>
          <li>Capacitación obligatoria para todo el personal</li>
        </ul>
      </div>
    `,
    'Alto': `
      <div class="alert alert-warning">
        <h5 class="alert-heading"><i class="fas fa-exclamation-circle me-2"></i>Riesgo Alto</h5>
        <p>Se recomienda intervención a corto plazo. Existen factores psicosociales que pueden afectar la salud de los trabajadores.</p>
        <ul>
          <li>Realizar análisis más profundo de los factores de riesgo</li>
          <li>Implementar medidas preventivas en los próximos 30 días</li>
          <li>Capacitación para mandos medios y superiores</li>
          <li>Evaluar nuevamente en 3 meses</li>
        </ul>
      </div>
    `,
    'Medio': `
      <div class="alert alert-info">
        <h5 class="alert-heading"><i class="fas fa-info-circle me-2"></i>Riesgo Medio</h5>
        <p>Se sugiere monitoreo y mejora continua. Existen oportunidades para mejorar el clima laboral.</p>
        <ul>
          <li>Implementar programas de bienestar laboral</li>
          <li>Realizar encuestas de seguimiento cada 6 meses</li>
          <li>Capacitación en manejo del estrés</li>
          <li>Fomentar la comunicación abierta</li>
        </ul>
      </div>
    `,
    'Bajo': `
      <div class="alert alert-success">
        <h5 class="alert-heading"><i class="fas fa-check-circle me-2"></i>Riesgo Bajo</h5>
        <p>Buen ambiente laboral. Se recomienda mantener las buenas prácticas y monitorear periódicamente.</p>
        <ul>
          <li>Continuar con las buenas prácticas actuales</li>
          <li>Realizar encuestas anuales de seguimiento</li>
          <li>Fomentar actividades de integración</li>
          <li>Mantener canales de comunicación abiertos</li>
        </ul>
      </div>
    `,
    'Nulo o despreciable': `
      <div class="alert alert-secondary">
        <h5 class="alert-heading"><i class="fas fa-info-circle me-2"></i>Riesgo Nulo o Despreciable</h5>
        <p>El riesgo es despreciable, se recomienda mantener las condiciones actuales.</p>
      </div>
    `
  };

  const accionRiesgoContent = document.getElementById('accionRiesgoContent');
  accionRiesgoContent.innerHTML = recomendaciones[nivelRiesgo] || recomendaciones['Nulo o despreciable'];
  document.getElementById('accionRiesgoContainer').classList.remove('d-none');
}

// Funciones auxiliares
function determinarNivelRiesgoGeneral(puntajePromedio) {
  const puntaje = parseFloat(puntajePromedio);
  if (puntaje < 20) return 'Nulo o despreciable';
  if (puntaje < 45) return 'Bajo';
  if (puntaje < 70) return 'Medio';
  if (puntaje < 90) return 'Alto';
  return 'Muy alto';
}

function determinarNivelCategoria(puntaje, categoria) {
  const rangos = {
    'Ambiente de trabajo': [3, 5, 7, 9],
    'Factores propios de la actividad': [10, 20, 30, 40],
    'Organización del tiempo de trabajo': [4, 8, 9, 12],
    'Liderazgo y relaciones en el trabajo': [10, 18, 28, 38],
    'Falta de control sobre el trabajo': [5, 10, 15, 20]
  };
  const limites = rangos[categoria] || [0, 0, 0, 0];
  if (puntaje < limites[0]) return 'Nulo o despreciable';
  if (puntaje < limites[1]) return 'Bajo';
  if (puntaje < limites[2]) return 'Medio';
  if (puntaje < limites[3]) return 'Alto';
  return 'Muy alto';
}

function determinarNivelDominio(puntaje, dominio) {
  const rangos = {
    'Condiciones en el ambiente de trabajo': [3, 5, 7, 9],
    'Carga de trabajo': [12, 18, 20, 24],
    'Cargas psicológicas emocionales': [3, 6 ,9 ,12],
    'Jornada de trabajo': [1, 2, 4, 9],
    'Interferencia en la relación trabajo-familia': [1, 2, 4, 9],
    'Liderazgo': [5, 10, 15, 20], // Corregido: 5 preguntas × 4 puntos = 20 máximo
    'Relaciones en el trabajo': [5, 8, 11, 14],
    'Violencia': [7, 10, 13, 16],
    'Falta de control y autonomía sobre el trabajo': [3, 6, 9, 12],
    'Limitada o nula posibilidad de desarrollo': [2, 4, 6, 8],
    'Limitada o inexistente capacitación': [2, 4, 6, 8]
  };

  const limites = rangos[dominio] || [0, 0, 0, 0];
  if (puntaje < limites[0]) return 'Nulo o despreciable';
  if (puntaje < limites[1]) return 'Bajo';
  if (puntaje < limites[2]) return 'Medio';
  if (puntaje < limites[3]) return 'Alto';
  return 'Muy alto';
}

function getInterpretacionDominio(nombre, puntaje) {
  const interpretaciones = {
    'Condiciones en el ambiente de trabajo': 'Evalúa las condiciones físicas y ambientales del lugar de trabajo.',
    'Carga de trabajo': 'Analiza la cantidad y ritmo de trabajo asignado.',
    'Cargas psicológicas emocionales': 'Evalúa el impacto emocional y psicológico de las tareas realizadas.',
    'Falla de control sobre el trabajo': 'Evalúa la autonomía y control sobre las tareas.',
    'Jornada de trabajo': 'Examina la duración y horarios de trabajo.',
    'Interferencia en la relación trabajo-familia': 'Mide el equilibrio entre vida laboral y personal.',
    'Liderazgo': 'Analiza la calidad del liderazgo y supervisión.',
    'Relaciones en el trabajo': 'Evalúa las relaciones interpersonales en el trabajo.',
    'Violencia laboral': 'Detecta presencia de acoso o violencia laboral.',
    'Falta de control y autonomía sobre el trabajo': 'Evalúa la falta de control y autonomía en las tareas asignadas.',
    'Limitada o nula posibilidad de desarrollo': 'Examina las oportunidades de desarrollo profesional dentro del trabajo.',
    'Limitada o inexistente capacitación': 'Evalúa la disponibilidad de programas de capacitación para los empleados.'
  };
  return interpretaciones[nombre] || 'Dominio no especificado';
}

function getBarColor(nivel) {
  switch (nivel.toLowerCase()) {
    case 'nulo o despreciable': return 'bg-secondary';
    case 'bajo': return 'bg-success';
    case 'medio': return 'bg-warning';
    case 'alto': return 'bg-danger';
    case 'muy alto': return 'bg-danger';
    default: return 'bg-secondary';
  }
}

function getNivelClass(nivel) {
  switch (nivel.toLowerCase()) {
    case 'nulo o despreciable': return 'text-secondary';
    case 'bajo': return 'text-success';
    case 'medio': return 'text-warning';
    case 'alto': return 'text-danger';
    case 'muy alto': return 'text-danger fw-bold';
    default: return 'text-muted';
  }
}

function getBadgeClass(nivel) {
  switch (nivel.toLowerCase()) {
    case 'nulo o despreciable': return 'bg-secondary';
    case 'bajo': return 'bg-success';
    case 'medio': return 'bg-warning text-dark';
    case 'alto': return 'bg-warning'; // Naranja para Alto (usaremos estilo inline)
    case 'muy alto': return 'bg-danger';
    default: return 'bg-secondary';
  }
}

function formatDate(date) {
  if (!date) return '--/--/----';
  const d = new Date(date);
  if (isNaN(d)) return '--/--/----';
  return d.toLocaleDateString('es-ES');
}

function mostrarMensajeError(mensaje) {
  const errorContainer = document.getElementById('errorContainer');
  if (!errorContainer) return;
  
  const errorElement = document.createElement('div');
  errorElement.className = 'alert alert-danger alert-dismissible fade show';
  errorElement.innerHTML = `
    ${mensaje}
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  `;
  errorContainer.prepend(errorElement);
}

function mostrarModalSinDatos(mensaje) {
  // Si no existe el modal, lo crea dinámicamente
  let modalDiv = document.getElementById('modalSinDatos');
  if (!modalDiv) {
    modalDiv = document.createElement('div');
    modalDiv.id = 'modalSinDatos';
    modalDiv.innerHTML = `
      <div class="modal fade" tabindex="-1" id="sinDatosModal" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header bg-info text-dark">
              <h5 class="modal-title">Sin datos disponibles</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
            </div>
            <div class="modal-body">
              <p id="sinDatosMensaje"></p>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-primary" data-bs-dismiss="modal">Aceptar</button>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modalDiv);
  }
  document.getElementById('sinDatosMensaje').textContent = mensaje;
  const modal = new bootstrap.Modal(document.getElementById('sinDatosModal'));
  modal.show();
}

const { jsPDF } = window.jspdf;
const doc = new jsPDF();

document.getElementById('btnGenerarPDF').addEventListener('click', () => {
  const previewContent = document.getElementById('previewContent');
  previewContent.innerHTML = ''; // Limpiar contenido previo

  // Obtener datos generales
  const nombreEmpresa = document.getElementById('nombreEmpresa')?.textContent || 'Sin nombre';
  const puntajePromedio = document.getElementById('puntajePromedio')?.textContent || '0';
  const totalEncuestas = document.getElementById('totalEncuestas')?.textContent || '0';
  const nivelRiesgo = document.getElementById('nivelRiesgo')?.textContent || 'Sin nivel';

  // Crear contenido HTML para la previsualización
  let html = `
    <h3>Reporte de Resultados</h3>
    <p><strong>Empresa:</strong> ${nombreEmpresa}</p>
    <p><strong>Puntaje Promedio:</strong> ${puntajePromedio}</p>
    <p><strong>Total Encuestas:</strong> ${totalEncuestas}</p>
    <p><strong>Nivel de Riesgo:</strong> ${nivelRiesgo}</p>
    <hr>
  `;

  // Obtener las encuestas
  const encuestas = document.querySelectorAll('.card-respuesta');
  encuestas.forEach((encuesta, index) => {
    const fechaEncuesta = encuesta.querySelector('h5')?.textContent?.trim() || 'Sin fecha';
    const puntajeTotal = encuesta.querySelector('.puntaje-display')?.textContent?.trim() || '0';
    const nivelRiesgoEncuesta = encuesta.querySelector('.badge')?.textContent?.trim() || 'Sin nivel';

    html += `
      <h4>Encuesta ${index + 1}</h4>
      <p><strong>Fecha:</strong> ${fechaEncuesta}</p>
      <p><strong>Puntaje Total:</strong> ${puntajeTotal}</p>
      <p><strong>Nivel de Riesgo:</strong> ${nivelRiesgoEncuesta}</p>
      <h5>Categorías:</h5>
      <ul>
    `;

    // Categorías
    const categoriasFijas = [
      'Ambiente de trabajo',
      'Factores propios de la actividad',
      'Organización del tiempo de trabajo',
      'Liderazgo y relaciones en el trabajo',
      'Falta de control sobre el trabajo'
    ];

    const categorias = encuesta.querySelectorAll('.card-section .card-body > div');
    categoriasFijas.forEach((categoriaFija) => {
      const categoria = Array.from(categorias).find(cat =>
        cat.querySelector('.d-flex span:first-child')?.textContent?.trim() === categoriaFija
      );

      const puntaje = categoria
        ? categoria.querySelector('.fw-bold')?.textContent?.trim() || '0'
        : 'No disponible';

      html += `<li>${categoriaFija}: ${puntaje}</li>`;
    });

    html += `</ul><h5>Dominios:</h5><ul>`;

    // Dominios
    const dominiosFijos = [
      'Condiciones en el ambiente de trabajo',
      'Carga de trabajo',
      'Cargas psicológicas emocionales',
      'Jornada de trabajo',
      'Interferencia en la relación trabajo-familia',
      'Liderazgo',
      'Relaciones en el trabajo',
      'Violencia',
      'Falta de control y autonomía sobre el trabajo',
      'Limitada o nula posibilidad de desarrollo'
    ];

    const dominios = encuesta.querySelectorAll('.card-section .card-body > div');
    dominiosFijos.forEach((dominioFijo) => {
      const dominio = Array.from(dominios).find(dom =>
        dom.querySelector('.d-flex span:first-child')?.textContent?.trim() === dominioFijo
      );

      const puntaje = dominio
        ? dominio.querySelector('.fw-bold')?.textContent?.trim() || '0'
        : 'No disponible';

      html += `<li>${dominioFijo}: ${puntaje}</li>`;
    });

    html += `</ul><hr>`;
  });

  // Mostrar contenido en el modal
  previewContent.innerHTML = html;

  // Mostrar el modal
  const previewModal = new bootstrap.Modal(document.getElementById('previewModal'));
  previewModal.show();
});

// Descargar el PDF después de la previsualización
document.getElementById('btnDescargarPDF').addEventListener('click', () => {
  // Obtener el total de encuestas y las encuestas resueltas
  const totalEncuestasText = document.getElementById('totalEncuestas')?.textContent || '0/0';
  const [encuestasResueltas, totalEncuestas] = totalEncuestasText.split('/').map(Number);

  // Verificar si todas las encuestas están completas
  if (encuestasResueltas < totalEncuestas) {
    // Mostrar el modal de advertencia
    const warningMessage = document.getElementById('warningMessage');
    warningMessage.textContent = `No se puede generar el PDF. Solo se han completado ${encuestasResueltas} de ${totalEncuestas} encuestas.`;
    const warningModal = new bootstrap.Modal(document.getElementById('warningModal'));
    warningModal.show();
    return; // Detener la ejecución si no están completas
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // Obtener el contenido de la previsualización
  const previewContent = document.getElementById('previewContent').innerHTML;

  // Convertir el contenido HTML a texto plano para el PDF
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = previewContent;

  // Extraer secciones del contenido
  const empresa = tempDiv.querySelector('h3')?.textContent || 'Reporte de Resultados';
  const datosGenerales = Array.from(tempDiv.querySelectorAll('p')).map(p => p.textContent);
  const encuestas = Array.from(tempDiv.querySelectorAll('h4, ul'));

  // Configuración inicial del PDF
  let y = 10; // Margen superior
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(empresa, 10, y);
  y += 10;

  // Agregar datos generales
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  datosGenerales.forEach((line) => {
    doc.text(line, 10, y);
    y += 8;
  });

  y += 5; // Espaciado adicional

  // Agregar encuestas
  encuestas.forEach((element, index) => {
    if (element.tagName === 'H4') {
      // Título de la encuesta
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text(element.textContent, 10, y);
      y += 10;
    } else if (element.tagName === 'UL') {
      // Lista de categorías o dominios
      const items = Array.from(element.querySelectorAll('li')).map(li => li.textContent);

      // Agregar encabezado de Categorías o Dominios
      if (index % 2 === 0) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text('Categorías:', 10, y);
      } else {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text('Dominios:', 10, y);
      }
      y += 8;

      // Agregar los elementos de la lista
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
      items.forEach((item) => {
        if (y > 280) { // Salto de página si se excede el límite
          doc.addPage();
          y = 10;
        }
        doc.text(`- ${item}`, 15, y);
        y += 8;
      });
      y += 5; // Espaciado adicional
    }
  });

  // Descargar el PDF
  doc.save('Reporte.pdf');
});

// Soluciona el problema de scroll al cerrar cualquier modal de Bootstrap
document.addEventListener('hidden.bs.modal', function () {
  document.body.style.overflow = '';
});

// Función para exportar a Excel
function exportarAExcelTrabajo() {
  if (!datosRespuestasTrabajoGlobales || !datosRespuestasTrabajoGlobales.resultados || datosRespuestasTrabajoGlobales.resultados.length === 0) {
    alert('No hay datos para exportar. Por favor, seleccione una empresa con respuestas.');
    return;
  }

  const { empresa, resultados } = datosRespuestasTrabajoGlobales;
  const nombreEmpresa = empresa?.nombreEmpresa || 'Empresa';

  // Calcular estadísticas
  const totalEncuestas = resultados.length;
  const totalPuntaje = resultados.reduce((sum, respuesta) => sum + (respuesta.puntajeTotal || 0), 0);
  const promedioPuntaje = (totalPuntaje / totalEncuestas).toFixed(2);
  const nivelRiesgoGeneral = determinarNivelRiesgoGeneral(promedioPuntaje);

  // Crear un libro de trabajo
  const wb = XLSX.utils.book_new();

  // Hoja 1: Resumen General
  const resumenData = [
    ['REPORTE DE RESULTADOS - FORMULARIO PSICOSOCIAL TRABAJO'],
    ['Empresa', nombreEmpresa],
    ['Total Encuestas', totalEncuestas],
    ['Total Empleados', empresa?.cantidadEmpleados || 0],
    ['Puntaje Promedio', promedioPuntaje],
    ['Nivel de Riesgo', nivelRiesgoGeneral],
    ['Fecha de Actualización', resultados.length > 0 ? formatDate(resultados.reduce((latest, respuesta) => {
      const fechaActual = new Date(respuesta.updatedAt || respuesta.createdAt);
      return fechaActual > latest ? fechaActual : latest;
    }, new Date(0))) : '--/--/----'],
    [],
    ['RESUMEN DE ENCUESTAS']
  ];

  const wsResumen = XLSX.utils.aoa_to_sheet(resumenData);
  XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen');

  // Hoja 2: Respuestas por Encuesta
  const respuestasData = [
    ['ID Encuesta', 'Fecha', 'Puntaje Total', 'Nivel de Riesgo']
  ];

  resultados.forEach((respuesta, index) => {
    const fecha = formatDate(respuesta.createdAt);
    respuestasData.push([
      `Encuesta ${index + 1}`,
      fecha,
      respuesta.puntajeTotal || 0,
      respuesta.nivelRiesgo || 'Nulo o despreciable'
    ]);
  });

  const wsRespuestas = XLSX.utils.aoa_to_sheet(respuestasData);
  XLSX.utils.book_append_sheet(wb, wsRespuestas, 'Encuestas');

  // Hoja 3: Puntajes por Categoría
  const categoriasData = [
    ['ID Encuesta', 'Fecha', 'Categoría', 'Puntaje', 'Nivel']
  ];

  resultados.forEach((respuesta, index) => {
    const fecha = formatDate(respuesta.createdAt);
    const categorias = respuesta.categorias || [];
    
    categorias.forEach(categoria => {
      const nivel = determinarNivelCategoria(categoria.puntaje, categoria.nombre);
      categoriasData.push([
        `Encuesta ${index + 1}`,
        fecha,
        categoria.nombre,
        categoria.puntaje,
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

  resultados.forEach((respuesta, index) => {
    const fecha = formatDate(respuesta.createdAt);
    const dominios = respuesta.dominios || [];
    
    dominios.forEach(dominio => {
      const nivel = determinarNivelDominio(dominio.puntaje, dominio.nombre);
      dominiosData.push([
        `Encuesta ${index + 1}`,
        fecha,
        dominio.nombre,
        dominio.puntaje,
        nivel
      ]);
    });
  });

  const wsDominios = XLSX.utils.aoa_to_sheet(dominiosData);
  XLSX.utils.book_append_sheet(wb, wsDominios, 'Dominios');

  // Hoja 5: Respuestas Detalladas por Pregunta
  const preguntasData = [
    ['ID Encuesta', 'Fecha', 'Pregunta', 'Respuesta', 'Valor Numérico']
  ];

  resultados.forEach((respuesta, index) => {
    const fecha = formatDate(respuesta.createdAt);
    const preguntas = respuesta.preguntas || {};
    
    Object.entries(preguntas).forEach(([pregunta, respuestaPregunta]) => {
      if (pregunta.startsWith('pregunta')) {
        const valorNumerico = convertirValorANumerico(respuestaPregunta);
        preguntasData.push([
          `Encuesta ${index + 1}`,
          fecha,
          pregunta.replace('pregunta', 'Pregunta '),
          convertirValorARespuesta(respuestaPregunta),
          valorNumerico
        ]);
      }
    });
  });

  const wsPreguntas = XLSX.utils.aoa_to_sheet(preguntasData);
  XLSX.utils.book_append_sheet(wb, wsPreguntas, 'Respuestas Detalladas');

  // Generar nombre de archivo
  const nombreArchivo = `Resultados_Trabajo_${nombreEmpresa.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;

  // Descargar el archivo
  XLSX.writeFile(wb, nombreArchivo);
}

// Event listener para el botón de descarga Excel
document.addEventListener('DOMContentLoaded', () => {
  const descargarExcelBtn = document.getElementById('descargarExcel');
  if (descargarExcelBtn) {
    descargarExcelBtn.addEventListener('click', exportarAExcelTrabajo);
  }
});