module.exports = function(users, socket) {

	function getTeamSize(t) {
		var existingTeamMembers = 0;
		for (u in users) {
			console.log('u.team is ' + u.team);
			if (users[u].team == t) {
				existingTeamMembers++;
			}
		}
		// users.forEach(function(u) {
		// 	if (u.team == t) {
		// 		teamMembers++;
		// 	}
		// });
		console.log('Team size is ' + existingTeamMembers);
		return existingTeamMembers;
	}

	var user = {

		// socketID: socket.id,
		// index: users.length,
		// team: '',
		// numberOnTeam: -1,
		// userID: '',
		// locationData: [],
		// captureData: {
		// 	//# of responses received to fast capture pings
		// 	resCount: 0,
		// 	//# of times enough agents to capture were in range
		// 	captureCount: 0
		// },
		// lockedOut: false,


		// var get = function(property) {
		// 	return user[property];
		// };

		// get: function(property) {
		// 	return user[property];
		// },
		create: function(team) {
			//will this work?
			user['socketID'] = socket.id;
			user['index'] = users.length;
			//user['name'] = '';
			user['team'] = team;
			var teamNumber = getTeamSize(team) + 1;
			user['numberOnTeam'] = teamNumber;
			user['userID'] = team + teamNumber.toString();
			user['locationData'] = [];
			user['captureData'] = {
				//# of responses received to fast capture pings
				resCount: 0,
				//# of times enough agents to capture were in range
				captureCount: 0
			};
			user['lockedOut'] = false;
			userID = 'ins1';

			console.log('Created player: ');
			console.log(user);

		},
		//emits to THIS user (i.e. socket.id)
		addToTeam: function(teamName, isNewPlayer) {
			socket.join(team);
			console.log('User ' + user.id + ' added to ' + team);
		}
	};

	return user;
};


// var user = module.exports = function(users, socket) {
// 	//var socket;

// 	//users = [];
// 	var socketID, index, team, numberOnTeam, userID;
// 	var locationData = [];
// 	var captureData = {
// 		//# of responses received to fast capture pings
// 		resCount: 0,
// 		//# of times enough agents to capture were in range
// 		captureCount: 0
// 	};
// 	var lockedOut = false;

// 	function getTeamSize(t) {
// 		var existingTeamMembers = 0;
// 		for (u in users) {
// 			if (u.team == t) {
// 				teamMembers++;
// 			}
// 		}
// 		// users.forEach(function(u) {
// 		// 	if (u.team == t) {
// 		// 		teamMembers++;
// 		// 	}
// 		// });

// 		return existingTeamMembers;
// 	}

// 	var get = function(property) {
// 		return user[property];
// 	};

// 	return {
// 		get: function(property) {
// 			return user[property];
// 		},
// 		create: function(team) {
// 			//will this work?
// 			user['socketID'] = socket.id;
// 			user['index'] = users.length;
// 			//user['name'] = '';
// 			user['team'] = team;
// 			var teamNumber = getTeamSize(team) + 1;
// 			user['numberOnTeam'] = teamNumber;
// 			user['userID'] = team + teamNumber.toString();
// 			user['locationData'] = [];
// 			user['captureData'] = {
// 				//# of responses received to fast capture pings
// 				resCount: 0,
// 				//# of times enough agents to capture were in range
// 				captureCount: 0
// 			};
// 			user['lockedOut'] = false;
// 			userID = 'ins1';

// 			console.log('Created player: ');
// 			console.log(user);

// 			// newUser = {
// 			// 	'socketID': socket.id,
// 			// 	'index': users.length,
// 			// 	'name': ,
// 			// 	'team': team,
// 			// 	'numberOnTeam': ,
// 			// 	'userID': ,
// 			// 	'locationData': [],
// 			// 	'captureData': {
// 			// 		//# of responses received to fast capture pings
// 			// 		resCount: 0,
// 			// 		//# of times enough agents to capture were in range
// 			// 		captureCount: 0
// 			// 	},
// 			// 	'lockedOut': false


// 			// };
// 		},
// 		//emits to THIS user (i.e. socket.id)
// 		addToTeam: function(teamName, isNewPlayer) {
// 			socket.join(team);
// 			console.log('User ' + user.id + ' added to ' + team);
// 		},
// 		'socketID': get('socketID'),
// 		index: get('index'),
// 		team: get('team'),
// 		numberOnTeam: user.numberOnTeam,
// 		'userID': get('userID'),
// 		locationData: user.locationData,
// 		captureData: user.captureData,
// 		lockedOut: user.lockedOut
// 	};
// };