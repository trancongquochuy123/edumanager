from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes import students, classes, enrollments, attendance, payments, tuition, dashboard

app = FastAPI(title="EduManager API", version="1.0.0")

# CORS — allow all origins (Vercel + localhost)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
)

# Routers
app.include_router(students.router,    tags=["Students"])
app.include_router(classes.router,     tags=["Classes"])
app.include_router(enrollments.router, tags=["Enrollments"])
app.include_router(attendance.router,  tags=["Attendance"])
app.include_router(payments.router,    tags=["Payments"])
app.include_router(tuition.router,     tags=["Tuition"])
app.include_router(dashboard.router,   tags=["Dashboard"])


@app.get("/")
def root():
    return {"message": "EduManager API is running", "docs": "/docs"}


@app.get("/health")
def health():
    return {"status": "ok"}