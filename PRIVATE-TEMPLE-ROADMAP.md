# Chánh Điện nội bộ · 100 nhân viên · Coin do Trụ trì cấp

**Trạng thái:** Thiết kế và mã nguồn thử nghiệm đã được chuẩn bị, **chưa tích hợp backend riêng, chưa phát hành lên nhánh main**. Bản cũ giữ nguyên để tránh làm gián đoạn chánh điện đang sử dụng.

## Yêu cầu nghiệp vụ đã chốt

- Chỉ các **nhân viên có danh tính được cấp và phê duyệt** mới xuất hiện; không còn người mẫu, tên mẫu hoặc sự kiện tự tạo.
- Mỗi `user_id` được chiếm tối đa một vị trí; phòng có tối đa **100 phiên hiện diện**. Khi người rời/đứt kết nối, vị trí được giải phóng sau khi phiên hết hạn.
- **Trụ trì** có quyền mời/duyệt/khóa nhân viên, cấu hình giá các nghi lễ và cộng coin thủ công.
- Người dùng muốn coin **phải liên hệ Trụ trì để được nạp**. Không có tự đăng ký, tự nạp, mua coin qua website hoặc chuyển coin giữa các thành viên.
- Tất cả thay đổi số dư phải đi qua RPC Postgres kiểm tra quyền **ở server** và có sổ giao dịch. Trình duyệt không có quyền ghi trực tiếp vào ví.
- Các nghi lễ (dâng hương, dâng hoa, thỉnh chuông, dâng hoa sen) **chưa có mức giá**. Khi Trụ trì thiết lập giá và bật nghi lễ mới được chi coin.
- **Không dùng Supabase các hệ thống SAGS/E-REPORT**. Để chạy thật, phải tạo project Supabase riêng, cấu hình Auth chỉ cho phép invite, cơ sở dữ liệu/RLS và Realtime.

## Tệp thử nghiệm

Bộ thử nghiệm gồm: `schema.sql` (Auth, membership, RLS, ví, sổ giao dịch, RPC, phòng 100 người), `index.html` (UI nội bộ), `main.js` (Supabase Realtime + admin coin), `config.example.js`, `README.md`. Các tệp đã được tạo trong gói `Chanh-Dien-Noi-Bo-100-Nguoi-Coin-Admin.zip` của cuộc trò chuyện, chưa thay nhánh main.

## Công khai / bảo mật

Đăng nhập chỉ bằng tài khoản do Trụ trì mời. Không đưa `service_role` hay `sb_secret_*` lên GitHub Pages; chỉ dùng publishable key. Cài chính sách RLS và kiểm thử người dùng thường không được cấp coin qua API trực tiếp.

## Việc còn thiếu trước khi ra mắt

1. Chọn tổ chức Supabase sẽ tạo **project mới**, tách khỏi nghiệp vụ công ty.
2. Triển khai schema trong project mới; invite/bootstrap tài khoản Trụ trì và phê duyệt nhân viên.
3. Điền project URL/publishable key, kiểm tra 2–3 thiết bị, quyền truy cập, giao dịch coin và giới hạn 100 người.
4. Mới đưa hệ thống mới lên GitHub Pages.

**Lưu ý:** Có tài khoản được duyệt chứng minh người tham gia thuộc danh sách nội bộ, không phải xác minh khuôn mặt hay chứng minh người không chia sẻ mật khẩu.
