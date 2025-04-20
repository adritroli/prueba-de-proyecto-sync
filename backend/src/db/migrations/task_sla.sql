CREATE TABLE task_sla (
    id INT AUTO_INCREMENT PRIMARY KEY,
    task_id INT NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME,
    total_time INT, -- tiempo en minutos
    status VARCHAR(50) DEFAULT 'active',
    FOREIGN KEY (task_id) REFERENCES tasks(id)
);

CREATE TABLE task_sla_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    task_id INT NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME,
    accumulated_time INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    FOREIGN KEY (task_id) REFERENCES tasks(id)
);
