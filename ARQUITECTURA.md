# Arquitectura del Sistema NOM-035

## 📋 Tabla de Contenidos

1. [Visión General](#visión-general)
2. [Arquitectura General](#arquitectura-general)
3. [Backend (API REST)](#backend-api-rest)
4. [Frontend (React)](#frontend-react)
5. [Base de Datos](#base-de-datos)
6. [Flujos de Datos](#flujos-de-datos)
7. [Seguridad](#seguridad)
8. [Patrones Arquitectónicos](#patrones-arquitectónicos)
9. [Estructura de Carpetas](#estructura-de-carpetas)

---

## 🎯 Visión General

El sistema NOM-035 es una aplicación web para la evaluación de factores de riesgo psicosocial según la Norma Oficial Mexicana NOM-035-STPS-2018. La aplicación permite a las empresas registrar empleados y realizar evaluaciones psicosociales para cumplir con la normativa mexicana.

### Características Principales

- Registro de empresas y empleados
- Evaluación psicosocial (Entorno y Trabajo)
- Evaluación de eventos traumáticos
- Visualización de resultados y estadísticas
- Sistema de autenticación por claves
- Reportes y análisis de datos

---

## 🏗️ Arquitectura General

La aplicación sigue una arquitectura de **3 capas** (Three-Tier Architecture):

```
┌─────────────────────────────────────────────────────────┐
│                    PRESENTACIÓN                          │
│  ┌──────────────────┐      ┌──────────────────┐         │
│  │  Frontend React  │      │ Frontend HTML    │         │
│  │   (Principal)    │      │   (Legacy)       │         │
│  └──────────────────┘      └──────────────────┘         │
└─────────────────────────────────────────────────────────┘
                          │
                          │ HTTP/REST API
                          ▼
┌─────────────────────────────────────────────────────────┐
│                      LÓGICA DE NEGOCIO                  │
│  ┌──────────────────────────────────────────────────┐  │
│  │          Backend Node.js/Express                 │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐      │  │
│  │  │Routes    │  │Controllers│  │Middleware│      │  │
│  │  └──────────┘  └──────────┘  └──────────┘      │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐      │  │
│  │  │Models    │  │  Utils   │  │  Config  │      │  │
│  │  └──────────┘  └──────────┘  └──────────┘      │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          │
                          │ Mongoose ODM
                          ▼
┌─────────────────────────────────────────────────────────┐
│                      CAPA DE DATOS                      │
│  ┌──────────────────────────────────────────────────┐  │
│  │              MongoDB Database                     │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐       │  │
│  │  │empresas  │  │empleados │  │respuestas│       │  │
│  │  └──────────┘  └──────────┘  └──────────┘       │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐       │  │
│  │  │resultados│  │traumas    │  │          │       │  │
│  │  └──────────┘  └──────────┘  └──────────┘       │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## 🔧 Backend (API REST)

### Tecnologías

- **Runtime**: Node.js
- **Framework**: Express.js
- **Base de Datos**: MongoDB con Mongoose ODM
- **Seguridad**: Helmet, CORS, Rate Limiting, Express Validator
- **Logging**: Middleware personalizado

### Estructura del Backend

```
Backend/
├── server.js                 # Punto de entrada principal
├── package.json              # Dependencias y scripts
├── .env                      # Variables de entorno
└── src/
    ├── config/               # Configuraciones
    │   ├── db.js            # Configuración de MongoDB
    │   └── security.js      # Configuración de seguridad
    ├── controllers/          # Lógica de negocio
    │   ├── empresaController.js
    │   ├── psicosocialController.js
    │   ├── respuestaController.js
    │   └── traumaController.js
    ├── models/               # Esquemas de MongoDB
    │   ├── empresa.js
    │   ├── respuesta.js
    │   ├── resultadoPsicosocial.js
    │   └── traumaModel.js
    ├── routes/               # Definición de rutas
    │   ├── empresaRoutes.js
    │   ├── empleadoRoutes.js
    │   ├── respuestaRoutes.js
    │   └── traumaRoutes.js
    ├── middleware/           # Middlewares personalizados
    │   ├── logging.js        # Logging y detección de seguridad
    │   └── validation.js     # Validación de datos
    └── utils/                # Utilidades
        ├── calcularPuntajeEntorno.js
        └── calcularPuntajeTrabajo.js
```

### Flujo de Request en el Backend

```
Cliente HTTP Request
    │
    ▼
┌─────────────────┐
│  Middleware      │  ← Helmet, CORS, Rate Limiting
│  de Seguridad    │
└─────────────────┘
    │
    ▼
┌─────────────────┐
│  Middleware      │  ← Logging, Validación
│  de Aplicación   │
└─────────────────┘
    │
    ▼
┌─────────────────┐
│     Routes      │  ← Define endpoints
│  (Router)       │
└─────────────────┘
    │
    ▼
┌─────────────────┐
│  Controllers    │  ← Lógica de negocio
│  (Business)     │
└─────────────────┘
    │
    ▼
┌─────────────────┐
│     Models      │  ← Interacción con DB
│   (Mongoose)    │
└─────────────────┘
    │
    ▼
┌─────────────────┐
│    MongoDB      │  ← Base de datos
└─────────────────┘
```

### Endpoints Principales

#### Empresas
- `POST /api/empresas` - Crear empresa
- `POST /api/empresas/verify-clave` - Verificar clave de empresa
- `GET /api/empresas/:id` - Obtener empresa por ID

#### Empleados
- `POST /api/empleados/verify` - Verificar empleado
- `POST /api/empleados` - Crear empleado

#### Evaluación Psicosocial
- `POST /api/psicosocial/entorno` - Guardar respuestas entorno
- `POST /api/psicosocial/trabajo` - Guardar respuestas trabajo
- `GET /api/psicosocial/entorno/empresa/:empresaId` - Resultados entorno
- `GET /api/psicosocial/trabajo/empresa/:empresaId` - Resultados trabajo

#### Eventos Traumáticos
- `POST /api/trauma` - Guardar evaluación traumática
- `GET /api/trauma` - Obtener resultados
- `GET /api/trauma/empresas` - Listar empresas con evaluaciones

---

## 🎨 Frontend (React)

### Tecnologías

- **Framework**: React 18
- **Build Tool**: Vite
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **UI Framework**: Bootstrap 5
- **Charts**: Chart.js con react-chartjs-2
- **Icons**: Bootstrap Icons

### Estructura del Frontend

```
frontend-react/
├── public/                   # Archivos estáticos
├── index.html               # HTML principal
├── vite.config.js           # Configuración de Vite
├── package.json             # Dependencias
└── src/
    ├── main.jsx             # Punto de entrada
    ├── App.jsx              # Componente raíz y rutas
    ├── App.css              # Estilos globales
    ├── index.css            # Estilos base
    ├── components/          # Componentes reutilizables
    │   ├── Layout.jsx      # Layout principal
    │   ├── Navbar.jsx      # Barra de navegación
    │   ├── Footer.jsx      # Pie de página
    │   ├── QuestionForm.jsx # Formulario de preguntas
    │   ├── TraumaticQuestionForm.jsx
    │   ├── DonutChart.jsx  # Gráfico dona
    │   └── PuntajesGrid.jsx # Grid de puntajes
    ├── pages/               # Páginas/Views
    │   ├── Home.jsx         # Página principal
    │   ├── RegistroEmpresa.jsx
    │   ├── Login.jsx
    │   ├── Intermedio.jsx
    │   ├── PsicosocialEntorno.jsx
    │   ├── PsicosocialTrabajo.jsx
    │   ├── Traumaticos.jsx
    │   ├── ResultadosEntorno.jsx
    │   ├── ResultadosTrabajo.jsx
    │   └── ResultadosTraumaticos.jsx
    ├── services/            # Servicios de API
    │   └── api.js           # Cliente HTTP configurado
    └── utils/               # Utilidades
        └── debug.js         # Utilidades de debug
```

### Flujo de Datos en el Frontend

```
Usuario interactúa con la UI
    │
    ▼
┌─────────────────┐
│   Componentes   │  ← React Components
│   (Pages/Views) │
└─────────────────┘
    │
    ▼
┌─────────────────┐
│    Services     │  ← API Service Layer
│    (api.js)     │
└─────────────────┘
    │
    ▼
┌─────────────────┐
│  Axios Client   │  ← HTTP Requests
└─────────────────┘
    │
    ▼
┌─────────────────┐
│  Backend API    │  ← Express Server
└─────────────────┘
```

### Rutas de la Aplicación

| Ruta | Componente | Descripción |
|------|------------|-------------|
| `/` | Home | Página principal informativa |
| `/registro` | RegistroEmpresa | Registro de nueva empresa |
| `/login` | Login | Login de empleado |
| `/intermedio` | Intermedio | Selección de tipo de acceso |
| `/psicosocial-entorno` | PsicosocialEntorno | Formulario entorno (51+ empleados) |
| `/psicosocial-trabajo` | PsicosocialTrabajo | Formulario trabajo (1-50 empleados) |
| `/traumaticos` | Traumaticos | Formulario eventos traumáticos |
| `/resultados-entorno` | ResultadosEntorno | Resultados evaluación entorno |
| `/resultados-trabajo` | ResultadosTrabajo | Resultados evaluación trabajo |
| `/resultados-traumaticos` | ResultadosTraumaticos | Resultados eventos traumáticos |

---

## 💾 Base de Datos

### MongoDB Collections

#### 1. `empresas`
```javascript
{
  _id: ObjectId,
  nombre: String,
  clave: String,           // Clave de acceso
  numEmpleados: Number,    // 1-50 o 51+
  createdAt: Date,
  updatedAt: Date
}
```

#### 2. `empleados` (implícito en el modelo de empresa)
```javascript
{
  _id: ObjectId,
  nombre: String,
  clave: String,
  empresaId: ObjectId,
  createdAt: Date
}
```

#### 3. `respuestas`
```javascript
{
  _id: ObjectId,
  empresaId: ObjectId,
  empleadoId: ObjectId,
  tipo: String,            // 'entorno' o 'trabajo'
  respuestas: [Number],    // Array de respuestas
  puntaje: Number,
  nivelRiesgo: String,     // 'Bajo', 'Medio', 'Alto'
  createdAt: Date
}
```

#### 4. `resultadosPsicosocial`
```javascript
{
  _id: ObjectId,
  empresaId: ObjectId,
  tipo: String,            // 'entorno' o 'trabajo'
  resultados: [{
    categoria: String,
    puntaje: Number,
    nivelRiesgo: String
  }],
  puntajeTotal: Number,
  nivelRiesgoGeneral: String,
  createdAt: Date
}
```

#### 5. `traumas`
```javascript
{
  _id: ObjectId,
  empresaNombre: String,
  empleadoNombre: String,
  respuestas: [Boolean],   // Array de respuestas boolean
  numEventos: Number,
  createdAt: Date
}
```

### Relaciones entre Collections

```
empresas (1) ────< (N) respuestas
empresas (1) ────< (N) resultadosPsicosocial
empresas (1) ────< (N) traumas
```

---

## 🔄 Flujos de Datos

### Flujo 1: Registro de Empresa

```
Usuario → Frontend (RegistroEmpresa)
    ↓
POST /api/empresas
    ↓
Controller (empresaController)
    ↓
Model (empresa) → MongoDB
    ↓
Response → Frontend
    ↓
Redirigir a Login
```

### Flujo 2: Evaluación Psicosocial

```
Usuario → Frontend (PsicosocialEntorno/Trabajo)
    ↓
Completar formulario
    ↓
POST /api/psicosocial/entorno o /trabajo
    ↓
Controller (psicosocialController)
    ↓
Utils (calcularPuntaje)
    ↓
Guardar en MongoDB (respuestas + resultadosPsicosocial)
    ↓
Response → Frontend
    ↓
Redirigir a Resultados
```

### Flujo 3: Visualización de Resultados

```
Usuario → Frontend (ResultadosEntorno)
    ↓
GET /api/psicosocial/entorno/empresa/:empresaId
    ↓
Controller → Model
    ↓
MongoDB Query
    ↓
Response con datos
    ↓
Frontend renderiza gráficos (Chart.js)
```

---

## 🔐 Seguridad

### Medidas Implementadas

1. **Helmet**: Configuración de headers de seguridad HTTP
2. **CORS**: Configuración de origen cruzado
3. **Rate Limiting**: 
   - General: Limita requests por IP
   - Auth: Límite más estricto para endpoints de autenticación
4. **Validación de Entrada**: Express Validator
5. **Sanitización**: Headers y datos de entrada
6. **Logging de Seguridad**: Detección de actividades sospechosas
7. **Límites de Tamaño**: Request body size limits

### Configuración de Seguridad

```javascript
// security.js
- Helmet config
- CORS config
- Rate limiting config
- MongoDB connection security
- Request size limits
```

---

## 🎯 Patrones Arquitectónicos

### 1. **MVC (Model-View-Controller)**
- **Models**: Esquemas de MongoDB (Mongoose)
- **Views**: Componentes React
- **Controllers**: Lógica de negocio en controllers

### 2. **Service Layer Pattern**
- Frontend: `services/api.js` - Capa de abstracción para llamadas API
- Backend: Controllers actúan como service layer

### 3. **Repository Pattern** (implícito)
- Models de Mongoose encapsulan acceso a datos

### 4. **Middleware Pattern**
- Express middleware para logging, validación, seguridad

### 5. **Component-Based Architecture**
- React: Componentes reutilizables
- Separación de concerns (Pages, Components, Services)

---

## 📁 Estructura de Carpetas Completa

```
NOM-035-5.3s/
│
├── Backend/                    # Backend Node.js/Express
│   ├── server.js
│   ├── package.json
│   ├── .env
│   ├── start.sh
│   ├── stop.sh
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── models/
│       ├── routes/
│       ├── middleware/
│       └── utils/
│
├── frontend-react/             # Frontend React (Principal)
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── utils/
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
│
├── Frontend/                   # Frontend HTML/JS (Legacy)
│   ├── Formularios/
│   ├── Js/
│   ├── css/
│   └── pages/
│
└── ARQUITECTURA.md            # Este documento
```

---

## 🚀 Despliegue

### Backend
```bash
cd Backend
npm install
npm start
# O usar los scripts: ./start.sh
```

### Frontend
```bash
cd frontend-react
npm install
npm run dev    # Desarrollo
npm run build  # Producción
```

### Variables de Entorno

**Backend (.env)**
```env
MONGO_URI=mongodb://localhost:27017/nom035DB
PORT=3000
NODE_ENV=development
```

**Frontend (.env)**
```env
VITE_API_URL=http://localhost:3000/api
```

---

## 📊 Diagrama de Secuencia (Ejemplo: Evaluación Psicosocial)

```
Usuario    Frontend    Backend API    MongoDB
   │          │            │            │
   │───POST /api/psicosocial/entorno──>│
   │          │            │            │
   │          │            │───Save───>│
   │          │            │<──Data────│
   │          │<──Response─│            │
   │<──Render──│            │            │
   │          │            │            │
```

---

## 🔧 Mejoras Futuras Sugeridas

1. **Autenticación JWT**: Implementar tokens JWT en lugar de claves simples
2. **Testing**: Agregar tests unitarios y de integración
3. **Documentación API**: Swagger/OpenAPI
4. **Caché**: Redis para mejorar performance
5. **Logging**: Winston o Pino para logging estructurado
6. **Monitoreo**: Health checks y métricas
7. **CI/CD**: Pipeline de despliegue automático
8. **Docker**: Containerización de la aplicación

---

## 📝 Notas Finales

- El frontend HTML en `Frontend/` es una versión legacy que puede mantenerse para compatibilidad
- El frontend React en `frontend-react/` es la versión principal y recomendada
- La arquitectura es escalable y permite agregar nuevas funcionalidades fácilmente
- El código sigue principios SOLID y separación de concerns

---

**Última actualización**: $(date)
**Versión**: 1.0.0

