-- TẬP LỆNH SQL THIẾT LẬP CƠ SỞ DỮ LIỆU TRÊN SUPABASE
-- Sao chép toàn bộ nội dung file này dán vào phần SQL Editor của Supabase Dashboard và nhấn Run.

-- 1. Bảng cấu hình hồ sơ người dùng (UserProfile)
CREATE TABLE IF NOT EXISTS public.profiles (
    email TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    level INTEGER DEFAULT 1,
    exp INTEGER DEFAULT 0,
    streak INTEGER DEFAULT 1,
    last_active DATE DEFAULT CURRENT_DATE,
    avatar TEXT DEFAULT '🎓',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Bảng môn học (Courses)
CREATE TABLE IF NOT EXISTS public.courses (
    id TEXT PRIMARY KEY,
    user_email TEXT REFERENCES public.profiles(email) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT,
    color TEXT,
    instructor TEXT,
    room TEXT,
    schedule JSONB DEFAULT '[]'::jsonb, -- Lưu trữ mảng lịch học dưới dạng JSONB
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Bảng nhiệm vụ (Tasks)
CREATE TABLE IF NOT EXISTS public.tasks (
    id TEXT PRIMARY KEY,
    user_email TEXT REFERENCES public.profiles(email) ON DELETE CASCADE,
    course_id TEXT REFERENCES public.courses(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    deadline DATE,
    priority TEXT CHECK (priority IN ('low', 'medium', 'high')),
    status TEXT CHECK (status IN ('pending', 'completed')) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Bảng phiên học tập (Study Sessions)
CREATE TABLE IF NOT EXISTS public.study_sessions (
    id TEXT PRIMARY KEY,
    user_email TEXT REFERENCES public.profiles(email) ON DELETE CASCADE,
    task_id TEXT REFERENCES public.tasks(id) ON DELETE SET NULL,
    course_id TEXT REFERENCES public.courses(id) ON DELETE SET NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    duration INTEGER NOT NULL, -- Số phút học
    type TEXT CHECK (type IN ('pomodoro', 'stopwatch')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. Bảng ghi nhận tâm trạng (Mood Logs)
CREATE TABLE IF NOT EXISTS public.mood_logs (
    user_email TEXT REFERENCES public.profiles(email) ON DELETE CASCADE,
    date DATE NOT NULL,
    mood TEXT CHECK (mood IN ('happy', 'neutral', 'tired', 'stressed')),
    sleep_hours NUMERIC(4, 2),
    PRIMARY KEY (user_email, date)
);

-- 6. Bảng quản lý chi tiêu (Expenses)
CREATE TABLE IF NOT EXISTS public.expenses (
    id TEXT PRIMARY KEY,
    user_email TEXT REFERENCES public.profiles(email) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL,
    category TEXT CHECK (category IN ('food', 'study', 'coffee', 'transport', 'other')),
    date DATE NOT NULL,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 7. Bảng điểm số các học phần (Gpa Modules)
CREATE TABLE IF NOT EXISTS public.gpa_modules (
    id TEXT PRIMARY KEY,
    user_email TEXT REFERENCES public.profiles(email) ON DELETE CASCADE,
    name TEXT NOT NULL,
    credits INTEGER NOT NULL,
    midterm_grade NUMERIC(4, 2),
    final_grade NUMERIC(4, 2),
    attendance_grade NUMERIC(4, 2),
    weight_attendance INTEGER NOT NULL DEFAULT 10,
    weight_midterm INTEGER NOT NULL DEFAULT 30,
    weight_final INTEGER NOT NULL DEFAULT 60,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Kích hoạt quyền Row Level Security (RLS) để bảo vệ dữ liệu giữa các người dùng
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mood_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gpa_modules ENABLE ROW LEVEL SECURITY;

-- Tạo chính sách (Policies) để cho phép người dùng chỉ đọc/ghi dữ liệu của chính mình
CREATE POLICY "Cho phép truy cập profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Cho phép truy cập courses" ON public.courses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Cho phép truy cập tasks" ON public.tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Cho phép truy cập study_sessions" ON public.study_sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Cho phép truy cập mood_logs" ON public.mood_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Cho phép truy cập expenses" ON public.expenses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Cho phép truy cập gpa_modules" ON public.gpa_modules FOR ALL USING (true) WITH CHECK (true);
