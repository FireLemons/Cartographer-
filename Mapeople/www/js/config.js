// Initialize Will's Firebase
/*var config = {
	apiKey: "AIzaSyBrjkpdRRDhQE554qEmWHAeMbrlh_lIIX8",
	authDomain: "mapeople-558c8.firebaseapp.com",
	databaseURL: "https://mapeople-558c8.firebaseio.com",
	projectId: "mapeople-558c8",
	storageBucket: "mapeople-558c8.appspot.com",
	messagingSenderId: "104232274398"
};*/

// Initialize Mapeople Firebase
var config = {
	apiKey: "AIzaSyBrebIOvJpdsYgFmfy3APrhqsG45eRTpfo",
	authDomain: "mapeople-7bcd9.firebaseapp.com",
	databaseURL: "https://mapeople-7bcd9.firebaseio.com",
	projectId: "mapeople-7bcd9",
	storageBucket: "",
	messagingSenderId: "282260381580"
};

firebase.initializeApp(config);

var db = firebase.database();