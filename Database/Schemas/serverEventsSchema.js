const mongoose = require("mongoose");

// Server's events data
module.exports = new mongoose.Schema({
		_id: {type: Number, required: true },
		title: {type: String, required: true, default: "(no title)"},
		_author: {type: String, required: false, default: "unidentified"},
    	description: {type: String, required: false},
		start: {type: Date, required: false},
		end: {type: Date, required: false, default: this.start },
		isStarted: {type: Boolean, default: false},
		maxAttendees: {type: Number, required: false, default: 3},
		members: new mongoose.Schema({
			_id: {type: String, required: false}
		}),
		tags: new mongoose.Schema({
			_id: {type: String, required: false}
		}),
		platform: {type: String, required: false}
});
