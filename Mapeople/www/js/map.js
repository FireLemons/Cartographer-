var map;
var currentPinSelection = "basicPin";

// Cordova is ready
//
function onDeviceReady() {
	var options = { timeout: 30000 };
    watchID = navigator.geolocation.watchPosition(onSuccess, onError, options);
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
						'Timestamp: '          + position.timestamp                    + '<br />';

	//Write to firebase.					
	user = firebase.auth().currentUser;
	if(user)
		db.ref('Users/'+user.uid+'/locs/').push().set({
					"lat": position.coords.latitude,
					"lng": position.coords.longitude
				});
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
				db.ref('Maps/public/map2/pins').push().set({
					"lat": event.latLng.lat(),
					"long": event.latLng.lng(),
					"type":"basicPin"
				});
				break;
			case "textPin":
				newTextPin(event.latLng.lat(), event.latLng.lng());
				/*
				if (textPinText != null) {
					db.ref('Maps/public/map2/pins').push().set({
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
				db.ref('Maps/public/map2/pins').push().set({
					"lat": event.latLng.lat(),
					"long": event.latLng.lng(),
					"type":"meetingPin"
				});
				*/
				break;
			case "landmarkPin":
				db.ref('Maps/public/map2/pins').push().set({
					"lat": event.latLng.lat(),
					"long": event.latLng.lng(),
					"type":"landmarkPin"
				});
				break;
			case "linePin":
				db.ref('Maps/public/map2/pins').push().set({
					"lat": event.latLng.lat(),
					"long": event.latLng.lng(),
					"type":"linePin"
				});
				break;
			case "picturePin":
				db.ref('Maps/public/map2/pins').push().set({
					"lat": event.latLng.lat(),
					"long": event.latLng.lng(),
					"type":"picturePin"
				});
				break;
			case "pollPin":
				db.ref('Maps/public/map2/pins').push().set({
					"lat": event.latLng.lat(),
					"long": event.latLng.lng(),
					"type":"pollPin"
				});
				break;
			default:
				db.ref('Maps/public/map2/pins').push().set({
					"lat": event.latLng.lat(),
					"long": event.latLng.lng(),
					"type":"basicPin"
				});
				break;
		} //End switch (currentPinSelection)
		
	});
	
	// load from firebase
	var commentsRef = db.ref('Maps/public/map2/pins');
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
				var today = new Date();

				if (data.val().day >= today.getDate() && data.val().month >= today.getMonth() && data.val().year >= today.getFullYear())
				{
					var meetingPinWindow = initMeetingPin('Mapeople', data.val().meetingText, data.val().day, data.val().month, data.val().year);
					var maxWidth = 200;
					
					var marker = new google.maps.Marker({
						position: myLatLng,
						map: map,
						title: 'meetingPin',
						icon: pinIcons['meetingPin'].icon
					});

					marker.addListener('click', function() {
						meetingPinWindow.setOptions({maxWidth:maxWidth}); 
						meetingPinWindow.open(map, marker);
					});
				} //End if (data.day >= today.getDate() && data.month >= today.getMonth() && data.year >= today.getFullYear())
				else {
					//Remove the meeting marker, it is past the meeting date
					console.log('Attempting to remove an old meeting pin');
					console.dir(data.key);
					db.ref('Maps/public/map2/pins').child(data.key).remove();
				} //End else
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
				db.ref('Maps/public/map2/pins').push().set({
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

	$('#text-pin-dialog').dialog('open');
} //End function newTextPin(lat, lng)

function initMeetingPin(user, meetingText, day, month, year) {
	var contentString = '<div id="content"'+
	'<div id="siteNotice">'+
	'</div>'+
	'<p id="" class="firstHeading">' + 
	'<b>Meeting Date:</b> ' + (month + 1).toString() + '/' + (day + 1).toString() + '/' + year + 
	'</p>'+
	'<div id="bodyContent" class="textPinContent">' +
	//'<pre>' + userText + '</pre>' +
	'<p><b>Purpose:</b> ' + meetingText + '</p>' +
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
				//Check for a valid date, ie. needs to be in the future, not the past
				var date = $("#meetingPinDatePicker").datepicker('getDate');
				var today = new Date();

				console.log("Attempting to create a new meeting pin.");
				console.log("lat: " + lat + " lng: " + lng);

				if (date != null) {
					if (date.getDate() >= today.getDate() && date.getMonth() >= today.getMonth() && date.getFullYear() >= today.getFullYear())
					{
						db.ref('Maps/public/map2/pins').push().set({
							"lat": lat,
							"long": lng,
							"day": date.getDate(),
							"month": date.getMonth(),
							"year": date.getFullYear(),
							"meetingText": $('#meeting-pin-dialog-textarea').val(),
							"type":"meetingPin"
						});
						$('#meeting-pin-dialog').dialog('close');
					} //End if (function () { if (date.getDate() < today.getDate()) { return false; } //End if (date.getDate() < today.getDate()) if (date.getMonth() < today.getMonth()) { return false; } //End if (date.getMonth() < today.getMonth()) if (date.getFullYear() < today.getFullYear()) { return false; } //End if (date.getFullYear() < today.getFullYear()) } return true;)
					else {
						//Need a date that is in the future
						alert('The date for the meeting cannot be in the past.');
					} //End else
				} //End 
				else {
					//Need a date to create a meeting pin
					alert('Please select a date.');
				} //End else
			} //End "Post": function()
		}, //End buttons:
		open: function() {
			$("#meetingPinDatePicker").datepicker();		
		}, //End open: function()
		close: function() {
			$('#meetingPinDatePicker').val("");
			$('#text-pin-dialog-textarea').val("");
		} //End close: function()
	});
	
	$('#meeting-pin-dialog').dialog('open');
} //End function newMeetingPin(lat, lng) {

function addUser() {}