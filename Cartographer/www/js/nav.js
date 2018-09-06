var firebaseLoadErr = typeof firebase === 'undefined';

if(firebaseLoadErr){
	document.getElementById('noInet').removeAttribute('hidden');
	
	if(firebaseLoadErr){
		console.error("Firebase has failed to load on this page.");
	}
} else {
	var provider = new firebase.auth.GoogleAuthProvider();
	
	firebase.auth().onAuthStateChanged(function(user){
		if(user){
			$(".login-button").hide();
			$(".logout-button").show();
			
			var DBUsers = db.ref('/Users/' + user.uid);
			
			DBUsers.once('value').then(function(snapshot){
				if(!snapshot.val()){
					DBUsers.set({
						email : user.email
					});
				}
			});
		}
	});
	
	$('.button-collapse').sideNav();
		
	$(".login-button").click(function(){
		firebase.auth().signInWithRedirect(provider);
	});
	
	$(".logout-button").click(function(){
		firebase.auth().signOut().then(function() {
			location.reload();
		}).catch(function(error) {
			// An error happened.
		});
	});
}