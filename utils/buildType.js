const { CoreBuild, CommunityBuild } = require("../database/models/buildModel");

function getModelByType(type) {
  return type === "core" ? CoreBuild : CommunityBuild;
}

function validateType(type) {
  return ["core", "community"].includes(type);
}

module.exports = { getModelByType, validateType };
