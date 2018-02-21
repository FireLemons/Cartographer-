var map;
var currentPinSelection = "basicPin";

// Cordova is ready
//
function onDeviceReady() {
	navigator.geolocation.getCurrentPosition(onSuccess, onError);
}

// DOM has loaded
//
$(function(){
	$("#pinHide").click(function(){
		$("#legend").animate(
			{width:"toggle"}, 
			500, 
			function(){
				$(this).children().hide();
				$("#pinShow").show();
				$(this).animate({width:"toggle"}, 500);
			}
		);
	});
	
	$("#pinShow").click(function(){
		$("#legend").animate(
			{width:"toggle"}, 
			500, 
			function(){
				$(this).children().show();
				$("#pinShow").hide();
				$(this).animate({width:"toggle"}, 500);
			}
		);
	});

	$('#text-pin-dialog').dialog();
	$('#text-pin-dialog-textarea').css('style', 'height: 10px');
	$('#text-pin-dialog').dialog('close');


	$('#meeting-pin-dialog').dialog();
	$('#meeting-pin-dialog-textarea').css('style', 'height: 10px');
	$('#meeting-pin-dialog').dialog('close');
});

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
			htmlID: 'basicPin',
            name: 'Basic',
            icon: 'oPin3.png'
		},
		textPin: {
			htmlID: 'textPin',
			name: 'Text',
			icon: 'oPin3.png'
		},
		meetingPin: {
			htmlID: 'meetingPin',
			name: 'Meeting',
			icon: 'oPin3.png'
		},
		landmarkPin: {
			htmlID: 'landmarkPin',
			name: 'Landmark',
			icon: 'oPin3.png'
		},
		linePin: {
			htmlID: 'linePin',
			name: 'Line',
			icon: 'oPin3.png'
		},
		picturePin: {
			htmlID: 'picturePin',
			name: 'Picture',
			icon: 'oPin3.png'
		},
		pollPin: {
			htmlID: 'pollPin',
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
				newTextPin(event.latLng.lat(), event.latLng.lng());
				/*
				if (textPinText != null) {
					firebase.database().ref('Maps/public/map2/pins').push().set({
						"lat": event.latLng.lat(),
						"long": event.latLng.lng(),
						"text": "PLACE HOLDER",
						"type":"textPin"
					});
				} //End 
				else {

				} //End else
				*/
				break;
			case "meetingPin":
				newMeetingPin(event.latLng.lat(), event.latLng.lng());
				
				/*
				firebase.database().ref('Maps/public/map2/pins').push().set({
					"lat": event.latLng.lat(),
					"long": event.latLng.lng(),
					"type":"meetingPin"
				});
				*/
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
				var maxWidth = 200;

				var marker = new google.maps.Marker({
					position: myLatLng,
					map: map,
					title: 'textPin',
					user: 'Mapeople', //Need to connect it to actual users when management is figured out.
					icon: pinIcons['textPin'].icon,
					maxWidth: maxWidth
				});

				marker.addListener('click', function() {
					textPinWindow.setOptions({maxWidth:maxWidth}); 
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

	$('#' + currentPinSelection).css('font-weight', 'normal');
	$('#' + selectedPin).css('font-weight', 'bold');

	currentPinSelection = selectedPin;
} //End function selectPin(selectedPin)

function initTextPinWindow(user, userText) {
	var contentString = '<div id="content"'+
	'<div id="siteNotice">'+
	'</div>'+
	'<h6 id="" class="firstHeading">' + 
	'<b>' + user + ':' + '</b>' + 
	'</h6>'+
	'<div id="bodyContent" class="textPinContent">' +
	//'<pre>' + userText + '</pre>' +
	'<p>' + userText + '</p>' +
	'</div>' +
	'</div>';

	var textInfoWindow = new google.maps.InfoWindow({
		content: contentString
	});

	return textInfoWindow;
} //End function initTextPinWindow(user, userText)

function newTextPin(lat, lng) {
	$('#text-pin-dialog-textarea').each(function () {
		if (this.scrollHeight > 48) {
			this.setAttribute('style', 'height:' + (this.scrollHeight) + 'px;overflow-y:hidden;');
		} //End if (this.scrollHeight > 48)
		else {
			this.setAttribute('style', 'height:48px;overflow-y:hidden;');
		} //End else
	}).on('input', function () {
		this.style.height = 'auto';
		this.style.height = (this.scrollHeight) + 'px';
	});

	
	

	$('#text-pin-dialog').dialog({
		autoOpen: false,
		modal: true,
		draggable: false,
		buttons: {
			"Post": function() {
				console.log("Attempting to create a new text pin.");
				console.log("lat: " + lat + " lng: " + lng);
				firebase.database().ref('Maps/public/map2/pins').push().set({
					"lat": lat,
					"long": lng,
					"text": $('#text-pin-dialog-textarea').val(),
					"type":"textPin"
				});

				$('#text-pin-dialog').dialog('close');
			}
			
		},
		close: function() {
			$('#text-pin-dialog-textarea').val("");
		}
	});
	//*/

	$('#text-pin-dialog').dialog('open');
} //End function newTextPin(lat, lng)

function initMeetingPin(user, meetingText, meetingDate) {
	var contentString = '<div id="content"'+
	'<div id="siteNotice">'+
	'</div>'+
	'<h6 id="" class="firstHeading">' + 
	'<b>' + meetingDate + ':' + '</b>' + 
	'</h6>'+
	'<div id="bodyContent" class="textPinContent">' +
	//'<pre>' + userText + '</pre>' +
	'<p>' + meetingText + '</p>' +
	'</div>' +
	'</div>';

	var meetingInfoWindow = new google.maps.InfoWindow({
		content: contentString
	});

	return meetingInfoWindow;

} //End function initMeetingPin(user, meetingDate, meetingText) {

function newMeetingPin(lat, lng) {
	$('#meeting-pin-dialog-textarea').each(function () {
		if (this.scrollHeight > 48) {
			this.setAttribute('style', 'height:' + (this.scrollHeight) + 'px;overflow-y:hidden;');
		} //End if (this.scrollHeight > 48)
		else {
			this.setAttribute('style', 'height:48px;overflow-y:hidden;');
		} //End else
	}).on('input', function () {
		this.style.height = 'auto';
		this.style.height = (this.scrollHeight) + 'px';
	});

	$('#meeting-pin-dialog').dialog({
		autoOpen: false,
		modal: true,
		draggable: false,
		buttons: {
			"Post": function() {
				console.log("Attempting to create a new text pin.");
				console.log("lat: " + lat + " lng: " + lng);
				firebase.database().ref('Maps/public/map2/pins').push().set({
					"lat": lat,
					"long": lng,
					"meetingDate": $('#meetingPinDatePicker').val(),
					"meetingText": $('#meeting-pin-dialog-textarea').val(),
					"type":"meetingPin"
				});

				$('#meeting-pin-dialog').dialog('close');
			}
			
		},
		open: function() {
			$("#meetingPinDatePicker").datepicker();		
		},
		close: function() {
			$('#meetingPinDatePicker').val("");
			$('#text-pin-dialog-textarea').val("");
		}
	});
	
	$('#meeting-pin-dialog').dialog('open');
} //End function newMeetingPin(lat, lng) {

function addUser() {}