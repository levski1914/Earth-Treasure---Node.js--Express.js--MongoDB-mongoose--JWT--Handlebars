const { Mineral } = require("../models/Minerals");
function isUser() {
  return function (req, res, next) {
    if (!req.user) {
      res.redirect("/login");
    } else {
      next();
    }
  };
}

function isGuest() {
  return function (req, res, next) {
    if (req.user) {
      res.redirect("/");
    } else {
      next();
    }
  };
}

function ownerOnly() {
  return async function (req, res, next) {
    try {
      const mineral = await Mineral.findById(req.params.id);
      if (!mineral) {
        return res.status(404).render("404", { error: "Mineral not found" });
      }

      console.log("Потребителят: ", req.user._id);
      console.log("Авторът на минерала: ", mineral.author);

      if (mineral.author.equals(req.user._id)) {
        next();
      } else {
        return res.redirect("/");
      }
    } catch (err) {
      console.log(err);
      return res.status(500).send("Server error");
    }
  };
}

module.exports = {
  isUser,
  isGuest,
  ownerOnly,
};
