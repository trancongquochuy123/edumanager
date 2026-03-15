from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from data_service import supabase

router = APIRouter()


class Enrollment(BaseModel):
    student_id: str
    class_id: str
    enroll_date: Optional[str] = None


def next_enrollment_id() -> str:
    res = supabase.table("enrollments").select("id").execute()
    ids = [r["id"] for r in (res.data or []) if r.get("id", "").startswith("EN")]
    nums = []
    for eid in ids:
        try:
            nums.append(int(eid[2:]))
        except ValueError:
            pass
    return f"EN{(max(nums) + 1 if nums else 1):03d}"


@router.get("/enrollments")
def get_enrollments():
    res = supabase.table("enrollments").select("*").execute()
    return res.data or []


@router.post("/enrollments")
def add_enrollment(enrollment: Enrollment):
    # Check duplicate
    dup = supabase.table("enrollments") \
        .select("id") \
        .eq("student_id", enrollment.student_id) \
        .eq("class_id", enrollment.class_id) \
        .execute()
    if dup.data:
        raise HTTPException(status_code=400, detail="Student already enrolled in this class")

    enroll_date = enrollment.enroll_date or datetime.now().strftime("%Y-%m-%d")
    row = {
        "id": next_enrollment_id(),
        "student_id": enrollment.student_id,
        "class_id": enrollment.class_id,
        "enroll_date": enroll_date,
    }
    res = supabase.table("enrollments").insert(row).execute()

    # Init tuition if not exists
    existing = supabase.table("tuition") \
        .select("student_id") \
        .eq("student_id", enrollment.student_id) \
        .eq("class_id", enrollment.class_id) \
        .execute()
    if not existing.data:
        cls_res = supabase.table("classes").select("tuition_fee").eq("id", enrollment.class_id).execute()
        fee = cls_res.data[0]["tuition_fee"] if cls_res.data else 0
        supabase.table("tuition").insert({
            "student_id": enrollment.student_id,
            "class_id": enrollment.class_id,
            "total_fee": fee,
            "paid": 0,
            "remaining": fee,
            "status": "unpaid",
        }).execute()

    return res.data[0]


@router.delete("/enrollments/{enrollment_id}")
def delete_enrollment(enrollment_id: str):
    res = supabase.table("enrollments").delete().eq("id", enrollment_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Enrollment not found")
    return {"message": "Deleted successfully"}
