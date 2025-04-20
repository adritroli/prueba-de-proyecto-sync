-- Active: 1743409748847@@127.0.0.1@3306@task_manager
-- Agregar columna de color para los proyectos si no existe
ALTER TABLE projects
ADD COLUMN badge_color VARCHAR(7) DEFAULT '#4B5563';

-- Actualizar colores por defecto para proyectos existentes según su código
-- Solo actualiza si el color actual es el por defecto
UPDATE projects 
SET badge_color = 
    CASE code
        WHEN 'DEVFE' THEN '#2563EB'  -- Azul para Frontend
        WHEN 'DEVBE' THEN '#DC2626'  -- Rojo para Backend
        WHEN 'QA' THEN '#059669'     -- Verde para QA
        WHEN 'DEVOPS' THEN '#9333EA' -- Púrpura para DevOps
        WHEN 'UI' THEN '#F59E0B'     -- Naranja para UI/UX
        ELSE badge_color             -- Mantiene el color existente si ya fue personalizado
    END
WHERE badge_color = '#4B5563';      -- Solo actualiza los que tienen el color por defecto

-- Crear índice para mejorar el rendimiento si no existe
CREATE INDEX idx_project_code ON projects(code);
