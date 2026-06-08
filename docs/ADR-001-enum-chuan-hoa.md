# ADR-001: Chuan hoa ENUM trang thai nghiep vu sang tieng Viet

## Quyet dinh

Toan bo **5 cot trang thai nghiep vu loi** trong database se dung **1 bo gia tri tieng Viet** duy nhat.

Cac ENUM ky thuat/danh muc khac (`VaiTro`, `GioiTinh`, `TinhTrang`, `LoaiGiam`, `LoaiMa`, `PhamVi`, `NguonTao`, ...) **khong doi** vi khong anh huong nghiep vu loi.

## Pham vi ap dung

| Bang | Cot | Gia tri Viet chinh thuc |
|---|---|---|
| `Ban` | `TrangThai` | `TRONG`, `DA_DAT`, `CO_KHACH`, `DANG_DON`, `BAO_TRI` |
| `DatBan` | `TrangThai` | `CHO_XAC_NHAN`, `DA_XAC_NHAN`, `DA_DEN`, `HOAN_THANH`, `DA_HUY`, `KHONG_DEN`, `HET_HAN` |
| `DonHang` | `TrangThai` | `CHO_XU_LY`, `DA_XAC_NHAN`, `DANG_CHE_BIEN`, `SAN_SANG`, `DA_PHUC_VU`, `HOAN_THANH`, `DA_HUY`, `DA_THANH_TOAN`, `DA_HOAN_TIEN` |
| `ChiTietDonHang` | `TrangThai` | `CHO_CHE_BIEN`, `DANG_CHE_BIEN`, `SAN_SANG`, `DA_PHUC_VU`, `HOAN_THANH`, `DA_HUY` |
| `ThanhToan` | `TrangThai` | `CHO_THANH_TOAN`, `THANH_CONG`, `THAT_BAI`, `DA_HOAN_TIEN` |

## Ly do

- **Q1 da chot** dung **Viet** cho toan bo enum nghiep vu loi (xem `docs/AUDIT_NGHIEP_VU.md` Muc 0 + Muc 4).
- Hien tai ENUM dang **tron lan Anh + Viet** (vi du `DatBan.TrangThai` co 23 gia tri tron ca 2 he), gay dual state machine, so sanh sai, filter sai.

## Cach trien khai

1. Tao migration V2 (`database/migrations/V2__chuan_hoa_trang_thai_enum_viet.sql`) doi 5 cot ENEM sang gia tri Viet.
2. Cap nhat `backend/nest-api/src/common/constants.ts`: bo gia tri Anh, giu nguyen key object.
3. Cap nhat `frontend/src/features/donHang/contracts.js`: bo gia tri Anh, giu key `TRANG_THAI_DON_HANG`.
4. Ra soat toan bo seed (`database/mysql_seed_dev.sql`) va code (controller, service, FE) de dong bo.

## Rui ro

- **Du lieu cu**: neu DB da co gia tri Anh (vi du `Pending`, `Completed`), migration phai `ALTER ... UPDATE` chuyen sang Viet truoc khi doi ENUM definition.
- **Breaking API**: FE gui gia tri cu (tieng Anh) se bi BE/DB tu choi sau migration. Can dam bao FE gui dung Viet.
- **Seed mismatch**: seed hien tai dung tieng Anh cho nhieu ban ghi — can cap nhat seed sau migration.

## Ma nguon lien quan

- `docs/AUDIT_NGHIEP_VU.md` — Muc 0 (Q1), Muc 3 (state machine), Muc 4 Cau 1
- `backend/nest-api/src/common/constants.ts` — `TRANG_THAI_DAT_BAN_KET_THUC` (dong 135) hien dang gop Anh+Viet
- `frontend/src/features/donHang/contracts.js` — `TRANG_THAI_DON_HANG` hoan toan tieng Anh
- `database/mysql_init_schema.sql` — dong 58, 141, 163, 189, 232
