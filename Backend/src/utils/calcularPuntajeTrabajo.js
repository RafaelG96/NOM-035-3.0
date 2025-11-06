/**
 * Calcula puntajes de riesgo psicosocial basado en respuestas a 46 preguntas.
 * @param {Object} respuestas - Objeto con las respuestas (pregunta1: "Siempre", ...)
 * @param {boolean} [esJefe=false] - Indica si el encuestado es jefe
 * @param {boolean} [servicioClientes=false] - Indica si atiende clientes
 * @returns {Object} - { puntajeTotal, nivelRiesgo, categorias, dominios, recomendaciones }
 */
const calcularPuntajePsicosocialTrabajo = (respuestas, esJefe = false, servicioClientes = false) => {
    const GRUPO_1 = new Set([23, 24, 25, 28, 29, 30, 31, 32, 44, 45, 46, 20, 21, 22, 26, 27, 18, 19, 33]); // Preguntas que se califican 4-0
    const GRUPO_2 = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43]); // Preguntas que se califican 0-4

    const VALORES_RESPUESTA = {
        GRUPO_1: { "Siempre": 0, "Casi siempre": 1, "Algunas veces": 2, "Casi nunca": 3, "Nunca": 4 },
        GRUPO_2: { "Siempre": 4, "Casi siempre": 3, "Algunas veces": 2, "Casi nunca": 1, "Nunca": 0 }
    };

    // Estructura jerárquica basada en la tabla NOM-035-STPS-2018 para formulario de trabajo (46 preguntas)
    // Agrupación por Categoría > Dominio > Dimensión (items)
    const ESTRUCTURA = {
        "Ambiente de trabajo": {
            "Condiciones en el ambiente de trabajo": [1, 2, 3]
            // Dimensiones:
            // - Condiciones peligrosas e inseguras: [2]
            // - Condiciones deficientes e insalubres: [1]
            // - Trabajos peligrosos: [3]
        },
        "Factores propios de la actividad": {
            "Carga de trabajo": [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 41, 42, 43]
            // Dimensiones:
            // - Cargas cuantitativas: [4, 9]
            // - Ritmos de trabajo acelerado: [5, 6]
            // - Carga mental: [7, 8]
            // - Cargas psicológicas emocionales: [41, 42, 43] (condicional para clientes)
            // - Cargas de alta responsabilidad: [10, 11]
            // - Cargas contradictorias o inconsistentes: [12, 13]
        },
        "Organización del tiempo de trabajo": {
            "Jornada de trabajo": [14, 15],
            // Dimensión: Jornadas de trabajo extensas: [14, 15]
            "Interferencia en la relación trabajo-familia": [16, 17]
            // Dimensiones:
            // - Influencia del trabajo fuera del centro laboral: [16]
            // - Influencia de las responsabilidades familiares: [17]
        },
        "Liderazgo y relaciones en el trabajo": {
            "Liderazgo": [23, 24, 25, 28, 29],
            // Dimensiones:
            // - Escasa claridad de funciones: [23, 24, 25]
            // - Características del liderazgo: [28, 29]
            "Relaciones en el trabajo": [30, 31, 32, 44, 45, 46],
            // Dimensiones:
            // - Relaciones sociales en el trabajo: [30, 31, 32]
            // - Deficiente relación con los colaboradores que supervisa: [44, 45, 46] (condicional para jefes)
            "Violencia": [33, 34, 35, 36, 37, 38, 39, 40]
            // Dimensión: Violencia laboral: [33, 34, 35, 36, 37, 38, 39, 40]
        },
        "Falta de control sobre el trabajo": {
            "Falta de control y autonomía sobre el trabajo": [20, 21, 22],
            // Dimensión: Falta de control y autonomía: [20, 21, 22]
            "Limitada o nula posibilidad de desarrollo": [18, 19],
            // Dimensión: Limitada o nula posibilidad de desarrollo: [18, 19]
            "Limitada o inexistente capacitación": [26, 27]
            // Dimensión: Limitada o inexistente capacitación: [26, 27]
        }
    };

    let puntajeTotal = 0;
    const categorias = {};
    const dominios = {};

    // Inicializar estructuras con ceros
    Object.keys(ESTRUCTURA).forEach(categoria => {
        categorias[categoria] = { puntaje: 0, nivel: '' };
        Object.keys(ESTRUCTURA[categoria]).forEach(dominio => {
            dominios[dominio] = { puntaje: 0, nivel: '' };
        });
    });

    // Validar respuestas obligatorias
    const preguntasObligatorias = Array.from({ length: 40 }, (_, i) => i + 1);
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
        if ((i >= 41 && i <= 43) && !servicioClientes) continue;
        if ((i >= 44 && i <= 46) && !esJefe) continue;

        const respuesta = respuestas[`pregunta${i}`];
        if (respuesta === undefined || respuesta === null) continue;

        let valor = 0;
        if (GRUPO_1.has(i)) {
            valor = VALORES_RESPUESTA.GRUPO_1[respuesta] ?? 0;
        } else if (GRUPO_2.has(i)) {
            valor = VALORES_RESPUESTA.GRUPO_2[respuesta] ?? 0;
        }

        puntajeTotal += valor;

        // Acumular puntajes en categorías y dominios
        for (const [categoria, dominiosData] of Object.entries(ESTRUCTURA)) {
            for (const [dominio, items] of Object.entries(dominiosData)) {
                if (items.includes(i)) {
                    categorias[categoria].puntaje += valor;
                    dominios[dominio].puntaje += valor;
                }
            }
        }
    }

    // Función para determinar nivel de riesgo
    const determinarNivel = (puntaje, tipo) => {
        const umbrales = {
            'Ambiente de trabajo': [3, 5, 7, 9],
            'Factores propios de la actividad': [10, 20, 30, 40],
            'Organización del tiempo de trabajo': [4, 8, 9, 12],
            'Liderazgo y relaciones en el trabajo': [10, 18, 28, 38],
            'Falta de control sobre el trabajo': [5, 8, 11, 14],
            'total': [20, 45, 70, 90]
        };

        const limites = umbrales[tipo] || umbrales['total'];
        if (puntaje < limites[0]) return 'Nulo o despreciable';
        if (puntaje < limites[1]) return 'Bajo';
        if (puntaje < limites[2]) return 'Medio';
        if (puntaje < limites[3]) return 'Alto';
        return 'Muy alto';
    };

    const nivelRiesgoTotal = determinarNivel(puntajeTotal, 'total');

    Object.keys(categorias).forEach(cat => {
        categorias[cat].nivel = determinarNivel(categorias[cat].puntaje, cat);
    });

    // Determinar niveles por dominio con umbrales específicos
    const determinarNivelPorDominio = (puntaje, dominio) => {
        const umbralesPorDominio = {
            'Condiciones en el ambiente de trabajo': [3, 5, 7, 9],
            'Carga de trabajo': [12, 18, 20, 24],
            'Falta de control y autonomía sobre el trabajo': [3, 5, 7, 9],
            'Limitada o nula posibilidad de desarrollo': [1, 2, 4, 6],
            'Limitada o inexistente capacitación': [1, 2, 4, 6],
            'Jornada de trabajo': [1, 2, 4, 6],
            'Interferencia en la relación trabajo-familia': [1, 2, 4, 6],
            'Liderazgo': [3, 5, 8, 11],
            'Relaciones en el trabajo': [5, 8, 11, 14],
            'Violencia': [7, 10, 13, 16]
        };

        const limites = umbralesPorDominio[dominio] || [5, 8, 11, 14];
        if (puntaje < limites[0]) return 'Nulo o despreciable';
        if (puntaje < limites[1]) return 'Bajo';
        if (puntaje < limites[2]) return 'Medio';
        if (puntaje < limites[3]) return 'Alto';
        return 'Muy alto';
    };

    Object.keys(dominios).forEach(dom => {
        dominios[dom].nivel = determinarNivelPorDominio(dominios[dom].puntaje, dom);
    });

    const generarRecomendacion = (nivel) => {
        const recomendaciones = {
            'Muy alto': 'Se requiere realizar un análisis detallado y establecer acciones de intervención inmediatas.',
            'Alto': 'Se recomienda realizar un análisis de cada categoría y dominio para determinar acciones correctivas.',
            'Medio': 'Se recomienda revisar políticas y programas de prevención, considerando mejorar las áreas identificadas.',
            'Bajo': 'Es necesario reforzar la difusión de políticas de prevención y mantener monitoreo periódico.',
            'Nulo o despreciable': 'El riesgo es despreciable, se recomienda mantener las condiciones actuales.'
        };
        return recomendaciones[nivel] || '';
    };

    return {
        puntajeTotal,
        nivelRiesgo: nivelRiesgoTotal,
        categorias,
        dominios,
        recomendaciones: generarRecomendacion(nivelRiesgoTotal)
    };
};

module.exports = calcularPuntajePsicosocialTrabajo;