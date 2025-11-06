# Sistema NOM-035 - Evaluación de Factores de Riesgo Psicosocial

Sistema completo para la evaluación de factores de riesgo psicosocial según la **Norma Oficial Mexicana NOM-035-STPS-2018**, desarrollado para ayudar a las organizaciones a cumplir con los requisitos de la Secretaría del Trabajo y Previsión Social (STPS).

---

## 📋 Tabla de Contenidos

1. [Descripción](#descripción)
2. [Características](#características)
3. [Tecnologías Utilizadas](#tecnologías-utilizadas)
4. [Estructura del Proyecto](#estructura-del-proyecto)
5. [Instalación y Configuración](#instalación-y-configuración)
6. [Uso](#uso)
7. [API Endpoints](#api-endpoints)
8. [Seguridad](#seguridad)
9. [Contribución](#contribución)

---

## 📝 Descripción

La aplicación web NOM-035 está diseñada para ayudar a las organizaciones a cumplir con los requisitos de la **Norma Oficial Mexicana NOM-035**, que tiene como objetivo identificar, analizar y prevenir los factores de riesgo psicosocial en el trabajo, así como promover un entorno organizacional favorable.

### Objetivo de la NOM-035

La norma busca establecer los elementos para:
- Identificar factores de riesgo psicosocial en el trabajo
- Analizar y evaluar estos factores
- Prevenir y controlar los riesgos identificados
- Promover un entorno organizacional favorable

### Aplicación de la Norma

- **Primera etapa**: A partir del 23 de octubre de 2019 para empresas con más de 50 trabajadores
- **Segunda etapa**: A partir del 23 de octubre de 2020 para todas las empresas, independientemente de su tamaño
- **Aplicación**: Obligatoria para todos los centros de trabajo en México, incluyendo sector público y privado

---

## ✨ Características

### Funcionalidades Principales

- **Registro de Empresas**: Sistema de registro y autenticación para empresas
  - Registro con nombre, cantidad de empleados, clave de acceso para empleados
  - **Código de acceso a resultados**: Código adicional seguro para proteger el acceso a los resultados
- **Sistema de Autenticación Dual**:
  - **Clave de acceso para empleados**: Para que los empleados accedan y completen los cuestionarios
  - **Código de acceso a resultados**: Para proteger el acceso a los resultados y reportes de la empresa
- **Autenticación de Resultados**: 
  - Sistema de login específico para acceder a los resultados
  - Protección de datos sensibles de la empresa mediante nombre y código de acceso
  - Solo usuarios autorizados pueden visualizar los resultados
- **Cuestionarios Digitales**:
  - **Acontecimientos Traumáticos Severos**: Evaluación de eventos traumáticos
  - **Factores de Riesgo Psicosocial - Entorno**: Para empresas con 51+ empleados (72 preguntas)
  - **Factores de Riesgo Psicosocial - Trabajo**: Para empresas con 1-50 empleados (46 preguntas)
- **Cálculo Automático de Resultados**: Clasificación de riesgos en **bajo**, **medio** y **alto**
- **Visualización de Resultados**: Reportes con gráficos y recomendaciones personalizadas
- **Exportación de Resultados**: Descarga de reportes en formato PDF y Excel
- **Bloqueo de Descarga**: Los reportes solo se pueden descargar cuando todos los formularios están completos
- **Almacenamiento en Base de Datos**: Los resultados se guardan en MongoDB para su posterior análisis

### Frontends Disponibles

El proyecto incluye dos interfaces frontend:

1. **Frontend React** (`frontend-react/`): Aplicación moderna desarrollada con React, Vite y Bootstrap 5
2. **Frontend Tradicional** (`Frontend/`): Aplicación desarrollada con HTML, CSS y JavaScript vanilla

---

## 🛠️ Tecnologías Utilizadas

### Backend

- **Node.js** - Runtime de JavaScript
- **Express.js** - Framework web para Node.js
- **MongoDB** - Base de datos NoSQL
- **Mongoose** - ODM para MongoDB
- **Helmet** - Seguridad HTTP headers
- **express-rate-limit** - Protección contra ataques de fuerza bruta
- **express-validator** - Validación de datos
- **CORS** - Configuración de Cross-Origin Resource Sharing
- **dotenv** - Gestión de variables de entorno

### Frontend React

- **React 18** - Biblioteca de JavaScript para interfaces de usuario
- **Vite** - Build tool y dev server de próxima generación
- **React Router DOM** - Enrutamiento para aplicaciones React
- **Bootstrap 5** - Framework CSS responsive
- **Bootstrap Icons** - Iconos
- **Axios** - Cliente HTTP para peticiones a la API
- **Chart.js** - Librería de gráficos
- **react-chartjs-2** - Wrapper de React para Chart.js
- **jsPDF** - Generación de documentos PDF
- **xlsx** - Exportación de datos a formato Excel

### Frontend Tradicional

- **HTML5** - Estructura de páginas
- **CSS3** - Estilos
- **JavaScript (ES6+)** - Lógica del cliente
- **Bootstrap** - Framework CSS

---

## 📁 Estructura del Proyecto

```
NOM-035-5.3s/
│
├── Backend/                    # API REST en Node.js/Express
│   ├── src/
│   │   ├── config/            # Configuraciones
│   │   │   ├── db.js          # Configuración de MongoDB
│   │   │   └── security.js    # Configuración de seguridad
│   │   ├── controllers/       # Controladores de la lógica de negocio
│   │   │   ├── empresaController.js
│   │   │   ├── psicosocialController.js
│   │   │   ├── respuestaController.js
│   │   │   └── traumaController.js
│   │   ├── middleware/        # Middlewares personalizados
│   │   │   ├── logging.js     # Logging y detección de seguridad
│   │   │   ├── validation.js   # Validación de datos
│   │   │   └── resultadosAuth.js  # Autenticación para acceso a resultados
│   │   ├── models/            # Modelos de MongoDB
│   │   │   ├── empresa.js
│   │   │   ├── respuesta.js
│   │   │   ├── resultadoPsicosocial.js
│   │   │   └── traumaModel.js
│   │   ├── routes/            # Rutas de la API
│   │   │   ├── empresaRoutes.js
│   │   │   ├── empleadoRoutes.js
│   │   │   ├── respuestaRoutes.js
│   │   │   └── traumaRoutes.js
│   │   └── utils/             # Utilidades
│   │       ├── calcularPuntajeEntorno.js
│   │       └── calcularPuntajeTrabajo.js
│   ├── server.js              # Punto de entrada del servidor
│   ├── package.json
│   ├── start.sh               # Script para iniciar el servidor
│   └── stop.sh                # Script para detener el servidor
│
├── frontend-react/            # Frontend en React
│   ├── src/
│   │   ├── components/        # Componentes reutilizables
│   │   │   ├── Layout.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── QuestionForm.jsx
│   │   │   ├── TraumaticQuestionForm.jsx
│   │   │   ├── DonutChart.jsx
│   │   │   ├── PuntajesGrid.jsx
│   │   │   └── LoginResultados.jsx
│   │   ├── pages/             # Páginas principales
│   │   │   ├── Home.jsx
│   │   │   ├── RegistroEmpresa.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Intermedio.jsx
│   │   │   ├── PsicosocialEntorno.jsx
│   │   │   ├── PsicosocialTrabajo.jsx
│   │   │   ├── Traumaticos.jsx
│   │   │   ├── ResultadosEntorno.jsx
│   │   │   ├── ResultadosTrabajo.jsx
│   │   │   └── ResultadosTraumaticos.jsx
│   │   ├── services/          # Servicios de API
│   │   │   └── api.js
│   │   ├── utils/             # Utilidades
│   │   │   └── debug.js
│   │   ├── App.jsx            # Componente principal
│   │   └── main.jsx           # Punto de entrada
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── Frontend/                  # Frontend tradicional (HTML/CSS/JS)
│   ├── Formularios/          # Formularios HTML
│   │   ├── empresa.html
│   │   ├── traumaticos.html
│   │   ├── psicosocial-entorno.html
│   │   ├── psicosocial-trabajo.html
│   │   ├── resultados.html
│   │   ├── resultadosTrabajo.html
│   │   └── resultadosTraumaticos.html
│   ├── Js/                   # Scripts JavaScript
│   │   ├── empresa.js
│   │   ├── traumaticos.js
│   │   ├── psicosocial-entorno.js
│   │   ├── psicosocial-trabajo.js
│   │   └── resultados.js
│   ├── css/                  # Estilos CSS
│   ├── index.html            # Página principal
│   └── pages/
│
└── README.md                 # Este archivo
```

---

## 🚀 Instalación y Configuración

### Requisitos Previos

- **Node.js** (versión 14 o superior) instalado
- **MongoDB** instalado y en ejecución (versión 4.4 o superior)
- **npm** o **yarn** como gestor de paquetes
- **Git** para clonar el repositorio

### Pasos para la Instalación

#### 1. Clonar el Repositorio

```bash
git clone https://github.com/RafaelG96/NOM-035-SST.git
cd NOM-035-SST
```

#### 2. Configurar el Backend

```bash
cd Backend
npm install
```

Crear archivo `.env` en la carpeta `Backend/`:

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/nom035DB
NODE_ENV=development
```

#### 3. Configurar el Frontend React (Recomendado)

```bash
cd ../frontend-react
npm install
```

Crear archivo `.env` en la carpeta `frontend-react/`:

```env
VITE_API_URL=http://localhost:3000/api
```

#### 4. Iniciar MongoDB

Asegúrate de que MongoDB esté corriendo:

```bash
# En Linux/Mac
sudo systemctl start mongod

# O en Windows
net start MongoDB
```

#### 5. Iniciar el Servidor Backend

```bash
cd Backend
npm start
# O usar el script
./start.sh
```

El servidor estará disponible en `http://localhost:3000`

#### 6. Iniciar el Frontend React

```bash
cd frontend-react
npm run dev
```

La aplicación estará disponible en `http://localhost:5173` (o el puerto que Vite asigne)

#### 7. Usar el Frontend Tradicional (Alternativa)

Si prefieres usar el frontend tradicional, puedes usar Live Server en Visual Studio Code:

1. Abre el archivo `Frontend/index.html`
2. Haz clic derecho y selecciona **"Open with Live Server"**

---

## 💻 Uso

### Acceso a la Aplicación

1. **Frontend React**: Visita `http://localhost:5173`
2. **Frontend Tradicional**: Visita `http://localhost:5500` (o el puerto de Live Server)

### Flujo de Uso

1. **Registro de Empresa**: 
   - Navega a la página de registro
   - Completa el formulario con los datos de la empresa:
     - Nombre de la empresa
     - Cantidad de empleados
     - Clave de acceso (para empleados)
     - **Código de acceso a resultados** (guarde este código de forma segura)
   - El sistema calculará automáticamente la muestra representativa si aplica
   - Obtendrá dos códigos diferentes:
     - **Clave de acceso**: Para que los empleados completen los cuestionarios
     - **Código de acceso a resultados**: Para acceder a los resultados y reportes

2. **Login de Empleado**:
   - Ingresa con la clave de acceso proporcionada por la empresa
   - Selecciona el tipo de cuestionario a realizar
   - Completa el cuestionario correspondiente

3. **Completar Cuestionarios**:
   - **Acontecimientos Traumáticos**: Para todos los empleados
   - **Psicosocial Entorno**: Para empresas con 51+ empleados (72 preguntas)
   - **Psicosocial Trabajo**: Para empresas con 1-50 empleados (46 preguntas)

4. **Consulta de Resultados**:
   - Visita la sección de resultados
   - **Autenticación requerida**: Ingrese el nombre exacto de la empresa y el código de acceso a resultados
   - Visualice los reportes con gráficos y estadísticas
   - Revisa las recomendaciones basadas en los resultados
   - Descarga los reportes en formato PDF o Excel (solo cuando todos los formularios estén completos)

---

## 🔌 API Endpoints

### Empresas

- `POST /api/empresas` - Registrar nueva empresa
- `POST /api/empresas/verify-clave` - Verificar clave de empresa (para empleados)
- `POST /api/empresas/verify-acceso-resultados` - Verificar código de acceso a resultados
- `GET /api/empresas/con-formulario-completo` - Obtener empresas con formulario completo
- `GET /api/empresas/con-formulario-basico` - Obtener empresas con formulario básico

### Empleados

- `POST /api/empleados/verify` - Verificar credenciales de empleado

### Cuestionarios

- `POST /api/trauma` - Guardar respuestas de cuestionario traumático
- `POST /api/psicosocial/entorno` - Guardar respuestas de psicosocial entorno
- `POST /api/psicosocial/trabajo` - Guardar respuestas de psicosocial trabajo

### Resultados (Protegidos)

- `GET /api/psicosocial/entorno/empresa/:empresaId` - Obtener resultados de entorno (requiere autenticación)
- `GET /api/psicosocial/trabajo/empresa/:empresaId` - Obtener resultados de trabajo (requiere autenticación)

**Nota**: Los endpoints de resultados requieren headers de autenticación:
- `x-empresa-nombre`: Nombre exacto de la empresa
- `x-codigo-acceso`: Código de acceso a resultados

### Health Check

- `GET /api/health` - Verificar estado del servidor y base de datos

---

## 🔒 Seguridad

El backend implementa múltiples medidas de seguridad:

- **Helmet**: Protección de headers HTTP
- **Rate Limiting**: Protección contra ataques de fuerza bruta
- **CORS**: Configuración segura de Cross-Origin Resource Sharing
- **Validación de Entrada**: Validación de datos con express-validator
- **Logging de Seguridad**: Detección de actividades sospechosas
- **Sanitización de Datos**: Limpieza de datos de entrada
- **Límites de Tamaño**: Prevención de ataques de tamaño de petición
- **Autenticación de Resultados**: 
  - Sistema de doble autenticación (clave para empleados, código para resultados)
  - Protección de endpoints de resultados mediante middleware de autenticación
  - Validación de credenciales en cada solicitud de resultados
  - Prevención de acceso no autorizado a datos sensibles de la empresa

---

## 🤝 Contribución

Las contribuciones son bienvenidas. Para contribuir:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto está basado en la Norma Oficial Mexicana NOM-035-STPS-2018 de la Secretaría del Trabajo y Previsión Social.

---

## 📞 Contacto

Para más información sobre el proyecto, visita el repositorio en GitHub:
[https://github.com/RafaelG96/NOM-035-SST](https://github.com/RafaelG96/NOM-035-SST)

---

## 📚 Referencias

- [Norma Oficial Mexicana NOM-035-STPS-2018](https://www.gob.mx/stps/documentos/nom-035-stps-2018)
- [Secretaría del Trabajo y Previsión Social](https://www.gob.mx/stps)
