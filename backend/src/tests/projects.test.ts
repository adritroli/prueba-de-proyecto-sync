import request from "supertest";
import app from "../app"; // Asegúrate de exportar tu app de Express

describe("GET /api/projects", () => {
  it("debe devolver un array de proyectos", async () => {
    const res = await request(app).get("/api/projects");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});
