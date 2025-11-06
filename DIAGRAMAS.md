# Diagramas de Arquitectura NOM-035

Este documento contiene diagramas visuales de la arquitectura del sistema.

## Diagrama de Arquitectura General

```mermaid
graph TB
    subgraph "Capa de Presentación"
        A[Frontend React]
        B[Frontend HTML Legacy]
    end
    
    subgraph "Capa de Aplicación"
        C[Backend API REST]
        D[Express Server]
        E[Controllers]
        F[Middleware]
        G[Routes]
    end
    
    subgraph "Capa de Datos"
        H[MongoDB]
        I[(empresas)]
        J[(respuestas)]
        K[(resultadosPsicosocial)]
        L[(traumas)]
    end
    
    A -->|HTTP/REST| C
    B -->|HTTP/REST| C
    C --> D
    D --> F
    F --> G
    G --> E
    E --> H
    H --> I
    H --> J
    H --> K
    H --> L
```

## Flujo de Datos - Registro de Empresa

```mermaid
sequenceDiagram
    participant U as Usuario
    participant F as Frontend React
    participant API as Backend API
    participant DB as MongoDB
    
    U->>F: Registrar empresa
    F->>API: POST /api/empresas
    API->>API: Validar datos
    API->>DB: Guardar empresa
    DB-->>API: Empresa creada
    API-->>F: Respuesta exitosa
    F-->>U: Redirigir a Login
```

## Flujo de Datos - Evaluación Psicosocial

```mermaid
sequenceDiagram
    participant U as Usuario
    participant F as Frontend React
    participant API as Backend API
    participant UTL as Utils (Cálculo)
    participant DB as MongoDB
    
    U->>F: Completar formulario
    F->>API: POST /api/psicosocial/entorno
    API->>API: Validar respuestas
    API->>UTL: Calcular puntajes
    UTL-->>API: Puntajes calculados
    API->>DB: Guardar respuestas
    API->>DB: Guardar resultados
    DB-->>API: Datos guardados
    API-->>F: Resultados
    F-->>U: Mostrar resultados
```

## Flujo de Datos - Visualización de Resultados

```mermaid
sequenceDiagram
    participant U as Usuario
    participant F as Frontend React
    participant API as Backend API
    participant DB as MongoDB
    
    U->>F: Ver resultados
    F->>API: GET /api/psicosocial/entorno/empresa/:id
    API->>DB: Consultar resultados
    DB-->>API: Datos de resultados
    API-->>F: JSON con resultados
    F->>F: Renderizar gráficos (Chart.js)
    F-->>U: Mostrar visualización
```

## Estructura de Componentes Frontend

```mermaid
graph TD
    A[App.jsx] --> B[Layout]
    B --> C[Navbar]
    B --> D[Footer]
    B --> E[Routes]
    
    E --> F[Home]
    E --> G[RegistroEmpresa]
    E --> H[Login]
    E --> I[Intermedio]
    E --> J[PsicosocialEntorno]
    E --> K[PsicosocialTrabajo]
    E --> L[Traumaticos]
    E --> M[ResultadosEntorno]
    E --> N[ResultadosTrabajo]
    E --> O[ResultadosTraumaticos]
    
    J --> P[QuestionForm]
    K --> P
    L --> Q[TraumaticQuestionForm]
    M --> R[DonutChart]
    M --> S[PuntajesGrid]
    N --> R
    N --> S
    O --> R
    
    F --> T[api.js]
    G --> T
    H --> T
    J --> T
    K --> T
    L --> T
    M --> T
    N --> T
    O --> T
```

## Estructura Backend - Capas

```mermaid
graph TB
    subgraph "Entry Point"
        A[server.js]
    end
    
    subgraph "Configuración"
        B[config/db.js]
        C[config/security.js]
    end
    
    subgraph "Routing Layer"
        D[routes/empresaRoutes]
        E[routes/empleadoRoutes]
        F[routes/respuestaRoutes]
        G[routes/traumaRoutes]
    end
    
    subgraph "Business Logic"
        H[controllers/empresaController]
        I[controllers/psicosocialController]
        J[controllers/respuestaController]
        K[controllers/traumaController]
    end
    
    subgraph "Middleware"
        L[middleware/logging]
        M[middleware/validation]
    end
    
    subgraph "Data Access"
        N[models/empresa]
        O[models/respuesta]
        P[models/resultadoPsicosocial]
        Q[models/trauma]
    end
    
    subgraph "Utilities"
        R[utils/calcularPuntajeEntorno]
        S[utils/calcularPuntajeTrabajo]
    end
    
    A --> B
    A --> C
    A --> D
    A --> E
    A --> F
    A --> G
    
    D --> H
    E --> H
    F --> I
    F --> J
    G --> K
    
    H --> L
    I --> L
    J --> L
    K --> L
    
    H --> M
    I --> M
    J --> M
    K --> M
    
    H --> N
    I --> O
    I --> P
    J --> O
    J --> P
    K --> Q
    
    I --> R
    I --> S
    J --> R
    J --> S
```

## Modelo de Datos MongoDB

```mermaid
erDiagram
    EMPRESA ||--o{ RESPUESTA : tiene
    EMPRESA ||--o{ RESULTADO_PSICOSOCIAL : genera
    EMPRESA ||--o{ TRAUMA : contiene
    
    EMPRESA {
        ObjectId _id
        string nombre
        string clave
        number numEmpleados
        date createdAt
        date updatedAt
    }
    
    RESPUESTA {
        ObjectId _id
        ObjectId empresaId
        ObjectId empleadoId
        string tipo
        array respuestas
        number puntaje
        string nivelRiesgo
        date createdAt
    }
    
    RESULTADO_PSICOSOCIAL {
        ObjectId _id
        ObjectId empresaId
        string tipo
        array resultados
        number puntajeTotal
        string nivelRiesgoGeneral
        date createdAt
    }
    
    TRAUMA {
        ObjectId _id
        string empresaNombre
        string empleadoNombre
        array respuestas
        number numEventos
        date createdAt
    }
```

## Flujo de Autenticación

```mermaid
sequenceDiagram
    participant U as Usuario
    participant F as Frontend
    participant API as Backend API
    participant DB as MongoDB
    
    Note over U,DB: Autenticación de Empresa
    U->>F: Ingresar clave empresa
    F->>API: POST /api/empresas/verify-clave
    API->>DB: Buscar empresa por clave
    alt Clave válida
        DB-->>API: Empresa encontrada
        API-->>F: Empresa válida
        F-->>U: Redirigir a formularios
    else Clave inválida
        DB-->>API: No encontrada
        API-->>F: Error de autenticación
        F-->>U: Mostrar error
    end
```

## Flujo de Cálculo de Puntajes

```mermaid
flowchart TD
    A[Respuestas del Usuario] --> B{Validar Respuestas}
    B -->|Válidas| C[Calcular Puntaje por Categoría]
    B -->|Inválidas| D[Error de Validación]
    C --> E[Sumar Puntajes]
    E --> F[Determinar Nivel de Riesgo]
    F --> G{Puntaje Total}
    G -->|0-40| H[Nivel: Bajo]
    G -->|41-70| I[Nivel: Medio]
    G -->|71+| J[Nivel: Alto]
    H --> K[Guardar Resultado]
    I --> K
    J --> K
    K --> L[Response al Frontend]
```

## Arquitectura de Seguridad

```mermaid
graph LR
    A[Request HTTP] --> B[Helmet]
    B --> C[CORS]
    C --> D[Rate Limiting]
    D --> E[Request Size Limiter]
    E --> F[Content Type Validator]
    F --> G[Request Logger]
    G --> H[Suspicious Activity Detector]
    H --> I[Validation Middleware]
    I --> J[Routes]
    
    style B fill:#ff6b6b
    style C fill:#ff6b6b
    style D fill:#ff6b6b
    style E fill:#ff6b6b
    style F fill:#ff6b6b
    style G fill:#ff6b6b
    style H fill:#ff6b6b
    style I fill:#ff6b6b
```

## Stack Tecnológico

```mermaid
graph TB
    subgraph "Frontend"
        A[React 18]
        B[Vite]
        C[React Router]
        D[Bootstrap 5]
        E[Chart.js]
        F[Axios]
    end
    
    subgraph "Backend"
        G[Node.js]
        H[Express.js]
        I[Mongoose]
        J[Helmet]
        K[CORS]
        L[Rate Limiting]
    end
    
    subgraph "Base de Datos"
        M[MongoDB]
    end
    
    A --> B
    A --> C
    A --> D
    A --> E
    A --> F
    F --> G
    G --> H
    H --> I
    H --> J
    H --> K
    H --> L
    I --> M
```

