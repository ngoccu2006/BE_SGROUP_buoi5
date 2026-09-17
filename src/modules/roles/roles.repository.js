const pool = require("../../config/database");

async function findByName(roleName){
  const query = "SELECT id FROM roles WHERE role_name = $1;";
  const result = await pool.query(query, [roleName]);
  
  return result.rows[0] || null; 
}

module.exports = {
  findByName
}