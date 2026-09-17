// src/middlewares/auth.middleware.js
const jwt = require("jsonwebtoken");
const userRepository = require("../modules/users/users.repository");

const protect = async (req, res, next) => {
  try {
    let token;

    // 1. Kiểm tra xem Front-End có gửi Token lên qua Header dạng Bearer không
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1]; // Bóc lấy chuỗi mã Token thô sau chữ Bearer
    }

    if (!token) {
      return res.status(401).json({
        status: "fail",
        message: "Bạn chưa đăng nhập! Vui lòng gửi kèm mã Token để truy cập."
      });
    }

    // 2. GIẢI MÃ TOKEN (Verify Token) bằng khóa bí mật trong file .env
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. KIỂM TRA USER CÒN TỒN TẠI KHÔNG (Phòng trường hợp Token còn hạn nhưng User đã bị xóa khỏi DB)
    const currentUser = await userRepository.getUserById(decoded.userId);
    if (!currentUser) {
      return res.status(401).json({
        status: "fail",
        message: "Tài khoản sở hữu mã Token này đã không còn tồn tại trên hệ thống!"
      });
    }

    // 4. Đính kèm thông tin User đã xác thực vào object `req` để Controller phía sau sử dụng
    req.user = currentUser;
    
    return next(); // Hộ chiếu hợp lệ, cho phép đi tiếp vào Controller xử lý logic!

  } catch (error) {
    return res.status(401).json({
      status: "fail",
      message: "Mã Token không hợp lệ hoặc đã hết hạn sử dụng!"
    });
  }
};

const restrictTo = (...allowedRoles) => {
  return (req, res, next) => {
    // Vì hàm protect ở trên đã lấy thông tin user kèm 'role_name' từ lệnh LEFT JOIN gán vào req.user
    // Ta chỉ cần check xem role_name của user hiện tại có nằm trong danh sách được phép không
    if (!allowedRoles.includes(req.user.role_name)) {
      return res.status(403).json({
        status: "fail",
        message: "Bạn không có quyền hạn thực hiện hành động này!"
      });
    }

    return next(); // Hợp lệ, cho phép đi tiếp vào Controller xử lý logic!
  };
};

module.exports = {
  protect,
  restrictTo
}
