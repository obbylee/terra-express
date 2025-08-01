import { Request, Response, Router } from "express";

const userRoutes = Router();

userRoutes.use((res, req, next) => {
  console.log("Time:", Date.now(), " - Request to /users api route");
  next();
});

userRoutes.get("/", (req: Request, res: Response) => {
  return res.status(200).json({ message: "user route api" });
});

export default userRoutes;
