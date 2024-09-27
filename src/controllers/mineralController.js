const { Router } = require("express");
const { body, validationResult } = require("express-validator");
const { getRecent, create, getAll, getDetails } = require("../services/data");
const { isUser, isGuest } = require("../middlewares/guards");
const { parseError } = require("../utils");
//TODO replace with real router according to exam prep
const mineralRouter = Router();

const { Types } = require("mongoose");

mineralRouter.get("/create", isUser(), async (req, res) => {
  res.render("create");
});

// Create mineral/stone
mineralRouter.post(
  "/create",
  isUser(),
  body("name")
    .trim()
    .isLength({ min: 2 })
    .withMessage("name Must be at least 2 characters long"),
  body("category")
    .trim()
    .isLength({ min: 3 })
    .withMessage("category Must be at least 2 characters long"),
  body("color")
    .trim()
    .isLength({ min: 2 })
    .withMessage("color Must be at least 2 characters long"),
  body("location")
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage("location Must be between 3 and 30 characters long"),
  body("formula")
    .trim()
    .isLength({ min: 5, max: 15 })
    .withMessage("formula Must be between 5 and 15 characters long"),
  body("description")
    .trim()
    .isLength({ min: 10 })
    .withMessage("description Must be at least 10 characters long"),
  body("image")
    .trim()
    .custom((value) => {
      if (
        value.startsWith("/images/") ||
        value.startsWith("http://") ||
        value.startsWith("https://")
      ) {
        return true;
      }
      throw new Error("Invalid image URL or path.");
    })
    .withMessage("Must be valid URL"),
  async (req, res) => {
    console.log(req.user);
    try {
      const validation = validationResult(req);
      if (validation.errors.length) {
        throw validation.errors;
      }
      const result = await create(req.body, req.user._id);

      res.redirect("/dashboard");
    } catch (err) {
      res.render("create", {
        data: req.body,
        errors: parseError(err).errors,
      });
    }
  }
);
//dashboard  - get all minerals/stones
mineralRouter.get("/dashboard", async (req, res) => {
  try {
    const cards = await getAll();
    res.render("dashboard", { cards });
  } catch (err) {
    res.status(500).render("dashboard", { error: err.message });
  }
});

mineralRouter.get("/details/:id", isUser(), async (req, res, next) => {
  const id = req.params.id;

  if (!Types.ObjectId.isValid(id)) {
    return res.status(404).render("404", { error: "Invalid ID format" });
  }
  try {
    const { mineral, isOwner } = await getDetails(req.params.id, req.user._id);
    if (!mineral) {
      return res.status(404).render("404", { error: "Mineral not found" });
    }
    res.render("details", { mineral, isOwner });
  } catch (err) {
    next(err);
  }
  // console.log(mineral);
});

module.exports = { mineralRouter };
