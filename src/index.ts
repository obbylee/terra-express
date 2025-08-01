import * as dotenv from "dotenv";
import express from "express";

import authRouter from "./routes/authRoutes";
import categoryRoutes from "./routes/categoryRoutes";
import featureRoutes from "./routes/featureRoutes";
import spaceRoutes from "./routes/spaceRoutes";
import typeRoutes from "./routes/typeRoutes";
import userRoutes from "./routes/userRoutes";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/categories", categoryRoutes);
app.use("/api/features", featureRoutes);
app.use("/api/spaces", spaceRoutes);
app.use("/api/types", typeRoutes);
app.use("/api/users", userRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Hello from TypeScript Express!" });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log(`Node Environment: ${process.env.NODE_ENV}`);
});
