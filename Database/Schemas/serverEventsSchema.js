const mongoose = require("mongoose");

// Server's events data
module.exports = new mongoose.Schema({
		title: {type: String, required: false, default: "(no title)"},
    	description: {type: String, required: false},

		start: {type: Date, required: true },
		end: {type: Date, default: this.start },
		isStarted: {type: Boolean, default: false}
});
