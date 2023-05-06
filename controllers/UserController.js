import { validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

import UserModel from "../models/User.js";

const SECRET_KEY = process.env.SECRET_KEY;

export default class {
  static getMe = async (req, res) => {
    try {
      const user = await UserModel.findById(req.userId);
      if (!user) {
        return res.status(404).json({
          message: "Пользователь не найден",
        });
      }

      const { passwordHash, ...userData } = user._doc;
      res.json({
        ...userData,
      });
    } catch (err) {
      return res.status(500).json({
        message: "Нет доступа",
      });
    }
  };
  static register = async (req, res) => {
    try {
      // Валидируем поля тела
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json(errors.array());
      }

      // Проверяем нет ли такого пользователя

      const candidate = await UserModel.findOne({ fullName: req.body.fullName })
      if (candidate) {
        throw new Error(`Пользователь с именем ${req.body.fullName} уже существует`)
      }

      // Шифруем пароль
      const password = req.body.password;
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);

      // Записываем модель в бд
      const doc = new UserModel({
        fullName: req.body.fullName,
        email: req.body.email,
        passwordHash: hash,
      });

      // Сохраняем изменения
      const user = await doc.save();

      // Формируем токен
      const token = jwt.sign(
        {
          _id: user._id,
        },
        SECRET_KEY,
        {
          expiresIn: "30d",
        }
      );

      const { passwordHash, ...userData } = user._doc;

      res.json({
        ...userData,
        token,
      });
    } catch (err) {
      res.status(500).json({
        message: "Не удалось зарегистрироваться",
      });
    }
  };
  static login = async (req, res) => {
    try {
      // Ищем user  в базе данных
      const user = await UserModel.findOne({ email: req.body.email });

      // Если такого нет, отправляем статус 404
      if (!user) {
        return res.status(404).json({
          message: "Пользователь не найден",
        });
      }

      // Проверяем пароль
      const isValidPassword = await bcrypt.compare(
        req.body.password,
        user._doc.passwordHash
      );
      // Если пароль неверный, отправляем статус 404
      if (!isValidPassword) {
        return res.status(404).json({
          message: "Неверный логин или пароль",
        });
      }

      // Формируем токен
      const token = jwt.sign(
        {
          _id: user._id,
        },
        SECRET_KEY, // нужно выделить в отдельный файл
        {
          expiresIn: "30d", // тоже самое
        }
      );

      // Достаем данные пользователя, кроме пароля
      const { passwordHash, ...userData } = user._doc;

      // Отправлем ответ
      res.json({
        ...userData,
        token,
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        message: "Не удалось авторизоваться",
      });
    }
  };
}
