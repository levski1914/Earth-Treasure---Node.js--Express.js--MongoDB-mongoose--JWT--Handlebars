const { Router } = require("express");
const { body, validationResult } = require("express-validator");
const {
  getRecent,
  create,
  getAll,
  getDetails,
  deleteById,
  getById,
  likeMineral,
  update,
} = require("../services/data");
const { isUser, isGuest, ownerOnly } = require("../middlewares/guards");
const { parseError } = require("../utils");
//TODO replace with real router according to exam prep
const mineralRouter = Router();

const { Types } = require("mongoose");
const { Mineral } = require("../models/Minerals");

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

//===========================

//DETAILS

//==========================
mineralRouter.get("/details/:id", async (req, res, next) => {
  const id = req.params.id;

  if (!Types.ObjectId.isValid(id)) {
    return res.status(404).render("404", { error: "Invalid ID format" });
  }
  try {
    const mineral = await Mineral.findById(id).lean();
    if (!mineral) {
      return res.status(404).render("404", { error: "Mineral not found" });
    }

    const isOwner = req.user?._id == mineral.author.toString();
    const hasLiked = Boolean(
      mineral.likes.find((l) => req.user?._id == l.toString())
    );
    res.render("details", { mineral, hasLiked, isOwner });
  } catch (err) {
    next(err);
  }
  // console.log(mineral);
});
//================================

// DELETE

//=============================
mineralRouter.get("/delete/:id", ownerOnly(), async (req, res, next) => {
  const id = req.params.id;
  console.log("ID за изтриване: ", id);
  if (!Types.ObjectId.isValid(id)) {
    return res.status(404).render("404", { error: "Invalid Id format" });
  }
  try {
    await deleteById(id, req.user._id);
    res.redirect("/dashboard");
  } catch (err) {
    next(err);
  }
});

mineralRouter.get("/edit/:id", ownerOnly(), async (req, res) => {
  const mineral = await getById(req.params.id);

  if (!mineral) {
    res.render("404");
    return;
  }

  const isOwner = req.user._id == mineral.author.toString();

  if (!isOwner) {
    res.redirect("/login");
    return;
  }
  res.render("edit", { data: mineral });
});

mineralRouter.post(
  "/edit/:id",
  ownerOnly(),
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
    console.log(req.params.id);
    const mineralId = req.params.id;
    const userId = req.user._id;
    try {
      const validation = validationResult(req);
      if (validation.errors.length) {
        throw validation.errors;
      }
      const result = await update(mineralId, req.body, req.user._id);

      res.redirect("/details/" + mineralId);
    } catch (err) {
      res.render("edit", {
        data: req.body,
        errors: parseError(err).errors,
      });
    }
  }
);

mineralRouter.get("/like/:id", isUser(), async (req, res) => {
  const mineralId = req.params.id;
  const userId = req.user._id;

  try {
    const result = await likeMineral(mineralId, userId);
    res.redirect("/details/" + mineralId);
  } catch (err) {
    res.status(500).render("/details", { error: err.message });
  }
});

mineralRouter.get("/search", async (req, res) => {
  const minerals = await getAll();
  res.render("search", { minerals });
});

mineralRouter.post("/search", async (req, res) => {
  const searchQuery = req.body.search;

  try {
    let minerals;

    if (searchQuery) {
      const regex = new RegExp(searchQuery, "i");

      minerals = await Mineral.find({ name: { $regex: regex } }).lean();
    } else {
      minerals = await Mineral.find().lean();
    }

    res.render("search", { minerals, searchQuery });
  } catch (err) {
    res.status(500).render("search", { error: err.message });
  }
});

module.exports = { mineralRouter };
