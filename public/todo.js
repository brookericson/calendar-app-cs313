function addItem(user_id){
	var item =  $("#todo_item").val();

	var params = {
		item: item,
		user_id: user_id
	};
	
$.post("/addItem", params, function(response, result) {
		if (result) {
			location.reload();
		} else {
			console.log("Fail")
		}
	});
}

function addEvent(user_id){
	var date =  $("#date").val();
	var event_name =  $("#event_name").val();
	var start_time =  $("#start_time").val();
	var end_time =  $("#end_time").val();
	
	var params = {
		date: date,
		event_name: event_name,
		start_time: start_time,
		end_time: end_time,
		user_id: user_id
	};
	
$.post("/addEvent", params, function(response, result) {
		if (result) {
			location.reload();
		} else {
			console.log("Fail")
		}
	});
}

