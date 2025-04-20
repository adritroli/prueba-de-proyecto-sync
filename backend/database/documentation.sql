-- Tabla de espacios de documentación
CREATE TABLE documentation_spaces (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(10) DEFAULT '📄',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INT,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Tabla de documentos
CREATE TABLE documentation (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content LONGTEXT,
    space_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INT,
    updated_by INT,
    FOREIGN KEY (space_id) REFERENCES documentation_spaces(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Tabla de etiquetas de documentos
CREATE TABLE documentation_tags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de relación entre documentos y etiquetas (muchos a muchos)
CREATE TABLE documentation_document_tags (
    document_id INT NOT NULL,
    tag_id INT NOT NULL,
    PRIMARY KEY (document_id, tag_id),
    FOREIGN KEY (document_id) REFERENCES documentation(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES documentation_tags(id) ON DELETE CASCADE
);

-- Tabla de historial de versiones de documentos
CREATE TABLE documentation_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    document_id INT NOT NULL,
    content LONGTEXT,
    version INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT,
    FOREIGN KEY (document_id) REFERENCES documentation(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Insertar espacios de documentación predeterminados
INSERT INTO documentation_spaces (name, description, icon, created_by) VALUES
('Desarrollo', 'Documentación técnica para desarrolladores', '💻', 1),
('Guías de Usuario', 'Manuales y tutoriales para usuarios finales', '📚', 1),
('Procesos', 'Documentación de procesos internos', '📋', 1);

-- Insertar etiquetas predeterminadas
INSERT INTO documentation_tags (name) VALUES
('guía'),
('tutorial'),
('referencia'),
('api'),
('desarrollo'),
('configuración'),
('usuario'),
('proceso');
