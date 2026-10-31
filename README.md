# AN LẠC ĐƯỜNG — V1.7.1 (31/10/2026)

**Trang Chùa Online:** https://sagsdieuhanh-gif.github.io/dichuaonline/?v=1.7.1

## Thay đổi hình ảnh V1.7

- Khôi phục **đúng bức ảnh chánh điện đầu tiên** mà người dùng đã chọn làm hình mẫu. Giữ đầy đủ tượng Phật, bàn thờ, khói hương, lối đi và những người ngồi hai bên trong một bức ảnh liền mạch.
- Không cắt ảnh chánh điện ở giữa rồi vẽ thêm sàn giả; không phóng, quay, hoặc kéo dịch chánh điện theo vị trí nhân vật.
- Dùng **nhân vật áo lam từ ảnh chụp dựng lại**, góc nhìn sau lưng, thay thế hình vector robot. Có ảnh nam tóc ngắn và nữ tóc dài, các pha quỳ/cúi lạy.
- Chỉ vẽ nhân vật người dùng và khói hương lên ảnh đã có người ngồi, tránh hiện người trùng lặp. Vị trí sàn thay đổi theo tọa độ nhân vật.
- Vẫn có 100 vị trí mô phỏng, nghi lễ lễ Phật/thắp hương, niệm Phật, lời chào cá nhân hóa, bộ phát ba bản nhạc thiền tự sáng tác. Không dùng giọng máy đọc Chú Đại Bi khi phát âm chưa chính xác.
- Giao diện máy tính/điện thoại, miễn phí và không đăng ký tài khoản.

## Kiểm thử

- Cú pháp JavaScript hợp lệ (Node.js syntax check).
- Có dữ liệu ảnh chánh điện, avatar nam/nữ và 3 tư thế lễ Phật.
- Có logic 100 vị trí và camera nền cố định, không vẽ bản sao các nhân vật ngồi.
- Đã tạo ảnh đối chiếu 390×844 và 1440×900 từ cùng hình nền, có nhân vật tại vị trí xuất phát.

**Giới hạn:** Đây là cảnh 2.5D với nhân vật tách lớp trên ảnh nền đã dựng, không phải 3D đầy đủ hoặc 100 người thật đang kết nối. Chuyển động quỳ lạy dùng chuỗi tư thế ảnh, chưa phải skeletal animation 3D. Âm thanh giọng nói vẫn tắt để tránh phát âm sai.
