import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para manejar errores con mejor logging
api.interceptors.response.use(
  (response) => {
    console.log('Respuesta exitosa:', response.config.method.toUpperCase(), response.config.url);
    return response;
  },
  (error) => {
    console.error('Error en la petición:', {
      url: error.config?.url,
      method: error.config?.method,
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      request: error.request ? 'Petición enviada pero sin respuesta' : null
    });

    if (error.response) {
      // El servidor respondió con un código de error
      const errorMessage = error.response.data?.message || error.response.data?.error || 'Error en el servidor';
      return Promise.reject({ 
        message: errorMessage,
        status: error.response.status,
        data: error.response.data
      });
    } else if (error.request) {
      // La petición se hizo pero no se recibió respuesta
      console.error('Error: No hay respuesta del servidor:', {
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        method: error.config?.method,
        request: error.request
      });
      console.error('Verifica que el backend esté corriendo en:', API_BASE_URL);
      return Promise.reject({ 
        message: 'No se pudo conectar con el servidor. Verifica que el backend esté corriendo.',
        details: `El servidor no respondió. URL intentada: ${API_BASE_URL}${error.config?.url || ''}`,
        status: 'NETWORK_ERROR'
      });
    } else {
      // Algo más causó el error
      return Promise.reject({ 
        message: error.message || 'Error desconocido',
        details: 'Error al configurar la petición'
      });
    }
  }
);

// Interceptor para requests (logging)
api.interceptors.request.use(
  (config) => {
    console.log('Enviando petición:', {
      method: config.method.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
      headers: Object.keys(config.headers || {})
    });
    return config;
  },
  (error) => {
    console.error('Error al configurar la petición:', error);
    return Promise.reject(error);
  }
);

// API de Empresas
export const empresaAPI = {
  create: (data) => api.post('/empresas', data),
  verifyClave: (data) => api.post('/empresas/verify-clave', data),
  verifyAccesoResultados: (data) => api.post('/empresas/verify-acceso-resultados', data),
  getById: (id) => api.get(`/empresas/${id}`),
  getConFormularioCompleto: () => api.get('/empresas/con-formulario-completo'),
  getConFormularioBasico: () => api.get('/empresas/con-formulario-basico'),
};

// API de Empleados
export const empleadoAPI = {
  verify: (data) => api.post('/empleados/verify', data),
  create: (data) => api.post('/empleados', data),
};

// API de Respuestas Psicosociales
export const psicosocialAPI = {
  entorno: (data) => api.post('/psicosocial/entorno', data),
  trabajo: (data) => api.post('/psicosocial/trabajo', data),
  getResultadosEntorno: (empresaId, credenciales) => {
    if (!credenciales || !credenciales.nombreEmpresa || !credenciales.codigoAccesoResultados) {
      console.error('Error: Credenciales faltantes para getResultadosEntorno');
      return Promise.reject(new Error('Credenciales de autenticación requeridas'));
    }
    
    const config = {
      headers: {
        'x-empresa-nombre': credenciales.nombreEmpresa,
        'x-codigo-acceso': credenciales.codigoAccesoResultados
      }
    };
    console.log('Enviando petición con credenciales:', {
      empresaId,
      nombreEmpresa: credenciales.nombreEmpresa,
      tieneCodigo: !!credenciales.codigoAccesoResultados
    });
    return api.get(`/psicosocial/entorno/empresa/${empresaId}`, config);
  },
  getResultadosTrabajo: (empresaId, credenciales) => {
    if (!credenciales || !credenciales.nombreEmpresa || !credenciales.codigoAccesoResultados) {
      console.error('Error: Credenciales faltantes para getResultadosTrabajo');
      return Promise.reject(new Error('Credenciales de autenticación requeridas'));
    }
    
    const config = {
      headers: {
        'x-empresa-nombre': credenciales.nombreEmpresa,
        'x-codigo-acceso': credenciales.codigoAccesoResultados
      }
    };
    console.log('Enviando petición con credenciales:', {
      empresaId,
      nombreEmpresa: credenciales.nombreEmpresa,
      tieneCodigo: !!credenciales.codigoAccesoResultados
    });
    return api.get(`/psicosocial/trabajo/empresa/${empresaId}`, config);
  },
};

// API de Eventos Traumáticos
export const traumaAPI = {
  create: (data) => api.post('/trauma', data),
  getResultados: (empresaNombre) => {
    if (empresaNombre) {
      return api.get(`/trauma`, { params: { empresa: empresaNombre } })
    } else {
      return api.get(`/trauma`)
    }
  },
  getEmpresas: () => api.get('/trauma/empresas'),
};

export default api;

