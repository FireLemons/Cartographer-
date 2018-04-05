var mapField;

$(function(){
	firebase.auth().onAuthStateChanged(function(user){
		if(!user){//hide logged in only UI
			$('#buttonNewMap').hide();
		}
	});
	
	$('#nav').load('nav.html');
	
	var loadBarNewMap = $('#createMap>.modal-footer>.progress');
	mapField = $('#mapName');
	
	$('.modal').modal();

	$('#buttonNewMap').click(function(){
		loadBarNewMap.hide();
	});
	
	//create new group if input valid
	$('#buttonCreateMap').click(function(){
		var mapName = $('#mapName').val();
		var publicPrivate = $('#isPublic').is(":checked") ? 'public' : 'private';
		
		loadBarNewMap.show();
		
		if(mapName && firebase.auth().currentUser){
			//create object with key uid
			var members = {};
			members[firebase.auth().currentUser.uid] = owner;
			
			db.ref('Maps/' + publicPrivate).push().set({
				'name':mapName,
				'members': members
			});
		}
		//write to db and hide loadbar
	});
	
	$("#load").fadeOut();
});