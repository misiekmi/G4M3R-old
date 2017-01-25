const mongoose = require("mongoose");

// Server's events data
module.exports = new mongoose.Schema({
		title: {type: String, required: false, default: "(no title)"},
    description: {type: String, required: false},
		maxNumber: {type: Number, required: false},
		start: {type: Date, required: false },
		end: {type: Date, default: this.start }
});
