
const mongoose = require("mongoose");

const registrationCounterSchema = new mongoose.Schema({
  total: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model(
  "RegistrationCounter",
  registrationCounterSchema
);
