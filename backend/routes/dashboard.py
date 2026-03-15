from fastapi import APIRouter
from datetime import datetime, date
from data_service import supabase

router = APIRouter()


@router.get("/dashboard/summary")
def get_dashboard_summary():
    students   = supabase.table("students").select("*").execute().data or []
    attendance = supabase.table("attendance").select("*").execute().data or []
    payments   = supabase.table("payments").select("*").execute().data or []
    tuition    = supabase.table("tuition").select("*").execute().data or []
    classes    = supabase.table("classes").select("*").execute().data or []

    student_map = {s["id"]: s.get("name", "") for s in students}
    class_map   = {c["id"]: c.get("class_name", "") for c in classes}

    total_students = len([s for s in students if s.get("status") == "active"])

    today = date.today().isoformat()
    absent_today = len([a for a in attendance if a.get("date") == today and a.get("status") == "absent"])

    unpaid_count = len([t for t in tuition if t.get("status") in ("unpaid", "partial")])

    now = datetime.now()
    current_month = f"{now.year}-{now.month:02d}"
    revenue_this_month = sum(
        p.get("amount", 0) for p in payments
        if p.get("date", "").startswith(current_month)
    )

    # Recent payments (last 5)
    sorted_payments = sorted(payments, key=lambda p: p.get("date", ""), reverse=True)
    recent_payments = [
        {**p,
         "student_name": student_map.get(p.get("student_id", ""), "N/A"),
         "class_name":   class_map.get(p.get("class_id", ""), "N/A")}
        for p in sorted_payments[:5]
    ]

    # Recent attendance (last 5)
    sorted_att = sorted(attendance, key=lambda a: a.get("date", ""), reverse=True)
    recent_attendance = [
        {**a,
         "student_name": student_map.get(a.get("student_id", ""), "N/A"),
         "class_name":   class_map.get(a.get("class_id", ""), "N/A")}
        for a in sorted_att[:5]
    ]

    # Monthly revenue — last 6 months
    monthly_revenue = {}
    for i in range(5, -1, -1):
        m = now.month - i
        y = now.year
        while m <= 0:
            m += 12; y -= 1
        monthly_revenue[f"{y}-{m:02d}"] = 0
    for p in payments:
        key = p.get("date", "")[:7]
        if key in monthly_revenue:
            monthly_revenue[key] += p.get("amount", 0)
    monthly_revenue_list = [{"month": k, "revenue": v} for k, v in monthly_revenue.items()]

    attendance_stats = {
        "present": len([a for a in attendance if a.get("status") == "present"]),
        "absent":  len([a for a in attendance if a.get("status") == "absent"]),
        "late":    len([a for a in attendance if a.get("status") == "late"]),
    }

    return {
        "total_students": total_students,
        "absent_today": absent_today,
        "unpaid_count": unpaid_count,
        "revenue_this_month": revenue_this_month,
        "recent_payments": recent_payments,
        "recent_attendance": recent_attendance,
        "monthly_revenue": monthly_revenue_list,
        "attendance_stats": attendance_stats,
    }
