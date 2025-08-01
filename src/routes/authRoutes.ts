import { Router, Request, Response } from "express";

const authRoutes = Router();

// Middleware specific to this router (optional)
authRoutes.use((req, res, next) => {
  console.log("Time:", Date.now(), " - Request to /api/items route");
  next(); // Pass control to the next middleware/route handler
});

authRoutes.get("/", (req: Request, res: Response) => {
  return res.json({ message: "Auth route" }).status(200);
});

export default authRoutes;
