-- Crear base de datos
CREATE DATABASE IF NOT EXISTS task_manager;
USE task_manager;

-- Tabla de usuarios
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100),
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    avatar VARCHAR(255),
    user_status ENUM('active', 'inactive', 'paused', 'deleted') DEFAULT 'active',
    connection_status ENUM('online', 'away', 'offline') DEFAULT 'offline',
    last_connection TIMESTAMP NULL,
    role_group_id INT,
    team_id INT,
    audit_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modif_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de roles
CREATE TABLE role_group (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name_rol VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    audit_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de equipos
CREATE TABLE teams (
    id INT AUTO_INCREMENT PRIMARY KEY,
    team_name VARCHAR(100) NOT NULL,
    description TEXT,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de proyectos
CREATE TABLE projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(10) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    status ENUM('active', 'paused', 'completed') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    team_id INT,
    manager_id INT,
    FOREIGN KEY (team_id) REFERENCES teams(id),
    FOREIGN KEY (manager_id) REFERENCES users(id)
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

-- Modificar la tabla tasks
CREATE TABLE tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    task_number INT,
    project_code VARCHAR(10),
    task_key VARCHAR(20),  -- Ya no será una columna generada
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

-- Crear trigger para generar el task_key
DELIMITER //
CREATE TRIGGER before_task_insert 
BEFORE INSERT ON tasks
FOR EACH ROW 
BEGIN
    DECLARE project_code_val VARCHAR(10);
    
    -- Obtener el código del proyecto
    SELECT code INTO project_code_val
    FROM projects 
    WHERE id = NEW.project_id;
    
    -- Establecer el project_code
    SET NEW.project_code = COALESCE(project_code_val, 'GEN');
    
    -- Generar el task_key
    SET NEW.task_key = CONCAT(NEW.project_code, '-', LPAD(NEW.task_number, 3, '0'));
END//
DELIMITER ;

-- Tabla de comentarios de tareas
CREATE TABLE task_comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    task_id INT NOT NULL,
    user_id INT NOT NULL,
    comment TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabla de historial de cambios
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

-- Insertar estados predefinidos de tareas
INSERT INTO task_status (name, color, description, order_index) VALUES
('backlog', '#666666', 'Tareas pendientes de planificación', 1),
('todo', '#3498db', 'Tareas listas para comenzar', 2),
('in_progress', '#f1c40f', 'Tareas en curso', 3),
('review', '#9b59b6', 'Tareas en revisión', 4),
('done', '#2ecc71', 'Tareas completadas', 5);

-- Insertar roles básicos
INSERT INTO role_group (name_rol, description) VALUES
('admin', 'Administrador del sistema'),
('project_manager', 'Gestor de proyectos'),
('team_leader', 'Líder de equipo'),
('developer', 'Desarrollador');

-- Insertar equipos de ejemplo
INSERT INTO teams (team_name, description) VALUES
('Backend Team', 'Equipo de desarrollo backend'),
('Frontend Team', 'Equipo de desarrollo frontend'),
('QA Team', 'Equipo de testing y calidad'),
('DevOps Team', 'Equipo de operaciones'),
('UX/UI Team', 'Equipo de diseño');

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_tasks_status_id ON tasks(status_id);
CREATE INDEX idx_tasks_sprint ON tasks(sprint_id);
CREATE INDEX idx_tasks_assignee ON tasks(assignee);
CREATE INDEX idx_sprints_status ON sprints(status);
CREATE INDEX idx_tasks_project ON tasks(project_id);
CREATE INDEX idx_users_team ON users(team_id);
CREATE INDEX idx_users_role ON users(role_group_id);

ALTER TABLE users
ADD COLUMN IF NOT EXISTS banner_url VARCHAR(255) DEFAULT '/banners/default-banner.jpg';

-- Tabla de módulos del sistema
CREATE TABLE IF NOT EXISTS modulos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    modulo_name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de permisos por rol
CREATE TABLE IF NOT EXISTS role_permissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role_group_id INT NOT NULL,
    modulo_id INT NOT NULL,
    view BOOLEAN DEFAULT FALSE,
    create BOOLEAN DEFAULT FALSE,
    edit BOOLEAN DEFAULT FALSE,
    delete BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (role_group_id) REFERENCES role_group(id) ON DELETE CASCADE,
    FOREIGN KEY (modulo_id) REFERENCES modulos(id) ON DELETE CASCADE,
    UNIQUE KEY unique_role_module (role_group_id, modulo_id)
);

-- Insertar módulos base
INSERT INTO modulos (modulo_name, description) VALUES
('users', 'Gestión de usuarios'),
('teams', 'Gestión de equipos'),
('projects', 'Gestión de proyectos'),
('tasks', 'Gestión de tareas'),
('documentation', 'Documentación'),
('settings', 'Configuración del sistema');
