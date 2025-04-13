document.addEventListener('DOMContentLoaded', function() {
  // Variables globales
  let currentTab = 0;
  const tabs = document.querySelectorAll('.tab-pane');
  const tabButtons = document.querySelectorAll('[data-bs-toggle="tab"]');
  const prevBtn = document.getElementById('prevTab');
  const nextBtn = document.getElementById('nextTab');
  const submitContainer = document.getElementById('submitContainer');
  const loginForm = document.getElementById('loginForm');
  const loginSection = document.getElementById('loginSection');
  const cuestionarioSection = document.getElementById('cuestionarioSection');
  const cuestionarioForm = document.getElementById('cuestionarioForm');
  const servicioClientes = document.getElementById('servicioClientes');
  const preguntasClientes = document.getElementById('preguntasClientes');
  const esJefe = document.getElementById('esJefe');
  const preguntasJefe = document.getElementById('preguntasJefe');
  const contador = document.getElementById('contador');
  const mensajeModal = new bootstrap.Modal(document.getElementById('mensajeModal'));
  let isSubmitting = false;

  // URLs de la API
  const API_URL = 'http://localhost:3000/api';
  const VERIFY_URL = `${API_URL}/empresas/verify-clave`;
  const RESPUESTAS_URL = `${API_URL}/respuestas`;

  // Inicialización
  showTab(currentTab);
  updateProgress();
  checkEmpresaId();
  initializeConditionalQuestions();

  // Event listeners
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }
  
  if (cuestionarioForm) {
    cuestionarioForm.addEventListener('submit', handleSubmit);
  }
  
  if (prevBtn) {
    prevBtn.addEventListener('click', prevTab);
  }
  
  if (nextBtn) {
    nextBtn.addEventListener('click', nextTab);
  }

  // Permitir navegación por teclado
  document.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowLeft' && currentTab > 0) {
      prevTab();
    } else if (e.key === 'ArrowRight' && currentTab < tabs.length - 1) {
      nextTab();
    }
  });

  // Funciones principales
  function handleLogin(e) {
    e.preventDefault();
    
    if (isSubmitting) return;
    isSubmitting = true;
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Verificando...';

    const nombreEmpresa = document.getElementById('nombre-empresa').value;
    const clave = document.getElementById('clave').value;

    fetch(VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombreEmpresa, clave })
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        showMessage('Éxito', 'Credenciales válidas. Cargando formulario...', 'success');
        
        // Guardar datos y preparar formulario
        localStorage.setItem('empresaId', data.empresaId);
        localStorage.setItem('empresaNombre', nombreEmpresa);
        
        setTimeout(() => {
          loginSection.style.display = 'none';
          cuestionarioSection.style.display = 'block';
          document.getElementById('empresaId').value = data.empresaId;
          updateCounterMessage(data.contador, nombreEmpresa, data.empresaId);
        }, 1500);
      } else {
        showMessage('Error', data.message || 'Clave incorrecta', 'error');
        document.getElementById('clave').value = '';
        document.getElementById('clave').focus();
      }
    })
    .catch(error => {
      console.error('Error:', error);
      showMessage('Error', error.message || 'Error al verificar credenciales', 'error');
    })
    .finally(() => {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
      isSubmitting = false;
    });
  }

  function handleSubmit(e) {
    e.preventDefault();
    
    if (isSubmitting) return;
    isSubmitting = true;
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Enviando...';

    try {
      // Validar todas las preguntas obligatorias
      const requiredQuestions = document.querySelectorAll('[required]');
      let isValid = true;
      
      requiredQuestions.forEach(question => {
        if (!question.value) {
          isValid = false;
          question.classList.add('is-invalid');
        } else {
          question.classList.remove('is-invalid');
        }
      });
      
      if (!isValid) {
        showMessage('Error', 'Por favor responde todas las preguntas obligatorias.', 'error');
        return;
      }

      // Validar preguntas condicionales
      if (servicioClientes.value === '') {
        showMessage('Error', 'Por favor indique si atiende clientes o usuarios', 'error');
        return;
      }

      if (esJefe.value === '') {
        showMessage('Error', 'Por favor indique si es jefe de otros trabajadores', 'error');
        return;
      }

      // Recolectar datos del formulario
      const formData = new FormData(cuestionarioForm);
      const data = {
        empresaId: formData.get('empresaId'),
        servicioClientes: servicioClientes.value === 'Sí',
        esJefe: esJefe.value === 'Sí',
        preguntas: {},
        timestamp: new Date().toISOString()
      };

      // Agregar todas las respuestas
      for (let i = 1; i <= 72; i++) {
        const respuesta = formData.get(`pregunta${i}`);
        if (respuesta) {
          data.preguntas[`pregunta${i}`] = respuesta;
        }
      }

      // Enviar datos al backend
      fetch(RESPUESTAS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      .then(response => response.json())
      .then(result => {
        if (result.success) {
          showMessage('Éxito', 'Formulario enviado correctamente. Redirigiendo...', 'success');
          setTimeout(() => {
            window.location.href = `resultados.html?empresaId=${data.empresaId}`;
          }, 2000);
        } else {
          throw new Error(result.message || 'Error al enviar respuestas');
        }
      })
      .catch(error => {
        console.error('Error:', error);
        showMessage('Error', error.message || 'Error al enviar el formulario', 'error');
      })
      .finally(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
        isSubmitting = false;
      });

    } catch (error) {
      console.error('Error:', error);
      showMessage('Error', error.message || 'Error al procesar el formulario', 'error');
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
      isSubmitting = false;
    }
  }

  // Funciones de navegación por pestañas
  function showTab(index) {
    // Ocultar todas las pestañas
    tabs.forEach(tab => {
      tab.classList.remove('active', 'show');
    });
    
    // Desactivar todos los botones de pestaña
    tabButtons.forEach(button => {
      button.classList.remove('active');
    });
    
    // Mostrar la pestaña actual
    tabs[index].classList.add('active', 'show');
    tabButtons[index].classList.add('active');
    
    // Actualizar botones de navegación
    prevBtn.style.display = index === 0 ? 'none' : 'block';
    nextBtn.style.display = index === tabs.length - 1 ? 'none' : 'block';
    submitContainer.classList.toggle('d-none', index !== tabs.length - 1);
    
    // Actualizar progreso
    updateProgress();
    
    // Desplazar a la parte superior
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function nextTab() {
    // Validar preguntas en la pestaña actual antes de avanzar
    const currentTabQuestions = tabs[currentTab].querySelectorAll('[required]');
    let isValid = true;
    
    currentTabQuestions.forEach(question => {
      if (!question.value) {
        isValid = false;
        question.classList.add('is-invalid');
      } else {
        question.classList.remove('is-invalid');
      }
    });
    
    if (!isValid) {
      showMessage('Error', 'Por favor responde todas las preguntas obligatorias antes de continuar.', 'error');
      return;
    }
    
    if (currentTab < tabs.length - 1) {
      currentTab++;
      showTab(currentTab);
    }
  }

  function prevTab() {
    if (currentTab > 0) {
      currentTab--;
      showTab(currentTab);
    }
  }

  // Funciones auxiliares
  function updateProgress() {
    const progress = Math.round(((currentTab + 1) / tabs.length) * 100);
    contador.textContent = `Progreso: ${progress}%`;
  }

  function showMessage(title, message, type = 'info') {
    const modalTitle = document.getElementById('modalTitulo');
    const modalBody = document.getElementById('modalMensaje');
    
    modalTitle.textContent = title;
    modalBody.textContent = message;
    
    // Cambiar color según el tipo de mensaje
    modalTitle.className = 'modal-title';
    if (type === 'success') {
      modalTitle.classList.add('text-success');
    } else if (type === 'error') {
      modalTitle.classList.add('text-danger');
    } else {
      modalTitle.classList.add('text-primary');
    }
    
    mensajeModal.show();
  }



  function checkEmpresaId() {
    const empresaId = new URLSearchParams(window.location.search).get('empresaId') || localStorage.getItem('empresaId');
    
    if (!empresaId && !window.location.pathname.includes('index.html')) {
      showMessage('Error', 'No se encontró el identificador de la empresa. Será redirigido al inicio.', 'error');
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 2000);
      return;
    }
    
    if (document.getElementById('empresaId')) {
      document.getElementById('empresaId').value = empresaId;
    }
  }

  function initializeConditionalQuestions() {
    // Configurar eventos para preguntas condicionales
    if (servicioClientes) {
      servicioClientes.addEventListener('change', function() {
        const show = this.value === 'Sí';
        preguntasClientes.style.display = show ? 'block' : 'none';
        
        // Actualizar atributo required
        const clientQuestions = preguntasClientes.querySelectorAll('select');
        clientQuestions.forEach(question => {
          question.required = show;
          if (!show) question.value = '';
        });
      });
    }

    if (esJefe) {
      esJefe.addEventListener('change', function() {
        const show = this.value === 'Sí';
        preguntasJefe.style.display = show ? 'block' : 'none';
        
        // Actualizar atributo required
        const bossQuestions = preguntasJefe.querySelectorAll('select');
        bossQuestions.forEach(question => {
          question.required = show;
          if (!show) question.value = '';
        });
      });
    }
  }

  // Verificar si hay datos guardados al cargar
 // const savedEmpresaId = localStorage.getItem('empresaId');
// if (savedEmpresaId && cuestionarioSection) {
//   loginSection.style.display = 'none';
//   cuestionarioSection.style.display = 'block';
//   document.getElementById('empresaId').value = savedEmpresaId;
// }

});