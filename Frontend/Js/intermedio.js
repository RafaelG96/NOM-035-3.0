async function validarAcceso() {
    const empresa = document.getElementById('empresaNombre').value.trim();
    const clave = document.getElementById('claveAcceso').value.trim();
    
    // Limpiar errores previos
    mostrarError('');
    
    if (!empresa || !clave) {
        mostrarError('Por favor complete todos los campos');
        return;
    }
    
    try {
        // Mostrar spinner de carga
        const btnIngresar = document.querySelector('#empleadoModal .btn-primary');
        btnIngresar.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Validando...';
        btnIngresar.disabled = true;
        
        const response = await fetch('http://localhost:3000/api/empleados/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nombreEmpresa: empresa,
                claveAcceso: clave
            })
        });
        
        // Manejar errores HTTP
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error en la autenticación');
        }
        
        const data = await response.json();
        
        if (data.success) {
            // Guardar datos en localStorage
            localStorage.setItem('empresaId', data.empresa.id); // Asegúrate de que el servidor envíe el ID de la empresa
            localStorage.setItem('empresaNombre', data.empresa.nombre);
            localStorage.setItem('tipoFormulario', data.empresa.tipoFormulario);

            // Redirigir al formulario correspondiente
            let formularioRedireccion = '';
            if (data.empresa.tipoFormulario === 'basico') {
                formularioRedireccion = '../Formularios/psicosocial-trabajo.html';
            } else if (data.empresa.tipoFormulario === 'completo') {
                formularioRedireccion = '../Formularios/psicosocial-entorno.html';
            }

            window.location.href = formularioRedireccion;
        } else {
            throw new Error(data.error || 'Credenciales inválidas');
        }
        
    } catch (error) {
        mostrarError(error.message);
    } finally {
        // Restaurar botón
        const btnIngresar = document.querySelector('#empleadoModal .btn-primary');
        btnIngresar.innerHTML = 'Ingresar';
        btnIngresar.disabled = false;
    }
}

function mostrarError(mensaje) {
    // Buscar o crear el contenedor de errores
    let errorContainer = document.getElementById('error-container');
    
    if (!errorContainer) {
        // Crear el contenedor si no existe
        errorContainer = document.createElement('div');
        errorContainer.id = 'error-container';
        errorContainer.className = 'alert alert-danger mt-3';
        errorContainer.style.display = 'block';
        
        // Insertarlo en el modal
        const modalBody = document.querySelector('#empleadoModal .modal-body');
        modalBody.insertBefore(errorContainer, modalBody.firstChild);
    }
    
    // Mostrar el mensaje de error
    errorContainer.textContent = mensaje;
    errorContainer.style.display = 'block';
    
    // Ocultar el error después de 5 segundos
    setTimeout(() => {
        errorContainer.style.display = 'none';
    }, 5000);
}