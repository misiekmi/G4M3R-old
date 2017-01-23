const mongoose = require("mongoose");

// Server's events data (time played and game playing)
module.exports = new mongoose.Schema({
		//event_id: {type: Number,  default: 0, min: 0},
		title: {type: String, required: false, default: "(no title)"},

		start: {type: Date, required: true },
		end: {type: Date, default: this.start },
		description: {type: String, required: false},
});
