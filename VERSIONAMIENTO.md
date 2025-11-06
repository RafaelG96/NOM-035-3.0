# Guía de Versionamiento - Sistema NOM-035

Esta guía explica cómo gestionar versiones y cambios en el proyecto siguiendo buenas prácticas.

## 📋 Tabla de Contenidos

1. [Estrategia de Versionamiento](#estrategia-de-versionamiento)
2. [Estructura de Ramas](#estructura-de-ramas)
3. [Flujo de Trabajo](#flujo-de-trabajo)
4. [Crear un Release](#crear-un-release)
5. [Etiquetas (Tags)](#etiquetas-tags)
6. [Convenciones de Commits](#convenciones-de-commits)

---

## 🎯 Estrategia de Versionamiento

Utilizamos **Semantic Versioning (SemVer)** con el formato: `MAJOR.MINOR.PATCH`

- **MAJOR** (1.0.0): Cambios incompatibles que rompen la API
- **MINOR** (0.1.0): Nuevas funcionalidades compatibles con versiones anteriores
- **PATCH** (0.0.1): Correcciones de errores compatibles

### Ejemplo de Versiones

```
v1.0.0  → Lanzamiento inicial
v1.1.0  → Nueva funcionalidad (compatible)
v1.1.1  → Corrección de bug
v1.2.0  → Más funcionalidades
v2.0.0  → Cambio mayor (rompe compatibilidad)
```

---

## 🌳 Estructura de Ramas

### Ramas Principales

#### `main` / `master`
- **Propósito**: Código de producción estable
- **Protección**: Solo merges desde `develop` o `release/*`
- **Versión**: Siempre refleja la última versión estable

#### `develop`
- **Propósito**: Código en desarrollo, integración continua
- **Origen**: De aquí salen las ramas de features
- **Destino**: Integración de features completadas

### Ramas de Soporte

#### `feature/*` - Nuevas Funcionalidades
```bash
# Crear rama de feature
git checkout -b feature/nueva-funcionalidad develop

# Ejemplos:
feature/login-mejorado
feature/exportar-pdf
feature/notificaciones
```

**Reglas:**
- Se crean desde `develop`
- Se hacen merge a `develop` cuando están completas
- Nomenclatura: `feature/nombre-descriptivo`

#### `fix/*` - Corrección de Errores
```bash
# Crear rama de fix
git checkout -b fix/correccion-bug develop

# Ejemplos:
fix/error-calculadora-puntajes
fix/validacion-formulario
fix/seguridad-autenticacion
```

**Reglas:**
- Se crean desde `develop` o `main` (si es crítico)
- Se hacen merge a `develop` y `main` si es crítico
- Nomenclatura: `fix/descripcion-bug`

#### `release/*` - Preparación de Release
```bash
# Crear rama de release
git checkout -b release/v1.1.0 develop

# Ejemplos:
release/v1.0.0
release/v1.2.0
```

**Reglas:**
- Se crean desde `develop` cuando está listo para release
- Solo correcciones de bugs en esta rama
- Se hace merge a `main` y `develop` al finalizar
- Etiquetar con versión: `v1.1.0`

#### `hotfix/*` - Correcciones Urgentes
```bash
# Crear rama de hotfix
git checkout -b hotfix/correccion-critica main

# Ejemplos:
hotfix/seguridad-critica
hotfix/error-produccion
```

**Reglas:**
- Se crean desde `main` (producción)
- Correcciones urgentes que no pueden esperar
- Se hace merge a `main` y `develop` inmediatamente
- Incrementa PATCH version: `v1.0.1`

---

## 🔄 Flujo de Trabajo

### Flujo Normal (Feature Development)

```
1. Crear feature branch
   git checkout -b feature/nueva-funcionalidad develop

2. Desarrollar y hacer commits
   git add .
   git commit -m "feat: agregar nueva funcionalidad"

3. Hacer merge a develop
   git checkout develop
   git merge feature/nueva-funcionalidad
   git branch -d feature/nueva-funcionalidad

4. Cuando develop esté listo, crear release
   git checkout -b release/v1.1.0 develop
   
5. Finalizar release y mergear a main
   git checkout main
   git merge release/v1.1.0
   git tag -a v1.1.0 -m "Release v1.1.0"
   git checkout develop
   git merge release/v1.1.0
   git branch -d release/v1.1.0
```

### Flujo de Hotfix (Urgente)

```
1. Crear hotfix desde main
   git checkout -b hotfix/correccion-critica main

2. Corregir y commitear
   git commit -m "fix: corrección crítica"

3. Mergear a main y crear tag
   git checkout main
   git merge hotfix/correccion-critica
   git tag -a v1.0.1 -m "Hotfix v1.0.1"

4. Mergear también a develop
   git checkout develop
   git merge hotfix/correccion-critica
   git branch -d hotfix/correccion-critica
```

---

## 🚀 Crear un Release

### Paso 1: Preparar la rama de release

```bash
# Asegúrate de estar en develop y actualizado
git checkout develop
git pull origin develop

# Crear rama de release
git checkout -b release/v1.1.0
```

### Paso 2: Actualizar versiones

Actualiza las versiones en:
- `Backend/package.json`
- `frontend-react/package.json`
- `CHANGELOG.md` (mover cambios de [Unreleased] a la nueva versión)

### Paso 3: Hacer merge a main

```bash
# Mergear a main
git checkout main
git merge release/v1.1.0

# Crear tag
git tag -a v1.1.0 -m "Release v1.1.0: Descripción del release"
git push origin main --tags

# Mergear también a develop
git checkout develop
git merge release/v1.1.0
git push origin develop

# Eliminar rama de release
git branch -d release/v1.1.0
```

### Paso 4: Publicar release

Si usas GitHub/GitLab, crea un release desde la interfaz web asociado al tag.

---

## 🏷️ Etiquetas (Tags)

### Crear un Tag

```bash
# Tag anotado (recomendado)
git tag -a v1.0.0 -m "Release v1.0.0: Lanzamiento inicial"

# Tag simple (alternativa)
git tag v1.0.0

# Ver tags
git tag

# Ver información de un tag
git show v1.0.0

# Subir tags al remoto
git push origin v1.0.0
# O todos los tags
git push origin --tags
```

### Eliminar un Tag

```bash
# Eliminar localmente
git tag -d v1.0.0

# Eliminar del remoto
git push origin --delete v1.0.0
```

---

## 📝 Convenciones de Commits

Utilizamos el formato **Conventional Commits** para mantener un historial claro.

### Formato

```
<tipo>(<ámbito>): <descripción corta>

[descripción larga opcional]

[pie de página opcional]
```

### Tipos de Commits

- `feat`: Nueva funcionalidad
- `fix`: Corrección de error
- `docs`: Cambios en documentación
- `style`: Cambios de formato (no afectan código)
- `refactor`: Refactorización de código
- `perf`: Mejoras de rendimiento
- `test`: Agregar o corregir tests
- `chore`: Cambios en build, dependencias, etc.
- `ci`: Cambios en CI/CD
- `security`: Correcciones de seguridad

### Ámbitos (Opcional)

- `backend`: Cambios en el backend
- `frontend`: Cambios en el frontend
- `api`: Cambios en la API
- `db`: Cambios en base de datos
- `auth`: Cambios en autenticación
- `ui`: Cambios en interfaz de usuario

### Ejemplos

```bash
# Nueva funcionalidad
git commit -m "feat(frontend): agregar formulario de eventos traumáticos"

# Corrección de bug
git commit -m "fix(backend): corregir cálculo de puntajes en entorno"

# Documentación
git commit -m "docs: agregar guía de versionamiento"

# Refactorización
git commit -m "refactor(api): reorganizar endpoints de psicosocial"

# Breaking change
git commit -m "feat(api)!: cambiar estructura de respuesta de resultados

BREAKING CHANGE: La respuesta ahora incluye nivelRiesgo en lugar de score"
```

---

## 📊 Matriz de Decisión para Versiones

| Tipo de Cambio | Incremento | Ejemplo |
|----------------|------------|---------|
| Nueva funcionalidad compatible | MINOR | 1.0.0 → 1.1.0 |
| Corrección de bug | PATCH | 1.1.0 → 1.1.1 |
| Cambio incompatible | MAJOR | 1.1.0 → 2.0.0 |
| Deprecación | MINOR | 1.1.0 → 1.2.0 |
| Corrección de seguridad | PATCH o MAJOR | Depende de la severidad |

---

## 🔧 Scripts Útiles

### Script para crear release

Puedes crear un script `scripts/create-release.sh`:

```bash
#!/bin/bash
VERSION=$1

if [ -z "$VERSION" ]; then
    echo "Uso: ./scripts/create-release.sh v1.1.0"
    exit 1
fi

git checkout develop
git pull origin develop
git checkout -b release/$VERSION

# Actualizar versiones en package.json (puedes usar sed o jq)
# Actualizar CHANGELOG.md

echo "Release $VERSION preparado. Revisa los cambios y haz merge a main."
```

### Script para crear hotfix

```bash
#!/bin/bash
VERSION=$1

if [ -z "$VERSION" ]; then
    echo "Uso: ./scripts/create-hotfix.sh v1.0.1"
    exit 1
fi

git checkout main
git pull origin main
git checkout -b hotfix/$VERSION

echo "Hotfix $VERSION creado. Realiza las correcciones."
```

---

## 📋 Checklist para Releases

Antes de crear un release, verifica:

- [ ] Todas las features están completas y probadas
- [ ] Tests pasan correctamente
- [ ] CHANGELOG.md actualizado
- [ ] Versiones actualizadas en package.json
- [ ] Documentación actualizada
- [ ] Código revisado (code review)
- [ ] No hay conflictos en develop
- [ ] Tag creado correctamente

---

## 🚨 Mejores Prácticas

1. **Nunca commitees directamente a `main`** (excepto hotfixes)
2. **Usa nombres descriptivos** para ramas y commits
3. **Actualiza CHANGELOG.md** con cada cambio significativo
4. **Haz tags anotados** con mensajes descriptivos
5. **Mantén `main` estable** y deployable en todo momento
6. **Documenta cambios breaking** claramente
7. **Comunica releases** al equipo antes de publicar

---

## 📚 Recursos Adicionales

- [Semantic Versioning](https://semver.org/lang/es/)
- [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Git Flow](https://nvie.com/posts/a-successful-git-branching-model/)

---

**Última actualización**: Diciembre 2024

