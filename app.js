var express = require('express');
var bodyParser = require('body-parser');

var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var port = 9000;
var admin = io.of('/admin');

var geolib = require('geolib');

var colors = require('colors');
var log = require('./my_modules/logWithColor.js');
colors.setTheme({
	err: 'bgRed'
});

var emitModule = require('./my_modules/emit.js');
var userModule = require('./my_modules/users.js');
var gameState = require('./my_modules/gameState.js');
//var emitTo = require('./my_modules/emit.js')(io);
//emitTo.start(io); //pass io to emitTo module

app.use(bodyParser.json());
app.use(function(req, res, next) {
	// Setup a Cross Origin Resource sharing
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
	console.log(('incoming request from ---> ' + ip).gray);
	// Show the target URL that the user just hit
	var url = req.originalUrl;
	console.log(('### requesting ---> ' + url).gray);
	next();
});

app.use('/', express.static(__dirname + '/public'));

server.listen(process.env.PORT || port, function() {
	var serverUpString = 'Server running at port:' + port + ' ';
	log(serverUpString, colors.cyan.inverse);
});

//var players = [];
// var players = {

// };
var players = gameState.players;

// var playerCount = function() {
// 		var numberOfPlayers = 0;
// 		for (p in players) {
// 			numberOfPlayers++;
// 		}
// 		return numberOfPlayers;
// 	};

var teams = {
	'g': 'gov',
	'i': 'ins',
	'default': 'ins'
};


/*––––––––––– SOCKET.IO starts here –––––––––––––––*/
io.on('connection', function(socket) {

	var checkPlayerType = function() {
		var existingUserIDs = [];
		for (p in players) {
			console.log("Existing player: " + players[p].userID);
			existingUserIDs.push(players[p].userID);

		}

		console.log("ExistingIDs List length: " + existingUserIDs.length);
		emitTo.socket('playerTypeCheck', {
			userIDs: existingUserIDs
		});
		console.log("Checking if new player...");
	};

	//create new instance of emit module for each socket
	var emitTo = emitModule(io, socket);
	var player = {}; //userModule(players, socket);

	var tracking;

	var startTracking = function() {
		player.trackActive = true;
		log('Started tracking ' + player.userID,colors.green);
		emitTo.socket('getLocation', {});

		tracking = setInterval(function() {
			emitTo.socket('getLocation', {});
		}, 10000);
	};

	log('The user ' + socket.id + ' just connected!', colors.yellow);
	emitTo.socket('connected', {});

	//client message handler:
	socket.on('clientMsg', function(res, err) {

		var getTeam = function(hash) {
			log("teamhash is: " + hash);
			var t;
			if (teams[hash] !== undefined) {
				t = teams[hash];
			} else {
				t = teams['default'];
			}
			log('Team is: ' + t);
			return t;
		};

		var handleClientMsg = {

			clientInitialized: function() {
				log(socket.id + " is initialized!", colors.yellow);
				checkPlayerType();
			},

			newPlayer: function() {
				player = userModule(players, socket); //instantiate new player object

				var team = getTeam(res.teamHash); //create player
				player.create(team);
				player.addToTeam(team);

				players[player.userID] = player; //add player to playersObject
				log("Total # of players: " + gameState.playerCount());
				log('Added player to database:');
				log(players[player.userID]);

				//send new ID to player:
				emitTo.socket('newUserID', {
					newID: player.userID
				});

			},

			returningPlayer: function() {
				log('Requesting update of player ' + players[res.userID].userID, colors.italic);
				players[res.userID].update(socket);
				player = players[res.userID];
				player.addToTeam(player.team);
				log("'Player' for socket " + socket.id + " is now:", colors.yellow.inverse);
				console.log(player);

				player.connected = true;

				emitTo.socket('returningReadyCheck',{});
			},

			readyToPlay: function() {
				//player.startTracking();
				player.connected = true;
				startTracking();
			},

			locationUpdate: function() {
				player.locationData.unshift(res.locData);
				log('New location data for ' + player.userID + ":");
				console.log(player.locationData);
			},

			findSuspects: function() {
				newLocData = {}; //getInsLocData();
				for (p in players) {
					newLocData[players[p].userID] = {
						team: players[p].team,
						locData: players[p].getLocationData()
					};
				}
				// Object.keys(players).forEach(function(p){
				// 	newLocData[p.userID] = {
				// 		team: p.team,
				// 		locData: p.locationData
				// 	};
				// });
				log('Data to be sent to ' + socket.id + ":");
				console.log(newLocData);
				emitTo.socket('suspectData', {
					locData: newLocData
				});
			}
		};

		//handleClientMsg[res.tag]();
		try {
			handleClientMsg[res.tag]();
		} catch (err) {
			log('Error: "' + res.tag + '" is not a valid socket.on message because:', colors.err);
			log(err, colors.err);
		}

	});

	// when a client disconnects
	socket.on('disconnect', function() {
		log('User ' + socket.id + ' just disconnected.', colors.orange);

		//var userToRemove = getUser(socket.id);
		//removePlayerFromTeam(userToRemove);
		//userToRemove.socketID = '';
		//player.socketID = '';

		//if (userToRemove.team = 'ins'){
		if (player.trackActive) {
			clearInterval(tracking);
		}

		try {
		player.removeFromTeam(player.team);
		player.disconnect();
	} catch (err) {
		log(err, colors.err);
	}

		console.log('current players: ' + gameState.playerCount());
		console.log('current connected users: ' + io.sockets.sockets.length);

	});

});