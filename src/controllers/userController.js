const { Router } = require("express");
const { isGuest } = require("../middlewares/guards");
const { register, login } = require("../services/user");
const { createToken } = require("../services/jwt");
const { parseError } = require("../utils");

const { body, validationResult } = require("express-validator");
const userRouter = Router();

userRouter.get("/register", isGuest(), (req, res) => {
  res.render("register");
});

userRouter.post(
  "/register",
  isGuest(),
  body("email")
    .trim()
    .isEmail()
    .isLength({ min: 10 })
    .withMessage("Email must be at least 10 characters long"),
  body("password")
    .trim()
    .isLength({ min: 4 })
    .withMessage("Password must be at least 4 characters long"),
  body("rePassword")
    .trim()
    .custom((value, { req }) => value == req.body.password)
    .withMessage("Passwords don't match"),
  async (req, res) => {
    const { email, password } = req.body;

    try {
      //TODO add validation
      const validation = validationResult(req);
      if (validation.errors.length) {
        throw validation.errors;
      }
      const result = await register(email, password);
      const token = createToken(result);

      res.cookie("token", token);
      res.redirect("/");
    } catch (err) {
      res.render("register", {
        data: { email },
        errors: parseError(err).errors,
      });
    }
  }
);
userRouter.get("/login", isGuest(), (req, res) => {
  res.render("login");
});

userRouter.post(
  "/login",
  isGuest(),
  body("email").trim(),
  body("password").trim(),
  async (req, res) => {
    const { email, password } = req.body;

    try {
      const result = await login(email, password);
      const token = createToken(result);

      res.cookie("token", token);
      res.redirect("/");
    } catch (err) {
      res.render("login", {
        data: { email },
        errors: parseError(err).errors,
      });
    }
  }
);

userRouter.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/");
});

module.exports = { userRouter };
