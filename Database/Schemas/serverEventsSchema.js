const mongoose = require("mongoose");

// schema for storing event information
module.exports = new mongoose.Schema({
		_id: {type: Number, required: true },
    	_author: {type: String, required: true },

		title: {type: String, default: "(no title)"},
    	description: {type: String, default: "(no description)"},
    	tags: {type: [String], default: []},

		start: {type: Date, default: Date.now()},
		end: {type: Date, default: this.start },

		attendee_max: {type: Number, default: 3},
		attendees: {type: [new mongoose.Schema({
			_id: String,
			_timestamp: Date
		})], default: []},

		// notification settings
		announce: {type: Boolean, default: false},		// if bot should announce when start/end
		pre_announce: {type: Boolean, default: false},	// if bot should announce before start/end
		pre_interval: {type: Number, default: 15},		// time interval, in minutes
		pre_frequency: {type: Number, default: 1},		// number of times to send pre-announces
		announce_targets: {type: [new mongoose.Schema({
			_type: {type: String, required: true},		// is a channel or user?
			_id: {type: String, required: true}			// id of channel or user
		})], default: []},

		// privacy settings
		isPublicToLocal: {type: Boolean, default: true},// public to server/clan
		isPublicToWorld: {type: Boolean, default: true},// public to all users
		whitelist_users: {type: [String], default: []},	// users who always have access to event
		whitelist_roles: {type: [String], default: []},	// roles who always have access to event
		blacklist_users: {type: [String], default: []},	// users who never have access to event
		blacklist_roles: {type: [String], default: []}	// roles who never have access to event
});
