// resultados.js
document.addEventListener('DOMContentLoaded', async () => {
    const empresaSelect = document.getElementById('empresaSelect');
    const loadingDiv = document.getElementById('loading');
    const resultadosContainer = document.getElementById('resultadosContainer');
  
    // 1. Cargar empresas
    try {
      loadingDiv.style.display = 'block';
      resultadosContainer.classList.add('d-none');
  
      const response = await fetch('http://localhost:3000/api/empresas');
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
  
        const response = await fetch(`http://localhost:3000/api/respuestas/empresa/${empresaId}`);
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Error al cargar respuestas');
        }
  
        const { data: respuestas } = await response.json();
        mostrarResultados(respuestas);
  
      } catch (error) {
        console.error('Error:', error);
        mostrarMensajeError(error.message);
      } finally {
        loadingDiv.style.display = 'none';
      }
    });
  });
  
  // Mostrar resultados por empresa
  // Función para mostrar resultados (actualizada)
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
    totalEncuestas.textContent = resumen.totalEncuestas;
    puntajePromedio.textContent = resumen.puntajePromedio;
    nivelRiesgo.innerHTML = `<span class="badge ${getBadgeClass(resumen.nivelRiesgo)}">${resumen.nivelRiesgo}</span>`;
    
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
          <div class="row">
            <div class="col-md-4">
              <div class="card mb-3 h-100">
                <div class="card-header bg-light">
                  <h6 class="mb-0"><i class="fas fa-layer-group me-2"></i>Puntajes por Categoría</h6>
                </div>
                <div class="card-body">
                  ${renderizarPuntajes(respuesta.puntajesPorCategoria, 50)}
                </div>
              </div>
            </div>
            
            <div class="col-md-4">
              <div class="card mb-3 h-100">
                <div class="card-header bg-light">
                  <h6 class="mb-0"><i class="fas fa-sitemap me-2"></i>Puntajes por Dominio</h6>
                </div>
                <div class="card-body">
                  ${renderizarPuntajes(respuesta.puntajesPorDominio, 30)}
                </div>
              </div>
            </div>
            
            <div class="col-md-4">
              <div class="card mb-3 h-100">
                <div class="card-header bg-light">
                  <h6 class="mb-0"><i class="fas fa-chart-pie me-2"></i>Puntajes por Dimensión</h6>
                </div>
                <div class="card-body">
                  ${renderizarPuntajes(respuesta.puntajesPorDimension, 20)}
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
    if (lower.includes('muy alto') || lower.includes('alto')) return 'bg-danger';
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
  
  // Mostrar barras de progreso
  function renderizarPuntajes(puntajes, maxValue = 50) {
    if (!puntajes || Object.keys(puntajes).length === 0) {
      return '<p class="text-muted small">No hay datos disponibles</p>';
    }
  
    return Object.entries(puntajes).map(([nombre, valor]) => {
      const porcentaje = Math.min(100, (valor / maxValue) * 100);
      let barColor = 'bg-success';
      if (porcentaje > 75) barColor = 'bg-danger';
      else if (porcentaje > 50) barColor = 'bg-warning';
  
      return `
        <div class="mb-3">
          <div class="d-flex justify-content-between mb-1 small">
            <span>${nombre}</span>
            <span class="fw-bold">${valor}</span>
          </div>
          <div class="progress" style="height: 10px;">
            <div class="progress-bar ${barColor}" style="width: ${porcentaje}%;" aria-valuenow="${valor}" aria-valuemin="0" aria-valuemax="${maxValue}"></div>
          </div>
        </div>
      `;
    }).join('');
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
  