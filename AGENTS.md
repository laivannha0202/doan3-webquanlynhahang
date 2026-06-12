# Scope Lock — Docs-only / Read-only

Nếu user ghi một trong các cụm sau trong prompt, scope lock có hiệu lực
**tuyệt đối** và ưu tiên hơn mọi auto-router/workflow khác:

- "chỉ kiểm tra"
- "không sửa file"
- "read-only"
- "docs-only"
- "chỉ tài liệu"
- "không code"
- "không sửa backend/frontend/database"
- "không migration"
- "không commit"
- "không push"

Khi scope lock kích hoạt, **bắt buộc**:

- KHÔNG gọi build-strong.
- KHÔNG gọi /power-build.
- KHÔNG gọi /agent-router.
- KHÔNG gọi build-slice.
- KHÔNG tự chuyển sang implementation/fix code.
- KHÔNG tạo Todo implementation (migration, constants, contracts, service, seed).
- KHÔNG sửa backend, frontend, hay database.
- KHÔNG tạo migration.
- KHÔNG commit.
- KHÔNG push.
- Nếu phát hiện code/spec lệch nhau → chỉ ghi checklist hoặc báo cáo.
- Sau khi báo cáo xong → **dừng**.

`docs/` là tài liệu tham khảo, không phải danh sách task tự động để thực thi.
Không tự đọc toàn bộ `docs/**/*.md` nếu user không chỉ định rõ.

---

# Agent Rules - OpenCode Project

## Quy tắc bắt buộc

1. **Đọc AGENTS.md và OPENCODE.md trước khi sửa bất kỳ file nào.**
2. **Trước khi sửa code phải chạy `git status`** để xác nhận trạng thái working tree.
3. **Dùng `rg`, `fd`, `ast-grep`** để tìm file/code, không dùng `grep`/`find` thủ công.
4. **Không đọc toàn bộ repo** nếu task chỉ liên quan 1 module.
5. **Không xóa file** trừ khi được yêu cầu rõ ràng.
6. **Không `git reset --hard`**, không `git push --force`, không `git clean -fd`.

## An toàn dữ liệu

7. **Không sửa `.env`, secrets, tokens, API keys.**
8. **Với MySQL/PostgreSQL:**
   - Không `DROP TABLE`, `TRUNCATE`, `DELETE` hàng loạt nếu chưa được yêu cầu rõ.
   - Luôn chạy `SELECT COUNT(*)` trước khi DELETE/UPDATE.
   - Backup database trước migration lớn.
9. **Không commit secrets**, kiểm tra `.gitignore` trước khi `git add`.

## Quy trình làm việc

10. **Sau khi sửa phải báo cáo:**
    - File đã sửa
    - Lý do sửa
    - Test đã chạy (nếu có)
11. **Ưu tiên sửa ít file nhất** có thể để hoàn thành task.
12. **Chạy lint/typecheck** sau khi sửa code (nếu project có).

## Token saving

- Ưu tiên tiết kiệm token.
- Không đọc toàn bộ repo nếu task chỉ liên quan một module.
- Trước khi mở file lớn, dùng `rg`, `fd`, `sg`, `git diff --stat`.
- Khi chạy lệnh terminal có output dài, ưu tiên dùng `rtk` nếu có.
- Không mở `node_modules`, `dist`, `build`, `coverage`, `.git`.

## Search workflow

- Tìm text/code bằng `rg`.
- Tìm file bằng `fd`.
- Tìm pattern JS/TS bằng `sg`.
- Xem thay đổi bằng `git diff --stat` trước, rồi mới xem diff chi tiết nếu cần.

## Cleanup protocol

- Cuối mỗi task phải chạy `git status --short`.
- Nếu tạo file debug/test/temp/scratch/log thì phải dọn.
- Không dùng `rm -rf`.
- Ưu tiên dùng `trash-put` thay vì `rm`.
- Trước khi xóa untracked files phải chạy `git clean -nd` để xem trước.

## Full Auto Permission Mode (v1.6.0)

**OpenCode được cấu hình với `"permission": "allow"`.** Agent có thể
tự chạy tool, sửa file, tạo file, chạy bash/test/build mà **không hỏi
lại permission**. Phù hợp máy/project cá nhân.

### Safety rules — vẫn tuân thủ

Dù `permission: allow`, agent vẫn phải tuân theo các safety rule sau
(được enforce bằng instruction, không phải bằng OpenCode permission
prompt):

1. **Không tự `git push`** nếu user chưa yêu cầu rõ.
2. **Không tự `git reset --hard`**, `git clean -fd`.
3. **Không tự xóa file lớn/hàng loạt** nếu chưa cần.
4. **Không tự sửa `.env`/secrets/token** nếu user chưa yêu cầu rõ.
5. **Trước task lớn:** chạy `git status` và báo tóm tắt.
6. **Sau task:** chạy `git diff --stat` và báo cáo bằng tiếng Việt.

### Kế thừa agent frontmatter (backward compatible)

Mỗi agent vẫn giữ `permission` frontmatter với `"*": "ask"` fallback
và safe command allowlist. Khi copy template qua project mới, agent
vẫn hoạt động an toàn — **Full Auto Permission Mode** là global
config override cho phép agent bypass permission prompt.

---

## Checkpoints

- Trước khi sửa lớn, dùng `/checkpoint` để snapshot working tree ra
  `.opk-checkpoints/<ts>.patch` + `.summary.md`.
- Không `git reset --hard` để "undo" — restore từ patch bằng `git apply`.

---

## Vietnamese Language Lock

Đây là rule bắt buộc cho toàn bộ tương tác:

1. **Mặc định trả lời user bằng tiếng Việt.** Toàn bộ kế hoạch, giải thích, báo cáo, kết luận phải bằng tiếng Việt.
2. **Giữ tiếng Anh cho:** tên lệnh, slash command, tên agent, tên file/path, code, API, package name, error log, stacktrace, keyword kỹ thuật bắt buộc.
3. **Không tự chuyển câu trả lời sang tiếng Anh.** Nếu user viết tiếng Việt thì agent trả lời tiếng Việt.
4. **Code/comment trong repo giữ nguyên.** Không dịch code comment hay tài liệu có sẵn.
5. **Nếu user yêu cầu tiếng Anh** thì mới dùng tiếng Anh.
6. **Cuối task báo cáo bằng tiếng Việt** gồm: đã làm gì, file đã sửa, kiểm tra đã chạy, rủi ro còn lại.

---

## Natural Language Auto Router (v1.3.3)

User có thể nói tự nhiên, không cần nhớ slash command. Khi user nói
một câu casual (tiếng Việt / tiếng Anh), agent tự suy ra workflow
và chạy an toàn. Slash command luôn thắng auto-router.

### 1. Bugfix intent

Triggers: "fix lỗi", "sửa bug", "nó lỗi", "chạy không được",
"doesn't work", "it's broken", "fix this".

- Reproduce hoặc inspect lỗi trước.
- Đọc đúng file liên quan.
- Tìm root cause trước khi sửa.
- Sửa nhỏ nhất có thể.
- Chạy test/build/typecheck liên quan.
- Không xóa file trừ khi user yêu cầu rõ.
- Báo cáo: file sửa, nguyên nhân, fix, verification.

### 2. Project health intent

Triggers: "kiểm tra project", "scan all", "xem ổn chưa",
"check the project", "is this healthy".

- Inspect repo structure.
- Detect stack + scripts.
- Check `git status`.
- Check lint / test / build commands.
- Báo risks + next actions cụ thể.

### 3. Feature intent

Triggers: "làm tính năng", "thêm chức năng", "code fullstack",
"build a feature", "add this feature".

- Spec-lite → plan-work → build-slice → test-proof.
- Viết acceptance criteria ngắn.
- Chia thành vertical slices nhỏ.
- Sửa đúng file cần.
- Frontend / backend / API / DB contract phải khớp.
- Verify bằng test hoặc manual proof.

### 4. Token-smart intent

Triggers: "tiết kiệm token", "đừng đọc lan man",
"làm dài không ngắt", "save tokens", "keep it short".

- Build compact repo map trước.
- Đọc đúng file cần.
- Giữ running handoff summary.
- Patch nhỏ.
- Update `AI_HANDOFF.md` sau khi xong việc lớn.

### 5. Cleanup intent

Triggers: "dọn rác", "xóa file bug tự tạo", "cleanup",
"clean up the temp files".

- Chạy `git status` trước.
- Chỉ chạm untracked temp/debug/repro files.
- Không xóa tracked file.
- Move vào `.opk-trash/` thay vì `rm`.
- Sinh `CLEANUP_REPORT.md` nếu cần.

### Default behavior

- Mơ hồ → inspect trước, hành động thận trọng.
- Cấm `git reset --hard`, `git clean -fd`, `rm -rf`, force push.
- Cấm in secret hoặc sửa `.env` secret.
- Slash command luôn thắng auto-router.

<!-- OPENCODE-POWER-KIT-MARKER: fullstack-profile-begin -->

## Scope Gate — Fullstack workflow chỉ chạy khi user yêu cầu code

Fullstack workflow DB → BE → FE (migration → entity → DTO → service → controller → FE)
**CHỈ** áp dụng khi user yêu cầu code/fix/build rõ ràng (feature, bugfix, refactor,
thêm/sửa endpoint, migration mới).

Nếu user ghi docs-only/read-only/chỉ kiểm tra/không sửa file:

- KHÔNG chạy fullstack workflow
- KHÔNG chạy migration
- KHÔNG sửa backend/frontend/database
- Nếu phát hiện code lệch spec → chỉ ghi checklist, không sửa
- Sau khi báo cáo → dừng

---

## Full-Stack Rules (NestJS + React/Vite + MySQL)

Phần này được append tự động bởi `install-fullstack-profile.sh`.
KHÔNG xóa marker nếu muốn script idempotent.

### Backend (NestJS)

- **Layer:** Controller → Service → Repository. Không truy cập DB trực tiếp từ controller.
- **DTO:** Mọi input API có DTO + `class-validator`. Không nhận `any` ở boundary.
- **Guard:** Mọi route private phải có `@UseGuards(AuthGuard)` + role guard nếu cần.
- **Error:** Dùng `HttpException` chuẩn (400/401/403/404/409/422). Không trả stack trace ra response.
- **Logger:** Dùng Nest `Logger`. Không log token / password / PII.
- **Config:** Đọc từ `ConfigService` (`@nestjs/config`), không `process.env` rải rác.
- **Async:** Promise trả về từ service phải có try/catch ở controller hoặc global filter.

### Frontend (React + Vite)

- **Component:** Functional + hooks. Mỗi file ≤ 300 dòng.
- **API client:** Centralize (axios instance hoặc fetch wrapper). Không gọi `fetch` rải rác.
- **State:** Server state → React Query / SWR. Client state → Zustand / Context. Không dùng Redux trừ khi cần.
- **Form:** React Hook Form + Zod schema. Không validate tay trong onSubmit.
- **Routing:** React Router v6+. Route private wrap trong `ProtectedRoute`.
- **Type:** `strict: true`. Không `any`. Dùng `unknown` rồi narrow.
- **Env:** Chỉ `VITE_*` được expose ra client. Không đặt secret trong `.env` frontend.

### Database (MySQL)

- **Migration:** Dùng TypeORM migrations hoặc Prisma migrate. KHÔNG sửa schema bằng sync.
- **Transaction:** Mọi write nhiều bảng phải wrap transaction.
- **Index:** FK + index cho mọi cột dùng trong WHERE/ORDER BY thường xuyên.
- **Charset:** `utf8mb4` + `utf8mb4_unicode_ci`. Không dùng `utf8` cũ.
- **Time:** Lưu `DATETIME(3)` UTC. Server set `time_zone='+00:00'`.
- **Soft delete:** Cột `deleted_at` nếu cần audit, không `DELETE` cứng trừ khi yêu cầu rõ.

### Auth / RBAC

- **Token:** JWT access (15-30 phút) + refresh (7-30 ngày). Refresh rotation.
- **Storage (FE):** Không lưu token trong `localStorage` nếu có thể — ưu tiên httpOnly cookie.
- **Password:** bcrypt/argon2, cost ≥ 10. Không MD5/SHA1.
- **Role:** RBAC theo claim `roles` hoặc `permissions` trong JWT.
- **Public route:** Whitelist rõ ràng, mặc định deny.
- **CORS:** Whitelist origin cụ thể. Không `*` khi có credential.

### Test Strategy

- **Unit:** Service / hook / util. Mock IO.
- **Integration:** Module NestJS + DB sandbox. Reset DB giữa test.
- **E2E:** Playwright cho flow user. Tách khỏi unit/integration.
- **Smoke:** Build + start + ping health endpoint.
- **CI gate:** Unit + integration chạy mỗi PR. E2E chạy nightly hoặc trước release.

### Workflow khi sửa full-stack

1. Đọc AGENTS.md + OPENCODE.md (rule backend/frontend/db ở trên).
2. Xác định layer cần sửa: FE / BE / DB / cả ba.
3. Sửa từ DB lên: migration → entity → DTO → service → controller → FE.
4. Chạy lint + typecheck + test của layer đó.
5. Chạy `/api-e2e-flow` cho happy path.
6. Commit riêng từng layer nếu có thể.

### Vietnamese Language Lock

- **Mặc định trả lời user bằng tiếng Việt.** Kế hoạch, giải thích, báo cáo đều bằng tiếng Việt.
- **Giữ tiếng Anh cho:** tên lệnh, slash command, tên agent, file/path, code, API, package name, error log, stacktrace.
- **Không tự chuyển sang tiếng Anh** khi user đang dùng tiếng Việt.
- **Code/comment giữ nguyên**, không dịch.
- **Báo cáo cuối task bằng tiếng Việt**: đã làm gì, file sửa, verify, rủi ro.

<!-- OPENCODE-POWER-KIT-MARKER: fullstack-profile-end -->
