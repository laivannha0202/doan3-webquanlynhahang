# Full-Stack Profile Install Report

- **Thời gian:** 2026-06-06 11:52:22
- **Project:** /media/nha/New Volume/doan3-webquanlynhahang
- **Kit:** /home/nha/opencode-power-kit
- **Profile:** /home/nha/opencode-power-kit/profiles/node-nest-react-mysql

## Files appended

| File | Action | Notes |
|------|--------|-------|
| AGENTS.md | appended | marker idempotent |
| OPENCODE.md | appended | marker idempotent |

## Commands copied

| Source | Dest |
|--------|------|
| profiles/node-nest-react-mysql/commands/*.md | .opencode/commands/fullstack/ |

## Skills copied

| Source | Dest |
|--------|------|
| profiles/node-nest-react-mysql/skills/*/ | .agents/skills/ |

## Backup

- **Location:** /media/nha/New Volume/doan3-webquanlynhahang/.opencode-power-kit-backup-20260606-115222
- AGENTS.md + OPENCODE.md đã backup trước khi append (nếu tồn tại).

## An toàn

- KHÔNG sudo.
- KHÔNG curl|sh.
- KHÔNG tự cài dependency nặng.
- KHÔNG ghi đè file user (chỉ append với marker, hoặc skip nếu conflict).
- KHÔNG chạy trong HOME hoặc trong /home/nha/opencode-power-kit.

## Bước tiếp theo

1. Đọc phần append trong AGENTS.md / OPENCODE.md.
2. Chạy `/fullstack-scan` trong OpenCode để xem project trông thế nào.
3. Chạy `/env-doctor` và `/docker-dev-doctor` nếu có docker-compose.
4. Nếu không thích, restore từ /media/nha/New Volume/doan3-webquanlynhahang/.opencode-power-kit-backup-20260606-115222.
