const { Router } = require("express");
const { getRecent } = require("../services/data");

//TODO replace with real router according to exam prep
const homeRouter = Router();

homeRouter.get("/", async (req, res) => {
  const minerals = await getRecent();

  res.render("home", { minerals });
});

module.exports = { homeRouter };
