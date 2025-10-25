# Appointment Booking System - AI Coding Agent Guide

## Project Overview
Fullstack appointment booking system for **Monarca** beauty salon with FastAPI backend, React frontend, MySQL database, and integrated payment processing (Culqi) and AI image editing (Replicate).

## Architecture & Critical Patterns

### Monorepo Structure
- **Backend**: `backend/` - FastAPI async application with SQLAlchemy 2.0 + aiomysql
- **Frontend**: `frontend/` - React 19 + Vite + Tailwind CSS v4 SPA
- **Deployment**: Single Dockerfile builds frontend → copies to `backend/app/static/` → serves via FastAPI

### Backend Architecture (FastAPI)

#### Dependency Injection Pattern
All services use FastAPI's dependency injection system (`app/api/dependencies/deps.py`):
```python
# Services are injected via Depends()
def get_appointment_service(db: AsyncSession = Depends(get_db_session)) -> AppointmentService:
    return AppointmentService(db)
```
- **Never instantiate services directly** - always use dependency injection
- Database sessions managed through `sessionmanager.session()` context manager

#### Role-Based Access Control (RBAC)
Four roles: `admin`, `receptionist`, `stylist`, `client`. Authorization uses `check_user_role(*roles)`:
```python
@router.get("/appointments")
async def list_appointments(
    _: Annotated[bool, Depends(check_user_role("admin", "receptionist"))]
):
```
- Auth via JWT Bearer tokens (`http_bearer_scheme`)
- Current user extracted via `get_current_user()` dependency
- Token verification in `app/core/security.py` using `python-jose`

#### Database Session Management
**Critical**: Use async context managers for ALL database operations:
```python
async with sessionmanager.session() as session:
    # Database operations here
```
- SQLAlchemy 2.0 async style with `aiomysql` driver
- Connection string: `mysql+aiomysql://...` (defined in `app/db/session.py`)
- Schema migrations via Alembic (`alembic/versions/`)

#### Service Layer Pattern
Business logic lives in `app/services/` (e.g., `appointment_service.py`, `auth_service.py`):
- Each service class takes `AsyncSession` in `__init__`
- Methods perform validation + database operations
- Example: `AppointmentService._validate_datetime()` enforces business hours (8 AM - 8 PM)

### Frontend Architecture (React)

#### Routing & Layouts
- Role-based routing in `src/pages/{Admin,Client,Receptionist,Stylist}/`
- Shared layout: `InsideLayout.jsx` with `Sidebar.jsx` component
- Authentication stored in `localStorage` (`access_token`, `user`)

#### API Communication
All API calls through `src/services/api.js` Axios instance:
```javascript
// Auto-injects Bearer token from localStorage
// Auto-redirects to /login on 401 responses
// Base URL: '/api' (proxied by backend in production)
```
- Service modules: `appointmentService.js`, `serviceService.js`, `paymentService.js`, `userService.js`
- No direct axios imports in components - use service modules

#### Payment Integration
Culqi checkout hook pattern (`hooks/useCulqiCheckout.js`):
```javascript
const { openCheckout } = useCulqiCheckout({
  onSuccess: async () => { /* handle success */ },
  onError: (error, appointmentId) => { /* handle error */ }
});
```
- Backend processes charges via `app/services/payment_service.py`
- Amounts in **centavos** (e.g., 10000 = 100.00 PEN)

### Key Domain Concepts

#### Walk-In vs Registered Clients
Appointments support both types (`app/models/appointment.py`):
```python
client_id: Optional[int]  # NULL for walk-in clients
is_walk_in: bool
client_name/phone/email: Optional[str]  # Only for walk-in
```
- Schema: `AppointmentCreate` accepts either `client_id` OR walk-in details
- Validation in `AppointmentService.create_appointment()`

#### Availability System
Complex availability logic in `AppointmentService.get_availability()`:
- Returns available time slots per stylist for a given date + service
- Considers: service duration, business hours (8 AM - 8 PM), existing bookings
- Time slot conflicts checked via overlapping datetime ranges

## Development Workflows

### Backend Setup
```bash
cd backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
# Configure .env from .env.example (MUST be in backend/ dir)
fastapi dev app/app.py  # Starts on :8000
```
**Critical**: Run from `backend/` directory so Pydantic Settings finds `.env`

### Frontend Setup
```bash
cd frontend
npm install
npm run dev  # Starts on :5173
```

### Database Migrations
```bash
cd backend
alembic revision --autogenerate -m "description"
alembic upgrade head
```

### Production Build
```bash
docker build -t appointment-system .
# Frontend → backend/app/static/ → uvicorn serves all
```

## Environment Configuration

### Required Environment Variables
- **Database**: `MYSQL_DB_*` (user, password, host, port, name)
- **Auth**: `SECRET_KEY`, `ALGORITHM` (HS256), `ACCESS_TOKEN_EXPIRE_MINUTES`
- **Payments**: `CULQI_SECRET_KEY`, `CULQI_API_URL`
- **Email**: `EMAIL_SENDER`, `EMAIL_PASSWORD`, `SMTP_SERVER`, `SMTP_PORT`
- **AI**: `REPLICATE_API_TOKEN` (for image editing in `ai.py`)
- **Runtime**: `ENVIRONMENT` (development/production), `API_PREFIX` (/api)

### Development Mode
When `ENVIRONMENT=development`, FastAPI auto-creates tables via `Base.metadata.create_all()` in lifespan event.

## Project Conventions

### Git Flow
- Main branches: `main` (production), `develop` (integration)
- Feature branches: `feature/*`, `fix/*`, `hotfix/*`, `release/*`
- Commit messages: [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`, etc.)

### Code Style
- **Backend**: FastAPI async/await, type hints via `Annotated`, Pydantic v2 schemas
- **Frontend**: Functional components, hooks, Tailwind CSS for styling
- **Naming**: Snake_case (Python), camelCase (JavaScript)

## Integration Points

### SPA Serving
Backend serves frontend SPA via catch-all route:
```python
@app.get("/{full_path:path}")
async def serve_spa_root(full_path: str):
    if full_path.startswith(settings.API_PREFIX.strip("/")):
        raise HTTPException(404)
    return FileResponse("app/static/index.html")
```
- API routes prefixed with `/api` to avoid conflicts
- Static assets mounted at `/static`

### External APIs
- **Culqi**: Payment processing (charges, tokens) via `httpx` async client
- **Replicate**: AI image editing (hairstyle visualization) in `app/api/routes/ai.py`
- **SMTP**: Email notifications via `smtplib` (appointment confirmations, reminders)

## Common Pitfalls

1. **Database sessions**: Always use `async with sessionmanager.session()`, never store sessions as attributes
2. **Bearer tokens**: Frontend uses `Bearer ${token}` format, backend expects `HTTPAuthorizationCredentials`
3. **Timezone handling**: All datetime operations use `timezone.utc` to avoid inconsistencies
4. **Service injection**: Never `ServiceClass(db)` directly in routes - use `Depends(get_service)`
5. **Walk-in validation**: Check `is_walk_in` flag to determine whether `client_id` or walk-in details are required
6. **Payment amounts**: Always in centavos/cents, never decimal amounts

## Health Check
Verify backend + database connectivity: `GET /health` (no `/api` prefix)
