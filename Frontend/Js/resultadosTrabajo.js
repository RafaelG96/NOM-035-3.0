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

    // Cambiar el endpoint para obtener solo empresas con formulario básico
    const response = await fetch('http://localhost:3000/api/empresas/con-formulario-basico');
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al cargar empresas');
    }

    const { data: empresas } = await response.json();

    if (!empresas || empresas.length === 0) {
      empresaSelect.innerHTML = '<option value="" disabled>No hay empresas disponibles</option>';
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
    empresaSelect.innerHTML = '<option value="" disabled>Error al cargar empresas</option>';
    mostrarMensajeError(error.message);
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

      // Mostrar nombre de la empresa
      nombreEmpresaElement.textContent = empresaNombre || 'Empresa seleccionada';

      // Llamar al endpoint del formulario de trabajo
      const response = await fetch(`http://localhost:3000/api/psicosocial/trabajo/empresa/${empresaId}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al cargar respuestas');
      }

      const { data: respuestas } = await response.json();
      mostrarResultadosTrabajo(respuestas);

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
  const resultadosContainer = document.getElementById('resultadosContainer');
  const respuestasList = document.getElementById('respuestasList');
  const puntajePromedioElement = document.getElementById('puntajePromedio');
  const totalEncuestasElement = document.getElementById('totalEncuestas');
  const fechaUltimaActualizacionElement = document.getElementById('fechaUltimaActualizacion');
  const nivelRiesgoElement = document.getElementById('nivelRiesgo');
  const accionRiesgoContainer = document.getElementById('accionRiesgoContainer');
  const accionRiesgoContent = document.getElementById('accionRiesgoContent');

  // Limpia el contenedor antes de agregar nuevos resultados
  respuestasList.innerHTML = '';

  if (!data || data.length === 0) {
    respuestasList.innerHTML = '<div class="alert alert-info">No se encontraron respuestas para esta empresa</div>';
    resultadosContainer.classList.remove('d-none');
    return;
  }

  // Calcular estadísticas
  const totalEncuestas = data.length;
  const ultimaFecha = data.reduce((latest, respuesta) => {
    const fechaActual = new Date(respuesta.updatedAt || respuesta.createdAt);
    return fechaActual > latest ? fechaActual : latest;
  }, new Date(0));

  const totalPuntaje = data.reduce((sum, respuesta) => sum + (respuesta.puntajeTotal || 0), 0);
  const promedioPuntaje = (totalPuntaje / totalEncuestas).toFixed(2);

  // Determinar nivel de riesgo general
  const nivelRiesgoGeneral = determinarNivelRiesgoGeneral(promedioPuntaje);

  // Mostrar estadísticas
  totalEncuestasElement.textContent = totalEncuestas;
  fechaUltimaActualizacionElement.textContent = formatDate(ultimaFecha);
  puntajePromedioElement.textContent = promedioPuntaje;
  nivelRiesgoElement.innerHTML = `<span class="badge ${getBadgeClass(nivelRiesgoGeneral)}">${nivelRiesgoGeneral}</span>`;

  // Mostrar recomendaciones según nivel de riesgo
  mostrarRecomendacionesRiesgo(nivelRiesgoGeneral);

  // Renderizar las respuestas
  respuestasList.innerHTML = data.map(respuesta => {
    const fechaEncuesta = formatDate(respuesta.createdAt);

    // Renderizar las secciones
    const categoriasHTML = renderizarCategorias(respuesta.categorias);
    const dominiosHTML = renderizarDominios(respuesta.dominios);
    const dimensionesHTML = renderizarDimensiones(respuesta.dimensiones);

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
          <div class="row mb-4">
            <div class="col-md-4">
              ${categoriasHTML}
            </div>
            <div class="col-md-4">
              ${dominiosHTML}
            </div>
            <div class="col-md-4">
              ${dimensionesHTML}
            </div>
          </div>
          
          <button class="btn btn-outline-primary btn-sm mt-3" onclick="mostrarDetallePreguntas(this)" data-preguntas='${JSON.stringify(respuesta.preguntas)}'>
            <i class="fas fa-list me-2"></i>Ver respuestas del formulario
          </button>
        </div>
      </div>
    `;
  }).join('');

  resultadosContainer.classList.remove('d-none');
}

function mostrarDetallePreguntas(button) {
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
    .filter(([key, value]) => typeof value !== 'object') // Excluir objetos anidados
    .map(([key, value]) => ({
      numero: key,
      texto: formatearTextoPregunta(key),
      respuesta: convertirValorARespuesta(value),
      valor: convertirValorANumerico(value),
      dimension: obtenerDimension(key)
    }));

  if (preguntasArray.length === 0) {
    alert('No hay respuestas disponibles para mostrar.');
    return;
  }

  const modalBody = document.getElementById('modalBody');
  modalBody.innerHTML = preguntasArray.map(pregunta => `
    <div class="mb-3 border-bottom pb-2">
      <h6 class="fw-bold">${pregunta.numero}</h6>
      <p><strong>Respuesta:</strong> <span class="badge ${getRespuestaClass(pregunta.respuesta)}">${pregunta.respuesta}</span></p>
    </div>
  `).join('');

  const modal = new bootstrap.Modal(document.getElementById('detallePreguntasModal'));
  modal.show();
}

// Funciones auxiliares para formatear las preguntas
function formatearTextoPregunta(key) {
  // Mapea las claves a textos más descriptivos
  const preguntasMap = {
    'esJefe': '¿Tiene puesto de jefe o supervisor?',
    'servicioClientes': '¿Trabaja en servicio al cliente?',
    // Agrega aquí todas las preguntas posibles con sus textos
  };
  return preguntasMap[key] || key;
}

function convertirValorARespuesta(value) {
  if (typeof value === 'boolean') {
    return value ? 'Sí' : 'No';
  }
  return String(value);
}

function convertirValorANumerico(value) {
  if (typeof value === 'boolean') {
    return value ? 1 : 0;
  }
  if (typeof value === 'number') {
    return value;
  }
  return 0;
}

function obtenerDimension(key) {
  // Mapea las preguntas a sus dimensiones correspondientes
  const dimensionesMap = {
    'esJefe': 'Organización del trabajo',
    'servicioClientes': 'Interacción con clientes',
    // Agrega aquí todas las dimensiones
  };
  return dimensionesMap[key] || 'General';
}

// Renderizar categorías con más detalle
function renderizarCategorias(categorias) {
  if (!categorias || categorias.length === 0) {
    return `
      <div class="card card-section mb-4">
        <div class="card-header bg-light">
          <h6 class="mb-0 text-primary">Categorías</h6>
        </div>
        <div class="card-body">
          <p class="text-muted small">No hay datos de categorías disponibles</p>
        </div>
      </div>
    `;
  }

  const itemsHTML = categorias.map(cat => {
    const porcentaje = Math.min(100, (cat.puntaje / 50) * 100);
    const barColor = getBarColor(porcentaje);
    
    return `
      <div class="mb-3">
        <div class="d-flex justify-content-between mb-1 small">
          <span>${cat.nombre}</span>
          <span class="fw-bold">${cat.puntaje}/50</span>
        </div>
        <div class="progress" style="height: 10px;">
          <div class="progress-bar ${barColor}" style="width: ${porcentaje}%;"></div>
        </div>
        <p class="small text-muted mt-1 mb-0">${getInterpretacionCategoria(cat.nombre, cat.puntaje)}</p>
      </div>
    `;
  }).join('');

  return `
    <div class="card card-section mb-4">
      <div class="card-header bg-light">
        <h6 class="mb-0 text-primary">Categorías</h6>
      </div>
      <div class="card-body">
        ${itemsHTML}
      </div>
    </div>
  `;
}

// Renderizar dominios con más detalle
function renderizarDominios(dominios) {
  if (!dominios || dominios.length === 0) {
    return `
      <div class="card card-section mb-4">
        <div class="card-header bg-light">
          <h6 class="mb-0 text-primary">Dominios</h6>
        </div>
        <div class="card-body">
          <p class="text-muted small">No hay datos de dominios disponibles</p>
        </div>
      </div>
    `;
  }

  const itemsHTML = dominios.map(dom => {
    const porcentaje = Math.min(100, (dom.puntaje / 30) * 100);
    const barColor = getBarColor(porcentaje);
    
    return `
      <div class="mb-3">
        <div class="d-flex justify-content-between mb-1 small">
          <span>${dom.nombre}</span>
          <span class="fw-bold">${dom.puntaje}/30</span>
        </div>
        <div class="progress" style="height: 10px;">
          <div class="progress-bar ${barColor}" style="width: ${porcentaje}%;"></div>
        </div>
        <p class="small text-muted mt-1 mb-0">${getInterpretacionDominio(dom.nombre, dom.puntaje)}</p>
      </div>
    `;
  }).join('');

  return `
    <div class="card card-section mb-4">
      <div class="card-header bg-light">
        <h6 class="mb-0 text-primary">Dominios</h6>
      </div>
      <div class="card-body">
        ${itemsHTML}
      </div>
    </div>
  `;
}

// Renderizar dimensiones con más detalle
function renderizarDimensiones(dimensiones) {
  if (!dimensiones || dimensiones.length === 0) {
    return `
      <div class="card card-section mb-4">
        <div class="card-header bg-light">
          <h6 class="mb-0 text-primary">Dimensiones</h6>
        </div>
        <div class="card-body">
          <p class="text-muted small">No hay datos de dimensiones disponibles</p>
        </div>
      </div>
    `;
  }

  const itemsHTML = dimensiones.map(dim => {
    const porcentaje = Math.min(100, (dim.puntaje / 20) * 100);
    const barColor = getBarColor(porcentaje);
    
    return `
      <div class="mb-3">
        <div class="d-flex justify-content-between mb-1 small">
          <span>${dim.nombre}</span>
          <span class="fw-bold">${dim.puntaje}/20</span>
        </div>
        <div class="progress" style="height: 10px;">
          <div class="progress-bar ${barColor}" style="width: ${porcentaje}%;"></div>
        </div>
        <p class="small text-muted mt-1 mb-0">${getInterpretacionDimension(dim.nombre, dim.puntaje)}</p>
      </div>
    `;
  }).join('');

  return `
    <div class="card card-section mb-4">
      <div class="card-header bg-light">
        <h6 class="mb-0 text-primary">Dimensiones</h6>
      </div>
      <div class="card-body">
        ${itemsHTML}
      </div>
    </div>
  `;
}

// Renderizar preguntas y respuestas
function renderizarPreguntas(preguntas) {
  if (!preguntas || preguntas.length === 0) {
    return '<div class="alert alert-info">No hay datos de preguntas disponibles</div>';
  }

  // Agrupar preguntas por categoría
  const preguntasPorCategoria = {};
  preguntas.forEach(pregunta => {
    if (!preguntasPorCategoria[pregunta.categoria]) {
      preguntasPorCategoria[pregunta.categoria] = [];
    }
    preguntasPorCategoria[pregunta.categoria].push(pregunta);
  });

  // Generar HTML para cada categoría de preguntas
  return Object.entries(preguntasPorCategoria).map(([categoria, preguntas]) => {
    const preguntasHTML = preguntas.map(pregunta => {
      const respuestaClass = getRespuestaClass(pregunta.respuesta);
      
      return `
        <div class="pregunta-item mb-3">
          <div class="d-flex justify-content-between align-items-start">
            <div class="flex-grow-1">
              <p class="mb-1 fw-bold">${pregunta.numero}. ${pregunta.texto}</p>
              <div class="d-flex align-items-center">
                <span class="badge ${respuestaClass} me-2">${pregunta.respuesta}</span>
                <small class="text-muted">Valor: ${pregunta.valor}</small>
              </div>
            </div>
            <div class="text-end">
              <small class="text-muted">${pregunta.dimension || 'Sin dimensión'}</small>
            </div>
          </div>
        </div>
      `;
    }).join('');

    return `
      <div class="card card-preguntas mb-3">
        <div class="card-header bg-light">
          <h6 class="mb-0">${categoria}</h6>
        </div>
        <div class="card-body">
          ${preguntasHTML}
        </div>
      </div>
    `;
  }).join('');
}

// Mostrar recomendaciones según nivel de riesgo
function mostrarRecomendacionesRiesgo(nivelRiesgo) {
  let recomendaciones = '';
  
  switch(nivelRiesgo.toLowerCase()) {
    case 'muy alto':
      recomendaciones = `
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
      `;
      break;
    case 'alto':
      recomendaciones = `
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
      `;
      break;
    case 'medio':
      recomendaciones = `
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
      `;
      break;
    case 'bajo':
      recomendaciones = `
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
      `;
      break;
    default:
      recomendaciones = `
        <div class="alert alert-secondary">
          <h5 class="alert-heading"><i class="fas fa-info-circle me-2"></i>Riesgo No Determinado</h5>
          <p>No se pudo determinar el nivel de riesgo con los datos disponibles.</p>
        </div>
      `;
  }
  
  accionRiesgoContent.innerHTML = recomendaciones;
  accionRiesgoContainer.classList.remove('d-none');
}

// Determinar nivel de riesgo general basado en el puntaje promedio
function determinarNivelRiesgoGeneral(puntajePromedio) {
  const puntaje = parseFloat(puntajePromedio);
  
  if (puntaje >= 80) return 'Muy Alto';
  if (puntaje >= 60) return 'Alto';
  if (puntaje >= 40) return 'Medio';
  return 'Bajo';
}

// Obtener clase CSS para la respuesta
function getRespuestaClass(respuesta) {
  if (!respuesta) return 'bg-secondary';
  
  const lower = respuesta.toLowerCase();
  if (lower.includes('siempre') || lower.includes('si')) return 'bg-danger';
  if (lower.includes('casi siempre')) return 'bg-warning text-dark';
  if (lower.includes('algunas veces')) return 'bg-info text-dark';
  if (lower.includes('casi nunca') || lower.includes('no')) return 'bg-success';
  return 'bg-secondary';
}

// Obtener color de la barra de progreso
function getBarColor(porcentaje) {
  if (porcentaje > 75) return 'bg-danger';
  if (porcentaje > 50) return 'bg-warning';
  return 'bg-success';
}

// Interpretación de categorías
function getInterpretacionCategoria(nombre, puntaje) {
  // Implementar lógica específica para cada categoría
  return `Interpretación para ${nombre} con puntaje ${puntaje}`;
}

// Interpretación de dominios
function getInterpretacionDominio(nombre, puntaje) {
  // Implementar lógica específica para cada dominio
  return `Interpretación para ${nombre} con puntaje ${puntaje}`;
}

// Interpretación de dimensiones
function getInterpretacionDimension(nombre, puntaje) {
  // Implementar lógica específica para cada dimensión
  return `Interpretación para ${nombre} con puntaje ${puntaje}`;
}

// Formatear fechas
function formatDate(date) {
  const d = new Date(date);
  if (isNaN(d)) return '--/--/----';
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

// Mostrar mensaje de error
function mostrarMensajeError(mensaje) {
  const alertDiv = document.createElement('div');
  alertDiv.className = 'alert alert-danger alert-dismissible fade show';
  alertDiv.innerHTML = `
    <strong>Error!</strong> ${mensaje}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;
  
  const container = document.querySelector('main .container');
  container.prepend(alertDiv);
}

// Clases de estilo para badges
function getBadgeClass(nivel) {
  if (!nivel) return 'bg-secondary';
  const lower = nivel.toLowerCase();
  if (lower.includes('muy alto') || lower.includes('alto')) return 'bg-danger';
  if (lower.includes('medio')) return 'bg-warning text-dark';
  if (lower.includes('bajo')) return 'bg-success';
  return 'bg-secondary';
}