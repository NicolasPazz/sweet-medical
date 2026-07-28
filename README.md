# Sweet Medical

Plataforma web de gestión de turnos médicos con cobertura de obra social, diseñada para conectar pacientes con profesionales de la salud de forma eficiente y escalable.

## Tech Stack

| Capa | Tecnología |
|------|-----------|
| **Frontend** | React, Vite, Axios |
| **Backend** | Node.js, Express |
| **Base de Datos** | MongoDB (Mongoose ODM) |
| **Testing** | Jest (unitario e integración), Cypress (E2E) |
| **API Docs** | Swagger |
| **CI/CD** | GitHub Actions |

---

## Arquitectura del Proyecto

```
sweet-medical/
├── packages/
│   ├── backend/          # API REST (Express)
│   ├── frontend/         # UI (React + Vite)
│   └── e2e/              # Tests end-to-end (Cypress)
├── package.json          # Monorepo root (npm workspaces)
└── packages/backend/.env.example
```

### Infraestructura en Producción

| Componente | Proveedor | URL |
|-----------|-----------|-----|
| **Frontend** | Netlify | `https://sweet-medical-ui.netlify.app` |
| **Dominio personalizado** | No-IP + Netlify | `https://sweetmedical.ddns.net` |
| **Backend** | Render | `https://sweet-medical-be.onrender.com` |
| **Base de datos** | MongoDB Atlas | Cluster cloud compartido |

---

## Funcionalidades Principales

### Gestión de Turnos
- Reserva, cancelación y modificación de turnos con validaciones de plazo y estado
- Búsqueda con filtros por profesional, especialidad, práctica, sede y rango de fechas
- Visualización de cobertura y costo estimado según obra social y plan del paciente
- Preselección múltiple de turnos (módulo tipo carrito en frontend)

### Administración de Médicos
- Definición de disponibilidad horaria
- Generación batch asincrónica de turnos disponibles
- Gestión de servicios (alta, modificación, baja de especialidades/prácticas)
- Confirmación y marcado de turnos como realizados
- Consulta de historial de turnos por paciente

### Notificaciones
- Notificaciones ante reserva, confirmación, cancelación y modificación de turnos
- Recordatorio automático al día previo del turno
- Endpoints para consultar notificaciones leídas / no leídas y marcado como leídas

### Cobertura de Obra Social
- Soporte para cobertura TOTAL, PARCIAL y NO CUBIERTA según plan del paciente
- Cálculo automático del costo final al momento de la reserva

---

## Inicio Rápido (Desarrollo Local)

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

```bash
# packages/backend/.env
PORT=3001
HOST=0.0.0.0
NODE_ENV=development
API_PUBLIC_URL=http://localhost:3001
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB_NAME=sweet_medical_db
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
DURACION_SLOT_MINUTOS=30
NUM_SEMANAS_GENERAR_SLOTS=4
DEFAULT_COPAGO=0.5
MAX_RANGO_BUSQUEDA_DIAS=30
SALT_ROUNDS=10
```

Usá `packages/backend/.env.example` como referencia.

### 3. Ejecutar en desarrollo

```bash
# Backend + Frontend simultáneamente
npm run dev

# Individual
npm run dev:backend
npm run dev:frontend
```

---

## Estrategia de Versionado (Git Flow)

### Ramas principales
- **`main`** — Código estable en producción.
- **`develop`** — Integración de funcionalidades en curso.

### Ramas de soporte
- **`feature/<nombre>`** — Nuevos requerimientos. Salen de `develop` y vuelven a `develop`.
- **`bugfix/<nombre>`** — Correcciones durante integración.

### Flujo
1. Sincronizar `develop` local → `git pull origin develop`
2. Crear rama de tarea → `git checkout -b feature/mi-tarea`
3. Commits atómicos con mensajes claros
4. PR hacia `develop` con code review de otro integrante
5. Al completar el hito, PR de `develop` → `main`

---

## Pipeline CI/CD

El despliegue a producción es completamente automatizado:

```
[Código local] → [Push a GitHub] → [GitHub Actions: tests] → [Autodeploy Backend (Render)] → [Autodeploy Frontend (Netlify)]
```

- GitHub Actions ejecuta tests de integración (Jest) y E2E (Cypress) ante cada push o PR a `main`.
- Si alguna prueba falla, el pipeline se detiene y protege el entorno de producción.
- Netlify y Render despliegan automáticamente al detectar cambios en la rama principal.

---

## Documentación de la API

Disponible en Swagger al levantar el backend:

```
http://localhost:3001/api-docs
```

El spec JSON se sirve en `http://localhost:3001/swagger.json`.

---

## Despliegue

### Variables de entorno en producción

| Variable | Descripción |
|----------|-------------|
| `NODE_ENV` | `production` |
| `MONGODB_URI` | URI de conexión a MongoDB Atlas |
| `MONGODB_DB_NAME` | `sweet_medical_db` |
| `ALLOWED_ORIGINS` | Orígenes permitidos para CORS (Netlify, dominio personalizado) |
| `API_PUBLIC_URL` | URL pública del backend para Swagger |
| `VITE_API_URL` | URL del backend (inyectada en build del frontend) |

### URLs en producción

- **App:** [https://sweetmedical.ddns.net](https://sweetmedical.ddns.net)
- **API:** [https://sweet-medical-be.onrender.com](https://sweet-medical-be.onrender.com)

---

## Testing

```bash
# Tests unitarios (backend)
npm run test:backend

# Tests de integración (controladores)
npm run test:backend:integracion

# Tests E2E (frontend)
npm run test:e2e
```
