import { Request, Response, Router } from "express";

const categoryRoutes = Router();

categoryRoutes.use((res, req, next) => {
  console.log("Time:", Date.now(), " - Request to /category api route");
  next();
});

categoryRoutes.get("/", (req: Request, res: Response) => {
  return res.status(200).json({ message: "Category route api" });
});

export default categoryRoutes;
