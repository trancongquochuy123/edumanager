from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from data_service import supabase

router = APIRouter()


class Student(BaseModel):
    name: str
    phone: Optional[str] = ""
    parent_phone: Optional[str] = ""
    email: Optional[str] = ""
    address: Optional[str] = ""
    status: Optional[str] = "active"


def next_student_id() -> str:
    res = supabase.table("students").select("id").execute()
    ids = [r["id"] for r in (res.data or []) if r.get("id", "").startswith("ST")]
    nums = []
    for sid in ids:
        try:
            nums.append(int(sid[2:]))
        except ValueError:
            pass
    return f"ST{(max(nums) + 1 if nums else 1):03d}"


@router.get("/students")
def get_students():
    res = supabase.table("students").select("*").order("id").execute()
    return res.data or []


@router.post("/students")
def add_student(student: Student):
    new_id = next_student_id()
    row = {
        "id": new_id,
        "name": student.name,
        "phone": student.phone,
        "parent_phone": student.parent_phone,
        "email": student.email,
        "address": student.address,
        "status": student.status,
        "created_at": datetime.now().isoformat(),
    }
    res = supabase.table("students").insert(row).execute()
    return res.data[0]


@router.put("/students/{student_id}")
def update_student(student_id: str, student: Student):
    res = supabase.table("students").update({
        "name": student.name,
        "phone": student.phone,
        "parent_phone": student.parent_phone,
        "email": student.email,
        "address": student.address,
        "status": student.status,
    }).eq("id", student_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Student not found")
    return res.data[0]


@router.delete("/students/{student_id}")
def delete_student(student_id: str):
    res = supabase.table("students").delete().eq("id", student_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Student not found")
    return {"message": "Deleted successfully"}
