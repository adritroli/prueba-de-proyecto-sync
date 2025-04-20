-- Tabla de sprints
CREATE TABLE sprints (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    goal TEXT,
    status ENUM('planned', 'active', 'completed') DEFAULT 'planned',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de tareas
CREATE TABLE tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    assignee INT,
    sprint_id INT,
    story_points INT DEFAULT 1,
    tags JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    due_date DATE,
    status_id INT NOT NULL,
    project_id INT,
    FOREIGN KEY (assignee) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (sprint_id) REFERENCES sprints(id) ON DELETE SET NULL,
    FOREIGN KEY (status_id) REFERENCES task_status(id),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL
);

-- Tabla de estados de tareas
CREATE TABLE task_status (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    color VARCHAR(20) NOT NULL,
    description TEXT,
    order_index INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Modificar la tabla tasks para usar la referencia
ALTER TABLE tasks
    DROP COLUMN status,
    ADD COLUMN status_id INT NOT NULL,
    ADD FOREIGN KEY (status_id) REFERENCES task_status(id);

-- Insertar estados predefinidos
INSERT INTO task_status (name, color, description, order_index) VALUES
('backlog', '#666666', 'Tareas pendientes de planificación', 1),
('todo', '#3498db', 'Tareas listas para comenzar', 2),
('in_progress', '#f1c40f', 'Tareas en curso', 3),
('review', '#9b59b6', 'Tareas en revisión', 4),
('done', '#2ecc71', 'Tareas completadas', 5);

-- Actualizar las tareas existentes para usar los nuevos IDs de estado
UPDATE tasks
SET status_id = (
    SELECT id FROM task_status
    WHERE name = tasks.status
);

-- Tabla de comentarios de tareas (opcional)
CREATE TABLE task_comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    task_id INT NOT NULL,
    user_id INT NOT NULL,
    comment TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabla de historial de cambios de tareas (opcional)
CREATE TABLE task_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    task_id INT NOT NULL,
    user_id INT NOT NULL,
    field_changed VARCHAR(50) NOT NULL,
    old_value TEXT,
    new_value TEXT,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabla de proyectos
CREATE TABLE projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(10) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    status ENUM('active', 'paused', 'completed') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    team_id INT,
    manager_id INT,
    badge_color VARCHAR(7) DEFAULT '#4B5563',
    FOREIGN KEY (team_id) REFERENCES teams(id),
    FOREIGN KEY (manager_id) REFERENCES users(id),
    UNIQUE (code)
);

-- Agregar campo de proyecto a las tareas
ALTER TABLE tasks
    ADD COLUMN project_id INT,
    ADD FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL;

-- Índices para mejorar el rendimiento
CREATE INDEX idx_tasks_status_id ON tasks(status_id);
CREATE INDEX idx_tasks_sprint ON tasks(sprint_id);
CREATE INDEX idx_tasks_assignee ON tasks(assignee);
CREATE INDEX idx_sprints_status ON sprints(status);
CREATE INDEX idx_tasks_project ON tasks(project_id);

-- Verificar la estructura de la tabla teams
DESCRIBE teams;

-- Insertar equipos de ejemplo si no existen
INSERT INTO teams (team_name, description, audit_date) VALUES 
('Desarrollo Backend', 'Equipo de desarrollo backend', NOW()),
('Desarrollo Frontend', 'Equipo de desarrollo frontend', NOW()),
('QA', 'Equipo de control de calidad', NOW()),
('DevOps', 'Equipo de operaciones', NOW());

-- Consultar los equipos existentes y sus IDs
SELECT id, team_name FROM teams;

-- Agregar algunos datos de ejemplo
INSERT INTO sprints (name, start_date, end_date, goal, status) VALUES
('Sprint 1', '2024-03-01', '2024-03-15', 'Implementar funcionalidades básicas', 'completed'),
('Sprint 2', '2024-03-16', '2024-03-30', 'Mejorar la experiencia de usuario', 'active'),
('Sprint 3', '2024-04-01', '2024-04-15', 'Optimizar rendimiento', 'planned');

INSERT INTO tasks (title, description, priority, status_id, story_points, tags) VALUES
('Implementar login', 'Crear sistema de autenticación', 'high', (SELECT id FROM task_status WHERE name = 'done'), 5, '["auth", "security"]'),
('Diseñar dashboard', 'Crear diseño responsive del dashboard', 'medium', (SELECT id FROM task_status WHERE name = 'in_progress'), 3, '["ui", "frontend"]'),
('Optimizar consultas', 'Mejorar rendimiento de consultas SQL', 'high', (SELECT id FROM task_status WHERE name = 'todo'), 8, '["backend", "performance"]'),
('Agregar tests', 'Implementar tests unitarios', 'medium', (SELECT id FROM task_status WHERE name = 'backlog'), 5, '["testing"]'),
('Fix bug #123', 'Corregir error en formulario de registro', 'urgent', (SELECT id FROM task_status WHERE name = 'review'), 2, '["bug", "frontend"]');

-- Actualizar los proyectos existentes con códigos por defecto
UPDATE projects SET code = CONCAT('PROJ', id) WHERE code IS NULL;

-- Actualizar algunos proyectos con colores por defecto
UPDATE projects SET badge_color = '#2563EB' WHERE code = 'DEVFE';
UPDATE projects SET badge_color = '#DC2626' WHERE code = 'DEVBE';
UPDATE projects SET badge_color = '#059669' WHERE code = 'QA';
