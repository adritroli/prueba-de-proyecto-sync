CREATE TABLE dashboard_configs (
    user_id INT PRIMARY KEY,
    config JSON NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
);

-- Insertar configuraciones por defecto
INSERT INTO
    dashboard_configs (user_id, config)
VALUES (
        1,
        '{
    "userId": 1,
    "layout": "grid",
    "widgets": [
        {"id": "1", "type": "activeSprint", "position": 0, "visible": true},
        {"id": "2", "type": "projectSummary", "position": 1, "visible": true},
        {"id": "3", "type": "tasksByStatus", "position": 2, "visible": true},
        {"id": "4", "type": "teamPerformance", "position": 3, "visible": true},
        {"id": "5", "type": "topPerformers", "position": 4, "visible": true},
        {"id": "6", "type": "userStats", "position": 5, "visible": true},
        {"id": "7", "type": "recentActivity", "position": 6, "visible": true},
        {"id": "8", "type": "mainStats", "position": 7, "visible": true}
    ]
}'
    );