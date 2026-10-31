# AN LẠC ĐƯỜNG — V1.2

**Bổ sung nhạc chùa thu âm và trình phát điều khiển trên máy tính/điện thoại.** Nhấn nút ♫ ở góc phải để mở bảng nhạc, chọn bản nhạc hoặc nhạc riêng từ thiết bị. Website miễn phí, không đăng ký. Trình duyệt điện thoại có thể yêu cầu nhấn Phát lần đầu.


Website chánh điện trực tuyến miễn phí, không cần đăng ký tài khoản.

## Website
https://sagsdieuhanh-gif.github.io/dichuaonline/

**Chú ý**: trang GitHub Pages có thể chưa hoạt động đến khi chủ repository kích hoạt Pages trong **Settings → Pages → Build and deployment → Source: Deploy from a branch → Branch: main → Folder: /(root) → Save**.

## Chức năng
- Chánh điện trang trí tượng Phật vàng và hoa đèn, thảm đỏ chính giữa, lư hương với làn khói bay.
- Phật tử mặc áo lam, nam tóc ngắn/nữ tóc dài, camera sau lưng, thao tác WASD/phím mũi tên và cảm ứng.
- 100 vị trí mô phỏng: 5 hàng × 20 chỗ (10 trái và 10 phải), chừa lối giữa.
- Tự đến chỗ ngồi, đứng lên, lạy Phật, thắp hương, niệm Phật 108 hạt, thỉnh chuông.
- Lời chào đọc tên bằng giọng tiếng Việt khi trình duyệt hỗ trợ.
- Nhạc thiền có giai điệu nguyên bản tạo bằng Web Audio; không sử dụng bản thu có bản quyền từ video.

## Phạm vi kỹ thuật
- Dùng HTML/CSS/Canvas2D và âm thanh Web Audio. Toàn bộ giao diện và tài sản ảnh được đóng gói trong `index.html` để GitHub Pages phục vụ tĩnh, không cần bước build.
- Đây là phối cảnh 3D mô phỏng có chuyển động, **chưa phải 3D WebGL thực**.
- Các nhân vật khác trong chùa là **NPC mô phỏng**, **chưa có 100 người thật online**. Muốn đồng bộ người dùng ở các thiết bị cần kết nối Firebase/Supabase/WebSocket, không thể đạt chỉ bằng GitHub Pages.
- Hình ảnh nền được tạo riêng cho dự án, không sao chép tài sản gốc của website/video tham khảo.
- Không có chức năng thanh toán hay tài khoản.

## Phiên bản
V1.1 — 31/10/2026


## Âm thanh V1.2

- Danh sách ba bản thu âm từ Wikimedia Commons: nhạc thiền không lời, tụng Tam Quy (Pali), tiếng tụng tại chùa Linh Ẩn (Trung Quốc).
- Tự chuyển bài, điều chỉnh âm lượng, phát/tạm dừng, chọn file âm thanh trong thiết bị. Nhạc do người dùng chọn chỉ mở tại máy đó, không upload.
- Nguồn và giấy phép ghi ở [MUSIC-CREDITS.md](MUSIC-CREDITS.md).
- Chưa bao gồm bản tụng kinh tiếng Việt có giấy phép, cũng chưa có realtime nhiều người; không phải bản sao 100% website tham khảo.
