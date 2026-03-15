from fastapi import APIRouter
from data_service import supabase

router = APIRouter()


@router.get("/tuition")
def get_tuition():
    tuition = supabase.table("tuition").select("*").execute().data or []
    students = {s["id"]: s for s in (supabase.table("students").select("id,name").execute().data or [])}
    classes  = {c["id"]: c for c in (supabase.table("classes").select("id,class_name").execute().data or [])}
    return [
        {**t,
         "student_name": students.get(t["student_id"], {}).get("name", "N/A"),
         "class_name":   classes.get(t["class_id"],   {}).get("class_name", "N/A")}
        for t in tuition
    ]


@router.get("/tuition/{student_id}")
def get_tuition_by_student(student_id: str):
    tuition  = supabase.table("tuition").select("*").eq("student_id", student_id).execute().data or []
    classes  = {c["id"]: c for c in (supabase.table("classes").select("id,class_name").execute().data or [])}
    return [
        {**t, "class_name": classes.get(t["class_id"], {}).get("class_name", "N/A")}
        for t in tuition
    ]
