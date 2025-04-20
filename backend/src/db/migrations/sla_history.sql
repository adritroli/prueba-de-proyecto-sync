CREATE TABLE task_sla_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    task_id INT NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME,
    accumulated_time INT DEFAULT 0,
    FOREIGN KEY (task_id) REFERENCES tasks(id)
);
