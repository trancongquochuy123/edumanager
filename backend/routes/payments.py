from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from data_service import supabase

router = APIRouter()


class Payment(BaseModel):
    student_id: str
    class_id: str
    amount: float
    method: Optional[str] = "cash"
    note: Optional[str] = ""
    date: Optional[str] = None


def next_payment_id() -> str:
    res = supabase.table("payments").select("id").execute()
    ids = [r["id"] for r in (res.data or []) if r.get("id", "").startswith("PAY")]
    nums = []
    for pid in ids:
        try:
            nums.append(int(pid[3:]))
        except ValueError:
            pass
    return f"PAY{(max(nums) + 1 if nums else 1):03d}"


@router.get("/payments")
def get_payments():
    res = supabase.table("payments").select("*").order("date", desc=True).execute()
    return res.data or []


@router.post("/payments")
def add_payment(payment: Payment):
    pay_date = payment.date or datetime.now().strftime("%Y-%m-%d")
    row = {
        "id": next_payment_id(),
        "student_id": payment.student_id,
        "class_id": payment.class_id,
        "amount": payment.amount,
        "method": payment.method,
        "note": payment.note,
        "date": pay_date,
    }
    res = supabase.table("payments").insert(row).execute()

    # Update tuition
    t_res = supabase.table("tuition") \
        .select("*") \
        .eq("student_id", payment.student_id) \
        .eq("class_id", payment.class_id) \
        .execute()

    if t_res.data:
        t = t_res.data[0]
        new_paid = (t.get("paid") or 0) + payment.amount
        new_remaining = max(0, (t.get("total_fee") or 0) - new_paid)
        new_status = "paid" if new_remaining <= 0 else "partial"
        supabase.table("tuition").update({
            "paid": new_paid,
            "remaining": new_remaining,
            "status": new_status,
        }).eq("student_id", payment.student_id).eq("class_id", payment.class_id).execute()
    else:
        # Create tuition record on the fly
        cls_res = supabase.table("classes").select("tuition_fee").eq("id", payment.class_id).execute()
        total = cls_res.data[0]["tuition_fee"] if cls_res.data else 0
        remaining = max(0, total - payment.amount)
        supabase.table("tuition").insert({
            "student_id": payment.student_id,
            "class_id": payment.class_id,
            "total_fee": total,
            "paid": payment.amount,
            "remaining": remaining,
            "status": "paid" if remaining <= 0 else "partial",
        }).execute()

    return res.data[0]
