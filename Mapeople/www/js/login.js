if(!firebase){
	console.error("Firebase has failed to load on this page.");
} else if(!jQuery){
	console.error("JQuery failed to load on this page.");
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
		} else {
			displayAnonymous();
		}
	});
	
	
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

function displayAnonymous(){
	
	
}