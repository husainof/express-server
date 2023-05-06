import bcrypt from "bcrypt";
import { verify } from "jsonwebtoken";

const SECRET_KEY = process.env.SECRET_KEY;

export default function (req, res, next) {
  const token = (req.headers.authorization || "").replace(/Bearer\s?/, "");
  if (token) {
    try {
      const decoded = verify(token, SECRET_KEY);
      req.userId = decoded._id;
      next();
    } catch (err) {
      console.log(err);
      return res.status(403).json({
        message: "Нет доступа",
      });
    }
  }
}
