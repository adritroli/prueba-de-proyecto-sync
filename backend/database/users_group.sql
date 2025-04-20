-- Eliminar la tabla si existe
DROP TABLE IF EXISTS users_group;

-- Crear la tabla users_group
CREATE TABLE users_group (
    id INT AUTO_INCREMENT PRIMARY KEY,
    team_id INT NOT NULL,
    user_id INT NOT NULL,
    role VARCHAR(50) DEFAULT 'member',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    -- Asegurar que un usuario no pueda estar más de una vez en el mismo equipo
    UNIQUE KEY unique_team_user (team_id, user_id)
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_users_group_team ON users_group(team_id);
CREATE INDEX idx_users_group_user ON users_group(user_id);

-- Insertar algunos datos de ejemplo
INSERT INTO users_group (team_id, user_id, role)
SELECT 
    t.id as team_id,
    u.id as user_id,
    'member' as role
FROM 
    teams t
    CROSS JOIN users u
WHERE 
    u.team_id IS NOT NULL 
    AND u.id = 1  -- Para el usuario admin
LIMIT 1;
