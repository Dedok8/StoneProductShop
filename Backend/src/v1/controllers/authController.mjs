import UsersDBService from "../services/UsersDBService.mjs";
import {
  generateAccessToken,
  generateRefreshToken,
  parseRefreshBearer,
} from "../../../utils/jwtHelpers.mjs";
import config from "../../../config/default.mjs";
import bcrypt from "bcrypt";

// Контролер для авторизації та аутентифікації
class AuthController {
  // Реєстрація нового користувача
  static async signup(req, res, next) {
    try {
      // Отримуємо дані з тіла запиту
      const { email, username, password } = req.body;
      // Перевіряємо, чи існує користувач з таким email
      const existing = await UsersDBService.findOne({ email });
      if (existing) {
        return res.status(409).json({ error: "Email already in use" });
      }
      // Створюємо нового користувача
      const savedUser = await UsersDBService.createUser({
        email,
        username,
        password,
      });
      // Формуємо інформацію для токенів
      const userInfo = UsersDBService.getUserAuthInfo(savedUser);

      // Генеруємо accessToken і refreshToken
      const accessToken = generateAccessToken(userInfo, req.headers);
      const refreshToken = generateRefreshToken(
        { id: savedUser._id, type: "refresh" },
        req.headers
      );
      // Відправляємо refreshToken у httpOnly cookie
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true, // cookie недоступна з JS
        secure: config.nodeEnv === "production", // тільки по https у продакшені
        sameSite: "lax",
        maxAge: config.refreshCookiesExpires,
      });
      // Відправляємо accessToken у відповіді
      res.status(201).json({
        result: "Signed up successfully",
        accessToken,
        user: userInfo,
      });
    } catch (err) {
      res.status(500).json({ error: "Signup error" });
    }
  }

  // Логін користувача
  static async login(req, res, next) {
    try {
      // Знаходимо користувача по email
      const user = await UsersDBService.findUser({ email: req.body.email });

      if (!user) {
        return res
          .status(401)
          .json({ error: "Email or password is incorrect" });
      }

      // Перевіряємо пароль
      const isValid = await user.validPassword(req.body.password);

      if (!isValid) {
        // Fallback for legacy users with plain-text passwords
        const plainMatch = user.password === req.body.password;
        if (!plainMatch) {
          return res
            .status(401)
            .json({ error: "Email or password is incorrect" });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, salt);
        await user.save();
      }

      // Формуємо інформацію для токенів
      const userInfo = UsersDBService.getUserAuthInfo(user);

      // Генеруємо accessToken і refreshToken
      const accessToken = generateAccessToken(userInfo, req.headers);
      const refreshToken = generateRefreshToken(
        { id: user._id, type: "refresh" },
        req.headers
      );

      // Відправляємо refreshToken у httpOnly cookie
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: config.nodeEnv === "production", // тільки по https у продакшені
        sameSite: "lax",
        maxAge: config.refreshCookiesExpires,
      });
      // Відправляємо accessToken у відповіді
      res.json({
        result: "Authorized",
        accessToken,
        user: userInfo,
      });
    } catch (err) {
      res.status(500).json({ error: "Login error" });
    }
  }

  // Оновлення accessToken через refreshToken з cookie
  static async refreshToken(req, res, next) {
    try {
      // Дістаємо refreshToken з cookie
      const { refreshToken } = req.cookies;
      if (!refreshToken) {
        return res.status(401).json({ error: "No refresh token provided" });
      }
      let decoded;
      try {
        // Декодуємо refreshToken
        decoded = parseRefreshBearer(refreshToken, req.headers);
      } catch (err) {
        return res.status(401).json({ error: "Invalid refresh token" });
      }
      // Перевіряємо валідність токена
      if (!decoded || decoded.type !== "refresh" || !decoded.id) {
        return res.status(401).json({ error: "Invalid refresh token" });
      }
      // Знаходимо користувача
      const user = await UsersDBService.findUserById(decoded.id);
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }
      // Формуємо інформацію для нового accessToken
      const userInfo = UsersDBService.getUserAuthInfo(user);

      // Генеруємо новий accessToken
      const accessToken = generateAccessToken(userInfo, req.headers);

      // Відправляємо accessToken у відповіді
      res.json({ accessToken });
    } catch (err) {
      res.status(500).json({ error: "Refresh token error" });
    }
  }

  // Логаут користувача
  static async logout(req, res, next) {
    try {
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: config.nodeEnv === "production",
        sameSite: "lax",
      });
      res.json({ result: "Logged out" });
    } catch (err) {
      res.status(500).json({ error: "Logout error" });
    }
  }
}

// Експортуємо контролер
export default AuthController;
