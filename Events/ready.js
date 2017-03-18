const auth = require("./../Configuration/auth.json");
const getNewServerData = require("./../Modules/NewServer.js");
const clearStats = require("./../Modules/ClearServerStats.js");
const setReminder = require("./../Modules/SetReminder.js");
const setCountdown = require("./../Modules/SetCountdown.js");
const sendStreamingRSSUpdates = require("./../Modules/StreamingRSS.js");
const sendStreamerMessage = require("./../Modules/StreamChecker.js");
const createMessageOfTheDay = require("./../Modules/MessageOfTheDay.js");
const runTimerExtension = require("./../Modules/TimerExtensionRunner.js");
const postData = require("./../Modules/PostData.js");
const startWebServer = require("./../Web/WebServer.js");

module.exports = (bot, db, config, winston) => {
	winston.info("All shards connected");

	// Set existing reminders to send message when they expire
	const setReminders = async () => {
		db.users.find({reminders: {$not: {$size: 0}}}, (err, userDocuments) => {
			if(err) {
				winston.error("Failed to get reminders", err);
			} else {
				for(let i=0; i<userDocuments.length; i++) {
					for(let j=0; j<userDocuments[i].reminders.length; j++) {
						setReminder(bot, winston, userDocuments[i], userDocuments[i].reminders[j]);
					}
				}
			}
		});
	};

	// Set existing countdowns in servers to send message when they expire
	const setCountdowns = async () => {
		db.servers.find({"config.countdown_data": {$not: {$size: 0}}}, (err, serverDocuments) => {
			if(err) {
				winston.error("Failed to get countdowns", err);
			} else {
				for(let i=0; i<serverDocuments.length; i++) {
					for(let j=0; j<serverDocuments[i].config.countdown_data.length; j++) {
						setCountdown(bot, winston, serverDocuments[i], serverDocuments[i].config.countdown_data[j]);
					}
				}
			}
		});
	};

	// Set existing giveaways to end when they expire
	const setGiveaways = async () => {
		db.servers.find({
			channels: {
				$elemMatch: {
					"giveaway.isOngoing": true
				}
			}
		}, (err, serverDocuments) => {
			if(err) {
				winston.error("Failed to get giveaways", err);
			} else {
				serverDocuments.forEach(serverDocument => {
					const svr = bot.guilds.get(serverDocument._id);
					if(svr) {
						serverDocument.channels.forEach(channelDocument => {
							if(channelDocument.giveaway.isOngoing) {
								const ch = svr.channels.get(channelDocument._id);
								if(ch) {
									setTimeout(() => {
										bot.endGiveaway(svr, serverDocument, ch, channelDocument);
									}, channelDocument.giveaway.expiry_timestamp - Date.now());
								}
							}
						});
					}
				});
			}
		});
	};

	// Start streaming RSS timer
	const startStreamingRSS = async () => {
		db.servers.find({}, (err, serverDocuments) => {
			if(!err && serverDocuments) {
				const sendStreamingRSSToServer = i => {
					if(i<serverDocuments.length) {
						const serverDocument = serverDocuments[i];
						const svr = bot.guilds.get(serverDocument._id);
						if(svr) {
							const sendStreamingRSSFeed = j => {
								if(j<serverDocument.config.rss_feeds.length) {
									if(serverDocument.config.rss_feeds[j].streaming.isEnabled) {
										sendStreamingRSSUpdates(bot, winston, svr, serverDocument, serverDocument.config.rss_feeds[j], () => {
											sendStreamingRSSFeed(++j);
										});
                                    } else {
                                    	sendStreamingRSSFeed(++j);
                                    }

								} else {
									sendStreamingRSSToServer(++i);
								}
							};
							sendStreamingRSSFeed(0);
						}
					} else {
						setTimeout(() => {
                            startStreamingRSS();
                            //TODO: reduce to 15000 when testing (originally 600000)
						}, 600000);
					}
				};
				sendStreamingRSSToServer(0);
			}
		});
	};

	// Periodically check if people are streaming
	const checkStreamers = async () => {
		db.servers.find({}, (err, serverDocuments) => {
			if(!err && serverDocuments) {
				const checkStreamersForServer = i => {
					if(i<serverDocuments.length) {
						const serverDocument = serverDocuments[i];
						const svr = bot.guilds.get(serverDocument._id);
						if(svr) {
							const checkIfStreaming = j => {
								if(j<serverDocument.config.streamers_data.length) {
									sendStreamerMessage(winston, svr, serverDocument, serverDocument.config.streamers_data[j], () => {
										checkIfStreaming(++j);
									});
								} else {
									checkStreamersForServer(++i);
								}
							};
                            checkIfStreaming(0);
						}
					} else {
						setTimeout(() => {
                            checkStreamers();
                            //TODO: reduce to 15000 when testing (originally 600000)
						},600000);
					}
				};
				checkStreamersForServer(0);
			}
		});
	};

	// Start message of the day timer
	const startMessageOfTheDay = async () => {
		db.servers.find({"config.message_of_the_day.isEnabled": true}, (err, serverDocuments) => {
			if(err) {
				winston.error("Failed to find server data for message of the day", err);
			} else {
				for(let i=0; i<serverDocuments.length; i++) {
					const svr = bot.guilds.get(serverDocuments[i]._id);
					if(svr) {
						createMessageOfTheDay(bot, winston, svr, serverDocuments[i].config.message_of_the_day);
					}
				}
			}
		});
	};

	// Start all timer extensions (third-party)
	const runTimerExtensions = async () => {
		db.servers.find({"extensions": {$not: {$size: 0}}}, (err, serverDocuments) => {
			if(err) {
				winston.error("Failed to find server data to start timer extensions", err);
			} else {
				for(let i=0; i<serverDocuments.length; i++) {
					const svr = bot.guilds.get(serverDocuments[i]._id);
					if(svr) {
						serverDocuments[i].extensions.forEach(extensionDocument => {
							if(extensionDocument.type=="timer") {
								setTimeout(() => {
									runTimerExtension(bot, db, winston, svr, serverDocuments[i], extensionDocument);
								}, (extensionDocument.last_run + extensionDocument.interval) - Date.now());
							}
						});
					}
				}
			}
		});
	};

	// Print startup ASCII art in console
	const showStartupMessage = () => {
		bot.isReady = true;
		winston.info(`Started the best Discord bot, version ${config.version}\n\
     ____	     	_	   _    ___    ____	\n\
	/ 	      / |  | \\    / |      \\  |    \\ \n\
   | ___     /  |  |  \\  /  |   ___/  |____/ \n\
   |    |   /___|  |   \\/   |      \\  |	  \\ \n\
    \\___/       |  |        |  ____/  |    \\ \n`);
	};

	// Start the 60 second repeating timer that handles the start/end of events
	const startEventTimeChecker = () => {
		require("./../Modules/Events/EventTimeChecker")(bot,winston,db);
	};


	(async () => {
		await setReminders();
	})();
	(async () => {
		await setCountdowns();
	})();
	(async () => {
		await setGiveaways();
	})();
	(async () => {
		await startStreamingRSS();
	})();
	(async () => {
		await checkStreamers();
	})();
	(async () => {
		await startMessageOfTheDay();
	})();
	(async () => {
		await runTimerExtensions();
	})();
	postData(winston, auth, bot.guilds.size, bot.user.id);
	startWebServer(bot, db, auth, config, winston);



	(async () => {
		await showStartupMessage();
	})();
	(async () => {
		await startEventTimeChecker();
	})();


	// Set bot's "now playing" game
	const setBotGame = () => {
		let game = {
			name: config.game
		};
		if(config.game=="default") {
			game = {
				name: "g4m3r.xyz",
				url: "https://g4m3r.xyz"
			};
		}
		bot.editStatus(config.status, game);
	};

	// Delete data for old servers
	const pruneServerData = () => {
		db.servers.find({_id: {"$nin": bot.guilds.map(a => {
			return a.id;
		})}}).remove(err => {
			if(err) {
				winston.error("Failed to prune old server documents", err);
			}
			setBotGame();
		});
	};

	// Ensure that all servers have a database documents
	const guildIterator = bot.guilds.entries();
	const checkServerData = async (svr, newServerDocuments, callback) => {
		db.servers.findOne({_id: svr.id}, (err, serverDocument) => {
			if(err) {
				winston.error("Failed to find server data", {svrid: svr.id}, err);
			} else if(serverDocument) {
				const channelIDs = svr.channels.map(a => {
					return a.id;
				});
				for(let j=0; j<serverDocument.channels.length; j++) {
					if(channelIDs.indexOf(serverDocument.channels[j]._id)==-1) {
						serverDocument.channels[j].remove();
					}
				}
			} else {
				newServerDocuments.push(getNewServerData(bot, svr, new db.servers({_id: svr.id})));
			}

			try {
				checkServerData(guildIterator.next().value[1], newServerDocuments, callback);
			} catch(err) {
				callback(newServerDocuments);
			}
		});
	};

	checkServerData(guildIterator.next().value[1], [], newServerDocuments => {
		if(newServerDocuments.length>0) {
			winston.info(`Created documents for ${newServerDocuments.length} new servers`);
			db.servers.insertMany(newServerDocuments, err => {
				if(err) {
					winston.error("Failed to insert new server documents", err);
				} else {
					winston.info(`Successfully inserted ${newServerDocuments.length} new server documents into database`);
				}
				pruneServerData();
			});
		} else {
			pruneServerData();
		}
	});
};