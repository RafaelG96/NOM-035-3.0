document.addEventListener('DOMContentLoaded', function() {
    // Elementos del formulario de empresa
    const companyForm = document.getElementById('companyIdentification');
    const questionnaireSection = document.getElementById('questionnaireSection');
    const companyNameBadge = document.getElementById('companyNameBadge');
    let companyName = '';

    // Elementos del cuestionario
    const form = document.getElementById('traumaQuestionnaire');
    const evaluateBtn = document.getElementById('evaluateBtn');
    const resetBtn = document.getElementById('resetBtn');

    // Configuración de la API
    const API_URL = 'http://localhost:3000/api/trauma/cuestionarios';

    // Manejar el formulario de identificación de empresa
    companyForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        companyName = document.getElementById('companyName').value.trim();
        
        if (companyName) {
            // Mostrar el cuestionario y ocultar el formulario de empresa
            document.getElementById('companyForm').classList.add('hidden-section');
            questionnaireSection.classList.remove('hidden-section');
            
            // Mostrar el nombre de la empresa como badge
            companyNameBadge.textContent = `Empresa: ${companyName}`;
        }
    });

    // Event listeners del cuestionario
    form.addEventListener('submit', handleFormSubmit);
    resetBtn.addEventListener('click', resetForm);

    // Verificar respuestas de la Sección I
    document.querySelectorAll('input[name^="q"]').forEach(question => {
        if (question.name.match(/q[1-6]/)) {
            question.addEventListener('change', checkSectionIResponses);
        }
    });

    function checkSectionIResponses() {
        let anyYesInSectionI = false;
        
        for (let i = 1; i <= 6; i++) {
            if (document.querySelector(`input[name="q${i}"]:checked`)?.value === 'si') {
                anyYesInSectionI = true;
                break;
            }
        }
        
        const additionalSections = document.querySelectorAll('.question-group:not(:first-child)');
        additionalSections.forEach(section => {
            section.style.display = anyYesInSectionI ? 'block' : 'none';
        });
    }

    async function handleFormSubmit(e) {
        e.preventDefault();
        
        try {
            // Validar que tenemos el nombre de la empresa
            if (!companyName || companyName.trim() === '') {
                throw new Error('Por favor ingrese el nombre de la empresa primero');
            }
    
            evaluateBtn.disabled = true;
            evaluateBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Procesando...';
            
            const respuestas = collectResponses();
            const evaluacion = evaluarRespuestas(respuestas);
            
            const dataToSend = {
                empresa: companyName, // Asegurarnos de enviar el nombre
                respuestas,
                requiereEvaluacion: evaluacion.requiereEvaluacion,
                razonesEvaluacion: evaluacion.razonesEvaluacion
            };
            
            const response = await sendDataToBackend(dataToSend);
            
            if (!response || !response.identificadorAnonimo) {
                throw new Error('El servidor no devolvió una respuesta válida');
            }
            
            showResults({
                ...response,
                requiereEvaluacion: evaluacion.requiereEvaluacion,
                razonesEvaluacion: evaluacion.razonesEvaluacion,
                empresa: companyName
            });
            
        } catch (error) {
            console.error('Error en handleFormSubmit:', error);
            showAlert('danger', error.message || 'Error al enviar el cuestionario');
        } finally {
            evaluateBtn.disabled = false;
            evaluateBtn.innerHTML = '<i class="bi bi-check-circle"></i> Evaluar';
        }
    }

    function evaluarRespuestas(respuestas) {
        const seccionI = respuestas.filter(r => r.pregunta.match(/^q[1-6]$/));
        const seccionII = respuestas.filter(r => r.pregunta.match(/^q[7-8]$/));
        const seccionIII = respuestas.filter(r => r.pregunta.match(/^q(9|1[0-5])$/));
        const seccionIV = respuestas.filter(r => r.pregunta.match(/^q(1[6-9]|20)$/));
        
        let requiereEvaluacion = false;
        const razonesEvaluacion = [];
        
        const anyYesInSectionI = seccionI.some(r => r.respuesta === 'si');
        
        if (!anyYesInSectionI) {
            return { requiereEvaluacion: false, razonesEvaluacion: [] };
        }
        
        const yesInSectionII = seccionII.filter(r => r.respuesta === 'si').length;
        if (yesInSectionII > 0) {
            requiereEvaluacion = true;
            razonesEvaluacion.push(`Sección II: ${yesInSectionII} respuesta(s) positiva(s)`);
        }
        
        const yesInSectionIII = seccionIII.filter(r => r.respuesta === 'si').length;
        if (yesInSectionIII >= 3) {
            requiereEvaluacion = true;
            razonesEvaluacion.push(`Sección III: ${yesInSectionIII} respuesta(s) positiva(s)`);
        }
        
        const yesInSectionIV = seccionIV.filter(r => r.respuesta === 'si').length;
        if (yesInSectionIV >= 2) {
            requiereEvaluacion = true;
            razonesEvaluacion.push(`Sección IV: ${yesInSectionIV} respuesta(s) positiva(s)`);
        }
        
        return { requiereEvaluacion, razonesEvaluacion };
    }

    function collectResponses() {
        const respuestas = [];
        document.querySelectorAll('input[type="radio"]:checked').forEach(input => {
            respuestas.push({
                pregunta: input.name,
                respuesta: input.value
            });
        });
        return respuestas;
    }

    async function sendDataToBackend(data) {
        try {
            // Validación adicional antes de enviar
            if (!data.empresa || data.empresa.trim() === '') {
                throw new Error('El nombre de la empresa es requerido');
            }
    
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
    
            if (!response.ok) {
                // Si la respuesta no es OK, intentamos obtener el mensaje de error del backend
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Error en el servidor: ${response.status}`);
            }
    
            return await response.json();
            
        } catch (error) {
            console.error('Error en sendDataToBackend:', error);
            
            // Mejoramos el mensaje de error para el usuario
            let errorMessage = 'No se pudo conectar con el servidor. ';
            if (error.message.includes('Failed to fetch')) {
                errorMessage += 'Por favor verifique su conexión a internet.';
            } else {
                errorMessage += 'Por favor intente más tarde.';
            }
            
            throw new Error(errorMessage);
        }
    }

    function showResults(data) {
        if (!data || !data.identificadorAnonimo) {
            mostrarResultadoEnModal(`
                <div class="alert alert-danger">
                    Error: No se recibió un identificador válido del servidor.<br>
                    Por favor contacte al administrador.
                </div>
            `);
            return;
        }

        const identificador = data.identificadorAnonimo;

        // Mensaje de recomendación mejorado según el resultado
        let recomendacion = '';
        if (data.requiereEvaluacion) {
            recomendacion = `
                <div class="alert alert-warning mt-3">
                    <b>Recomendación:</b> De acuerdo con sus respuestas, se recomienda encarecidamente que acuda a una <b>evaluación profesional en salud mental</b> lo antes posible.<br>
                    El objetivo es brindarle apoyo y orientación especializada para su bienestar.<br>
                    <i class="bi bi-info-circle"></i> Recuerde que la atención oportuna puede marcar una gran diferencia.
                </div>
            `;
        } else {
            recomendacion = `
                <div class="alert alert-success mt-3">
                    <b>Recomendación:</b> Según sus respuestas, <b>no se detecta necesidad inmediata de evaluación profesional</b> en este momento.<br>
                    Si en el futuro experimenta situaciones de riesgo o malestar emocional, no dude en buscar apoyo.
                </div>
            `;
        }

        const resultadoHTML = `
          <b>Empresa:</b> ${data.empresa}<br>
          ${data.razonesEvaluacion?.length ? `
            <h6>Razones:</h6>
            <ul>
                ${data.razonesEvaluacion.map(r => `<li>${r}</li>`).join('')}
            </ul>
          ` : ''}
          <b>Identificador anónimo:</b> ${identificador}<br>
          <small>Guarde este identificador para futuras referencias.</small>
          ${recomendacion}
        `;

        mostrarResultadoEnModal(resultadoHTML);
    }

    function showAlert(type, message) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        const container = document.querySelector('.container');
        container.prepend(alertDiv);
        
        setTimeout(() => {
            alertDiv.classList.remove('show');
            setTimeout(() => alertDiv.remove(), 150);
        }, 5000);
    }

    function resetForm() {
        form.reset();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        document.querySelectorAll('.question-group:not(:first-child)').forEach(section => {
            section.style.display = 'none';
        });
    }

    function mostrarResultadoEnModal(htmlResultado) {
        document.getElementById('resultadoMensaje').innerHTML = htmlResultado;
        const modal = new bootstrap.Modal(document.getElementById('resultadoModal'));
        modal.show();

        document.getElementById('aceptarResultadoBtn').onclick = function() {
            window.location.href = '../index.html'; // Ajusta la ruta si es necesario
        };
    }

    // Inicialmente ocultar secciones adicionales
    document.querySelectorAll('.question-group:not(:first-child)').forEach(section => {
        section.style.display = 'none';
    });
});