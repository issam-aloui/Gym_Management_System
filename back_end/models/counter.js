const mongoose = require("mongoose");

const CounterSchema = new mongoose.Schema({
  model: { type: String, required: true, unique: true }, 
  count: { type: Number, required: true, default: 0 },
});

const Counter = mongoose.model("Counter", CounterSchema);
module.exports = Counter;
