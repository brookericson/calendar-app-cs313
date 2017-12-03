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
