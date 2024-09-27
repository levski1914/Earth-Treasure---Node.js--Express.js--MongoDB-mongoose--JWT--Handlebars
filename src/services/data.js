// TODO CRUD
const { Mineral } = require("../models/Minerals");
//TODO replace with real data service according to exam desc

async function getAll() {
  return Mineral.find().lean();
}

async function getRecent() {
  return Mineral.find().sort({ $natural: -1 }).limit(3).lean();
}

async function getById(id) {
  return Mineral.findById(id).lean();
}

async function create(data, authorId) {
  const record = new Mineral({
    name: data.name,
    category: data.category,
    color: data.color,
    image: data.image,
    location: data.location,
    formula: data.formula,
    description: data.description,
    author: authorId,
  });
  await record.save();

  console.log(record);

  return record;
}

async function update(id, data, userId) {
  const record = await Mineral.findById(id);

  if (!record) {
    throw new ReferenceError("Record not found" + id);
  }

  if (record.author.toString() != userId) {
    throw new Error("access denied");
  }

  //TODO replace with real properties
  record.prop = data.prop;

  record.name = data.name;
  record.category = data.category;
  record.color = data.color;
  record.image = data.image;
  record.location = data.location;
  record.formula = data.formula;
  record.description = data.description;
  await record.save();

  return record;
}

//TODO add function to only update likes

async function deleteById(id, userId) {
  const record = await Mineral.findById(id);

  if (!record) {
    throw new ReferenceError("Record not found" + id);
  }

  if (record.author.toString() != userId) {
    throw new Error("access denied");
  }

  await Mineral.findByIdAndDelete(id);
}

async function getDetails(id, userId) {
  // const mineralId=await Mineral.findById(id);

  const mineral = await Mineral.findById(id).lean();
  try {
    if (!mineral) {
      throw new Error("Mineral not found");
    }

    const isOwner = mineral.author.equals(userId);

    return { mineral, isOwner };
  } catch (err) {
    throw new Error(err.message);
  }
}

module.exports = {
  getAll,
  getRecent,
  getById,
  getDetails,
  create,
  update,
  deleteById,
};
