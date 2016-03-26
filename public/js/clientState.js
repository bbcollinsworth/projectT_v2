var clientState = {
	connected: false,
	mapLoaded: false,
	readyCheckRunning: false,
	initialized: false,
	socketEventsAttached: false,
	//ready: false,
	tracking: false,
	posStored: false,
	centeredOnPlayer: false,
	getHubByName: function(name) {
		for (var i in hubs) {
			if (hubs[i].name === name) {
				return hubs[i];
			}
		}
	},
	intro: {
		content: {},
		run: function() { //team) {
			var intro = this.content; //clientState.intro.content;
			var team = player.team;
			msg(intro[team].screen1);
			$('#nextButton').off('click').on('click', function() {
				msg(intro[team].screen2);
				$('#nextButton').off('click').on('click', function() {
					$('#app').trigger('introComplete');
				});
			});
		}
	},
	allPlayers: {
		localCount: {
			'agent': 0,
			'suspect': 0,
			update: function(playerType) {
				var typeCount = 0;
				for (id in clientState.allPlayers) {
					if (clientState.allPlayers[id].type == playerType) {
						console.log(playerType + " found in allPlayers. Adding to count");
						typeCount++;
					}
				}
				this[playerType] = typeCount;
				//clientState.allPlayers.localCount[type] = typeCount;
				console.log("Now locally tracking " + this.agent + " agents and " + this.suspect + " suspects.");
			}
		}
	},
	markerEvents: {
		ins: {
			inCaptureRange: false,
			startCapture: function(p) {

				//var p = this;

				//IMPORTANT: NEED TO START WATCHING POS TO FIGURE OUT IF MOVING
				console.log("Starting capture on " + p.localID);

				if (!('captureCircle' in p.marker)) {
					p.marker.addCaptureCircle();
					p.marker.captureCircle.animate();
					$(p.marker.captureCircle.domElement).on('animationend oAnimationEnd webkitAnimationEnd', function() {
						gov.captureComplete(p);
					});
				}
				//p['captureCircle'].startAnim();
				//map.on('mouseup', p.stopCapture);

			},
			stopCapture: function(e) {
				console.log("Mouse up - capture pausing");
				newPlayer.captureCircle.animRunning = false;
			},
			attachCaptureEvents: function() {
				var playerToCapture = this;
				console.log("Attaching Capture Events to " + playerToCapture.localID);

				playerToCapture.marker.off('click').on('click', function(e) {

					clientState.markerEvents.ins.startCapture(playerToCapture);
				});
			},

			clearCaptureEvents: function() {
				var playerToCapture = this;
				playerToCapture.marker.off('click');
			}
		}
	},

	addPlayer: function(player, uID) {
		newPlayer = {
			userID: uID,
			team: player.team,
			type: player.type,
			get status() {
				var p = this;
				customLog("Checking status of " + p.localID);

				if (p.type == 'suspect') {
					if (p.lockedOut) {
						return 'locked';
					} else if (p.goneDark) {
						return 'dark';
					} else {
						return 'active';
					}
				} else {
					return 'agent';
				}
			},
			//latestPos: player.locData[0],
			oldestTime: player.oldestTime,
			locData: player.locData,
			get latestPos() {
				return this.locData[0];
			},
			updateLocData: function(newData) {
				for (itemKey in newData) {
					this[itemKey] = newData[itemKey];
					console.log("Updated " + itemKey + " for player " + this.userID);
				}
				//this.latestPos = this.locData[0];
				if ('trail' in this) {
					console.log("Trail found in " + this.userID + "!");
					var pRef = this;
					pRef.marker.refresh();
					pRef.trail.render();
					$('#app').off('trailRendered').on('trailRendered', function() {
						pRef.marker.refresh();
						//pRef.marker.refresh(pRef.latestPos);
					});
				} else {
					this.marker.refresh();
				}
			}
		};

		clientState.allPlayers[uID] = newPlayer;

		newPlayer.marker = viz.marker(player.type, newPlayer.latestPos).addTo(map);
		newPlayer.marker['playerRef'] = newPlayer;

		console.log("ALL PLAYERS: ");
		console.log(clientState.allPlayers);

		clientState.allPlayers.localCount.update(newPlayer.type);

		if (newPlayer.userID === storage.userID) {
			newPlayer.localID = "you";
		} else {
			newPlayer.localID = player.type + " " + clientState.allPlayers.localCount[player.type].toString();
		}

		var popupData = {
			'title': newPlayer.localID,
			'text': {
				ln1: "(As of " + convertTimestamp(newPlayer.latestPos.time) + ")"
			},
			'popupClass': "playerPopup " + newPlayer.type + "Popup"
		};

		newPlayer.marker.initPopup(popupData);

		newPlayer.marker.addTag();

		if (newPlayer.team == 'ins') {
			//newPlayer['trail'] = viz.initTrail(newPlayer);
			$.extend(true, newPlayer, clientState.markerEvents.ins);
		}

		console.log("New player stored locally as " + newPlayer.localID);

	},
	features: {
		geolocation: {
			title: 'Geolocation',
			helpText: 'To play, "allow" geolocation when prompted.',
			noSupportText: 'Geolocation not supported. Please use another device.',
			supported: false,
			ready: false,
			setup: navigator.geolocation,
			readyTest: function() {
				viz.geoPrompt.render();

				// setTimeout(function() {
				// 	navigator.geolocation.getCurrentPosition(function(position) {
				// 		console.log('ReadyTest Position is: ' + position.coords.latitude + ', ' + position.coords.longitude);
				// 		window.player.pos.update({
				// 			lat: position.coords.latitude,
				// 			lng: position.coords.longitude,
				// 			time: position.timestamp
				// 		});

				// 		emit('geoTestResult', {
				// 			playerPos: player.pos
				// 		});


				// 		//viz.renderLocPrompt();

				// 		// clientState.features.geolocation.ready = true;
				// 		// clientState.posStored = true;
				// 		// app.trackLocation();
				// 		// console.log('Geoloc test successful');

				// 		// startup.svcCheck(); //re-run service check
				// 	}, function(error) {
				// 		switch (error.code) {
				// 			case 1:
				// 				// 1 === error.PERMISSION_DENIED
				// 				console.log('User does not want to share Geolocation data.');
				// 				break;

				// 			case 2:
				// 				// 2 === error.POSITION_UNAVAILABLE
				// 				console.log('Position of the device could not be determined.');
				// 				break;

				// 			case 3:
				// 				// 3 === error.TIMEOUT
				// 				console.log('Position Retrieval TIMEOUT.');
				// 				break;

				// 			default:
				// 				// 0 means UNKNOWN_ERROR
				// 				console.log('Unknown Error');
				// 				break;
				// 		}
				// 	});
				// }, 1000);
			}
		},
		deviceorientation: {
			title: 'Orientation',
			helpText: '',
			noSupportText: "Your device/browser can't detect orientation.",
			supported: false,
			ready: true,
			setup: function(orientEventHandler) {
				window.addEventListener('deviceorientation', orientEventHandler, false);
				console.log("From Setup: ORIENTATION EVENT HANDLER ADDED");
				//footerMsg("ORIENTATION EVENT HANDLER ADDED");
			},
			readyTest: function() {
				console.log('Ready test called for vibration but no test.');
			}
		},
		vibrate: {
			title: 'Vibration',
			helpText: '',
			noSupportText: 'Your browser does not support vibration.',
			supported: false,
			ready: true, //no prep required
			setup: function(vibrateLength) {
				try {
					navigator.vibrate = navigator.vibrate ||
						navigator.webkitVibrate ||
						navigator.mozVibrate ||
						navigator.msVibrate;
					navigator.vibrate(vibrateLength);
					//msg("Vibrate successful!");
					console.log("Vibrate successful!");
				} catch (err) {
					msg(err.message);
				}
			},
			readyTest: function() {
				console.log('Ready test called for vibration but no test.');
			}
		},
		localstorage: {
			title: 'Local Storage',
			helpText: '',
			noSupportText: 'Your browser does not support local storage.',
			supported: false,
			ready: false, //no prep required
			setup: localStorage,
			// setup: localStorage,
			readyTest: function() {
				customLog("Current localStorage is: ");
				customLog(localStorage);
				// console.log("Current localStorage is: ");
				// console.log(localStorage);
				this.ready = true;
				//console.log('Ready test called for localStorage but no test.');
			},
			errorReturn: {
				set: function(key, val) {
					try {
						localStorage.set(key, value);
					} catch (error) {
						console.log("Local Storage error: ");
						console.log(error);
					}
				}
			}
		}
	}
};

console.log("ClientState loaded");