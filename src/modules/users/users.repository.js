const pool = require("../../config/database");

async function getAllUsers(page, limit, name, email, sortBy, sortOrder){

  let query = `
    SELECT u.id, u.name, u.email, r.role_name
    FROM users u
    LEFT JOIN roles r ON u.role_id = r.id
    `;

  let countQuery = "SELECT COUNT(*) FROM users u LEFT JOIN roles r ON u.role_id = r.id";

  const conditions = [];
  const values = [];

  // filtering
  if (name) {
    values.push(`%${name}%`);
    conditions.push(`u.name ILIKE $${values.length}`);
  }

  if (email) {
    values.push(`%${email}%`);
    conditions.push(`u.email ILIKE $${values.length}`);
  }

  if (conditions.length > 0) {
    const whereClause = ` WHERE ${conditions.join(" AND ")}`;
    query += whereClause;
    countQuery += whereClause;
  }

  // Sorting dynamic
  // Chống sql injection bằng cách chỉ cho phép các cột hợp lệ trong DB
  const allowedColumns = ['id', 'name', 'email', 'role_name'];
  const rawSortBy = allowedColumns.includes(sortBy) ? sortBy : 'id';

  // neu FE muốn xếp theo role_name thì trỏ sang bảng r, còn lại trỏ sang bảng u
  const safeSortBy = rawSortBy === 'role_name' ? 'r.role_name' : `u.${rawSortBy}`;
  const safeSortOrder = ['ASC', 'DESC'].includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'ASC';
  query += ` ORDER BY ${safeSortBy} ${safeSortOrder}`;

  // luu do dai mang values
  const filterParamsCount = values.length;

  // pagination

  // thuc hienj khi fe truyen day du page and limit
  if (page && limit) {

    const offset = (page - 1) * limit;

    values.push(limit);
    query += ` LIMIT $${values.length}`;

    values.push(offset);
    query += ` OFFSET $${values.length}`;
  }

  // thuc thi truy van song song (optimization)
  const [dataResult, countResult] = await Promise.all([
    pool.query(query, values),
    pool.query(countQuery, values.slice(0, filterParamsCount))
  ]);

  return {
    users: dataResult.rows,
    total: parseInt(countResult.rows[0].count, 10)
  };
}

async function getUserById(id){
  const query = `
    SELECT u.id, u.name, u.email, r.role_name 
    FROM users u
    LEFT JOIN roles r ON u.role_id = r.id
    WHERE u.id = $1;
  `;

  const result = await pool.query(query, [id]);

  return result.rows[0] || null;
}

async function createUser(name, email, role_id){
  const result = await pool.query(
    "INSERT INTO users (name, email, role_id) VALUES ($1, $2, $3) RETURNING *",
    [name, email, role_id]
  );

  return result.rows[0];
}

async function updateUser(id, name, email, role_id){
  const result = await pool.query(
    "UPDATE users SET name = $1, email = $2, role_id = $3 WHERE id = $4 RETURNING *",
    [name, email, role_id, id]
  );

  if(!result || !result.rows || result.rows.length === 0){
    return null;
  }

  return result.rows[0];
}

async function deleteUser(id){
  const query = `
    DELETE FROM users 
    WHERE id = $1 
    RETURNING id, name, email, role_id;
  `;

  const result = await pool.query(query, [id]);

   if (!result || !result.rows || result.rows.length === 0) {
    return null; 
  }

  return result.rows[0];
}


// Dang ky

async function register(name, email, hashedPassword, role_id){
  const query = `
    INSERT INTO users (name, email, password, role_id)
    VALUES ($1, $2, $3, $4)
    RETURNING id, name, email;
  `

  const result = await pool.query(query, [name, email, hashedPassword, role_id]);
  return result.rows[0];
}

async function findByEmail(email){
  const query = "SELECT * FROM users WHERE email = $1;";
  const result = await pool.query(query, [email]);
  
  return result.rows[0] || null; 
}

async function findById(id) {
  const result = await pool.query(
    "SELECT id, name, email, age, role FROM users WHERE id = $1",
    [id]
  );
  return result.rows[0] || null;
};

module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    register,
    findByEmail,
    findById
};