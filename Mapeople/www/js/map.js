var map;
var currentPinSelection = "basicPin";

function initMap() {
	map = new google.maps.Map(document.getElementById('map'), {
		zoom: 16,
		center: {lat: 38.940451750007945, lng: -92.32772827148438}
	});

	var customMapTypeId = 'custom_style';
	var customMapType = new google.maps.StyledMapType([
	{
		stylers: [
			{hue: '#81F9FB'},
			{visibility: 'simplified'},
			{gamma: 0.3},
			{weight: 0.20}
		]
		},
		{
			elementType: 'labels',
			stylers: [{visibility: 'on'}]
		},
		{
			featureType: 'water',
			stylers: [{color: '#346FFF'}]
		}
		], {
		name: 'Trippy'
	});

	map.mapTypes.set(customMapTypeId, customMapType);
	map.setMapTypeId(customMapTypeId);

	// tap to add pin to fb
	google.maps.event.addListener(map, 'click', function( event ){

		switch (currentPinSelection)
		{
			case "basicPin":
				firebase.database().ref('Maps/public/map2/pins').push().set({
					"lat": event.latLng.lat(),
					"long": event.latLng.lng(),
					"type":"basicPin"
				});
				break;
			case "textPin":
				firebase.database().ref('Maps/public/map2/pins').push().set({
					"lat": event.latLng.lat(),
					"long": event.latLng.lng(),
					"text": "PLACE HOLDER",
					"type":"textPin"
				});
				break;
			case "meetingPin":
				firebase.database().ref('Maps/public/map2/pins').push().set({
					"lat": event.latLng.lat(),
					"long": event.latLng.lng(),
					"type":"meetingPin"
				});
				break;
			case "landmarkPin":
				firebase.database().ref('Maps/public/map2/pins').push().set({
					"lat": event.latLng.lat(),
					"long": event.latLng.lng(),
					"type":"landmarkPin"
				});
				break;
			case "linePin":
				firebase.database().ref('Maps/public/map2/pins').push().set({
					"lat": event.latLng.lat(),
					"long": event.latLng.lng(),
					"type":"linePin"
				});
				break;
			case "picturePin":
				firebase.database().ref('Maps/public/map2/pins').push().set({
					"lat": event.latLng.lat(),
					"long": event.latLng.lng(),
					"type":"picturePin"
				});
				break;
			case "pollPin":
				firebase.database().ref('Maps/public/map2/pins').push().set({
					"lat": event.latLng.lat(),
					"long": event.latLng.lng(),
					"type":"pollPin"
				});
				break;
			default:
				firebase.database().ref('Maps/public/map2/pins').push().set({
					"lat": event.latLng.lat(),
					"long": event.latLng.lng(),
					"type":"basicPin"
				});
				break;
		} //End switch (currentPinSelection)
		
	});

	// load from firebase
	var commentsRef = firebase.database().ref('Maps/public/map2/pins');
	commentsRef.on('child_added', function(data) {

		switch (data.val().type)
		{
			case "basicPin":
				var myLatLng = {lat: data.val().lat, lng: data.val().long};
				var marker = new google.maps.Marker({
					position: myLatLng,
					map: map,
					title: 'Hello World!',
					icon: 'oPin3.png'
				});
				break;
			case "textPin":
				var myLatLng = {lat: data.val().lat, lng: data.val().long};
				var marker = new google.maps.Marker({
					position: myLatLng,
					map: map,
					title: data.val().text,
					label: {color: '#00aaff', fontWeight: 'bold', fontSize: '14px', text: data.val().text},
					icon: 'oPin3.png'
				});
				break;
			case "meetingPin":
				var myLatLng = {lat: data.val().lat, lng: data.val().long};
				var marker = new google.maps.Marker({
					position: myLatLng,
					map: map,
					title: 'Hello World!',
					icon: 'oPin3.png'
				});
				break;
			case "landmarkPin":
				var myLatLng = {lat: data.val().lat, lng: data.val().long};
				var marker = new google.maps.Marker({
					position: myLatLng,
					map: map,
					title: 'Hello World!',
					icon: 'oPin3.png'
				});
				break;
			case "linePin":
				var myLatLng = {lat: data.val().lat, lng: data.val().long};
				var marker = new google.maps.Marker({
					position: myLatLng,
					map: map,
					title: 'Hello World!',
					icon: 'oPin3.png'
				});
				break;
			case "picturePin":
				var myLatLng = {lat: data.val().lat, lng: data.val().long};
				var marker = new google.maps.Marker({
					position: myLatLng,
					map: map,
					title: 'Hello World!',
					icon: 'oPin3.png'
				});
				break;
			case "pollPin":
				var myLatLng = {lat: data.val().lat, lng: data.val().long};
				var marker = new google.maps.Marker({
					position: myLatLng,
					map: map,
					title: 'Hello World!',
					icon: 'oPin3.png'
				});
				break;
			default:
				var myLatLng = {lat: data.val().lat, lng: data.val().long};
				var marker = new google.maps.Marker({
					position: myLatLng,
					map: map,
					title: 'Hello World!',
					icon: 'oPin3.png'
				});
				break;
		} //End switch (data.val().type)

		/*
		if(data.val().type == "basicPin"){
			var myLatLng = {lat: data.val().lat, lng: data.val().long};
			var marker = new google.maps.Marker({
				position: myLatLng,
				map: map,
				title: 'Hello World!',
				icon: 'oPin3.png'
			});
		}
		*/
	});

	var legend = document.getElementById('legend');

	map.controls[google.maps.ControlPosition.LEFT].push(legend);
}

function selectPin(selectedPin) {
	console.log("selectPin(selectedPin) called")
	console.dir(selectedPin);
	currentPinSelection = selectedPin;
}