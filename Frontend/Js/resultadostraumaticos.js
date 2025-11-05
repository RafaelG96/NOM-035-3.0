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
      mostrarModalSinDatos('No hay empresas ni encuestas registradas en el sistema.');
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
      nombreEmpresaActual = empresaNombre; // Guardar nombre de empresa para exportación Excel
      mostrarResultadosTrauma(respuestas);

    } catch (error) {
      console.error('Error:', error);
      mostrarMensajeError(error.message);
    } finally {
      loadingDiv.style.display = 'none';
    }
  });
});

// 1. Variables globales para almacenar los datos actuales
let datosActuales = [];
let nombreEmpresaActual = '';

// Mostrar resultados del cuestionario de trauma
function mostrarResultadosTrauma(data) {
  const resultadosContainer = document.getElementById('resultadosContainer');
  const respuestasList = document.getElementById('respuestasList');
  const totalEncuestasElement = document.getElementById('totalEncuestas');
  const fechaUltimaActualizacionElement = document.getElementById('fechaUltimaActualizacion');

  if (!data || data.length === 0) {
    respuestasList.innerHTML = '<div class="alert alert-info">No se encontraron respuestas para esta empresa</div>';
    resultadosContainer.classList.remove('d-none');
    mostrarModalSinDatos('No se encontraron respuestas para esta empresa.');
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

  datosActuales = data; // Guardar para PDF
  document.getElementById('previsualizarPdfBtn').classList.toggle('d-none', !data || data.length === 0);
  document.getElementById('descargarPdfBtn').classList.toggle('d-none', !data || data.length === 0);
  document.getElementById('descargarExcel').classList.toggle('d-none', !data || data.length === 0);

  resultadosContainer.classList.remove('d-none');
}

// 2. Lógica para previsualizar PDF
document.getElementById('previsualizarPdfBtn').addEventListener('click', () => {
  const modal = new bootstrap.Modal(document.getElementById('previsualizacionPdf'));
  const contenido = document.getElementById('contenidoPrevisualizacion');
  contenido.innerHTML = generarHtmlPrevisualizacion(datosActuales);
  modal.show();
  document.getElementById('descargarPdfBtnModal').classList.remove('d-none');
});

// 3. Descargar PDF desde el modal
document.getElementById('descargarPdfBtnModal').addEventListener('click', () => {
  const doc = new window.jspdf.jsPDF();
  let y = 10;
  datosActuales.forEach(respuesta => {
    doc.text(`Encuesta: ${formatDate(respuesta.createdAt)}`, 10, y);
    y += 7;
    respuesta.respuestas.forEach(r => {
      doc.text(`${r.pregunta}: ${r.respuesta}`, 12, y);
      y += 6;
    });
    doc.text('Razones:', 12, y);
    y += 6;
    respuesta.razonesEvaluacion.forEach(razon => {
      doc.text(`- ${razon}`, 14, y);
      y += 5;
    });
    y += 8;
    if (y > 270) { doc.addPage(); y = 10; }
  });
  doc.save('resultados_trauma.pdf');
});

// 3. Función para generar HTML de previsualización
function generarHtmlPrevisualizacion(data) {
  if (!data || data.length === 0) return '<p>No hay datos para previsualizar.</p>';
  return data.map(respuesta => `
    <div>
      <h5>Encuesta: ${formatDate(respuesta.createdAt)}</h5>
      <ul>
        ${respuesta.respuestas.map(r => `<li><b>${r.pregunta}:</b> ${r.respuesta}</li>`).join('')}
      </ul>
      <b>Razones:</b>
      <ul>${respuesta.razonesEvaluacion.map(razon => `<li>${razon}</li>`).join('')}</ul>
      <hr>
    </div>
  `).join('');
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
  mostrarModalSinDatos(mensaje);
}

// Mostrar modal sin datos
function mostrarModalSinDatos(mensaje) {
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

// Función para exportar a Excel
function exportarAExcelTrauma() {
  if (!datosActuales || datosActuales.length === 0) {
    alert('No hay datos para exportar. Por favor, seleccione una empresa con respuestas.');
    return;
  }

  const nombreEmpresa = nombreEmpresaActual || 'Empresa';

  // Calcular estadísticas
  const totalEncuestas = datosActuales.length;

  // Crear un libro de trabajo
  const wb = XLSX.utils.book_new();

  // Hoja 1: Resumen General
  const resumenData = [
    ['REPORTE DE RESULTADOS - CUESTIONARIO DE TRAUMA'],
    ['Empresa', nombreEmpresa],
    ['Total Encuestas', totalEncuestas],
    ['Fecha de Actualización', datosActuales.length > 0 ? formatDate(datosActuales.reduce((latest, respuesta) => {
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
    ['ID Encuesta', 'Fecha', 'Identificador Anónimo']
  ];

  datosActuales.forEach((respuesta, index) => {
    const fecha = formatDate(respuesta.createdAt);
    respuestasData.push([
      `Encuesta ${index + 1}`,
      fecha,
      respuesta.identificadorAnonimo || 'N/A'
    ]);
  });

  const wsRespuestas = XLSX.utils.aoa_to_sheet(respuestasData);
  XLSX.utils.book_append_sheet(wb, wsRespuestas, 'Encuestas');

  // Hoja 3: Respuestas Detalladas por Pregunta
  const preguntasData = [
    ['ID Encuesta', 'Fecha', 'Pregunta', 'Respuesta']
  ];

  datosActuales.forEach((respuesta, index) => {
    const fecha = formatDate(respuesta.createdAt);
    const respuestas = respuesta.respuestas || [];
    
    respuestas.forEach(r => {
      preguntasData.push([
        `Encuesta ${index + 1}`,
        fecha,
        r.pregunta,
        r.respuesta
      ]);
    });
  });

  const wsPreguntas = XLSX.utils.aoa_to_sheet(preguntasData);
  XLSX.utils.book_append_sheet(wb, wsPreguntas, 'Respuestas Detalladas');

  // Hoja 4: Razones de Evaluación
  const razonesData = [
    ['ID Encuesta', 'Fecha', 'Razón de Evaluación']
  ];

  datosActuales.forEach((respuesta, index) => {
    const fecha = formatDate(respuesta.createdAt);
    const razonesEvaluacion = respuesta.razonesEvaluacion || [];
    
    razonesEvaluacion.forEach(razon => {
      razonesData.push([
        `Encuesta ${index + 1}`,
        fecha,
        razon
      ]);
    });
  });

  const wsRazones = XLSX.utils.aoa_to_sheet(razonesData);
  XLSX.utils.book_append_sheet(wb, wsRazones, 'Razones de Evaluación');

  // Generar nombre de archivo
  const nombreArchivo = `Resultados_Trauma_${nombreEmpresa.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;

  // Descargar el archivo
  XLSX.writeFile(wb, nombreArchivo);
}

// Event listener para el botón de descarga Excel
document.addEventListener('DOMContentLoaded', () => {
  const descargarExcelBtn = document.getElementById('descargarExcel');
  if (descargarExcelBtn) {
    descargarExcelBtn.addEventListener('click', exportarAExcelTrauma);
  }
});