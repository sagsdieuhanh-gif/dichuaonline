# AN LẠC ĐƯỜNG — V1.3 (31/10/2026)

**Website chùa online miễn phí, vào ngay không đăng ký:** https://sagsdieuhanh-gif.github.io/dichuaonline/

## Có gì trong V1.3?
- **Chánh điện được neo tại một tọa độ cố định** trong thế giới mô phỏng; khi bạn đi tới gần, góc nhìn chuyển theo nhân vật tạo phối cảnh đến gần tượng Phật. Không sử dụng chuyển dịch giả của toàn cảnh theo hướng di chuyển.
- **Nhân vật nhìn từ phía sau**, nam tóc ngắn, nữ tóc dài, có phần vai/cổ, tà áo lam dài, ống tay áo, nếp vải và hoạt ảnh bước chân 6 khung hình thay cho khối robot. Cảnh là Canvas phối cảnh, chưa phải mô hình WebGL 3D.
- **Ba giai điệu thiền nguyên bản** phát bằng Web Audio, không cần tải từ server âm nhạc bên ngoài: *Chuông Sớm An Nhiên*, *Sen Nở Trong Tâm*, *Hương Trầm Tĩnh Lặng*. Nhạc gồm các lớp sáo, chuông, mõ và âm nền; tạo bằng thuật toán. Không sử dụng giai điệu từ video tham khảo.
- **Ba bản thu bổ sung** tham khảo từ Wikimedia Commons (cần Internet): tụng Tam Quy; tụng kinh tại chùa Linh Ẩn; Spiritual Ambient. Xem [MUSIC-CREDITS.md](MUSIC-CREDITS.md).
- Nút ♫ để phát/tạm dừng, đổi bài, chỉnh âm lượng hoặc phát nhạc riêng từ điện thoại.
- 100 chỗ ngồi mô phỏng, 20 chỗ/hàng × 5 hàng; đi theo trục giữa; quỳ lễ, thắp hương và khói hương, thỉnh chuông, niệm Phật 108 hạt, lời chào tiếng Việt tùy thiết bị.

## Hướng dẫn sử dụng
1. Mở website, nhập pháp danh và chọn nhân vật.
2. Bấm **Vào chùa** để vào chánh điện và bật nhạc. Điện thoại có thể yêu cầu chạm **Phát nhạc** sau khi mở.
3. Dùng phím **W/A/S/D** hoặc phím mũi tên để di chuyển. Trên điện thoại dùng nút điều hướng.
4. Dùng các nút **An tọa**, **Lạy Phật**, **Dâng hương**, **Niệm Phật**, **Thỉnh chuông**.
5. Bấm **♫** để chuyển giữa 3 bài nhạc thiền nguyên bản, 3 bản thu tham khảo, hoặc chọn MP3 từ điện thoại. Bài nhạc riêng không được tải lên server.

## Phạm vi và giới hạn
- Đây là **phối cảnh 2.5D/Canvas**, không phải game 3D WebGL, nên nhân vật và chuyển động vẫn chưa đạt mức chân thực như video được cung cấp.
- 100 vị trí là **dữ liệu mô phỏng**, chưa phải 100 người online đồng thời. Muốn đồng bộ thật phải tích hợp backend realtime.
- Âm thanh thiền nguyên bản là nhạc **tổng hợp điện tử**, không phải bản thu hát kinh tiếng Việt. Tiếng nói chúc phụ thuộc giọng đọc có trên máy.
- Không có tài khoản, không theo dõi dữ liệu cá nhân trên server, không thanh toán.

## Phát hành
- Branch: `main` — source: `index.html`, `audio-player.js`, `MUSIC-CREDITS.md`.
- GitHub Pages: repository → Settings → Pages → Deploy from a branch → main / (root).
- Bản cũ V1.1 / V1.2 có thể còn trong bộ nhớ cache của trình duyệt; hãy tải lại để nhận bản mới.
