import { Request, Response } from 'express';
import { pool } from '../config/db';

export const getBoards = async (req: Request, res: Response): Promise<void> => {
    try {
        const [boards]: any = await pool.query(`
            SELECT 
                kb.*,
                p.project_name
            FROM kanban_boards kb
            LEFT JOIN projects p ON p.id = kb.project_id
            ORDER BY kb.created_at DESC
        `);

        res.json(boards);
    } catch (error) {
        console.error("Error fetching boards:", error);
        res.status(500).json({ error: "Server error" });
    }
};

export const getBoardDetails = async (req: Request, res: Response): Promise<void> => {
    try {
        const { boardId } = req.params;

        // Obtener detalles del tablero
        const [board]: any = await pool.query(`
            SELECT kb.*, p.project_name
            FROM kanban_boards kb
            LEFT JOIN projects p ON p.id = kb.project_id
            WHERE kb.id = ?
        `, [boardId]);

        // Obtener columnas del tablero
        const [columns]: any = await pool.query(`
            SELECT bc.* 
            FROM board_columns bc
            WHERE bc.board_id = ?
            ORDER BY bc.position
        `, [boardId]);

        // Obtener tareas para cada columna
        const columnsWithTasks = await Promise.all(columns.map(async (column: any) => {
            const [tasks]: any = await pool.query(`
                SELECT 
                    kt.*,
                    u.name as assigned_name
                FROM kanban_tasks kt
                LEFT JOIN users u ON u.id = kt.assigned_to
                WHERE kt.column_id = ?
                ORDER BY kt.position
            `, [column.id]);

            return {
                ...column,
                tasks: tasks || []
            };
        }));

        console.log("Board details:", { board: board[0], columns: columnsWithTasks });

        res.json({
            board: board[0],
            columns: columnsWithTasks
        });
    } catch (error) {
        console.error("Error fetching board details:", error);
        res.status(500).json({ error: "Server error" });
    }
};
