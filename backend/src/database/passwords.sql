CREATE TABLE IF NOT EXISTS password_folders (
    id VARCHAR(36) PRIMARY KEY,
    user_id INT NOT NULL, -- Cambiado de VARCHAR(36) a INT para coincidir con users.id
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS password_entries (
    id VARCHAR(36) PRIMARY KEY,
    user_id INT NOT NULL,
    folder_id VARCHAR(36),
    title VARCHAR(255) NOT NULL,
    username VARCHAR(255) NOT NULL,
    password TEXT NOT NULL,
    url TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    favorite BOOLEAN DEFAULT FALSE,
    deleted BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (folder_id) REFERENCES password_folders (id) ON DELETE SET NULL
);