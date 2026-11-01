# Chánh Điện Tịnh Tâm — Bình luận trực tiếp trên web + TikTok LIVE

**Trạng thái:** Đã viết gateway và bài kiểm thử; **chưa có máy chủ LIVE chạy thường trực**. Mã mới ở nhánh thử nghiệm `feature/private-temple-100-coins`, chưa chuyển sang `main`.

## Cơ chế thống nhất

- Bất cứ **bình luận có nội dung** nào (ví dụ `xin vô`, `Nam mô A Di Đà Phật`, một lời chúc hoặc emoji ❤️) từ TikTok LIVE **hoặc** cổng web đều trở thành yêu cầu chờ duyệt.
- Không yêu cầu nhân viên hoặc khách TikTok tạo tài khoản website.
- Trụ trì xem danh sách tại `http://localhost:3000/live/control.html`, phân loại **Nội bộ** / **Khách TikTok**, rồi **Duyệt** hoặc **Từ chối**.
- Chỉ người đã được duyệt mới có hình nhân vật trong overlay LIVE. Một định danh TikTok hoặc phiên trình duyệt có tối đa một ghế, phòng giới hạn 100 ghế; không có người mẫu, bot hoặc tự động vào khi bình luận.
- Bình luận không tự quy đổi thành coin; **quà TikTok không tạo/sửa ví coin**. Chức năng cấp coin bền vững chưa chạy vì dự án backend riêng chưa được tạo.

## Chạy thử bằng máy tính phát LIVE

Cần cài **Node.js 20+**, tải repository và chuyển sang nhánh thử nghiệm. Mở Terminal trong thư mục `live`:

```bash
npm install
npm start
```

Ứng dụng mở **hai cổng tách biệt**:

- **Cổng 3000 — CHỈ TRỤ TRÌ:** `http://localhost:3000/live/control.html` (bảng duyệt), `http://localhost:3000/live/overlay.html` (OBS/TikTok LIVE Studio). **Tuyệt đối không đưa cổng 3000 ra Internet hoặc cấu hình chuyển tiếp cổng từ router.**
- **Cổng 3001 — CHỈ KHÁCH:** `http://localhost:3001/` (nhập tên, bình luận, theo dõi trạng thái chờ duyệt, xem danh sách người đang ngồi, gửi lời niệm sau khi duyệt). Các đường dẫn của quản trị `/live/`, `/ws` đều bị chặn trên cổng này.

## Đưa cổng khách lên HTTPS để nhân viên dùng điện thoại

Trên máy đang chạy LIVE, cài `cloudflared` rồi mở một Terminal khác:

```bash
cloudflared tunnel --url http://localhost:3001
```

Lệnh in ra một URL HTTPS `https://...trycloudflare.com`. Chỉ chia sẻ URL này cho người cần vào chùa. **KHÔNG sử dụng `http://localhost:3000` trong lệnh tunnel.**

Đây là **Quick Tunnel để thử nghiệm**: URL thay đổi khi khởi động lại, ngừng hoạt động khi tắt máy hoặc thoát chương trình, không có cam kết uptime. Khi dùng ổn định lâu dài, cần tên miền và đường hầm Cloudflare cấu hình cố định; tài liệu chính thức: https://developers.cloudflare.com/tunnel/get-started/quick-tunnels/.

## Kiểm tra bằng hai điện thoại

1. Mở URL HTTPS trên điện thoại A, nhập tên và một bình luận **bất kỳ**, gửi yêu cầu.
2. Trên máy Trụ trì, mở bảng điều khiển 3000: yêu cầu xuất hiện **ở danh sách chờ**; overlay chưa có người mới.
3. Chọn loại **Nội bộ** rồi **Duyệt**. Điện thoại A thấy trạng thái đã duyệt; overlay xuất hiện nhân vật.
4. Dùng điện thoại B thử một người khác; chọn **Khách TikTok** và duyệt. Hai người cùng hiện diện, tổng không vượt 100.
5. Từ điện thoại A gửi một lời niệm; overlay nhận bình luận.
6. Bấm **Rời chánh điện** hoặc đóng trình duyệt, ghế được giải phóng (đóng tab không ngay lập tức; phiên sẽ hết hạn theo chu kỳ).
7. Thử bình luận **“Nam mô A Di Đà Phật”**, **“Xin vô”**, **“Chúc mọi người an lạc”** và **“❤️”** — tất cả đều chỉ gửi hàng chờ duyệt.

## Giới hạn bảo mật và xác minh người thật

- Người dùng **không đăng nhập**, vì vậy hệ thống không thể chứng minh một pháp danh thuộc về đúng nhân viên hoặc một người không mở hai trình duyệt. **Trụ trì phải nhận diện người xin vào trước khi chọn Nội bộ**; không mặc định mọi lời tự xưng là nhân viên đều đúng.
- Cổng web nhận một định danh ngẫu nhiên bằng cookie bảo vệ HttpOnly; không phải tài khoản và không phải giấy xác nhận danh tính. Nội dung gửi bị giới hạn kích thước, tần suất; người chưa duyệt không thể gửi lời niệm lên overlay.
- Có giới hạn hàng chờ **300 yêu cầu** để tránh tràn bộ nhớ. Khách bình luận lặp lại chỉ có **một** yêu cầu chờ.
- Yêu cầu, phiên, phân loại và trạng thái ghế đang lưu **trong RAM** của máy phát, sẽ mất khi khởi động lại. Không có cơ sở dữ liệu Supabase riêng vì tổ chức đã dùng hết hai suất project miễn phí. Tuyệt đối không tái sử dụng cơ sở dữ liệu SAGS.
- Đây chưa phải hệ thống chịu tải cao cho 100 người duy trì liên tục; cần kiểm thử thực tế và cấu hình thêm bảo vệ chống spam trước khi livestream công khai rộng rãi.

## Chat chung dành cho người đã được duyệt

- Khi Trụ trì bấm duyệt, người vào chánh điện bằng **website** sẽ thấy thẻ **💬 Phòng chat chung** để trò chuyện, gửi lời chào, lời niệm Phật hoặc phản hồi nhau. Hệ thống làm mới tin nhắn sau khoảng **2,8 giây**.
- Người đã được duyệt qua **TikTok LIVE** bình luận trong livestream thì nội dung cũng xuất hiện tại phòng chat trên web và hiển thị thành bong bóng trong overlay.
- Mọi người trong phòng được đọc các tin nhắn gần nhất; chỉ **80 tin mới nhất** được giữ trên máy phát trong RAM. Người chưa được duyệt không đọc hoặc gửi chat.
- Trụ trì sử dụng bảng quản trị **cổng localhost:3000** để **xóa từng tin**, **xóa toàn bộ** và **tắt/bật lại chat của từng người**. Cổng công khai **3001** không có API kiểm duyệt, không thể sửa tin người khác.
- Có hạn chế gửi liên tục (web ~3,5 giây, TikTok ~1,6 giây / tin) và nội dung tối đa 160 ký tự; tin được hiển thị dạng văn bản thường để tránh chèn mã HTML.
- Chat là **công khai với các thành viên đã được duyệt trong phòng**, không phải tin nhắn riêng. Không gửi dữ liệu cá nhân, số điện thoại, mã truy cập, thông tin thanh toán hoặc nội dung nhạy cảm.
- Chat **không được lưu vĩnh viễn**, mất khi khởi động lại máy chủ LIVE. Người dùng không có tài khoản nên việc một người đổi thiết bị/đổi tên có thể tạo định danh mới; Trụ trì kiểm tra khi duyệt.
