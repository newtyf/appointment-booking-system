# Appointment Booking System - Backend

## Project Setup

Este documento proporciona instrucciones para configurar y ejecutar el backend del Appointment Booking System.

### Pre-requisitos

Asegúrate de tener instalado en tu sistema:

- Python 3.10 o superior
- MySQL Server
- pip (gestor de paquetes de Python)
- Herramienta de entornos virtuales (opcional, pero recomendado)

### Instrucciones de Configuración

1. **Clona el repositorio**

   ```bash
   git clone <repository-url>
   cd appointment-booking-system/backend
   ```

2. **Crea y activa un entorno virtual** (opcional, pero recomendado)

   ```bash
   python3 -m venv venv
   source venv/bin/activate  # En macOS/Linux
   venv\Scripts\activate   # En Windows
   ```

3. **Instala las dependencias**

   ```bash
   pip install -r requirements.txt
   ```

4. **Configura las variables de entorno**

   Copia el archivo `.env.example` a `.env` y actualiza los valores según tu entorno:

   ```bash
   cp .env.example .env
   ```

   Modifica el archivo `.env` con tus credenciales de base de datos MySQL y el prefijo de la API.

5. **Ejecuta el servidor de base de datos**

   Asegúrate de que tu servidor MySQL esté en funcionamiento y accesible con las credenciales proporcionadas en el archivo `.env`.

6. **Ejecuta la aplicación**

   > **IMPORTANTE:** Debes estar ubicado en la carpeta `backend` antes de ejecutar la aplicación para que Pydantic Settings detecte correctamente el archivo `.env`.

   Inicia la aplicación FastAPI usando el siguiente comando:

   ```bash
   fastapi dev app/app.py
   ```

   La aplicación estará disponible por defecto en `http://127.0.0.1:8000`.

7. **Health Check**

   Verifica que la aplicación esté corriendo y la conexión a la base de datos sea exitosa visitando:

   ```
   http://127.0.0.1:8000/api/health
   ```

### Estructura del Proyecto

La estructura del backend es la siguiente:

```
backend/
    README.md                  # Documentación del backend
    requirements.txt           # Dependencias del proyecto
    .env                       # Variables de entorno (no versionado)
    .env.example               # Ejemplo de variables de entorno
    app/                       # Código fuente principal de la aplicación
        __init__.py            # Inicialización del módulo app
        app.py                 # Punto de entrada de la aplicación FastAPI
        api/                   # Lógica relacionada con la API
            __init__.py
            dependencies/      # Dependencias y utilidades para la API
                __init__.py
                deps.py        # Funciones de dependencias (auth, db, roles)
            routes/            # Definición de rutas/endpoints
                __init__.py
                auth.py        # Rutas de autenticación (login, registro)
                users.py       # Rutas de usuarios
        core/                  # Configuración y utilidades centrales
            __init__.py
            config.py          # Configuración general y de entorno
            security.py        # Utilidades de seguridad (hash, JWT, etc)
        db/                    # Configuración y utilidades de base de datos
            __init__.py
            base.py            # Declaración base de modelos
            session.py         # Sesión y conexión a la base de datos
        models/                # Modelos ORM
            __init__.py
            user.py            # Modelo de usuario (ahora con roles)
        schemas/               # Esquemas Pydantic (serialización/validación)
            auth.py            # Esquemas de autenticación (login, token)
            user.py            # Esquema de usuario
        services/              # Lógica de negocio y servicios
            __init__.py
            auth_service.py    # Servicio de autenticación (login, registro, JWT)
            role_service.py    # Servicio para validación de roles
            user_service.py    # Servicio relacionado a usuarios
```

### Documentación

Utilizamos SWAGGER para documentar todos los endpoints de la API:

```
http://127.0.0.1:8000/docs
```

### Notas Adicionales

- Usa el archivo `requirements.txt` para gestionar las dependencias.
- El archivo `.env` está ignorado por Git por razones de seguridad. No lo compartas públicamente.
- Para cualquier inconveniente, revisa los logs o contacta al responsable del proyecto.