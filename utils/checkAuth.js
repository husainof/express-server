import bcrypt from "bcrypt";
import { verify } from "jsonwebtoken";

export default function (req, res, next) {
  const token = (req.headers.authorization || "").replace(/Bearer\s?/, "");
  if (token) {
    try {
      const decoded = verify(token, "sercer123");
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
