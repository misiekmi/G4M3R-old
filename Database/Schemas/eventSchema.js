const mongoose = require("mongoose");

// schema for storing event information
module.exports = new mongoose.Schema({
    	_id: {type: String, required: true}, 		// event ID as computed from _no, _author, _server, and _clan concatenated together
		_no: {type: Number, required: true},		// the displayed id number
    	_author: {type: String, required: true },	// user that created the event
		_server: {type: String, required: false},	// id of server the event belongs too
		_clan: {type: String, required: false},		// id of clan event belongs too

		title: {type: String, default: "(default title)"},             // title of the event
    	description: {type: String, default: "(default description)"}, // short description of the event
    	tags: {type: [String], default: []},					  // event tags relevant for search

		start: {type: Date, required: true}, // start date of the event
		end: {type: Date, required: true},   // end date of the event
		hasStarted: {type: Boolean, default: false},

		attendee_max: {type: Number, default: 3}, // maximum number of people that can join the event
		attendees: {type: [new mongoose.Schema({  // people that joined the event
			_id: {type: String, required: true},
			_timestamp: {type: Date}
		})], default: []},

		// notification settings
		announce: {type: Boolean, default: false},		// if bot should announce when start/end
		pre_announce: {type: Boolean, default: false},	// if bot should announce before start/end
		pre_interval: {type: Number, default: 15},		// time interval, in minutes
		pre_frequency: {type: Number, default: 1},		// number of times to send pre-announces
		announce_targets: {type :[new mongoose.Schema({
			_type: {type: String, required: true},		// is a channel or user?
			_id: {type: String, required: true}			// id of channel or user
		})], default: []},

		// privacy settings
		isPublic: {type: Boolean, default: true},		// if true, all can see; if false, only clan/server can see
		whitelist_users: {type: [String], default: []},	// users who always have access to event
		whitelist_roles: {type: [String], default: []},	// roles who always have access to event
		blacklist_users: {type: [String], default: []},	// users who never have access to event
		blacklist_roles: {type: [String], default: []}	// roles who never have access to event
});
