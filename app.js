import express from "express";
import * as dotnev from 'dotenv';
import mongoose from "mongoose";

import { registerValidation } from "./validations/auth.js";

import checkAuth from "./utils/checkAuth.js";
import UserController from "./controllers/UserController.js";

dotnev.config()
// Подключение бд
mongoose.set("strictQuery", false);
mongoose
  .connect(
    "mongodb+srv://radik:1qaz2wsx@baza.xeku6si.mongodb.net/blog?retryWrites=true&w=majority" // Вынести в отдельный файл
  )
  .then(() => console.log("Db ok"))
  .catch((err) => console.log("Db error", err));

// Создаем экземпляр приложения
const app = express();

app.use(express.json());

// -------------- Описание путей --------------//

app.get("/me", checkAuth, UserController.getMe);

// Регистрация
app.post("/register", registerValidation, UserController.register);

// Авторизация
app.post("/login", UserController.login);

// Запуск сервера
app.listen(5000, (err) =>
  err ? console.log(err) : console.log("Server is running")
);
