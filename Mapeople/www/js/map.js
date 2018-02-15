var map;
var currentPinSelection = "basicPin";

// Cordova is ready
//
function onDeviceReady() {
	navigator.geolocation.getCurrentPosition(onSuccess, onError);
}

// onSuccess Geolocation
//
function onSuccess(position) {
	var element = document.getElementById('geolocation');
	element.innerHTML = 'Latitude: '           + position.coords.latitude              + '<br />' +
						'Longitude: '          + position.coords.longitude             + '<br />' +
						'Altitude: '           + position.coords.altitude              + '<br />' +
						'Accuracy: '           + position.coords.accuracy              + '<br />' +
						'Altitude Accuracy: '  + position.coords.altitudeAccuracy      + '<br />' +
						'Heading: '            + position.coords.heading               + '<br />' +
						'Speed: '              + position.coords.speed                 + '<br />' +
						'Timestamp: '          +                                   position.timestamp          + '<br />';
}

// onError Callback receives a PositionError object
//
function onError(error) {
	var element = document.getElementById('geolocation');
	element.innerHTML = 'FAIL';
}

document.addEventListener("deviceready", onDeviceReady, false);

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

	var pinIcons = {
		basicPin: {
			htmlID: 'basic-pin',
            name: 'Basic',
            icon: 'oPin3.png'
		},
		textPin: {
			htmlID: 'text-pin',
			name: 'Text',
			icon: 'oPin3.png'
		},
		meetingPin: {
			htmlID: 'meeting-pin',
			name: 'Meeting',
			icon: 'oPin3.png'
		},
		landmarkPin: {
			htmlID: 'landmark-pin',
			name: 'Landmark',
			icon: 'oPin3.png'
		},
		linePin: {
			htmlID: 'line-pin',
			name: 'Line',
			icon: 'oPin3.png'
		},
		picturePin: {
			htmlID: 'picture-pin',
			name: 'Picture',
			icon: 'oPin3.png'
		},
		pollPin: {
			htmlID: 'poll-pin',
			name: 'Poll',
			icon: 'oPin3.png'
		}
	};

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
				getTextPinUserInput();

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
					title: 'basicPin',
					icon: pinIcons['basicPin'].icon
					//icon: 'oPin3.png'
				});
				break;
			case "textPin":
				var myLatLng = {lat: data.val().lat, lng: data.val().long};
				var textPinWindow = initTextPinWindow('Mapeople', data.val().text);
				
				var marker = new google.maps.Marker({
					position: myLatLng,
					map: map,
					title: 'textPin',
					user: 'Mapeople', //Need to connect it to actual users when management is figured out.
					icon: pinIcons['textPin'].icon
				});

				marker.addListener('click', function() {
					textPinWindow.open(map, marker);
				});

				break;
			case "meetingPin":
				var myLatLng = {lat: data.val().lat, lng: data.val().long};
				var marker = new google.maps.Marker({
					position: myLatLng,
					map: map,
					title: 'meetingPin',
					icon: pinIcons['meetingPin'].icon
				});
				break;
			case "landmarkPin":
				var myLatLng = {lat: data.val().lat, lng: data.val().long};
				var marker = new google.maps.Marker({
					position: myLatLng,
					map: map,
					title: 'landmarkPin',
					icon: pinIcons['landmarkPin'].icon
				});
				break;
			case "linePin":
				var myLatLng = {lat: data.val().lat, lng: data.val().long};
				var marker = new google.maps.Marker({
					position: myLatLng,
					map: map,
					title: 'linePin',
					icon: pinIcons['linePin'].icon
				});
				break;
			case "picturePin":
				var myLatLng = {lat: data.val().lat, lng: data.val().long};
				var marker = new google.maps.Marker({
					position: myLatLng,
					map: map,
					title: 'picturePin',
					icon: pinIcons['picturePin'].icon
				});
				break;
			case "pollPin":
				var myLatLng = {lat: data.val().lat, lng: data.val().long};
				var marker = new google.maps.Marker({
					position: myLatLng,
					map: map,
					title: 'pollPin',
					icon: pinIcons['pollPin'].icon
				});
				break;
			default:
				var myLatLng = {lat: data.val().lat, lng: data.val().long};
				var marker = new google.maps.Marker({
					position: myLatLng,
					map: map,
					title: 'basicPin',
					icon: pinIcons['basicPin'].icon
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

	//Put the icons and their names in the legend
	for (var key in pinIcons) {
		var type = pinIcons[key];
		var name = type.name;
		var icon = type.icon;
		var div = document.createElement('div');
		div.innerHTML = '<a id="' + 
		type.htmlID + '" ' +
		'onclick="selectPin(\'' + key.toString() + '\')" class="">' +
		'<img src="' + icon + '"> ' + 
		name + 
		'</a>';
		legend.appendChild(div);
	}

	map.controls[google.maps.ControlPosition.LEFT_TOP].push(legend);
}

function selectPin(selectedPin) {
	console.log("selectPin(selectedPin) called")
	console.dir(selectedPin);
	currentPinSelection = selectedPin;
} //End function selectPin(selectedPin)

function initTextPinWindow(user, userText) {
	var contentString = '<div id="content">'+
	'<div id="siteNotice">'+
	'</div>'+
	'<h6 id="firstHeading" class="firstHeading">' + 
	'<b>' + user + ':' + '</b>' + 
	'</h6>'+
	'<div id="bodyContent">'+
	'<p>' + userText + '</p>'+
	'</div>'+
	'</div>';
	return new google.maps.InfoWindow({
		content: contentString
	});
} //End function initTextPinWindow(user, userText)

function getTextPinUserInput() {
	$('#text-pin-dialog').dialog({
		autoOpen: false,
		modal: true,
		draggable: false,
		buttons: {
			"Post": function () {
			
			},
		},
		close: function() {
			
		}
	});

	$('#text-pin-dialog').dialog('open');
} //End 

function addUser() {}