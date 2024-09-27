//TODO import routers

const { homeRouter } = require("../controllers/homeController");
const { mineralRouter } = require("../controllers/mineralController");
const { userRouter } = require("../controllers/userController");

function configRoutes(app) {
  app.use(homeRouter);
  app.use(userRouter);
  app.use(mineralRouter);
  //TODO register routes
}

module.exports = { configRoutes };
