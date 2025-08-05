import "dotenv/config";
import { sign, verify } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your_super_secret_jwt_key";

interface TokenPayload {
  userId: string;
  email: string;
}

export const createToken = (payload: TokenPayload): string => {
  const token = sign(payload, JWT_SECRET, {
    expiresIn: "1h",
  });
  return token;
};

export const validateToken = (token: string): TokenPayload | null => {
  try {
    const payload = verify(token, JWT_SECRET) as TokenPayload;
    return payload;
  } catch (error) {
    console.error("JWT validation failed:", error);
    return null;
  }
};
