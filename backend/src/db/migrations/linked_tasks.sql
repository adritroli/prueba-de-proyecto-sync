-- Primero, asegurarnos de que task_key es una clave primaria en la tabla tasks
ALTER TABLE tasks ADD PRIMARY KEY (task_key);

-- Luego crear la tabla linked_tasks con los índices necesarios
CREATE TABLE linked_tasks (
    id SERIAL PRIMARY KEY,
    task_key VARCHAR(50) NOT NULL,
    linked_task_key VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_task FOREIGN KEY (task_key) REFERENCES tasks(task_key),
    CONSTRAINT fk_linked_task FOREIGN KEY (linked_task_key) REFERENCES tasks(task_key),
    CONSTRAINT unique_link UNIQUE (task_key, linked_task_key)
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_linked_tasks_task_key ON linked_tasks(task_key);
CREATE INDEX idx_linked_tasks_linked_task_key ON linked_tasks(linked_task_key);
