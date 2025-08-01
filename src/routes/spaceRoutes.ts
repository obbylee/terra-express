import { Request, Response, Router } from "express";

const spaceRoutes = Router();

spaceRoutes.use((res, req, next) => {
  console.log("Time:", Date.now(), " - Request to /spaces api route");
  next();
});

spaceRoutes.get("/", (req: Request, res: Response) => {
  return res.status(200).json({ message: "Space route api" });
});

export default spaceRoutes;
