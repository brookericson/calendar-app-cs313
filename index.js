var express = require('express');
var app = express();

var pg = require('pg');
const connection = "postgres://postgres:Flatirons11@localhost:5432/planner";

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  response.render('pages/index');
});

app.get('/day', function(request, response) {
  getUserId(request, response);
});

app.get('/todo', function(request, response) {
  response.render('pages/todo');
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});


function getUserId(request, response) {
	
	var email = request.query.email;
	var password = request.query.password;
					
	getUserIdFromDb(email, password, function(error, result) {
		if (error || result == null || result.length != 1) {
			response.status(500).json({success: false, data: error});
		}
		else {
			var user_id = result[0];
			var date = '2017-11-18';
			var event = getEvent(user_id, date, request, response);
		}
	});
}
					
function getUserIdFromDb(email, password, callback) {

	var client = new pg.Client(connection);

	client.connect(function(err) {
		if (err) {
			console.log("Error connecting to DB: ")
			console.log(err);
			callback(err, null);
		}

		var sql = "SELECT user_id FROM public.user WHERE email = $1 AND password = $2";
		var params = [email, password];
		console.log(sql);

		var query = client.query(sql, params, function(err, result) {
			client.end(function(err) {
				if (err) throw err;
			});

			if (err) {
				console.log("Error in query: ")
				console.log(err);
				callback(err, null);
			}

			console.log("Found result: " + JSON.stringify(result.rows));
			
			callback(null, result.rows);
		});
	});

}





function getEvent(user_id, date, request, response) {

	getEventFromDb(user_id, date, function(error, result) {

		if (error || result == null || result.length != 1) {
			response.status(500).json({success: false, data: error});
		} else {
			var event = result[0];
			response.render('pages/day', event);
		}
	});
}

function getEventFromDb(user_id, date, callback) {

	var client = new pg.Client(connection);

	client.connect(function(err) {
		if (err) {
			console.log("Error connecting to DB: ")
			console.log(err);
			callback(err, null);
		}
		var user_id = 1;
		var sql = "SELECT event_name, start_time, end_time FROM event WHERE user_id = $1 AND date = $2";
		var params = [user_id, date];
		console.log(params);
		var query = client.query(sql, params, function(err, result) {
			client.end(function(err) {
				if (err) throw err;
			});

			if (err) {
				console.log("Error in query: ")
				console.log(err);
				callback(err, null);
			}

			console.log("Found result: " + JSON.stringify(result.rows));
			
			callback(null, result.rows);
		});
	});

}

function getToDoList(request, response) {
	
	var user_id = 1;

	getToDoList(user_id, function(error, result) {

		if (error || result == null || result.length != 1) {
			response.status(500).json({success: false, data: error});
		} else {
			var toDoList = result[0];
			response.status(200).json(result[0]);
		}
	});
}

function getToDoListFromDb(user_id, callback) {
	console.log("Getting event from DB with user id and date: " + user_id);

	var client = new pg.Client(connection);

	client.connect(function(err) {
		if (err) {
			console.log("Error connecting to DB: ")
			console.log(err);
			callback(err, null);
		}

		var sql = "SELECT item FROM todo WHERE user_id = $1";
		var params = [user_id];

		var query = client.query(sql, params, function(err, result) {
			client.end(function(err) {
				if (err) throw err;
			});

			if (err) {
				console.log("Error in query: ")
				console.log(err);
				callback(err, null);
			}

			console.log("Found result: " + JSON.stringify(result.rows));
			
			callback(null, result.rows);
		});
	});

}