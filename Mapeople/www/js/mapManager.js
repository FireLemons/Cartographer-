$(document).ready(function(){
	$('.modal').modal();
	
	$('#buttonCreateMap').click(function(){
		//load animation
		
	});
	
	//tell the user whether the group name is taken
	$('#mapName').on('input', function(){
		checkNames($(this).val());
	});
	
	$('#isPublic').change(function(){
		checkNames($('#mapName').val());
	});
});

function checkNames(mapName){
	var publicPrivate = $('#isPublic').is(":checked") ? 'public' : 'private';
	var mapField = $('#mapName');
	
	if(mapName){//check namespace for availability 
		db.ref('Maps/' + publicPrivate + '/' + mapName).once('value').then(function(snapshot){
			
			if(snapshot.val()){
				mapField.removeClass('approved');
				mapField.addClass('taken');
				$('#takenHint').show();
				$('#takenHint>span').html(publicPrivate + ' maps.');
			}else{
				$('#takenHint').hide();
				mapField.removeClass('taken');
				mapField.addClass('approved');
			}
		});
	}else{//default state
		$('#takenHint').hide();
		mapField.removeClass('taken');
		mapField.removeClass('approved');
	}
}