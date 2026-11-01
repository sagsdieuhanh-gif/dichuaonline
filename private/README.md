# Chánh Điện nội bộ + TikTok LIVE

TRẠNG THÁI: Nhánh thử nghiệm. Chưa triển khai main và chưa tạo Supabase riêng.

## Hai nhóm dùng chung 100 chỗ

- Nhân viên công ty: tài khoản Supabase Auth do Trụ trì mời; phải được duyệt; một tài khoản một nhân vật; phiên tự hết hạn nếu mất kết nối.
- Người xem TikTok: bình luận "xin vào chùa" để xếp hàng chờ Trụ trì duyệt. Bình luận hay tặng quà không tự tạo nhân vật.
- 100 ghế dùng chung được kiểm tra bên Postgres transaction. Trụ trì có thể phê duyệt hoặc thu hồi khách TikTok.
- Không có bot, không sinh 22 người mẫu; các chức năng tạo bot trong server LIVE đã vô hiệu.
- Coin nội bộ chỉ Trụ trì được cộng; trừ coin nghi lễ phải qua RPC và có lịch sử. Quà tặng TikTok tạo hiệu ứng riêng, KHÔNG quy đổi vào coin nội bộ.

## Kích hoạt dự án riêng

1. Tạo dự án Supabase mới chỉ dành cho Chánh Điện (không tái sử dụng database SAGS/E-REPORT). Chưa được tạo trong nhánh này.
2. Trong Supabase Auth tắt public và anonymous signup, dùng Invite user để mời nhân viên.
3. Chạy private/schema.sql trong SQL Editor của dự án mới.
4. Mời tài khoản Trụ trì; lấy Auth UUID và chạy lệnh sau với UUID thật:

    UPDATE public.temple_members SET role='abbot',active=true,display_name='Trụ trì' WHERE user_id='UUID_THAT';

5. Điền URL và publishable key dự án mới vào private/config.js. Chỉ publishable key được phép công khai. Tuyệt đối không đưa service-role JWT, sb_secret hay mật khẩu lên GitHub Pages.
6. Đăng nhập vào /dichuaonline/private/, duyệt thành viên và định mức coin.

## Kích hoạt TikTok LIVE

Trên máy phát LIVE đã cài Node.js 20+:

    cd live
    npm install
    npm start

Mở http://localhost:3000/live/control.html và nhấn Mở overlay 9:16, Bật âm thanh. Đưa overlay vào TikTok LIVE Studio (Window Capture) hoặc OBS (Browser Source) 1080x1920, bật TikTok LIVE, nhập @tentaikhoan và nhấn Kết nối.

Khi có Supabase riêng, đặt trên MÁY PHÁT (không trên website) các biến:

- TEMPLE_DB_URL = URL project Chánh Điện riêng
- TEMPLE_DB_SECRET = service-role JWT lưu bí mật chỉ trên máy phát

Máy chủ LIVE đọc người online từ Supabase; chuyển yêu cầu xin vào từ TikTok tới danh sách chờ. Trụ trì duyệt trong /private/. Người đã được duyệt và còn tương tác ở LIVE mới vào ghế.

Không có database: bảng LIVE vẫn cho phép duyệt khách thật ngay trên máy phát, nhưng là chế độ local tạm thời, chưa đồng bộ nhân viên và không lưu phê duyệt sau khi restart.

## An toàn và giới hạn

- Bảng điều khiển LIVE chỉ bind 127.0.0.1; không được mở trực tiếp ra Internet.
- TikTok-live-connector là thư viện không chính thức, có thể hỏng nếu TikTok thay đổi.
- Không xác thực được người thật bằng sinh trắc học từ tài khoản TikTok. Trụ trì tự xác nhận danh tính khi phê duyệt.
- Nên dùng pháp danh được đồng ý cho overlay, tránh lộ thông tin nhân sự khi phát trực tiếp.
- Ảnh chánh điện upstream hiện có người được vẽ sẵn vào ảnh nền; nếu muốn tuyệt đối không có bóng người mô phỏng thì cần thay ảnh nền không có người.
- Không có cổng thanh toán tiền thật. Khi quy đổi tiền thành coin cần kiểm tra pháp luật, nền tảng và chính sách nội bộ.
- Chưa test database/TikTok LIVE thực tế; trước khi đưa vào main phải kiểm thử quyền, giới hạn 100, duyệt guest, coin, mất kết nối và trình phát.
