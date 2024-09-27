const handleBars = require("express-handlebars");

function configHBS(app) {
  app.engine(
    "hbs",
    handleBars.engine({
      extname: "hbs",
    })
  );

  app.set("view engine", "hbs");
}

module.exports = { configHBS };
