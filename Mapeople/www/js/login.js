if(!firebase){
	console.error("Firebase API has failed to load on this page.");
} else {
	 
	var uiConfig = {
		callbacks: {
			signInSuccess: function(currentUser, credential, redirectUrl) {
				dbRef.child("users/" + currentUser.uid).once("value").then(function(snapshot){
					if(!(snapshot.val() && snapshot.val().username)){
						dbRef.child("users/" + currentUser.uid).set({
							username: currentUser.displayName,
							email: currentUser.email
						});
					}
	 
					//Manual redirect.
					/*window.location.replace("???.html");*/
				});
	 
				//Returns false for manual redirect to allow time for firebase query to run.
				return false;
			}
		},
		signInOptions: [
			// Leave the lines as is for the providers you want to offer your users.
			firebase.auth.GoogleAuthProvider.PROVIDER_ID
		],
		// Terms of service url.
		tosUrl: '<your-tos-url>'
	};
	
	// Initialize the FirebaseUI Widget using Firebase.
	var ui = new firebaseui.auth.AuthUI(firebase.auth());
	// The start method will wait until the DOM is loaded.
	ui.start('#login-button', uiConfig);
	
	firebase.auth().onAuthStateChanged(function(user){
		if(user){
			//User successfully logged in
		} else {
			displayAnonymous();
		}
	});
}

function displayAnonymous(){
	
	
}