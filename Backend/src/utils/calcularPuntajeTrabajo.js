/**
 * Calcula puntajes de riesgo psicosocial basado en respuestas a 46 preguntas.
 * @param {Object} respuestas - Objeto con las respuestas (pregunta1: "Siempre", ...)
 * @param {boolean} [esJefe=false] - Indica si el encuestado es jefe
 * @param {boolean} [servicioClientes=false] - Indica si atiende clientes
 * @returns {Object} - { puntajeTotal, nivelRiesgo, categorias, dominios, dimensiones, recomendaciones }
 */
const calcularPuntajePsicosocialTrabajo = (respuestas, esJefe = false, servicioClientes = false) => {
    // Configuración de grupos según Tabla 2
    const GRUPO_1 = new Set([18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33]);
    const GRUPO_2 = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46]);

    const VALORES_RESPUESTA = {
        "Siempre": 0,
        "Casi siempre": 1,
        "Algunas veces": 2,
        "Casi nunca": 3,
        "Nunca": 4
    };

    // Estructura jerárquica basada en las tablas proporcionadas por el documento NOM_035-STPS-2018
    const ESTRUCTURA = {
        "Ambiente de trabajo": {
            "Condiciones en el ambiente de work": {
                "Condiciones peligrosas e inseguras": [2],
                "Condiciones deficientes e insalubres": [1],
                "Trabajos peligrosos": [3]
            }
        },
        "Factores propios de la actividad": {
            "Carga de trabajo": {
                "Cargas cuantitativas": [4, 9],
                "Ritmos de trabajo acelerado": [5, 6],
                "Carga mental": [7, 8],
                "Cargas psicológicas emocionales": [41, 42, 43]
            },
            "Cargas de alta responsabilidad": {
                "Cargas de alta responsabilidad": [10, 11]
            },
            "Cargas contradictorias o inconsistentes": {
                "Cargas contradictorias o inconsistentes": [12, 13]
            }
        },
        "Falta de control sobre el trabajo": {
            "Falta de control y autonomía sobre el trabajo": [20, 21, 22],
            "Limitada o nula posibilidad de desarrollo": [18, 19],
            "Limitada o inexistente capacitación": [26, 27]
        },
        "Organización del tiempo de trabajo": {
            "Jornada de trabajo": [14, 15],
            "Interferencia en la relación trabajo-familia": [16, 17]
        },
        "Liderazgo y relaciones en el trabajo": {
            "Liderazgo": [28, 29, 30],
            "Relaciones en el trabajo": [31, 32, 33],
            "Violencia laboral": [34, 35, 36, 37, 38, 39, 40]
        }
    };

    // Inicialización de resultados
    let puntajeTotal = 0;
    const categorias = {};
    const dominios = {};
    const dimensiones = {};

    // Inicializar estructuras con ceros
    Object.keys(ESTRUCTURA).forEach(categoria => {
        categorias[categoria] = { puntaje: 0, nivel: '' };
        
        Object.keys(ESTRUCTURA[categoria]).forEach(dominio => {
            dominios[dominio] = { puntaje: 0, nivel: '' };
            
            if (Array.isArray(ESTRUCTURA[categoria][dominio])) {
                dimensiones[dominio] = { puntaje: 0, nivel: '' };
            } else {
                Object.keys(ESTRUCTURA[categoria][dominio]).forEach(dimension => {
                    dimensiones[dimension] = { puntaje: 0, nivel: '' };
                });
            }
        });
    });

    // Validar respuestas obligatorias (1-40)
    const preguntasObligatorias = Array.from({length: 40}, (_, i) => i+1);
    const faltantes = preguntasObligatorias.filter(p => 
        !respuestas.hasOwnProperty(`pregunta${p}`) && 
        !(p >= 41 && p <= 43 && !servicioClientes) &&
        !(p >= 44 && p <= 46 && !esJefe)
    );

    if (faltantes.length > 0) {
        throw new Error(`Faltan respuestas obligatorias: ${faltantes.join(', ')}`);
    }

    // Procesar cada pregunta
    for (let i = 1; i <= 46; i++) {
        // Saltar preguntas condicionales si no aplican
        if ((i >= 41 && i <= 43) && !servicioClientes) continue;
        if ((i >= 44 && i <= 46) && !esJefe) continue;

        const respuesta = respuestas[`pregunta${i}`];
        if (respuesta === undefined || respuesta === null) continue;

        // Determinar valor según grupo (corregido)
        let valor = 0;
        if (GRUPO_1.has(i)) {
            valor = VALORES_RESPUESTA[respuesta] ?? 0;
        } else if (GRUPO_2.has(i)) {
            valor = 4 - (VALORES_RESPUESTA[respuesta] ?? 0); // Invertir escala
        }

        // Acumular puntajes en todas las jerarquías
        for (const [categoria, dataDominio] of Object.entries(ESTRUCTURA)) {
            for (const [dominio, dataDimension] of Object.entries(dataDominio)) {
                if (Array.isArray(dataDimension)) {
                    if (dataDimension.includes(i)) {
                        puntajeTotal += valor;
                        categorias[categoria].puntaje += valor;
                        dominios[dominio].puntaje += valor;
                        dimensiones[dominio].puntaje += valor;
                    }
                } else {
                    for (const [dimension, items] of Object.entries(dataDimension)) {
                        if (items.includes(i)) {
                            puntajeTotal += valor;
                            categorias[categoria].puntaje += valor;
                            dominios[dominio].puntaje += valor;
                            dimensiones[dimension].puntaje += valor;
                        }
                    }
                }
            }
        }
    }

    // Función para determinar nivel de riesgo
    const determinarNivel = (puntaje, tipo) => {
        const umbrales = {
            'Ambiente de trabajo': [
                { max: 3, nivel: 'Nulo o despreciable' },
                { max: 5, nivel: 'Bajo' },
                { max: 7, nivel: 'Medio' },
                { max: 9, nivel: 'Alto' },
                { max: Infinity, nivel: 'Muy alto' }
            ],
            'Factores propios de la actividad': [
                { max: 10, nivel: 'Nulo o despreciable' },
                { max: 20, nivel: 'Bajo' },
                { max: 30, nivel: 'Medio' },
                { max: 40, nivel: 'Alto' },
                { max: Infinity, nivel: 'Muy alto' }
            ],
            'Organización del tiempo de trabajo': [
                { max: 4, nivel: 'Nulo o despreciable' },
                { max: 8, nivel: 'Bajo' },
                { max: 9, nivel: 'Medio' },
                { max: 12, nivel: 'Alto' },
                { max: Infinity, nivel: 'Muy alto' }
            ],
            'Liderazgo y relaciones en el trabajo': [
                { max: 10, nivel: 'Nulo o despreciable' },
                { max: 18, nivel: 'Bajo' },
                { max: 28, nivel: 'Medio' },
                { max: 38, nivel: 'Alto' },
                { max: Infinity, nivel: 'Muy alto' }
            ],
            'total': [
                { max: 20, nivel: 'Nulo o despreciable' },
                { max: 45, nivel: 'Bajo' },
                { max: 70, nivel: 'Medio' },
                { max: 80, nivel: 'Alto' },
                { max: Infinity, nivel: 'Muy alto' }
            ]
        };

        const escala = umbrales[tipo] || umbrales['total'];
        for (const umbral of escala) {
            if (puntaje < umbral.max) {
                return umbral.nivel;
            }
        }
        return 'Muy alto';
    };

    // Asignar niveles de riesgo
    const nivelRiesgoTotal = determinarNivel(puntajeTotal, 'total');
    
    // Asignar niveles a categorías, dominios y dimensiones
    Object.keys(categorias).forEach(cat => {
        categorias[cat].nivel = determinarNivel(categorias[cat].puntaje, cat);
    });
    
    Object.keys(dominios).forEach(dom => {
        const categoriaPadre = Object.keys(ESTRUCTURA).find(cat => 
            Object.keys(ESTRUCTURA[cat]).includes(dom)
        );
        dominios[dom].nivel = categoriaPadre ? determinarNivel(dominios[dom].puntaje, categoriaPadre) : 'Nulo o despreciable';
    });
    
    Object.keys(dimensiones).forEach(dim => {
        let categoriaPadre = '';
        for (const [cat, data] of Object.entries(ESTRUCTURA)) {
            for (const [dom, subdata] of Object.entries(data)) {
                if ((Array.isArray(subdata) && subdata.includes(dim)) || 
                    (typeof subdata === 'object' && Object.keys(subdata).includes(dim))) {
                    categoriaPadre = cat;
                    break;
                }
            }
            if (categoriaPadre) break;
        }
        dimensiones[dim].nivel = categoriaPadre ? determinarNivel(dimensiones[dim].puntaje, categoriaPadre) : 'Nulo o despreciable';
    });

    // Generar recomendaciones basadas en el nivel de riesgo
    const generarRecomendacion = (nivel) => {
        const recomendaciones = {
            'Muy alto': 'Se requiere realizar el análisis de cada categoría y dominio para establecer las acciones de intervención apropiadas, mediante un Programa de intervención que deberá incluir evaluaciones específicas, y contemplar campañas de sensibilización, revisar la política de prevención de riesgos psicosociales y programas para la prevención de los factores de riesgo psicosocial, la promoción de un entorno organizacional favorable y la prevención de la violencia laboral, así como reforzar su aplicación y difusión.',
            'Alto': 'Se requiere realizar un análisis de cada categoría y dominio, de manera que se puedan determinar las acciones de intervención apropiadas a través de un Programa de intervención, que podrá incluir una evaluación específica y deberá incluir una campaña de sensibilización, revisar la política de prevención de riesgos psicosociales y programas para la prevención de los factores de riesgo psicosocial, la promoción de un entorno organizacional favorable y la prevención de la violencia laboral, así como reforzar su aplicación y difusión.',
            'Medio': 'Se requiere revisar la política de prevención de riesgos psicosociales y programas para la prevención de los factores de riesgo psicosocial, la promoción de un entorno organizacional favorable y la prevención de la violencia laboral, así como reforzar su aplicación y difusión, mediante un Programa de intervención.',
            'Bajo': 'Es necesario una mayor difusión de la política de prevención de riesgos psicosociales y programas para: la prevención de los factores de riesgo psicosocial, la promoción de un entorno organizacional favorable y la prevención de la violencia laboral.',
            'Nulo o despreciable': 'El riesgo resulta despreciable por lo que no se requiere medidas adicionales.'
        };
        return recomendaciones[nivel] || '';
    };

    return {
        puntajeTotal,
        nivelRiesgo: nivelRiesgoTotal,
        categorias,
        dominios,
        dimensiones,
        recomendaciones: generarRecomendacion(nivelRiesgoTotal)
    };
};

module.exports = calcularPuntajePsicosocialTrabajo;