from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List
from data_service import supabase

router = APIRouter()


class AttendanceRecord(BaseModel):
    student_id: str
    class_id: str
    date: str
    status: str


class BulkAttendance(BaseModel):
    records: List[AttendanceRecord]


def next_attendance_id() -> str:
    res = supabase.table("attendance").select("id").execute()
    ids = [r["id"] for r in (res.data or []) if r.get("id", "").startswith("AT")]
    nums = []
    for aid in ids:
        try:
            nums.append(int(aid[2:]))
        except ValueError:
            pass
    return f"AT{(max(nums) + 1 if nums else 1):03d}"


@router.get("/attendance")
def get_attendance(date: Optional[str] = None, class_id: Optional[str] = None):
    q = supabase.table("attendance").select("*")
    if date:
        q = q.eq("date", date)
    if class_id:
        q = q.eq("class_id", class_id)
    return q.execute().data or []


@router.post("/attendance")
def post_attendance(bulk: BulkAttendance):
    results = []
    for record in bulk.records:
        existing = supabase.table("attendance") \
            .select("id") \
            .eq("student_id", record.student_id) \
            .eq("class_id", record.class_id) \
            .eq("date", record.date) \
            .execute()
        if existing.data:
            res = supabase.table("attendance") \
                .update({"status": record.status}) \
                .eq("id", existing.data[0]["id"]) \
                .execute()
        else:
            res = supabase.table("attendance").insert({
                "id": next_attendance_id(),
                "student_id": record.student_id,
                "class_id": record.class_id,
                "date": record.date,
                "status": record.status,
            }).execute()
        if res.data:
            results.append(res.data[0])
    return results
