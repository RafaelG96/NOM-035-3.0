document.addEventListener('DOMContentLoaded', async () => {
  const empresaSelect = document.getElementById('empresaSelect'); // Selector de empresas
  const buscarBtn = document.getElementById('buscarBtn'); // Botón para buscar respuestas
  const loadingDiv = document.getElementById('loading');
  const resultadosContainer = document.getElementById('resultadosContainer');
  const respuestasList = document.getElementById('respuestasList');
  const totalEncuestasElement = document.getElementById('totalEncuestas');
  const fechaUltimaActualizacionElement = document.getElementById('fechaUltimaActualizacion');
  const API_URL = 'http://localhost:3000/api/trauma';

  // Cargar empresas al cargar la página
  try {
    loadingDiv.style.display = 'block';

    // Llamar al endpoint para obtener las empresas únicas
    const response = await fetch(`${API_URL}/empresas`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al cargar empresas');
    }

    const { data: empresas } = await response.json();

    // Verificar si hay empresas disponibles
    if (!empresas || empresas.length === 0) {
      empresaSelect.innerHTML = '<option value="" disabled>No hay empresas disponibles</option>';
      return;
    }

    // Llenar el selector con las empresas
    empresaSelect.innerHTML = '<option value="" selected disabled>-- Seleccione una empresa --</option>';
    empresas.forEach(empresa => {
      const option = document.createElement('option');
      option.value = empresa; // Usar el nombre de la empresa como valor
      option.textContent = empresa; // Mostrar el nombre de la empresa
      empresaSelect.appendChild(option);
    });
  } catch (error) {
    console.error('Error al cargar empresas:', error);
    empresaSelect.innerHTML = '<option value="" disabled>Error al cargar empresas</option>';
    mostrarMensajeError(error.message);
  } finally {
    loadingDiv.style.display = 'none';
  }

  // Manejar la búsqueda de respuestas al hacer clic en el botón
  buscarBtn.addEventListener('click', async () => {
    const empresaNombre = empresaSelect.value.trim(); // Obtener el valor seleccionado del selector
    if (!empresaNombre) {
      alert('Por favor, seleccione una empresa.');
      return;
    }

    try {
      loadingDiv.style.display = 'block';
      resultadosContainer.classList.add('d-none');

      // Llamar al endpoint para obtener las respuestas del cuestionario de trauma
      const response = await fetch(`${API_URL}/resultados?empresa=${encodeURIComponent(empresaNombre)}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al cargar respuestas');
      }

      const { data: respuestas } = await response.json();
      mostrarResultadosTrauma(respuestas);

    } catch (error) {
      console.error('Error:', error);
      mostrarMensajeError(error.message);
    } finally {
      loadingDiv.style.display = 'none';
    }
  });
});

// Mostrar resultados del cuestionario de trauma
function mostrarResultadosTrauma(data) {
  const resultadosContainer = document.getElementById('resultadosContainer');
  const respuestasList = document.getElementById('respuestasList');
  const totalEncuestasElement = document.getElementById('totalEncuestas');
  const fechaUltimaActualizacionElement = document.getElementById('fechaUltimaActualizacion');

  if (!data || data.length === 0) {
    respuestasList.innerHTML = '<div class="alert alert-info">No se encontraron respuestas para esta empresa</div>';
    resultadosContainer.classList.remove('d-none');
    return;
  }

  // Calcular el total de encuestas y la fecha de la última actualización
  const totalEncuestas = data.length;
  const ultimaFecha = data.reduce((latest, respuesta) => {
    const fechaActual = new Date(respuesta.updatedAt || respuesta.createdAt);
    return fechaActual > latest ? fechaActual : latest;
  }, new Date(0)); // Fecha inicial muy antigua

  // Mostrar el total de encuestas y la última fecha de actualización
  totalEncuestasElement.textContent = totalEncuestas;
  fechaUltimaActualizacionElement.textContent = formatDate(ultimaFecha);

  // Renderizar las respuestas
  respuestasList.innerHTML = data.map(respuesta => {
    const fechaEncuesta = formatDate(respuesta.createdAt);

    // Renderizar las preguntas y respuestas
    const preguntasHTML = respuesta.respuestas.map(r => `
      <tr>
        <td class="fw-bold">${r.pregunta}</td>
        <td>${r.respuesta}</td>
      </tr>
    `).join('');

    return `
      <div class="card card-respuesta mb-4">
        <div class="card-header bg-white d-flex justify-content-between align-items-center">
          <h5 class="mb-0">
            <i class="fas fa-poll me-2 text-primary"></i>
            Encuesta realizada el ${fechaEncuesta}
          </h5>
          <div>
            <span class="badge bg-info">${respuesta.identificadorAnonimo}</span>
          </div>
        </div>
        <div class="card-body">
          <h6>Respuestas del formulario</h6>
          <div class="table-responsive">
            <table class="table table-sm table-hover">
              <thead>
                <tr>
                  <th>Pregunta</th>
                  <th>Respuesta</th>
                </tr>
              </thead>
              <tbody>
                ${preguntasHTML}
              </tbody>
            </table>
          </div>

          <h6>Razones de Evaluación</h6>
          <ul>
            ${respuesta.razonesEvaluacion.map(razon => `<li>${razon}</li>`).join('')}
          </ul>
        </div>
      </div>
    `;
  }).join('');

  resultadosContainer.classList.remove('d-none');
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
  alert(mensaje); // Puedes usar un modal si prefieres
}