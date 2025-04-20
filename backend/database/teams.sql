-- Eliminar la tabla si existe
DROP TABLE IF EXISTS teams;

-- Crear la tabla teams
CREATE TABLE teams (
    id INT AUTO_INCREMENT PRIMARY KEY,
    team_name VARCHAR(100) NOT NULL,
    description TEXT,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insertar algunos equipos de ejemplo
INSERT INTO teams (team_name, description, status) VALUES 
('Backend Team', 'Equipo de desarrollo backend', 'active'),
('Frontend Team', 'Equipo de desarrollo frontend', 'active'),
('QA Team', 'Equipo de testing y calidad', 'active'),
('DevOps Team', 'Equipo de operaciones', 'active'),
('UX/UI Team', 'Equipo de diseño', 'active');

-- Verificar que los datos se insertaron correctamente
SELECT * FROM teams;
