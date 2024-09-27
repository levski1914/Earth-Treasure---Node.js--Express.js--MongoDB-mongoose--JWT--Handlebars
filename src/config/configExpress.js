const cookieParser = require("cookie-parser");
const express = require("express");
const handleBars = require("express-handlebars");
const { session } = require("../middlewares/session");
const path = require("path");
const secret = "cookie secret";

function configExpress(app) {
  app.use(express.static(path.join(__dirname, "../static")));
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser({ secret }));
  app.use(session());
}

module.exports = { configExpress };
