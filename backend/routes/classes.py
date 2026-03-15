from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from data_service import supabase

router = APIRouter()


class Class(BaseModel):
    class_name: str
    teacher: Optional[str] = ""
    schedule: Optional[str] = ""
    tuition_fee: Optional[float] = 0
    start_date: Optional[str] = ""


def next_class_id() -> str:
    res = supabase.table("classes").select("id").execute()
    ids = [r["id"] for r in (res.data or []) if r.get("id", "").startswith("CL")]
    nums = []
    for cid in ids:
        try:
            nums.append(int(cid[2:]))
        except ValueError:
            pass
    return f"CL{(max(nums) + 1 if nums else 1):03d}"


@router.get("/classes")
def get_classes():
    res = supabase.table("classes").select("*").order("id").execute()
    return res.data or []


@router.post("/classes")
def add_class(cls: Class):
    row = {
        "id": next_class_id(),
        "class_name": cls.class_name,
        "teacher": cls.teacher,
        "schedule": cls.schedule,
        "tuition_fee": cls.tuition_fee,
        "start_date": cls.start_date,
    }
    res = supabase.table("classes").insert(row).execute()
    return res.data[0]


@router.put("/classes/{class_id}")
def update_class(class_id: str, cls: Class):
    res = supabase.table("classes").update({
        "class_name": cls.class_name,
        "teacher": cls.teacher,
        "schedule": cls.schedule,
        "tuition_fee": cls.tuition_fee,
        "start_date": cls.start_date,
    }).eq("id", class_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Class not found")
    return res.data[0]


@router.delete("/classes/{class_id}")
def delete_class(class_id: str):
    res = supabase.table("classes").delete().eq("id", class_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Class not found")
    return {"message": "Deleted successfully"}
