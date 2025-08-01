import argon2 from "argon2";

export async function hashPassword(password: string): Promise<string> {
  try {
    const options = {
      type: argon2.argon2id, // Recommended variant
      memoryCost: 16384, // 16 MB of RAM
      timeCost: 2, // Number of iterations
      parallelism: 1, // Number of threads
    };
    const hash = await argon2.hash(password, options);
    return hash;
  } catch (err) {
    console.error(err);
    throw new Error("Password hashing failed.");
  }
}

export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  try {
    return await argon2.verify(hash, password);
  } catch (err) {
    console.error(err);
    return false;
  }
}
