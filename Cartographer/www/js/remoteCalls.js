var cartographer = {
    auth: {
        createAccount: function(email, password, errorHandler){
            firebase.auth().createUserWithEmailAndPassword(email, password).catch(errorHandler);
        }       
    }
};