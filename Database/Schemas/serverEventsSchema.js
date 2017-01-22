const mongoose = require("mongoose");

// Server's events data (time played and game playing)
module.exports = new mongoose.Schema({
		//event_id: {type: Number,  default: 0, min: 0},
		e_title: {type: String, required: false}
});
