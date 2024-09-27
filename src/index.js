const express = require("express");
const { configDatabase } = require("./config/configDB");
const { configExpress } = require("./config/configExpress");
const { configHBS } = require("./config/configHandlebars");
const { configRoutes } = require("./config/configRoutes");
const { register, login } = require("./services/user");
const { createToken, verifyToken } = require("./services/jwt");
const path = require("path");
const catchErrors = require("./middlewares/catchErrors");
start();
async function start() {
  const app = express();

  await configDatabase();
  configHBS(app);
  configExpress(app);
  configRoutes(app);

  app.set("views", path.join(__dirname, "views"));

  app.use(catchErrors);
  app.use((req, res, next) => {
    res.status(404).render("404");
  });
  app.listen(3000, () => {
    console.log("Server started http://localhost:3000");
  });
}
