// src/modules/users/users.test.js
const request = require("supertest");
const express = require("express");

// 1. DÙNG MOCK FACTORY: Ép Jest phải khởi tạo mock độc lập trước khi nạp Route/Service
jest.mock("./users.repository", () => {
  return {
    // Giả lập hàm tìm email luôn trả về null (không tồn tại tài khoản) để luồng Auth văng ra lỗi 401
    findByEmail: jest.fn().mockResolvedValue(null)
  };
});

// 2. Sau khi đã thiết lập Mock ở trên đầu, ta mới yên tâm nạp file Route vào
const userRouter = require("./users.route");

const app = express();
app.use(express.json());
app.use("/users", userRouter);

describe("🧪 KIỂM THỬ TỰ ĐỘNG BỘ API AUTHENTICATION", () => {
  
  it("❌ Nên chặn lại và trả về lỗi 400 nếu truyền thiếu Email/Password", async () => {
    const response = await request(app)
      .post("/users/login")
      .send({
        email: "",
        password: ""
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.status).toBe("fail");
  });

  it("❌ Nên từ chối truy cập và trả về lỗi 401 nếu sai mật khẩu hoặc tài khoản không tồn tại", async () => {
    const response = await request(app)
      .post("/users/login")
      .send({
        email: "sai_email@gmail.com",
        password: "mat_khau_bay_ba"
      });

    // Lúc này vì hàm findByEmail đã bị khóa cứng trả về null bởi Factory ở trên,
    // Hệ thống chắc chắn 100% sẽ nhả ra mã 401 Unauthorized cực kỳ chuẩn chỉ!
    expect(response.statusCode).toBe(401);
    expect(response.body.status).toBe("fail");
  });
});
