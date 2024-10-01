const { Schema, model, Types } = require("mongoose");

const mineralSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  formula: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  likes: {
    type: [Types.ObjectId],
    ref: "User",
    default: [],
  },

  author: {
    type: Types.ObjectId,
    ref: "User",
  },
});

const Mineral = model("Mineral", mineralSchema);

module.exports = { Mineral };
