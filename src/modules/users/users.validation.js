const {z} = require("zod"); // goi thu vien zod


// schema gac cua cho tinh nag dang ky

const registerSchema = z.object({
  body: z.object({
    name: z.string({ required_error: "Ten khong duoc de trong"}).min(2, "Ten phai tu 2 ky tu tro len"),
    email: z.string({ required_error: "Email khong duoc de trong"}).email("Email khong dung dinh dang"),
    password: z.string({ required_error: "Mat khau khong duoc de trong"}).min(6, "Mật khẩu phải từ 6 ký tự trở lên"),
    role_name: z.string().optional().default("User") 
  })
})

// 2. Schema gác cửa cho tính năng ĐĂNG NHẬP (Login)
const loginSchema = z.object({
  body: z.object({
    email: z.string({ required_error: "Email không được để trống" }).email("Email không đúng định dạng"),
    password: z.string({ required_error: "Mật khẩu không được để trống" })
  })
});

const createUserSchema = z.object({
  body: z.object({
    name: z.string({ required_error: "Tên không được để trống" })
           .min(2, "Tên phải có ít nhất 2 ký tự")
           .max(100, "Tên không được quá 100 ký tự"),
    
    email: z.string({ required_error: "Email không được để trống" })
            .email("Định dạng email không hợp lệ"),
    
    role_name: z.string({ required_error: "Vai trò không được để trống" })
  })
});

const queryUserSchema = z.object({
  query: z.object({
    page: z.string().optional().transform((val) => val ? Number(val) : undefined),
    limit: z.string().optional().transform((val) => val ? Number(val) : undefined),
    name: z.string().optional(),
    email: z.string().optional(),
    sortBy: z.string().optional(),
    sortOrder: z.string().optional()
  })
});

module.exports = {
  createUserSchema,
  queryUserSchema,
  registerSchema,
  loginSchema
};