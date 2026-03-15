from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path

from routes import students, classes, enrollments, attendance, payments, tuition, dashboard

app = FastAPI(title="EduManager API", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(students.router, tags=["Students"])
app.include_router(classes.router, tags=["Classes"])
app.include_router(enrollments.router, tags=["Enrollments"])
app.include_router(attendance.router, tags=["Attendance"])
app.include_router(payments.router, tags=["Payments"])
app.include_router(tuition.router, tags=["Tuition"])
app.include_router(dashboard.router, tags=["Dashboard"])

# Mount data folder as static (optional, for debugging)
data_dir = Path(__file__).parent.parent / "data"
data_dir.mkdir(exist_ok=True)


@app.get("/")
def root():
    return {"message": "EduManager API is running", "docs": "/docs"}
