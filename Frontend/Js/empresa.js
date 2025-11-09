document.addEventListener('DOMContentLoaded', function() {
    // URL base de la API (ajustar según sea necesario)
    const API_BASE_URL = 'http://localhost:3000/api/empresas';
    let isSubmitting = false;

    // Función para mostrar mensajes en el modal
    function mostrarMensaje(titulo, mensaje, esExito = true, callback = null) {
        const modalElement = document.getElementById('mensajeModal');
        if (!modalElement) {
            console.error('Modal no encontrado en el DOM');
            alert(`${titulo}\n\n${mensaje}`);
            if (callback) callback();
            return;
        }

        const modalTitulo = document.getElementById('modalTitulo');
        const modalMensaje = document.getElementById('modalMensaje');
        const modal = new bootstrap.Modal(modalElement);
        const btnAceptar = document.getElementById('modalAceptar');
        
        if (!modalTitulo || !modalMensaje || !btnAceptar) {
            console.error('Elementos del modal no encontrados');
            alert(`${titulo}\n\n${mensaje}`);
            if (callback) callback();
            return;
        }

        // Configurar estilo según si es éxito o error
        modalTitulo.className = esExito ? 'modal-title text-success' : 'modal-title text-danger';
        modalTitulo.textContent = titulo;
        modalMensaje.innerHTML = mensaje;
        
        // Configurar el evento del botón Aceptar
        const handler = () => {
            if (callback) callback();
            btnAceptar.removeEventListener('click', handler);

            // Redirigir al index.html si es un mensaje de éxito
            if (esExito) {
                window.location.href = '../index.html';
            }
        };
        
        // Limpiar eventos previos y agregar el nuevo
        btnAceptar.replaceWith(btnAceptar.cloneNode(true));
        document.getElementById('modalAceptar').addEventListener('click', handler);
        
        modal.show();
    }

    // Función para calcular muestra representativa (solo para formulario 3)
    function calcularMuestraRepresentativa(N) {
        const constante1 = 0.9604;
        const constante2 = 0.0025;
        const numerador = constante1 * N;
        const denominador = (constante2 * (N - 1)) + constante1;
        const n = numerador / denominador;
        return Math.round(n);
    }

    // Función para determinar a qué formulario redirigir
    function determinarFormularioRedireccion(cantidadEmpleados) {
        if (cantidadEmpleados >= 1 && cantidadEmpleados <= 50) {
            return {
                url: '../Formularios/psicosocial-trabajo.html',
                requiereMuestra: false,
                descripcion: 'Formulario básico para empresas pequeñas (1-50 empleados)'
            };
        } else if (cantidadEmpleados >= 51) {
            return {
                url: '../Formularios/psicosocial-entorno.html',
                requiereMuestra: true,
                descripcion: 'Formulario completo con muestra representativa (51+ empleados)'
            };
        } else {
            return null;
        }
    }

    // Función para construir el mensaje de éxito
    function construirMensajeExito(nombreEmpresa, cantidadEmpleados, clave, formularioInfo, muestraRepresentativa = null) {
        let mensajeHTML = `
        <div class="mb-4">
            <div class="text-center mb-3">
                <i class="fas fa-check-circle text-success" style="font-size: 3rem;"></i>
                <h4 class="mt-2 mb-3 fw-bold">Registro Exitoso</h4>
            </div>
            
            <div class="card border-success mb-3">
                <div class="card-header bg-success text-white">
                    <i class="fas fa-building me-2"></i>Detalles de la Empresa
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-6 mb-2">
                            <div class="d-flex align-items-center">
                                <i class="fas fa-signature text-primary me-2"></i>
                                <div>
                                    <small class="text-muted">Nombre</small>
                                    <div class="fw-bold">${nombreEmpresa}</div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="col-md-6 mb-2">
                            <div class="d-flex align-items-center">
                                <i class="fas fa-users text-primary me-2"></i>
                                <div>
                                    <small class="text-muted">Total Empleados</small>
                                    <div class="fw-bold">${cantidadEmpleados}</div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="col-md-6 mb-2">
                            <div class="d-flex align-items-center">
                                <i class="fas fa-file-alt text-primary me-2"></i>
                                <div>
                                    <small class="text-muted">Tipo de Formulario</small>
                                    <div class="fw-bold">${formularioInfo.descripcion}</div>
                                </div>
                            </div>
                        </div>`;
        
        if (formularioInfo.requiereMuestra) {
            mensajeHTML += `
                        <div class="col-md-6 mb-2">
                            <div class="d-flex align-items-center">
                                <i class="fas fa-chart-pie text-primary me-2"></i>
                                <div>
                                    <small class="text-muted">Muestra Representativa</small>
                                    <div class="fw-bold">${muestraRepresentativa} empleados</div>
                                </div>
                            </div>
                        </div>`;
        }
        
        mensajeHTML += `
                        <div class="col-md-6 mb-2">
                            <div class="d-flex align-items-center">
                                <i class="fas fa-key text-primary me-2"></i>
                                <div>
                                    <small class="text-muted">Clave Asignada</small>
                                    <div class="fw-bold"><code class="bg-light p-1 rounded">${clave}</code></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
        
        return mensajeHTML;
    }

    // Manejador del formulario
    const empresaForm = document.getElementById('empresaForm');
    if (empresaForm) {
        empresaForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (isSubmitting) return;
            isSubmitting = true;

            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Procesando...';
            submitBtn.disabled = true;

            const nombreEmpresa = document.getElementById('nombre-empresa').value;
            const cantidadEmpleados = parseInt(document.getElementById('cantidad-empleados').value || 0);
            const clave = document.getElementById('clave').value;

            // Validaciones básicas
            if (!nombreEmpresa || !clave || cantidadEmpleados <= 0) {
                mostrarMensaje(
                    'Datos incompletos',
                    'Por favor complete todos los campos correctamente:\n\n- Nombre de empresa\n- Cantidad de empleados (mayor a 0)\n- Clave de acceso',
                    false
                );
                resetSubmitButton();
                return;
            }

            // Determinar formulario de destino
            const formularioInfo = determinarFormularioRedireccion(cantidadEmpleados);
            if (!formularioInfo) {
                mostrarMensaje(
                    'Cantidad no válida',
                    'La cantidad de empleados debe ser mayor a 0',
                    false
                );
                resetSubmitButton();
                return;
            }

            // Preparar datos para enviar
            const requestData = {
                nombreEmpresa: nombreEmpresa,
                cantidadEmpleados: cantidadEmpleados,
                clave: clave,
                tipoFormulario: formularioInfo.requiereMuestra ? 'completo' : 'basico'
            };

            // Solo calcular y agregar muestra si es necesario
            let muestraRepresentativa = null;
            if (formularioInfo.requiereMuestra) {
                muestraRepresentativa = calcularMuestraRepresentativa(cantidadEmpleados);
                requestData.muestraRepresentativa = muestraRepresentativa;
            }

            // Enviar datos al backend
            fetch(API_BASE_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(requestData)
            })
            .then(async response => {
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.message || 'Error al registrar la empresa');
                }
                
                return data;
            })
            .then(data => {
                // Guardar datos en localStorage
                localStorage.setItem('empresaId', data._id || data.id);
                localStorage.setItem('empresaNombre', nombreEmpresa);
                localStorage.setItem('empresaClave', clave);
                localStorage.setItem('tipoFormulario', requestData.tipoFormulario);
                
                if (formularioInfo.requiereMuestra) {
                    localStorage.setItem('muestraRepresentativa', muestraRepresentativa);
                }
                
                // Mostrar mensaje de éxito
                const mensajeHTML = construirMensajeExito(
                    nombreEmpresa, 
                    cantidadEmpleados, 
                    clave, 
                    formularioInfo, 
                    muestraRepresentativa
                );
                
                mostrarMensaje(
                    'Registro exitoso', 
                    mensajeHTML,
                    true,
                    () => {
                        // Eliminamos la redirección al formulario
                        console.log('Registro completado. No se redirige a ningún formulario.');
                    }
                );
            })
            .catch((error) => {
                console.error('Error:', error);
                mostrarMensaje(
                    'Error en el registro',
                    `<div class="alert alert-danger">
                        <i class="fas fa-exclamation-triangle me-2"></i>
                        ${error.message || 'Ocurrió un error al registrar la empresa.'}
                    </div>
                    <p class="mb-0">Por favor intente nuevamente.</p>`,
                    false
                );
            })
            .finally(() => {
                resetSubmitButton();
            });

            function resetSubmitButton() {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                isSubmitting = false;
            }
        });
    } else {
        console.error('Formulario no encontrado');
    }
});