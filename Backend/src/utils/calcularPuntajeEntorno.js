/**
 * Calcula puntajes de riesgo psicosocial basado en respuestas a 72 preguntas.
 * @param {Object} preguntas - Objeto con las respuestas (pregunta1: "Siempre", ...)
 * @param {boolean} [esJefe=false] - Indica si el encuestado es jefe
 * @param {boolean} [servicioClientes=false] - Indica si atiende clientes
 * @returns {Object} - { puntajeTotal, puntajesPorCategoria, puntajesPorDominio, puntajesPorDimension }
 */
const calcularPuntaje = (preguntas, esJefe = false, servicioClientes = false) => {
    // Configuración de grupos
    const GRUPO_1 = new Set([1, 4, 23, 24, 25, 26, 27, 28, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 55, 56, 57]);
    const GRUPO_2 = new Set([2, 3, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 29, 54, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72]);
  
    const VALORES_RESPUESTA = {
      GRUPO_1: { "Siempre": 0, "Casi siempre": 1, "Algunas veces": 2, "Casi nunca": 3, "Nunca": 4 },
      GRUPO_2: { "Siempre": 4, "Casi siempre": 3, "Algunas veces": 2, "Casi nunca": 1, "Nunca": 0 }
    };
  
    // Estructura jerárquica completa basada en la tabla
    const ESTRUCTURA = {
      "Ambiente de trabajo": {
        "Condiciones en el ambiente de trabajo": {
          "Condiciones peligrosas e inseguras": [1, 3],
          "Condiciones deficientes e insalubres": [2, 4]
        },
        "Trabajos peligrosos": {
          "Trabajos peligrosos": [5]
        }
      },
      "Factores propios de la actividad": {
        "Carga de trabajo": {
          "Cargas cuantitativas": [6, 12],
          "Ritmos de trabajo acelerado": [7, 8],
          "Carga mental": [9, 10, 11],
          "Cargas psicológicas emocionales": [65, 66, 67, 68],
          "Cargas de alta responsabilidad": [13, 14],
          "Cargas contradictorias o inconsistentes": [15, 16]
        },
        "Falta de control sobre el trabajo": {
          "Falta de control y autonomía sobre el trabajo": [25, 26, 27, 28],
          "Limitada o nula posibilidad de desarrollo": [23, 24],
          "Insuficiente participación y manejo del cambio": [29, 30],
          "Limitada o inexistente capacitación": [35, 38]
        }
      },
      "Organización del tiempo de trabajo": {
        "Jornada de trabajo": {
          "Jornadas de trabajo extensas": [17, 18]
        },
        "Interferencia en la relación trabajo-familia": {
          "Influencia del trabajo fuera del centro laboral": [19, 20],
          "Influencia de las responsabilidades familiares": [21, 22]
        }
      },
      "Liderazgo y relaciones en el trabajo": {
        "Liderazgo": {
          "Escaza claridad de funciones": [31, 32, 33, 34],
          "Características del liderazgo": [37, 38, 39, 40, 41]
        },
        "Relaciones en el trabajo": {
          "Relaciones sociales en el trabajo": [42, 43, 44, 45, 46],
          "Deficiente relación con los colaboradores que supervisa": [69, 70, 71, 72]
        },
        "Violencia": {
          "Violencia laboral": [57, 58, 59, 60, 61, 62, 63, 64]
        }
      },
      "Entorno organizacional": {
        "Reconocimiento del desempeño": {
          "Escasa o nula retroalimentación del desempeño": [47, 48],
          "Escaso o nulo reconocimiento y compensación": [49, 50, 51, 52]
        },
        "Insuficiente sentido de pertenencia e inestabilidad": {
          "Limitado sentido de pertenencia": [55, 56],
          "Inestabilidad laboral": [53, 54]
        }
      }
    };
  
    // Inicialización de resultados
    let puntajeTotal = 0;
    const puntajesPorCategoria = {};
    const puntajesPorDominio = {};
    const puntajesPorDimension = {};
  
    // Inicializar estructuras con ceros
    Object.keys(ESTRUCTURA).forEach(categoria => {
      puntajesPorCategoria[categoria] = 0;
      
      Object.keys(ESTRUCTURA[categoria]).forEach(dominio => {
        puntajesPorDominio[dominio] = 0;
        
        Object.keys(ESTRUCTURA[categoria][dominio]).forEach(dimension => {
          puntajesPorDimension[dimension] = 0;
        });
      });
    });
  
    // Procesar cada pregunta
    for (let i = 1; i <= 72; i++) {
      const respuesta = preguntas[`pregunta${i}`];
  
      // Validar si la pregunta debe procesarse
      if (i >= 65 && i <= 68) {
        // Preguntas 65-68: Solo si atiende clientes
        if (!servicioClientes) continue;
      } else if (i >= 69 && i <= 72) {
        // Preguntas 69-72: Solo si es jefe
        if (!esJefe) continue;
      }
      // Preguntas 1-64: Siempre se procesan
  
      // Validar respuesta existente (para preguntas que deben procesarse)
      if (respuesta === undefined || respuesta === null) {
        throw new Error(`Pregunta ${i} no tiene respuesta pero es requerida`);
      }
  
      // Determinar valor según grupo
      let valor = 0;
      if (GRUPO_1.has(i)) {
        valor = VALORES_RESPUESTA.GRUPO_1[respuesta] ?? 0;
      } else if (GRUPO_2.has(i)) {
        valor = VALORES_RESPUESTA.GRUPO_2[respuesta] ?? 0;
      }
  
      // Acumular puntajes en todas las jerarquías
      for (const [categoria, dominios] of Object.entries(ESTRUCTURA)) {
        for (const [dominio, dimensiones] of Object.entries(dominios)) {
          for (const [dimension, items] of Object.entries(dimensiones)) {
            if (items.includes(i)) {
              puntajeTotal += valor;
              puntajesPorCategoria[categoria] += valor;
              puntajesPorDominio[dominio] += valor;
              puntajesPorDimension[dimension] += valor;
            }
          }
        }
      }
    }
  
    return {
      puntajeTotal,
      puntajesPorCategoria,
      puntajesPorDominio,
      puntajesPorDimension
    };
  };
  
  module.exports = calcularPuntaje;