var express = require('express');
var app = express();

var pg = require('pg');
const connection = "postgres://postgres:Flatirons11@localhost:5432/planner";
//const connection = "postgres://xnvuvjhworoltf:a245729dd1b3098790240daee1dd04034caedf335a7c701b8fa225f0081e7d38@ec2-174-129-15-251.compute-1.amazonaws.com:5432/d48k9ohpfakaje";

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  response.render('pages/index');
});

app.get('/home', function(request, response) {
  getUserId(request, response);
});

app.get('/day', function(request, response) {
  var user_id = request.query.user_id;
  getEvent(user_id, request, response);
});

app.get('/todo', function(request, response) {
  var user_id = request.query.user_id;
  getToDoList(user_id, request, response);
});

app.get('/updateEvent', function(request, response) {
 updateEvent(request, response);
});

app.get('/updateToDoList', function(request, response) {
 updateTodo(request, response);
});

app.get('/deleteEvent', function(request, response) {
   var user_id = request.query.user_id;
   var event_id = request.query.event_id;
   deleteEvent(user_id, event_id, request, response);
});

app.get('/deleteItem', function(request, response) {
   var user_id = request.query.user_id;
   var todo_item_id = request.query.todo_item_id;
   deleteItem(user_id, todo_item_id, request, response);
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
			var result = result[0];
			var user_id = result.user_id;
			getEvent(user_id, request, response);
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


function getEvent(user_id, request, response) {

	getEventFromDb(user_id, function(error, result) {

		if (error || result == null || result.length <= 1) {
			response.status(500).json({success: false, data: error});
		} else {
			var event = result;
			response.render('pages/day', {events: event});
		}
	});
}

function getEventFromDb(user_id, callback) {

	var client = new pg.Client(connection);

	client.connect(function(err) {
		if (err) {
			console.log("Error connecting to DB: ")
			console.log(err);
			callback(err, null);
		}
		
		var sql = "SELECT u.user_id, event_id, event_name, CAST(start_time as time) as start_time, CAST(end_time as time) as end_time, date FROM event e JOIN public.user u ON e.user_id = u.user_id WHERE u.user_id = $1";
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

function getToDoList(user_id, request, response) {
	

	getToDoListFromDb(user_id, function(error, result) {

		if (error || result == null || result.length <= 1) {
			response.status(500).json({success: false, data: error});
		} else {
			var todo = result;
			response.render('pages/todo', {todoList: todo});
		}
	});
}

function getToDoListFromDb(user_id, callback) {
	
	var client = new pg.Client(connection);

	client.connect(function(err) {
		if (err) {
			console.log("Error connecting to DB: ")
			console.log(err);
			callback(err, null);
		}

		var sql = "SELECT u.user_id, todo_item_id, item FROM todo t JOIN public.user u ON t.user_id = u.user_id WHERE u.user_id = $1";
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


function updateEvent(request, response) {
	
	var date = request.query.date;
	var event_name = request.query.event_name;
	var start_time = request.query.start_time;
	var end_time = request.query.end_time;
	var user_id = request.query.user_id;
	
	updateEventToDb(user_id, date, event_name, start_time, end_time, function(error, result) {

		if (error || result == null || result.length >= 1) {
			response.status(500).json({success: false, data: error});
		} else {
			getEvent(user_id, request, response);
		}
	});
}

function updateEventToDb(user_id, date, event_name, start_time, end_time, callback) {
	
	var client = new pg.Client(connection);

	client.connect(function(err) {
		if (err) {
			console.log("Error connecting to DB: ")
			console.log(err);
			callback(err, null);
		}

		var sql = "INSERT into public.event (date, start_time, end_time, event_name, user_id) VALUES ($1, $2, $3, $4, $5)";
		var params = [date, start_time, end_time, event_name, user_id];
		var query = client.query(sql, params, function(err, result) {
			client.end(function(err) {
				if (err) throw err;
			});

			if (err) {
				console.log("Error in query: ")
				console.log(err);
				callback(err, null);
			}
			console.log("Found result: " + JSON.stringify(result.rowCount));
			
			callback(null, result.rows);
		});
	});
}

function updateTodo(request, response) {
	
	var item = request.query.item;
	var user_id = request.query.user_id;
	
	updateTodoToDb(item, user_id, function(error, result) {

		if (error || result == null || result.length >= 1) {
			response.status(500).json({success: false, data: error});
		} else {
			getToDoList(user_id, request, response);
		}
	});
}

function updateTodoToDb(item, user_id, callback) {
	
	var client = new pg.Client(connection);

	client.connect(function(err) {
		if (err) {
			console.log("Error connecting to DB: ")
			console.log(err);
			callback(err, null);
		}

		var sql = "INSERT into public.todo (item, user_id) VALUES ($1, $2)";
		var params = [item, user_id];
		var query = client.query(sql, params, function(err, result) {
			client.end(function(err) {
				if (err) throw err;
			});

			if (err) {
				console.log("Error in query: ")
				console.log(err);
				callback(err, null);
			}
			console.log("Found result: " + JSON.stringify(result.rowCount));
			
			callback(null, result.rows);
		});
	});

}

function deleteItem(user_id, todo_item_id, request, response) {	
	deleteItemInDb(user_id, todo_item_id, function(error, result) {

		if (error || result == null || result.length >= 1) {
			response.status(500).json({success: false, data: error});
		} else {
			getToDoList(user_id, request, response);
		}
	});
}

function deleteItemInDb(user_id, todo_item_id, callback) {
	
	var client = new pg.Client(connection);

	client.connect(function(err) {
		if (err) {
			console.log("Error connecting to DB: ")
			console.log(err);
			callback(err, null);
		}

		var sql = "DELETE FROM public.todo WHERE todo_item_id = $1";
		var params = [todo_item_id];
		var query = client.query(sql, params, function(err, result) {
			client.end(function(err) {
				if (err) throw err;
			});

			if (err) {
				console.log("Error in query: ")
				console.log(err);
				callback(err, null);
			}
			console.log("Found result: " + JSON.stringify(result.rowCount));
			
			callback(null, result.rows);
		});
	});

}


function deleteEvent(user_id, event_id, request, response) {
	
	deleteEventInDb(user_id, event_id, function(error, result) {

		if (error || result == null || result.length >= 1) {
			response.status(500).json({success: false, data: error});
		} else {
			getEvent(user_id, request, response);
		}
	});
}

function deleteEventInDb(user_id, event_id, callback) {
	
	var client = new pg.Client(connection);

	client.connect(function(err) {
		if (err) {
			console.log("Error connecting to DB: ")
			console.log(err);
			callback(err, null);
		}

		var sql = "DELETE FROM public.event WHERE event_id = $1";
		var params = [event_id];
		var query = client.query(sql, params, function(err, result) {
			client.end(function(err) {
				if (err) throw err;
			});

			if (err) {
				console.log("Error in query: ")
				console.log(err);
				callback(err, null);
			}
			console.log("Found result: " + JSON.stringify(result.rowCount));
			
			callback(null, result.rows);
		});
	});
}

