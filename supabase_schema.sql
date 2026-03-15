-- ============================================================
-- EduManager — Supabase Schema
-- Chạy toàn bộ file này trong Supabase SQL Editor
-- ============================================================

-- 1. Học sinh
create table if not exists students (
  id           text primary key,
  name         text not null,
  phone        text default '',
  parent_phone text default '',
  email        text default '',
  address      text default '',
  status       text default 'active',
  created_at   text default ''
);

-- 2. Lớp học
create table if not exists classes (
  id          text primary key,
  class_name  text not null,
  teacher     text default '',
  schedule    text default '',
  tuition_fee numeric default 0,
  start_date  text default ''
);

-- 3. Đăng ký học
create table if not exists enrollments (
  id          text primary key,
  student_id  text references students(id) on delete cascade,
  class_id    text references classes(id)  on delete cascade,
  enroll_date text default ''
);

-- 4. Điểm danh
create table if not exists attendance (
  id         text primary key,
  student_id text references students(id) on delete cascade,
  class_id   text references classes(id)  on delete cascade,
  date       text not null,
  status     text default 'present'
);

-- 5. Thanh toán
create table if not exists payments (
  id         text primary key,
  student_id text references students(id) on delete cascade,
  class_id   text references classes(id)  on delete cascade,
  amount     numeric default 0,
  method     text default 'cash',
  note       text default '',
  date       text default ''
);

-- 6. Học phí
create table if not exists tuition (
  student_id text references students(id) on delete cascade,
  class_id   text references classes(id)  on delete cascade,
  total_fee  numeric default 0,
  paid       numeric default 0,
  remaining  numeric default 0,
  status     text default 'unpaid',
  primary key (student_id, class_id)
);

-- ============================================================
-- Dữ liệu mẫu (5 học sinh + 3 lớp)
-- ============================================================

insert into students (id, name, phone, parent_phone, email, address, status, created_at) values
  ('ST001', 'Nguyễn Minh Anh',   '0901234567', '0912345678', 'minhanh@gmail.com',   '123 Lê Lợi, Q.1, TP.HCM',              'active',   '2024-01-15T08:00:00'),
  ('ST002', 'Trần Khánh Linh',   '0902345678', '0923456789', 'khanhlinh@gmail.com', '456 Nguyễn Huệ, Q.1, TP.HCM',          'active',   '2024-01-20T08:00:00'),
  ('ST003', 'Lê Hoàng Tuấn',     '0903456789', '0934567890', 'hoangtuan@gmail.com', '789 Hai Bà Trưng, Q.3, TP.HCM',         'active',   '2024-02-01T08:00:00'),
  ('ST004', 'Phạm Thị Thu Hà',   '0904567890', '0945678901', 'thuha@gmail.com',     '321 Đinh Tiên Hoàng, Q. Bình Thạnh',    'active',   '2024-02-10T08:00:00'),
  ('ST005', 'Võ Thanh Bình',     '0905678901', '0956789012', 'thanhbinh@gmail.com', '654 Cách Mạng Tháng 8, Q.10, TP.HCM',  'inactive', '2024-02-15T08:00:00')
on conflict (id) do nothing;

insert into classes (id, class_name, teacher, schedule, tuition_fee, start_date) values
  ('CL001', 'IELTS 6.0',       'Nguyễn Thị Lan',  'Thứ 2, 4, 6 - 18:00-20:00', 3000000, '2024-03-01'),
  ('CL002', 'Toán 9',           'Trần Văn Hùng',   'Thứ 3, 5, 7 - 17:00-19:00', 2000000, '2024-03-05'),
  ('CL003', 'Lập Trình Python', 'Lê Minh Khoa',    'Thứ 7, CN - 09:00-12:00',   4500000, '2024-03-10')
on conflict (id) do nothing;

-- ============================================================
-- Tắt Row Level Security (cho phép API đọc/ghi tự do)
-- Nếu muốn bảo mật hơn, hãy bật RLS và cấu hình policy riêng
-- ============================================================

alter table students   disable row level security;
alter table classes    disable row level security;
alter table enrollments disable row level security;
alter table attendance disable row level security;
alter table payments   disable row level security;
alter table tuition    disable row level security;
