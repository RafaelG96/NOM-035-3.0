// Utilidad para depuración
export const debugAPI = {
  testConnection: async () => {
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    console.log('🔍 Probando conexión con el backend...');
    console.log('📍 URL base:', API_BASE_URL);
    
    try {
      const response = await fetch(`${API_BASE_URL.replace('/api', '')}/api/health`);
      const data = await response.json();
      console.log('✅ Backend responde:', data);
      return { success: true, data };
    } catch (error) {
      console.error('❌ Error al conectar con el backend:', error);
      return { success: false, error: error.message };
    }
  },
  
  testCORS: async () => {
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    console.log('🔍 Probando CORS...');
    
    try {
      const response = await fetch(`${API_BASE_URL}/empresas`, {
        method: 'OPTIONS',
        headers: {
          'Origin': window.location.origin,
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type'
        }
      });
      console.log('✅ CORS headers:', {
        status: response.status,
        headers: Object.fromEntries(response.headers.entries())
      });
      return { success: true, response };
    } catch (error) {
      console.error('❌ Error en CORS:', error);
      return { success: false, error: error.message };
    }
  }
};

// Auto-ejecutar en desarrollo
if (import.meta.env.DEV) {
  console.log('🐛 Modo de depuración activado');
  console.log('📋 Variables de entorno:', {
    VITE_API_URL: import.meta.env.VITE_API_URL,
    MODE: import.meta.env.MODE,
    DEV: import.meta.env.DEV
  });
  
  // Hacer disponible en la consola del navegador
  window.debugAPI = debugAPI;
  console.log('💡 Usa window.debugAPI.testConnection() para probar la conexión');
  console.log('💡 Usa window.debugAPI.testCORS() para probar CORS');
}

