const userRepository = require("./users.repository");
const roleRepository = require("../roles/roles.repository");
const pool = require("../../config/database");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken")


// read
async function getUsers(page, limit, name, email, sortBy, sortOrder){
  return await userRepository.getAllUsers(page, limit, name, email, sortBy, sortOrder);
}

async function getUserById(id){
  const user = await userRepository.getUserById(id);
  return user;
}

// create

async function createUser(name, email, role_name){
  // id auto 1->n
  const role = await roleRepository.findByName(role_name);
  if (!role){
    throw new Error(`Ten vai tro ${role_name} khong hop le tren he thong!` );
  }

  const role_id = role.id;

  // lưu xuống DB thô với dữ liệu name, email, role_id
  const rawUser =  await userRepository.createUser(name, email, role_id);

  // lấy user chuẩn có role_name

  const completedUser = await userRepository.getUserById(rawUser.id);

  return completedUser
}


//put

async function updateUser(id, name, email, role_name){
  const role = await roleRepository.findByName(role_name);

  if (!role){
    throw new Error(`Ten vai tro ${role_name} khong hop le tren he thong!` );
  }

  const role_id = role.id;
  const updatedUser = await userRepository.updateUser(id, name, email, role_id);

  const completedUser = await userRepository.getUserById(id);

  return completedUser;
}


// delete

async function deleteUser(id){
  const deletedUser = await userRepository.deleteUser(id);

  return deletedUser;
}

async function deleteRoleSafely(roleNameToDelete) {
    // 1. Lấy kết nối độc lập từ Pool để quản lý Transaction
    const client = await pool.connect();
    
    try {
        // 2. BẮT ĐẦU TRANSACTION
        await client.query('BEGIN');

        // Bước 1: Tìm ID của Role dựa vào tên và LOCK dòng này lại chống Race Condition
        const findRoleQuery = "SELECT id FROM roles WHERE role_name = $1 FOR UPDATE;";
        const roleRes = await client.query(findRoleQuery, [roleNameToDelete]);

        if (!roleRes.rows || roleRes.rows.length === 0) {
            throw new Error(`Vai trò '${roleNameToDelete}' không tồn tại để xóa!`);
        }

        const roleId = roleRes.rows[0].id; // Sửa lỗi cú pháp nhỏ từ code cũ: rows[0].id

        // Không cho phép xóa quyền mặc định (id = 2)
        if (roleId === 2) {
            throw new Error("Không được phép xóa vai trò mặc định 'User' của hệ thống!");
        }

        // Bước 2: Cập nhật toàn bộ các User mang quyền này về 'User' thông thường (id = 2)
        const updateUsersQuery = `
            UPDATE users 
            SET role_id = 2 
            WHERE role_id = $1;
        `;
        await client.query(updateUsersQuery, [roleId]);

        // Bước 3: Tiến hành xóa cái Role đó ra khỏi bảng roles
        const deleteRoleQuery = `
            DELETE FROM roles 
            WHERE id = $1 
            RETURNING *;
        `;
        await client.query(deleteRoleQuery, [roleId]);

        // 3. CHỐT HẠ (COMMIT): Mọi thứ mượt mà, lưu vĩnh viễn vào DB
        await client.query('COMMIT');

        return {
            success: true,
            message: `Đã xóa thành công vai trò '${roleNameToDelete}' và chuyển các user liên quan về quyền mặc định.`
        };

    } catch (error) {
        // 4. HOÀN NGUYÊN (ROLLBACK): Có lỗi là hủy bỏ mọi thay đổi ngay lập tức để bảo vệ dữ liệu
        await client.query('ROLLBACK');
        
        // Ném lỗi ra ngoài để middleware (asyncHandler) của ní ở tầng controller bắt lấy và xử lý tiếp
        throw error; 
        
    } finally {
        // 5. GIẢI PHÓNG: Trả kết nối về lại cho Pool, tuyệt đối chống rò rỉ kết nối (Connection Leak)
        client.release();
    }
}

// Ma hoa mkhau bangwf bcryptjs

async function registerUser(name, email, password, role_name) {
  // 1 kiemr tra xem email nay da co ai dang ky chua
  const existingUser = await userRepository.findByEmail(email);
  if(existingUser){
    throw new Error("Email nay da duoc dang ky trong he thong");
  }

  //2. tim id so ung voi cai chu role_name
  const role = await roleRepository.findByName(role_name);
  if(!role){
    throw new Error("Quyen tai khoan khong hop le");
  }

  // ma hoa mat khau: tao chuoi muoi (salt) va tien hanh bam (hash)

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // 4. goi xuong repo de chen vao postgre
  const newUser = userRepository.register(name, email, hashedPassword, role.id);

  return newUser;
};

async function loginUser(email, password){
  //1. Kiem tra su ton tai cua he thong
  const user = await userRepository.findByEmail(email);
  if(!user){
    throw new Error("Email hoac mat khau khong chinh xac");
  }

  // 2. so sanh mat khau tho do FE gui len voi mat khau da hash trong DB
  const isMatch = await bcrypt.compare(password, user.password);
  if(!isMatch){
    throw new Error("Email hoac mat khau khong chinh xac");
  }

  //3. tao the bai ho chieu JWS Token
  // Đóng gói thông tin cốt lõi của người dùng vào mã 
  const payload = {
    userId: user.id,
    userEmail: user.email
  };

  // tien hanh ky ma token bang chia khoa bi mat trong file .env
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
  });

  // tra ve token va thong tin user co ban cho fe
  return{
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email
    }
  };
};

// getMe

async function getMe(user_id) {
  const user = await userRepository.findById(user_id);
  return user;
}

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  deleteRoleSafely,
  registerUser,
  loginUser,
  getMe
};
