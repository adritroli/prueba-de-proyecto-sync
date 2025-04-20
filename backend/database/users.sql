DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100),
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    avatar VARCHAR(255) DEFAULT 'default-avatar.png',
    user_status ENUM('active', 'inactive', 'paused', 'deleted') DEFAULT 'active',
    connection_status ENUM('online', 'away', 'offline') DEFAULT 'offline',
    last_connection TIMESTAMP NULL,
    role_group_id INT,
    team_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_group_id) REFERENCES role_group(id),
    FOREIGN KEY (team_id) REFERENCES teams(id)
);

-- Insertar un usuario administrador de ejemplo
INSERT INTO users (
    name, last_name, username, email, password, 
    role_group_id, team_id, user_status
) VALUES (
    'Admin', 'System', 'admin', 'admin@system.com', 
    '$2a$10$X8DZmVZI6SyPKZ4SxG5Yk.EaxcpRK9oLtZ5Hbb6M1VQRg7bTAZH.a', -- password: admin123
    1, 1, 'active'
);
