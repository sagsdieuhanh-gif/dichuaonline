# AN LẠC ĐƯỜNG — V1.6 (bản sửa lỗi)

Website: https://sagsdieuhanh-gif.github.io/dichuaonline/?v=1.6

## Sửa lỗi V1.6

- Chánh điện dùng nền chi tiết mới và **cố định**: không tự phóng to hoặc trôi theo chuyển động của nhân vật.
- Bỏ thao tác vẽ khung hình cũ lên chính canvas đang hiển thị; tránh hình ảnh chồng/nhòe.
- Nhân vật và 100 vị trí chỉ thay đổi tọa độ trên mặt phẳng sàn; giảm kích thước người ngồi để hạn chế đè lên nhau trên điện thoại.
- **Dừng giọng đọc tự động** khi chưa kiểm chứng giọng Việt chuẩn; lời chào vẫn hiển thị trên màn hình. Không dùng TTS đọc Chú Đại Bi vì nguy cơ đọc sai âm.
- Trình phát 3 bản nhạc thiền nguyên bản được nhúng trong `audio-player.js`, không phụ thuộc máy chủ âm thanh bên ngoài. Chỉ phát nhạc thiền khi vào chùa; tự chuyển giữa 3 bài.

## Giới hạn hiện tại

Đây là cảnh mô phỏng 2.5D, chưa phải game WebGL 3D hoặc 100 người thật realtime. Hoạt ảnh quỳ lạy là các tư thế tạo hình theo bước, không phải chuyển động xương 3D chuyên nghiệp. Chưa đưa bản thu Chú Đại Bi có người tụng vào vì chưa có nguồn được cấp phép và xác minh giọng đọc.

## Kiểm thử

Đã kiểm tra cú pháp JavaScript, sự tồn tại của asset nền, bộ ba MP3, số vị trí (100), phép chiếu ghế/người theo sàn và loại bỏ giọng máy đọc chú. Kiểm thử thao tác trực tiếp trên điện thoại thực tế vẫn chưa hoàn tất.

---



## V1.5 — Cảnh chánh điện và âm thanh

- Chánh điện dùng nền cố định; nhân vật đi trên mặt phẳng sàn với góc nhìn từ phía sau. Động tác lạy có các tư thế quỳ, cúi, đứng dậy (mô phỏng sprite Canvas, chưa phải 3D rig).
- **3 bản nhạc thiền nguyên bản trong `music/`:** `chuong-som-an-nhien.wav`, `sen-no-trong-tam.wav`, `huong-tram-tinh-lang.wav` — phát từ GitHub Pages không phải tìm file bên ngoài.
- Các lựa chọn khác trong nút **♫**: Chú Đại Bi trích đoạn 6 câu đầu bằng giọng máy (không phải bản tụng đầy đủ), niệm A Di Đà Phật bằng giọng máy, Om Mani Padme Hum và Đà-la-ni bản thu mở (cần mạng).
- Không đăng ký tài khoản. Trình duyệt di động có thể yêu cầu chạm vào nút phát để cấp quyền âm thanh.
- Website hiện là mô phỏng 2.5D một người với các Phật tử mô phỏng, chưa có nhiều người thật cùng kết nối.

**Website chùa online miễn phí, vào ngay không đăng ký:** https://sagsdieuhanh-gif.github.io/dichuaonline/

## Sửa lỗi V1.4
- Sửa lỗi chánh điện bị đẩy lên khỏi màn hình khi nhân vật đi tới gần bàn thờ: loại bỏ phép chiếu sai y=34; dùng nền cố định, giới hạn mức phóng to 1,43 lần.
- Giữ tượng Phật ở trung tâm, nền chánh điện trong khung nhìn; giới hạn vùng vẽ phía trên sàn để tránh che lấp lối đi.
- Giữ nguyên dữ liệu nhân vật, góc nhìn sau lưng, ghế ngồi và các thao tác, không yêu cầu tài khoản.

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
