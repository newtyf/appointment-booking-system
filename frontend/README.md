# Appointment Booking System - Frontend

Este proyecto es la interfaz de usuario (frontend) de un sistema de reservas de citas para **Monarca**, un salón de belleza. Está desarrollado con React y Vite, y permite a los usuarios gestionar y reservar citas de manera sencilla y eficiente.

## 🚀 ¿Qué es este proyecto?

Una SPA (Single Page Application) moderna para la gestión de reservas, con autenticación, panel de usuario y diseño responsivo usando Tailwind CSS.

## 🛠️ Tecnologías principales
- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)

## 📦 Estructura de carpetas

```
frontend/
├── public/              # Archivos estáticos (imágenes, favicon, etc.)
├── src/
│   ├── assets/          # Recursos estáticos (imágenes, íconos)
│   ├── components/      # Componentes reutilizables (Button, etc.)
│   ├── layouts/         # Layouts generales de la app
│   ├── pages/           # Páginas principales (Home, Login, etc.)
│   ├── routes/          # Definición de rutas de la app
│   ├── services/        # Lógica de conexión con APIs
│   ├── App.jsx          # Componente raíz
│   └── main.jsx         # Punto de entrada de la app
├── package.json         # Dependencias y scripts
└── vite.config.js       # Configuración de Vite
```

## ▶️ Cómo levantar el proyecto

1. Instala las dependencias:
   ```bash
   npm install
   ```
2. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```
3. Abre [http://localhost:5173](http://localhost:5173) en tu navegador.

## 🤝 Cómo contribuir

Este es un proyecto privado. Si eres parte del equipo de desarrollo, sigue estas indicaciones para contribuir:

1. Crea una nueva rama a partir de `develop` para tu feature o fix:
   ```bash
   git checkout develop
   git pull
   git checkout -b feature/mi-nueva-feature
   ```
2. Realiza tus cambios y haz commits siguiendo [Conventional Commits](https://www.conventionalcommits.org/es/v1.0.0/):
   ```bash
   git commit -m "feat: agrega botón de reserva"
   ```
3. Sube tu rama al repositorio remoto:
   ```bash
   git push origin feature/mi-nueva-feature
   ```
4. Abre un Pull Request hacia la rama `develop` y describe tus cambios.
5. Espera revisión y aprobación antes de hacer merge.

### Flujo de trabajo
- Trabajamos con [Git Flow](https://nvie.com/posts/a-successful-git-branching-model/):
  - Usa ramas `feature/`, `fix/`, `release/`, `hotfix/` según corresponda.
  - Los merges a `main` solo se hacen desde `develop` en releases.
- Los mensajes de commit deben seguir la convención [Conventional Commits](https://www.conventionalcommits.org/es/v1.0.0/).

## 📄 Convenciones

- **Git Flow:**
  - `main`: rama de producción
  - `develop`: rama de desarrollo
  - `feature/*`, `fix/*`, `release/*`, `hotfix/*`: ramas de trabajo
- **Commits:** Usa [Conventional Commits](https://www.conventionalcommits.org/es/v1.0.0/) para mensajes claros y automáticos en el changelog.

## 📬 Contacto

Para dudas o sugerencias, abre un issue o contacta al equipo de desarrollo.

---

¡Gracias por contribuir y usar Appointment Booking System!
