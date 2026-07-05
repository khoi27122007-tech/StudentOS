# Project sprints mapping

Dưới đây là bản đồ Sprint → danh sách issue (title/label) để bạn copy vào Project columns (Backlog, Sprint 0..4, In Progress, Review, QA, Done).

Hướng dẫn nhanh để sync với Project (UI):
1. Tạo các column trên Project: Backlog, Sprint 0, Sprint 1, Sprint 2, Sprint 3, Sprint 4, In Progress, Review, QA, Done.
2. Dùng web UI kéo & thả các issue bên dưới vào column tương ứng.
3. Nếu muốn tự động hoá, mình có thể cung cấp script gh/GraphQL để thêm issue vào Project nếu bạn chạy trên máy có `gh` và quyền truy cập repository.

---

Sprint 0 — Setup & API Contracts
- Sprint 0 — Setup & API Contracts (epic)
- Sprint 0: Frontend - Init Vite + TS and basic layout
- Sprint 0: Backend - Init services and OpenAPI
- Sprint 0: Infra - Docker Compose and Basic CI

Sprint 1 — Auth + Schedule core
- Sprint 1 — Auth + Schedule core APIs + Frontend integration (epic)
- Sprint 1: Backend - Auth Service (register/login, JWT)
- Sprint 1: Backend - Schedule Service (CRUD)
- Sprint 1: Frontend - Login/Register and Schedule UI
- Sprint 1: API Gateway routes & CORS

Sprint 2 — Pomodoro, Notifications, UI polishing
- Sprint 2 — Pomodoro, Notifications, UI polishing (epic)
- Sprint 2: Frontend - Pomodoro UI component
- Sprint 2: Backend - Pomodoro service (session history)
- Sprint 2: Backend - Notification service (queue + SSE/WS)
- Sprint 2: Frontend - Integrate notifications (SSE/WS)
- Sprint 2: Infra - Redis queue and worker (dev)

Sprint 3 — Analytics, Hardening, Staging
- Sprint 3 — Analytics, Hardening, Staging (epic)
- Sprint 3: Backend - Analytics service (GPA calculator)
- Sprint 3: Backend - Stress prediction MVP
- Sprint 3: Frontend - Analytics pages & charts
- Sprint 3: Infra - CI/CD staging deploy
- Sprint 3: Backend - Security hardening

Sprint 4 — Polish, E2E, Prod deploy
- Sprint 4 — Polish, E2E, Prod deploy (epic)
- Sprint 4: Frontend - E2E tests
- Sprint 4: Backend - Performance tuning (schedule-service)
- Sprint 4: Infra - Production deploy & monitoring
- Sprint 4: Frontend - Accessibility and UI polish

Backlog
- Backlog: Localization (vi/en)
- Backlog: Email / Push notifications integration
- Backlog: User profile & settings
- Backlog: Calendar sync (Google Calendar)
- Backlog: Mobile PWA support

---

Nếu bạn muốn mình tự động hoá thêm (thêm issue vào columns), cho mình biết: 1) bạn có thể cấp quyền tạm thời để chạy gh on your machine, hoặc 2) bạn sẽ tạo columns tay và mình sẽ gửi danh sách issue numbers và một script nhỏ để bạn chạy. Mình có thể cung cấp script gh/GraphQL ngay.
