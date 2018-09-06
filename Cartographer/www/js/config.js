var config = {
    apiKey: "AIzaSyBw2nx5ZknrD8rT3n9NuHAhIwc_fUqwKO8",
    authDomain: "cartographer-e17f6.firebaseapp.com",
    databaseURL: "https://cartographer-e17f6.firebaseio.com",
    projectId: "cartographer-e17f6",
    storageBucket: "cartographer-e17f6.appspot.com",
    messagingSenderId: "755099082114"
};

firebase.initializeApp(config);

const firestore = firebase.firestore();
const settings = {/* your settings... */ timestampsInSnapshots: true};

firestore.settings(settings);