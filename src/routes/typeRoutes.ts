import { Request, Response, Router } from "express";

const typeRoutes = Router();

typeRoutes.use((res, req, next) => {
  console.log("Time:", Date.now(), " - Request to /types api route");
  next();
});

typeRoutes.get("/", (req: Request, res: Response) => {
  return res.status(200).json({ message: "Type route api" });
});

export default typeRoutes;
