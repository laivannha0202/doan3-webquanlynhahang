# QUY TẮC FRONTEND HIỆN TẠI

## 1. Mục tiêu

Phần frontend của project hiện tại được viết bằng React và chạy bằng Vite.

Mục tiêu:

- xây dựng giao diện quản lý nhà hàng rõ ràng, dễ dùng
- bám sát ngữ cảnh nhà hàng tại Việt Nam
- giữ code dễ đọc, dễ bảo trì, phù hợp đồ án
- tương thích với backend NestJS đang dùng thật trong `backend/nest-api`

## 2. Hiện trạng repo

Trong repo hiện tại:

- frontend chính nằm trong `frontend/`
- mã nguồn giao diện chính nằm trong `frontend/src/`
- backend đang dùng cho phát triển và kiểm thử hiện tại nằm trong `backend/nest-api`

Khi sửa frontend, cần ưu tiên hiểu đúng hiện trạng này trước khi thay đổi code.

## 3. Công nghệ sử dụng

- React
- JavaScript và JSX
- Vite
- React Router theo cấu trúc dự án hiện có
- CSS theo cách tổ chức hiện tại của repo

Không tự ý:

- đổi sang framework khác
- đổi toàn bộ sang TypeScript nếu chưa được yêu cầu
- thêm thư viện mới nếu chưa thật sự cần

## 4. Quy tắc ngôn ngữ trong code

- Ưu tiên tiếng Việt không dấu cho tên mới nếu phù hợp với style hiện tại.
- Không dùng các tên tiếng Anh chung chung như `data`, `item`, `value`, `handleSubmit` nếu có thể đặt tên rõ nghĩa theo nghiệp vụ.
- Nếu file hiện tại đang theo convention tiếng Anh thì giữ nhất quán trong chính file đó, không đổi hàng loạt.
- Nội dung hiển thị ra giao diện phải là tiếng Việt tự nhiên, dễ hiểu.

## 5. Cấu trúc cần tôn trọng

Ưu tiên giữ cấu trúc hiện có của frontend, ví dụ:

```text
frontend/src/
  components/
  pages/
  layouts/
  features/
  context/
  hooks/
  services/
  utils/
  constants/
  data/
  assets/
```

Không tự ý:

- đổi tên thư mục hàng loạt
- di chuyển file diện rộng chỉ vì muốn “đẹp hơn”
- áp cấu trúc mới nếu chưa có yêu cầu rõ ràng

## 6. Quy tắc giao diện

- Giao diện phải rõ chức năng, dễ thao tác, dễ đọc.
- Không làm giao diện theo kiểu mẫu AI chung chung, bóng bẩy quá mức nhưng thiếu thực tế.
- Tôn trọng phong cách hiện có của dự án nếu không có yêu cầu đổi UI rõ ràng.
- Nội dung, hình ảnh, cách trình bày phải phù hợp ngữ cảnh Việt Nam.
- Không lạm dụng animation, popup hoặc hiệu ứng gây rối.

Yêu cầu cơ bản khi sửa màn hình:

- có trạng thái loading nếu có tải dữ liệu
- có trạng thái rỗng khi không có dữ liệu
- có thông báo lỗi dễ hiểu khi thao tác thất bại
- có phản hồi thành công với thao tác quan trọng khi cần
- có xác nhận với thao tác xóa hoặc thay đổi dữ liệu quan trọng

## 7. Quy tắc component và trang

- Mỗi trang nên có file riêng.
- Component nên tách riêng khi có giao diện hoặc logic đủ lớn.
- Không nhét quá nhiều component lớn vào cùng một file.
- Không trộn logic gọi API, dữ liệu mẫu và giao diện trong một file dài nếu có thể tách rõ.
- Nếu file bắt đầu quá dài hoặc quá nhiều trách nhiệm, ưu tiên tách nhỏ hợp lý.

## 8. Quy tắc dữ liệu và API

- Không tự ý đổi contract API đang dùng nếu chưa xác nhận backend hỗ trợ.
- Không tự ý đổi key dữ liệu, tên field, hoặc format dữ liệu giữa frontend và backend.
- Ưu tiên gom phần gọi API trong `src/services/` hoặc theo cấu trúc đang có.
- Không viết lặp lại URL hoặc logic gọi API ở nhiều nơi nếu có thể gom lại.
- Nếu cần mock dữ liệu, đặt ở khu vực dữ liệu riêng thay vì viết cứng trong component lớn.

Khi đối chiếu API đang chạy thật, ưu tiên đọc:

- `README.md`
- `backend/nest-api/README.md`
- mã nguồn trong `backend/nest-api/`

## 9. Quy tắc trải nghiệm người dùng

Các màn hình chính hiện có cần được ưu tiên giữ ổn định, ví dụ:

- trang chủ
- thực đơn
- đặt bàn
- giỏ hàng
- thanh toán
- đăng nhập
- đăng ký
- hồ sơ
- khu vực nội bộ nếu có

Khi sửa form:

- có nhãn rõ ràng
- có validate cơ bản
- có thông báo lỗi dễ hiểu
- có trạng thái disabled và loading phù hợp

Khi sửa danh sách hoặc bảng:

- chú ý trạng thái rỗng
- chú ý dữ liệu dài
- chú ý cách hiển thị trên desktop và mobile

## 10. Quy tắc debug và dọn dẹp

- Chỉ debug khi thật sự cần.
- Không để lại `console.log`, `debugger`, file log tạm, file test tạm trong bản chính thức.
- Không giữ file rác, file thử nghiệm hoặc tài nguyên không còn dùng trong khu vực chính của project.
- Nếu công cụ tạo ra file hoặc thư mục tạm, cần dọn sạch sau khi xong việc.

## 11. Cách phản hồi khi hoàn thành

Khi chỉnh sửa frontend, cần báo rõ:

- đã sửa file nào
- sửa gì
- lý do sửa
- có ảnh hưởng API, dữ liệu hoặc hành vi giao diện hay không
- cần kiểm tra thêm gì sau khi sửa

## 12. Kết luận áp dụng

Toàn bộ frontend hiện tại cần bám theo các nguyên tắc sau:

- React + Vite, mã nguồn chính trong `frontend/src/`
- ưu tiên tiếng Việt không dấu khi đặt tên mới nếu phù hợp
- giữ cấu trúc hiện có của repo
- không tự ý đổi contract API
- ưu tiên bám backend NestJS that trong `backend/nest-api`
- giao diện thực tế, rõ ràng, phù hợp ngữ cảnh Việt Nam
