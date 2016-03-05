
module.exports = function(users, _socket) {

	var include = require('./moduleLoader.js');

	var colors = include('colors');
	var log = include('log');
	var gameState = include('gameState');
	var util = include('util');
	// log("GameState from userModule is: ");
	// log(gameState);

	var socket = _socket;

	var user = {
		//stores properties of new user
		create: function(team) {

			var setTypeFromTeam = function(teamName) {
				switch (teamName) {
					case 'gov':
						return 'agent';
					case 'ins':
					default:
						return 'suspect';
				}
			};

			var teamNumber = gameState.getTeamSize(team) + 1;

			var userProps = {
				'socketID': socket.id,
				'index': users.length,
				//'name': '',
				'team': team,
				//var teamNumber = getTeamSize(team) + 1,
				'numberOnTeam': teamNumber,
				'type': setTypeFromTeam(team),
				'userID': team + teamNumber.toString(),
				'connected': false,
				'trackActive': false,
				'svcCheckComplete': false,
				'playStarted': false,
				'warned': {
					'50': false,
					'100': false,
					'200': false
				},
				'locationData': [],
				'lastLocRequest': {},
				'captureData': {
					//# of responses received to fast capture pings
					resCount: 0,
					//# of times enough agents to capture were in range
					captureCount: 0
				},
				'goneDark': false,
				'lockedOut': false,
			};

			util.myExtend(user,userProps);
			// for (prop in userProps) {
			// 	user[prop] = userProps[prop];
			// }

			log('Created player: ', colors.green);
			log(user);

		},
		//switches user socket when reconnecting to server
		update: function(newSocket) {
			socket = newSocket;
			user['socketID'] = socket.id;
			log(user.userID + " socket updated to: " + socket.id, colors.green);
		},
		//adds user to team
		addToTeam: function(teamName) { //,isNewPlayer)
			socket.join(teamName);
			log('User ' + user.userID + ' added to ' + teamName, colors.orange);
		},

		removeFromTeam: function(teamName) {
			socket.leave(teamName);
			log('User ' + user.userID + ' removed from ' + teamName, colors.orange);
		},

		getLastLocation: function() {
			if (user.locationData.length > 0) {
				return user.locationData[0];
			} else {
				return;
			}
		},

		getLocationData: function(sinceTime) { //limit) {
			var locArray = [];
			if (sinceTime !== undefined) {
				// for (i in user.locationData) {
				for (var i = 0; i < user.locationData.length; i += gameState.settings.dataSkipInterval) {
					//log(user.locationData);
					if (user.locationData[i].time > sinceTime) {
						locArray.push(user.locationData[i]);
					} else {
						//break;
					}
				}
			} else {
				//*****NOTE: NO SKIP HERE
				locArray = user.locationData;
			}
			
			log(locArray.length + " of " + user.locationData.length + " LocDataPoints being sent to Gov", colors.standout);

			return locArray;
		},

		setDark: function() {
			log("No locUpdate from client " + user.userID, colors.red);
			log("Player " + user.userID + " has gone dark.", colors.err);
			user.goneDark = true;
			user.trackActive = false;
		},

		clearDark: function() {
			log("Player " + user.userID + " active again.", colors.bgGreen);
			user.goneDark = false;
			user.trackActive = true;
		},

		lockout: function() {
			user.lockedOut = true;
			log("Player " + user.userID + "lockout status is: " + user.lockedOut, colors.orange);
		},

		disconnect: function() {
			user.socketID = '';
			user.connected = false;
			user.setDark();
			//log(user.userID + ' has gone dark', colors.orange);
		}

	};

	return user;
};