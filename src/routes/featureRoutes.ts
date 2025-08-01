import { Request, Response, Router } from "express";

const featureRoutes = Router();

featureRoutes.use((res, req, next) => {
  console.log("Time:", Date.now(), " - Request to /features api route");
  next();
});

featureRoutes.get("/", (req: Request, res: Response) => {
  return res.status(200).json({ message: "Feature route api" });
});

export default featureRoutes;
