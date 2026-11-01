# Chánh Điện – vào bằng bình luận, không đăng ký

**Đã chốt:** Cả nhân viên công ty và người xem TikTok đều xin vào bằng một câu bình luận, không cần tài khoản website.

## Luồng sử dụng (TikTok LIVE)

1. Trụ trì khởi chạy chương trình LIVE trên máy phát và kết nối phòng TikTok.
2. Nhân viên công ty **hoặc** khách TikTok bình luận `xin vô`, `xin vào`, `xin vo`, `xin vào chùa` hoặc `xin vào chánh điện`.
3. Người đó xuất hiện **trong danh sách chờ**, **không xuất hiện trong chánh điện**.
4. Trụ trì xác minh người quen/nội bộ theo thông tin ngoài website rồi chọn **Nhân viên nội bộ** hoặc **Khách TikTok** và bấm **Duyệt**. Cần lưu ý: chỉ bình luận không xác minh được tư cách nhân viên; Trụ trì phải tự nhận diện người bình luận.
5. Khi được duyệt, người đó được một chỗ ngồi trong giới hạn 100 chỗ. Một định danh TikTok chỉ có một chỗ; đủ 100 thì không nhận thêm.
6. Người bình luận khác không tự có nhân vật. Không thêm tên mẫu, bot hoặc người giả.

## Quà TikTok và coin

- Quà TikTok chỉ kích hoạt thông báo và hiệu ứng LIVE. **Không được tự cộng coin** cho bất kỳ người xem nào, kể cả người đã được duyệt.
- Coin dùng cho nghi lễ nội bộ chỉ có thể được Trụ trì cấp thông qua backend bảo vệ bằng quyền quản trị; không có luồng tự nạp hoặc tự đăng ký.
- Chế độ LIVE trên máy hiện tại có thể xử lý yêu cầu/duyệt trong **bộ nhớ tạm**, **không phải ví coin bền vững**. Mất nguồn hoặc khởi động lại máy có thể mất hàng chờ và người ngồi. Không được hiển thị trạng thái giả như đã nạp coin thành công.

## Chưa hỗ trợ / cần hạ tầng trước khi dùng thật ở nhiều nơi

- **Bình luận trực tiếp từ website nội bộ trên điện thoại khác**, đồng bộ về máy trụ trì: cần một backend công khai được bảo mật (ví dụ một dịch vụ có xác thực người quản trị). GitHub Pages không nhận và lưu bình luận từ nhiều người.
- **Nhân viên nội bộ trong LIVE hiện sử dụng bình luận TikTok**, không yêu cầu đăng ký website.
- Ở nhánh thử nghiệm cũ có phần `private/` sử dụng Supabase Auth cho nhân viên. **Phần đăng nhập đó không còn là quy trình tham gia**, không nên triển khai cho nhân viên. Cần thiết kế lại dữ liệu và phần cấp coin trước khi phát hành chính thức.
- Supabase riêng chưa được tạo vì giới hạn hai dự án miễn phí của tổ chức. Không sử dụng hoặc thay đổi hai dự án SAGS để khắc phục.
- Nhánh `main` hiện vẫn là bản nguồn cũ; chỉ `feature/private-temple-100-coins` có sửa đổi này.

## Thử nghiệm

Kiểm tra tự động tại `.github/workflows/verify-hybrid.yml` và `live/test-hybrid.mjs` cho:
- nhận cả câu **xin vô** và **xin vào chùa**;
- không vào chùa trước khi duyệt;
- phân loại **Nội bộ / TikTok** sau khi duyệt;
- quà không cấp coin;
- tối đa 100 vị trí.
