import { RequestHandler } from "express";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import { pool } from "../config/db";

interface DocumentationSpace {
  id?: number;
  name: string;
  description: string;
  icon: string;
  created_by?: number;
}

interface Documentation {
  id?: number;
  title: string;
  content: string;
  space_id: number;
  created_by?: number;
  updated_by?: number;
  tags?: string[];
}

// Controladores para espacios de documentación
export const getAllSpaces: RequestHandler = async (req, res) => {
  try {
    const [spaces] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM documentation_spaces ORDER BY name"
    );
    res.json(spaces);
  } catch (error) {
    console.error("Error al obtener espacios de documentación:", error);
    res.status(500).json({ message: "Error al obtener espacios de documentación" });
  }
};

export const getSpaceById: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const [spaces] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM documentation_spaces WHERE id = ?",
      [id]
    );

    if (spaces.length === 0) {
      res.status(404).json({ message: "Espacio de documentación no encontrado" });
    }

    res.json(spaces[0]);
  } catch (error) {
    console.error("Error al obtener espacio de documentación:", error);
    res.status(500).json({ message: "Error al obtener espacio de documentación" });
  }
};

export const createSpace: RequestHandler = async (req, res) => {
  try {
    const { name, description, icon } = req.body as DocumentationSpace;
    const created_by = req.body.user_id || 1; // Obtener el ID del usuario autenticado

    if (!name) {
      res.status(400).json({ message: "El nombre del espacio es obligatorio" });
      return;
    }

    const [result] = await pool.query<ResultSetHeader>(
      "INSERT INTO documentation_spaces (name, description, icon, created_by) VALUES (?, ?, ?, ?)",
      [name, description || "", icon || "📄", created_by]
    );
    res.status(201).json({
      id: result.insertId,
      name,
      description,
      icon,
      created_by,
    });
  } catch (error) {
    console.error("Error al crear espacio de documentación:", error);
    res.status(500).json({ message: "Error al crear espacio de documentación" });
  }
};

export const updateSpace: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, icon } = req.body as DocumentationSpace;

    if (!name) {
      res.status(400).json({ message: "El nombre del espacio es obligatorio" });
      return;
    }

    const [result] = await pool.query<ResultSetHeader>(
      "UPDATE documentation_spaces SET name = ?, description = ?, icon = ? WHERE id = ?",
      [name, description || "", icon || "📄", id]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ message: "Espacio de documentación no encontrado" });
      return;
    }

    res.json({
      id: parseInt(id),
      name,
      description,
      icon,
    });
  } catch (error) {
    console.error("Error al actualizar espacio de documentación:", error);
    res.status(500).json({ message: "Error al actualizar espacio de documentación" });
  }
};

export const deleteSpace: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query<ResultSetHeader>(
      "DELETE FROM documentation_spaces WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ message: "Espacio de documentación no encontrado" });
      return;
    }

    res.json({ message: "Espacio de documentación eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar espacio de documentación:", error);
    res.status(500).json({ message: "Error al eliminar espacio de documentación" });
  }
};

// Controladores para documentos
export const getAllDocuments: RequestHandler = async (req, res) => {
  try {
    const { space_id } = req.query;

    let query = `
      SELECT d.*, 
             u1.username as created_by_username, 
             u2.username as updated_by_username,
             s.name as space_name,
             s.icon as space_icon,
             (
               SELECT JSON_ARRAYAGG(t.name)
               FROM documentation_document_tags dt
               JOIN documentation_tags t ON dt.tag_id = t.id
               WHERE dt.document_id = d.id
             ) as tags
      FROM documentation d
      LEFT JOIN users u1 ON d.created_by = u1.id
      LEFT JOIN users u2 ON d.updated_by = u2.id
      JOIN documentation_spaces s ON d.space_id = s.id
    `;

    const params = [];

    if (space_id) {
      query += " WHERE d.space_id = ?";
      params.push(space_id);
    }

    query += " ORDER BY d.updated_at DESC";

    const [documents] = await pool.query<RowDataPacket[]>(query, params);

    const formattedDocuments = documents.map((doc: RowDataPacket) => ({
      ...doc,
      tags: doc.tags ? JSON.parse(doc.tags as string) : [],
    }));

    res.json(formattedDocuments);
  } catch (error) {
    console.error("Error al obtener documentos:", error);
    res.status(500).json({ message: "Error al obtener documentos" });
  }
};

export const getDocumentById: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT d.*, 
             u1.username as created_by_username, 
             u2.username as updated_by_username,
             s.name as space_name,
             s.icon as space_icon,
             (
               SELECT JSON_ARRAYAGG(t.name)
               FROM documentation_document_tags dt
               JOIN documentation_tags t ON dt.tag_id = t.id
               WHERE dt.document_id = d.id
             ) as tags
      FROM documentation d
      LEFT JOIN users u1 ON d.created_by = u1.id
      LEFT JOIN users u2 ON d.updated_by = u2.id
      JOIN documentation_spaces s ON d.space_id = s.id
      WHERE d.id = ?
    `;

    const [documents] = await pool.query<RowDataPacket[]>(query, [id]);

    if (documents.length === 0) {
      res.status(404).json({ message: "Documento no encontrado" });
      return;
    }

    const document = {
      ...documents[0],
      tags: documents[0].tags ? JSON.parse(documents[0].tags as string) : [],
    };
    res.json(document);
  } catch (error) {
    console.error("Error al obtener documento:", error);
    res.status(500).json({ message: "Error al obtener documento" });
  }
};

export const createDocument: RequestHandler = async (req, res) => {
  try {
    const { title, content, space_id, tags } = req.body as Documentation;
    const created_by = req.body.user_id || 1;
    const updated_by = created_by;

    if (!title || !space_id) {
      res.status(400).json({ message: "El título y el espacio son obligatorios" });
      return;
    }

    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      const [result] = await connection.query<ResultSetHeader>(
        "INSERT INTO documentation (title, content, space_id, created_by, updated_by) VALUES (?, ?, ?, ?, ?)",
        [title, content || "", space_id, created_by, updated_by]
      );

      const documentId = result.insertId;

      if (tags && tags.length > 0) {
        for (const tagName of tags) {
          const [existingTags] = await connection.query<RowDataPacket[]>(
            "SELECT id FROM documentation_tags WHERE name = ?",
            [tagName]
          );

          let tagId;

          if (existingTags.length > 0) {
            tagId = existingTags[0].id;
          } else {
            const [tagResult] = await connection.query<ResultSetHeader>(
              "INSERT INTO documentation_tags (name) VALUES (?)",
              [tagName]
            );
            tagId = tagResult.insertId;
          }

          await connection.query(
            "INSERT INTO documentation_document_tags (document_id, tag_id) VALUES (?, ?)",
            [documentId, tagId]
          );
        }
      }

      await connection.query(
        "INSERT INTO documentation_history (document_id, content, version, created_by) VALUES (?, ?, ?, ?)",
        [documentId, content || "", 1, created_by]
      );

      await connection.commit();
      res.status(201).json({
        id: documentId,
        title,
        content,
        space_id,
        created_by,
        updated_by,
        tags: tags || [],
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error al crear documento:", error);
    res.status(500).json({ message: "Error al crear documento" });
  }
};

export const updateDocument: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, space_id, tags } = req.body as Documentation;
    const updated_by = req.body.user_id || 1;

    if (!title || !space_id) {
      res.status(400).json({ message: "El título y el espacio son obligatorios" });
      return;
    }

    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      const [versionResult] = await connection.query<RowDataPacket[]>(
        "SELECT MAX(version) as current_version FROM documentation_history WHERE document_id = ?",
        [id]
      );

      const currentVersion = versionResult[0].current_version || 0;
      const newVersion = currentVersion + 1;

      const [result] = await connection.query<ResultSetHeader>(
        "UPDATE documentation SET title = ?, content = ?, space_id = ?, updated_by = ? WHERE id = ?",
        [title, content || "", space_id, updated_by, id]
      );

      if (result.affectedRows === 0) {
        await connection.rollback();
        res.status(404).json({ message: "Documento no encontrado" });
        return;
      }

      await connection.query(
        "DELETE FROM documentation_document_tags WHERE document_id = ?",
        [id]
      );

      if (tags && tags.length > 0) {
        for (const tagName of tags) {
          const [existingTags] = await connection.query<RowDataPacket[]>(
            "SELECT id FROM documentation_tags WHERE name = ?",
            [tagName]
          );

          let tagId;

          if (existingTags.length > 0) {
            tagId = existingTags[0].id;
          } else {
            const [tagResult] = await connection.query<ResultSetHeader>(
              "INSERT INTO documentation_tags (name) VALUES (?)",
              [tagName]
            );
            tagId = tagResult.insertId;
          }

          await connection.query(
            "INSERT INTO documentation_document_tags (document_id, tag_id) VALUES (?, ?)",
            [id, tagId]
          );
        }
      }

      await connection.query(
        "INSERT INTO documentation_history (document_id, content, version, created_by) VALUES (?, ?, ?, ?)",
        [id, content || "", newVersion, updated_by]
      );

      await connection.commit();

      res.json({
        id: parseInt(id),
        title,
        content,
        space_id,
        updated_by,
        tags: tags || [],
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error al actualizar documento:", error);
    res.status(500).json({ message: "Error al actualizar documento" });
  }
};

export const deleteDocument: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query<ResultSetHeader>(
      "DELETE FROM documentation WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ message: "Documento no encontrado" });
      return;
    }

    res.json({ message: "Documento eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar documento:", error);
    res.status(500).json({ message: "Error al eliminar documento" });
  }
};

// Controladores para etiquetas
export const getAllTags: RequestHandler = async (req, res) => {
  try {
    const [tags] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM documentation_tags ORDER BY name"
    );
    res.json(tags);
  } catch (error) {
    console.error("Error al obtener etiquetas:", error);
    res.status(500).json({ message: "Error al obtener etiquetas" });
  }
};

// Controlador para obtener el historial de versiones de un documento
export const getDocumentHistory: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT h.*, u.username as created_by_username
      FROM documentation_history h
      LEFT JOIN users u ON h.created_by = u.id
      WHERE h.document_id = ?
      ORDER BY h.version DESC
    `;

    const [history] = await pool.query<RowDataPacket[]>(query, [id]);

    res.json(history);
  } catch (error) {
    console.error("Error al obtener historial del documento:", error);
    res.status(500).json({ message: "Error al obtener historial del documento" });
  }
};

// Controlador para obtener una versión específica de un documento
export const getDocumentVersion: RequestHandler = async (req, res) => {
  try {
    const { id, version } = req.params;

    const query = `
      SELECT h.*, u.username as created_by_username
      FROM documentation_history h
      LEFT JOIN users u ON h.created_by = u.id
      WHERE h.document_id = ? AND h.version = ?
    `;

    const [versions] = await pool.query<RowDataPacket[]>(query, [id, version]);

    if (versions.length === 0) {
      res.status(404).json({ message: "Versión del documento no encontrada" });
      return;
    }

    res.json(versions[0]);
  } catch (error) {
    console.error("Error al obtener versión del documento:", error);
    res.status(500).json({ message: "Error al obtener versión del documento" });
  }
};
