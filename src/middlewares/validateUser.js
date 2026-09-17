// src/middlewares/validateUser.js

const validate = (schema) => async (req, res, next) => {
  // Dùng safeParseAsync để Zod tự gom lỗi thành Object, TUYỆT ĐỐI KHÔNG LÀM SẬP SERVER
  const result = await schema.safeParseAsync({
    body: req.body,
    query: req.query,
    params: req.params,
  });

  // 1. Nếu Front-End truyền dữ liệu chuẩn xác 100%
  if (result.success) {
    // Gán dữ liệu đã được làm sạch và ép kiểu (Number) ngược lại vào req
    req.body = result.data.body;
    req.query = result.data.query;
    req.params = result.data.params;
    return next(); // Cho đi tiếp vào Controller ngon lành!
  }

  // 2. Nếu Front-End truyền sai dữ liệu (Zod tự sinh ra mảng result.error.issues)
  const errorMessages = result.error.issues.map((issue) => {
    // Bóc tách tên trường bị lỗi (ví dụ: lấy phần tử cuối cùng trong mảng ['body', 'email'] -> 'email')
    const fieldName = issue.path[issue.path.length - 1] || "field";
    
    return {
      field: fieldName,
      message: issue.message
    };
  });

  // Trả về mã lỗi 400 chuẩn API, cực kỳ an toàn
  return res.status(400).json({
    status: "fail",
    errors: errorMessages
  });
};

module.exports = validate;
