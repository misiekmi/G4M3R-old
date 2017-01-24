const mongoose = require("mongoose");

// Server's events data (time played and game playing)
module.exports = new mongoose.Schema({
		//event_id: {type: Number,  default: 0, min: 0},
		title: {type: String, required: true, default: "(no title)"},
		maxNoMembers: {type: Number, required: true, default: 0},
		start: {type: Date, required: true },
		end: {type: Date, default: this.start },
		description: {type: String, required: false},
		members: new mongoose.Schema({
				_id: {type: String, required: false, default: "(no title)"}
		});
});
