const express = require("express");

const router = express.Router();
const userController = require("./users.controller");
const validate = require("../../middlewares/validateUser");
const asyncHandler = require("../../middlewares/asyncHandler");

const { registerSchema, loginSchema,createUserSchema, queryUserSchema} = require("./users.validation")

const {protect, restrictTo} = require("../../middlewares/auth.middleware");

/**
 * @swagger
 * /users/register:
 *   post:
 *     summary: Đăng ký tài khoản thành viên mới (Ép cứng quyền User thường)
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Nguyen Van C
 *               email:
 *                 type: string
 *                 example: vanc@gmail.com
 *               password:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       201:
 *         description: Đăng ký thành công!
 *       400:
 *         description: Dữ liệu gửi lên sai định dạng (Zod chặn)
 */
router.post("/register", validate(registerSchema), asyncHandler(userController.register));

/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Đăng nhập hệ thống và cấp mã JWT Token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: vanc@gmail.com
 *               password:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Đăng nhập thành công và cấp Token!
 *       401:
 *         description: Email hoặc mật khẩu không chính xác
 */
router.post("/login", validate(loginSchema), asyncHandler(userController.login));

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Lấy danh sách thành viên (Tích hợp Phân trang, Bộ lọc, Sắp xếp)
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *         example: 10
 *       - in: query
 *         name: name
 *         schema: { type: string }
 *       - in: query
 *         name: email
 *         schema: { type: string }
 *       - in: query
 *         name: sortBy
 *         schema: { type: string }
 *         example: id
 *       - in: query
 *         name: sortOrder
 *         schema: { type: string }
 *         example: ASC
 *     responses:
 *       200:
 *         description: Trả về cục JSON danh sách dữ liệu kèm phân trang hoàn chỉnh.
 */
router.get(
  "/", 
  validate(queryUserSchema),
  asyncHandler(userController.getAllUsers));
  
router.get(
    "/:id",
    asyncHandler(userController.getUserById)
);

router.post(
    "/",
    validate(createUserSchema),
    asyncHandler(userController.createUser)
);

// lap bao mat vao put, delete (phai dang nhap moi vao dc)
/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Cập nhật thông tin thành viên (Yêu cầu đăng nhập)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của user cần cập nhật
 *         example: "123"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Nguyen Van C Updated
 *               email:
 *                 type: string
 *                 example: vanc_new@gmail.com
 *     responses:
 *       200:
 *         description: Cập nhật thông tin thành công.
 *       401:
 *         description: Chưa đăng nhập hoặc Token không hợp lệ.
 *       404:
 *         description: Không tìm thấy thành viên.
 */
router.put(
    "/:id",
    protect,
    asyncHandler(userController.updateUser)
);
// xóa role
/**
 * @swagger
 * /users/roles:
 *   delete:
 *     summary: Xóa vai trò hệ thống an toàn (Chỉ Admin - Dùng Transaction)
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [role_name]
 *             properties:
 *               role_name:
 *                 type: string
 *                 example: Manager
 *     responses:
 *       200:
 *         description: Xóa role và điều hướng user cũ thành công!
 *       403:
 *         description: Bị chặn quyền truy cập (Không phải Admin)
 */
router.delete(
    "/roles",
    protect,
    restrictTo("Admin"),
    asyncHandler(userController.deleteRoleController)
);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Xóa thành viên khỏi hệ thống (Chỉ Admin và Manager)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của user cần xóa
 *         example: "123"
 *     responses:
 *       200:
 *         description: Xóa thành viên thành công.
 *       401:
 *         description: Chưa đăng nhập hệ thống.
 *       403:
 *         description: Không đủ quyền hạn thực hiện hành động này.
 *       404:
 *         description: Không tìm thấy thành viên để xóa.
 */
router.delete(
    "/:id",
    protect,
    restrictTo("Admin", "Manager"),
    asyncHandler(userController.deleteUser)
);


// route: users/getMe
router.get("/me", asyncHandler(userController.getMe));

module.exports = router;