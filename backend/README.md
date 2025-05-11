# Appointment Booking System - Backend

## Project Setup

This document provides instructions to set up and run the backend of the Appointment Booking System.

### Prerequisites

Ensure you have the following installed on your system:

- Python 3.10 or higher
- MySQL Server
- pip (Python package manager)
- Virtual environment tool (optional but recommended)

### Setup Instructions

1. **Clone the Repository**

   Clone the repository to your local machine:

   ```bash
   git clone <repository-url>
   cd appointment-booking-system/backend
   ```

2. **Set Up a Virtual Environment** (Optional but recommended)

   Create and activate a virtual environment:

   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On macOS/Linux
   venv\Scripts\activate   # On Windows
   ```

3. **Install Dependencies**

   Install the required Python packages:

   ```bash
   pip install -r requirements.txt
   ```

4. **Configure Environment Variables**

   Copy the `.env.example` file to `.env` and update the values as needed:

   ```bash
   cp .env.example .env
   ```

   Update the `.env` file with your MySQL database credentials and API prefix.

5. **Run the Database Server**

   Ensure your MySQL server is running and accessible with the credentials provided in the `.env` file.

6. **Run the Application**

   Start the FastAPI application using the `fastapi dev` command, which integrates Uvicorn under the hood:

   ```bash
   fastapi dev app.py
   ```

   The application will be available at `http://127.0.0.1:8000` by default.

7. **Health Check**

   Verify the application is running and the database connection is healthy by visiting the health check endpoint:

   ```
   http://127.0.0.1:8000/api/health
   ```

### Directory Structure

The backend directory structure is as follows:

```
backend/
    app.py
    requirements.txt
    .env
    .env.example
    config/ -- all configurations (databases, loggers,  HTTP libraries, etc...)
        db.py
    models/ -- ORM Models
    routes/
        auth.py
    schemas/ -- Database Schemas
```

### Documentation

We use SWAGGER to document all api endpoints

```
http://127.0.0.1:8000/docs
```

### Additional Notes

- Use the `requirements.txt` file to manage dependencies.
- The `.env` file is ignored by Git for security reasons. Do not share it publicly.
- For any issues, refer to the logs or contact the project maintainer.