firebase.auth().onAuthStateChanged(function(user){
	if(!user){//hide logged in only UI
		$('#buttonNewMap').hide();
	}
});

var mapField;

$(document).ready(function(){
	var loadBarNewMap = $('#createMap>.modal-footer>.progress');
	mapField = $('#mapName');
	
	$('.modal').modal();
	
	$('#buttonNewMap').click(function(){
		loadBarNewMap.hide();
	});
	
	$('#buttonCreateMap').click(function(){
		loadBarNewMap.show();
		//write to db and hide loadbar
	});
});