Este repositorio es la base para el Trabajo Práctico de la materia **Desarrollo de Software (DDS)** de la carrera **Ingeniería en Sistemas de Información** de la **UTN FRBA**. Se trata de un **monorepo** que integra una aplicación frontend con Create React App y un backend con Express, facilitando el desarrollo y la gestión de ambos proyectos en un único entorno.

## 📦 Estructura del Proyecto

El monorepo está organizado de la siguiente manera:

```
.
├── packages/
│   ├── backend/        # Servidor Express.js
│   └── frontend/       # Aplicación React (Create React App)
├── package.json        # Configuración del monorepo (root)
├── README.md           # Este archivo
└── .env.example        # Ejemplo de configuración de variables de entorno
```

## ⚙️ Paquetes

Este monorepo utiliza **`npm workspaces`** para gestionar los diferentes paquetes.

### Backend (`packages/backend`)

El backend está construido con Express.js y utiliza las siguientes dependencias:

- **`express`**: El framework web para Node.js, utilizado para construir la API.
- **`cors`**: Middleware para Express que habilita Cross-Origin Resource Sharing (CORS), necesario para permitir que el frontend acceda al backend desde un origen diferente.
- **`dotenv`**: Carga variables de entorno desde un archivo `.env` en `process.env`. Es crucial para configurar el puerto del servidor y los orígenes permitidos.

La idea es dar lo mínimo para levantar el servidor, y que durante el desarrollo del TP se vayan agregando las dependencias necesarias.

### Frontend (`packages/frontend`)

El frontend es una aplicación de React generada con Create React App.

## 🚀 Inicio Rápido

Seguí estos pasos para poner en marcha el proyecto:

### 1\. Instalación de Dependencias

Desde la raíz del monorepo, ejecutá:

```bash
npm install
```

Esto instalará todas las dependencias para la raíz y para los paquetes `frontend` y `backend`.

### 2\. Configuración de Variables de Entorno

Crea un archivo `.env` en el directorio `packages/backend`. Puedes usar el archivo `.env.example` como plantilla.

```
# packages/backend/.env
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
SERVER_PORT=3001
```

- **`ALLOWED_ORIGINS`**: Define los orígenes permitidos para las solicitudes CORS. Asegurate de incluir la URL donde se ejecuta tu frontend (por defecto, `http://localhost:3000` para Create React App). Cuando se haga el despliegue en nube acá se deberá incluir la URL donde se desplegó el frontend.
- **`SERVER_PORT`**: El puerto en el que se ejecutará el servidor backend (ej. `8000`).

### 3\. Ejecución de la Aplicación

Podés iniciar el frontend y el backend por separado o ambos a la vez:

#### Ejecutar el Backend

```bash
npm run start:backend
```

Para el desarrollo con reinicio automático:

```bash
npm run dev:backend
```

#### Ejecutar el Frontend

```bash
npm run start:frontend
```

#### Ejecutar Ambos (Desarrollo)

Para iniciar el backend en modo `dev` y el frontend simultáneamente, usá:

```bash
npm run start:dev
```

# Estrategia de Control de Versiones (Git Flow)

## 1. Ramas Principales

* **`main`**: Contiene el código estable, funcional y testeado. Solo se actualiza al finalizar cada iteración. Es la rama que finalmente se desplegará en producción.
* **`develop`**: Es la rama de integración principal. Todo el código nuevo de las funcionalidades en curso converge acá.

## 2. Ramas de Soporte

* **`feature/<nombre-tarea>`**: Utilizadas para desarrollar cada nuevo requerimiento (ej. `feature/modelo-dominio`, `feature/health-check`).
  * **Salen de:** `develop`
  * **Vuelven a:** `develop`
* **`bugfix/<nombre-error>`**: Utilizadas para resolver errores puntuales detectados durante la integración en `develop`.

## 3. Flujo de Trabajo

1. **Sincronización:** El desarrollador se posiciona en `develop` y sincroniza su repositorio local (`git pull origin develop`).
2. **Creación de Rama:** Se crea una nueva rama para la tarea asignada (`git checkout -b feature/modelo-objetos`).
3. **Desarrollo y Commits:** Se escribe el código realizando commits atómicos y con mensajes claros.
4. **Pull Request (PR):** Al finalizar la tarea, se sube la rama y se abre un PR hacia `develop`.
5. **Code Review y Merge:** Otro integrante del equipo revisa el PR. Si todo está correcto, se aprueba y se integra (merge) el código a `develop`.
6. **Release:** Al finalizar todos los requerimientos de la iteración actual, se realiza un PR desde `develop` hacia `main` para marcar la versión entregable.