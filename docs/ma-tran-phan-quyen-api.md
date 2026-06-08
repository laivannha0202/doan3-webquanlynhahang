# Ma tran phan quyen API

Cap nhat: 2026-04-11

Tai lieu nay tom tat quyen truy cap cho cac endpoint trong `backend/nest-api/src/api.controller.ts`.

## Quy uoc muc quyen

- `public`: khong can dang nhap
- `customer-own`: khach hang (actor **Khách hàng**) phai dang nhap va chi duoc thao tac du lieu cua chinh minh
- `customer-auth`: khach hang (actor **Khách hàng**) bat buoc dang nhap
- `staff`: nhan vien noi bo (actor **Nhân viên** — bao gồm phục vụ, bếp, thu ngân) hoac admin
- `admin`: chi quan tri vien (actor **Admin / Quản lý**)

## Bang endpoint

| Method | Endpoint | Muc quyen | Ghi chu |
|---|---|---:|---|
| POST | `/api/auth/register` | public | Dang ky tai khoan khach hang |
| POST | `/api/auth/login` | public | Dang nhap khach hang |
| POST | `/api/auth/internal-login` | public | Dang nhap noi bo, backend tu chan `KhachHang` |
| POST | `/api/auth/logout` | public | Dang xuat phien hien tai |
| GET | `/api/auth/me` | customer-own | Tra thong tin nguoi dung dang dang nhap |
| PUT | `/api/auth/profile` | customer-own | Cap nhat ho so cua chinh user |
| PUT | `/api/auth/doi-mat-khau` | customer-own | Doi mat khau cua chinh user |
| GET | `/api/nguoi-dung` | admin | Danh sach tai khoan he thong |
| GET | `/api/thuc-don` | public | Xem thuc don cong khai |
| POST | `/api/upload/mon-an` | admin | Upload anh mon |
| POST | `/api/thuc-don` | admin | Tao mon |
| PUT | `/api/thuc-don/:maMon` | admin | Sua mon |
| DELETE | `/api/thuc-don/:maMon` | admin | Xoa mon |
| GET | `/api/ban` | public | Danh sach ban cho luong cong khai/QR |
| POST | `/api/ban` | admin | Tao ban |
| PUT | `/api/ban/:maBan` | admin | Sua ban |
| DELETE | `/api/ban/:maBan` | admin | Xoa ban |
| PATCH | `/api/ban/:maBan/status` | staff | Cap nhat trang thai ban |
| GET | `/api/ban/:maBan/qr` | staff | Xem QR ban |
| GET | `/api/ban/:maBan/thuc-don` | public | Xem thuc don theo ban tu QR |
| POST | `/api/ban/:maBan/order` | public | Khach tai ban tao order qua QR |
| GET | `/api/ban/:maBan/order` | public | Xem order dang mo tai ban |
| POST | `/api/ban/:maBan/yeu-cau-thanh-toan` | public | Khach tai ban gui yeu cau thanh toan |
| POST | `/api/ban/:maBan/xac-nhan-thanh-toan` | staff | Thu ngan/xac nhan thanh toan tai ban |
| GET | `/api/dat-ban` | staff | Danh sach booking noi bo |
| GET | `/api/dat-ban/khach/:maKh` | customer-own | Khach chi xem lich su dat ban cua chinh minh |
| POST | `/api/dat-ban` | customer-auth | Khach dang nhap tao booking cho chinh minh (DatBan bat buoc gan MaKH); noi bo co the tao booking thay mat khach |
| GET | `/api/dat-ban/availability` | public | Kiem tra kha dung dat ban |
| PATCH | `/api/dat-ban/:maDatBan` | staff | Sua booking |
| PATCH | `/api/dat-ban/:maDatBan/status` | staff | Doi trang thai booking |
| PATCH | `/api/dat-ban/:maDatBan/assign-tables` | staff | Gan ban cho booking |
| GET | `/api/don-hang` | staff | Danh sach don hang noi bo |
| GET | `/api/don-hang/me` | customer-own | Lich su don hang cua chinh user |
| GET | `/api/don-hang/co-the-danh-gia` | customer-own | Don du dieu kien review cua chinh user |
| GET | `/api/don-hang/:maDonHang` | customer-own | Khach chi xem don cua minh; staff/admin xem noi bo |
| POST | `/api/don-hang` | public | Tao don hang theo flow hien tai |
| PATCH | `/api/don-hang/:maDonHang/status` | staff | Cap nhat trang thai don |
| POST | `/api/ma-giam-gia/validate` | public | Kiem tra voucher |
| GET | `/api/danh-gia` | public / staff | Public chi nhan review `Approved`; noi bo co token thi xem full |
| POST | `/api/danh-gia` | customer-own | Khach chi review don cua chinh minh |
| PATCH | `/api/danh-gia/:maDanhGia/duyet` | admin | Duyet / tu choi review |
| GET | `/api/diem-tich-luy/me` | customer-own | Tong quan diem tich luy cua toi |
| GET | `/api/diem-tich-luy/me/history` | customer-own | Lich su bien dong diem tich luy cua toi |

## Ghi chu trien khai

### 1. Muc `customer-own`

Backend dang kiem tra so huu du lieu theo `Authorization` header o cac nhom route:

- `dat-ban/khach/:maKh`
- `danh-gia`
- `don-hang/:maDonHang`

### 2. Muc `customer-auth`

`customer-auth` nghia la khach hang **bat buoc dang nhap** (co token JWT hop le). DatBan bat buoc gan MaKH. Khach chi xem/huy DatBan cua chinh minh.

- `POST /api/dat-ban`

### 3. Muc `staff`

`staff` nghia la:

- `NhanVien`
- hoac `Admin`

### 4. Cac endpoint van de `public-qr` (public danh cho flow QR tai ban)

Cac endpoint sau van de `public` vi dang phuc vu flow QR goi mon tai ban (khach khong can dang nhap):

- `/api/ban/:maBan/order`
- `/api/ban/:maBan/order` (GET)
- `/api/ban/:maBan/yeu-cau-thanh-toan`
- `/api/don-hang` (POST)

### 5. Luong dat ban yeu cau dang nhap

- `POST /api/dat-ban`: `customer-auth` — khach phai dang nhap, DatBan gan MaKH.
- `GET /api/dat-ban/khach/:maKh`: `customer-own` — khach chi xem dat ban cua chinh minh.
- `PATCH /api/dat-ban/:maDatBan`: `staff` — staff/xu ly dat ban.
- `PATCH /api/dat-ban/:maDatBan/status`: `staff` — doi trang thai dat ban.
- `PATCH /api/dat-ban/:maDatBan/assign-tables`: `staff` — gan ban cho dat ban.

### 6. Thanh toan tai ban

- `POST /api/ban/:maBan/xac-nhan-thanh-toan`: `staff` — thu ngan/xac nhan thanh toan.

## Khuyen nghi tiep theo

1. Tach rieng `public-qr` thanh muc quyen rieng neu muon ro nghia hon `public`.
2. Bo sung test backend cho cac truong hop `401` / `403`.
3. Dat-ban da chot la customer-auth (bat buoc dang nhap) — khong con dat ban public bang ten + SĐT.
4. Can nhac khoa hon nua `POST /api/don-hang` neu khong con can flow tao don cong khai.
