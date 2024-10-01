module.exports = (err, req, res, next) => {
  console.log(err.stack);

  // Проверка за грешка от тип CastError, свързана с ObjectId
  if (err.name === "CastError" && err.kind === "ObjectId") {
    return res.status(404).render("404", { error: "Invalid ID format" });
  }
};
