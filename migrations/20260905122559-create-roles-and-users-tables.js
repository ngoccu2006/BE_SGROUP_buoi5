'use strict';

var dbm;
var type;
var seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

// luồng naao cấp ( gõ lệnh npx db-migratio up)
exports.up = function(db) {
  return db.runSql(`
    -- 1. Tạo bảng roles trước
    CREATE TABLE IF NOT EXISTS roles (
        id SERIAL PRIMARY KEY,
        role_name VARCHAR(50) NOT NULL UNIQUE
    );

    -- 2. Chèn sẵn dữ liệu mẫu cho bảng roles (Để hệ thống có quyền Admin/User chạy ngay)
    INSERT INTO roles (role_name) VALUES ('Admin'), ('User'), ('Manager')
    ON CONFLICT (role_name) DO NOTHING; -- Tránh lỗi nếu dữ liệu đã tồn tại sẵn

    -- 3. Tạo bảng users có mối quan hệ khóa ngoại và cột password bảo mật
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role_id INT REFERENCES roles(id) ON DELETE SET NULL -- Tự động gán null nếu role bị xóa
    );

    -- 4. Bật tính năng mở rộng Trigram và tạo INDEX tối ưu hiệu năng tìm kiếm ILIKE
    CREATE EXTENSION IF NOT EXISTS pg_trgm;
    CREATE INDEX IF NOT EXISTS users_name_trgm_idx ON users USING gin (name gin_trgm_ops);
    CREATE INDEX IF NOT EXISTS users_email_idx ON users (email);
  `);
};

// luồng hạ (... down)
exports.down = function(db) {
  return db.runSql(`
    DROP INDEX IF EXISTS users_email_idx;
    DROP INDEX IF EXISTS users_name_trgm_idx;
    DROP TABLE IF EXISTS users;
    DROP TABLE IF EXISTS roles;
  `);
};

exports._meta = {
  "version": 1
};
