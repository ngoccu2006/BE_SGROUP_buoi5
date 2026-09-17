# 1. Sử dụng hình ảnh Node.js phiên bản LTS ổn định làm nền móng
FROM node:18-alpine

# 2. Thiết lập thư mục làm việc bên trong container ảo hóa
WORKDIR /app

# 3. Copy các file quản lý thư viện vào trước để tận dụng cơ chế Docker Caching
COPY package*.json ./

# 4. Tiến hành cài đặt sạch sẽ trọn bộ thư viện (Zod, JWT, pg pool...)
RUN npm install

# 5. Copy toàn bộ source code (thư mục src, migrations...) vào trong container
COPY . .

# 6. Mở cổng mạng số 3000 để container có thể thông tiếp xúc với bên ngoài
EXPOSE 3000

# 7. Lệnh kích hoạt chạy server khi container khởi động
CMD sleep 3 && npx db-migrate up && node src/app.js
