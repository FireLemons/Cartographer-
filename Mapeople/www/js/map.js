var map;
var currentPinSelection = "basicPin";
var globLineCoord = [];
var globShapeCoord = [];
var pollPolylines = []

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

	$('#poll-pin-dialog').dialog();
	$('#poll-pin-dialog-textarea').css('style', 'height: 10px');
	$('#poll-pin-dialog').dialog('close');

	$("ul#poll-new-choices").on("click", "button", function(e) {
		e.preventDefault();
		$(this).parent().remove();
		//$('#poll-new-add-choice-btn').show();
	});

	$("ul#poll-add-choices").on("click", "button", function(e) {
		e.preventDefault();
		$(this).parent().remove();
		//$('#poll-new-add-choice-btn').show();
	});
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
	{
		db.ref('Users/'+user.uid+'/locs/').push().set({
					"lat": position.coords.latitude,
					"lng": position.coords.longitude
				});
				
		console.log('Test');
		ref=db.ref('Users/'+user.uid+'/locs/');
		ref.once("value", function(data) {
		  // do some stuff once
		  locs=data.toJSON();
		  keys=Object.keys(data.toJSON());
		  console.log(locs[keys[0]]);
		  points=[];
		  for (i = 0; i < keys.length; i++) { 
				points.push(  new google.maps.LatLng(locs[keys[i]]['lat'], locs[keys[i]]['lng'])  );
			}
		  // Create a heatmap.
			var heatmap = new google.maps.visualization.HeatmapLayer({
			  data: points
			});
			heatmap.setMap(map);
		});
	}
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
        },
        shapePin: {
            htmlID: 'shape-pin',
            name: 'Shape',
            icon: 'oPin3.png'
        }
	};
    
    var lineCoordinates = [];
    var lineWrite = new google.maps.Polyline({
        path: globLineCoord,
        strokeColor: '#FF0000',
        strokeOpacity: 1.0,
        strokeWeight: 2,
        draggable: true,
        geodesic: true,
        editable: true
    });
    var shapeCoords = [];
    var shape = new google.maps.Polygon({
        map: map,
        paths: globShapeCoord,
        strokeColor: '#FF0000',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#FF0000',
        fillOpacity: 0.35,
        draggable: true,
        geodesic: true,
        editable: true
    });

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
				break;
			case "meetingPin":
				newMeetingPin(event.latLng.lat(), event.latLng.lng());
				break;
			case "landmarkPin":
				db.ref('Maps/public/map2/pins').push().set({
					"lat": event.latLng.lat(),
					"long": event.latLng.lng(),
					"type":"landmarkPin"
				});
				break;
			case "linePin":
                globLineCoord.push({lat: event.latLng.lat(), lng: event.latLng.lng()});
                globLineCoord = lineCoordinates;

                lineWrite.setMap(null);
                lineWrite = new google.maps.Polyline({
                    path: globLineCoord,
                    strokeColor: '#FF0000',
                    strokeOpacity: 1.0,
                    strokeWeight: 2,
                    // draggable: true,
                    geodesic: true
                    //editable: true
                });

                lineWrite.setMap(map);
				break;
			case "picturePin":
				db.ref('Maps/public/map2/pins').push().set({
					"lat": event.latLng.lat(),
					"long": event.latLng.lng(),
					"type":"picturePin"
				});
				break;
			case "pollPin":
				newPollPin(event.latLng.lat(), event.latLng.lng());
				break;
            case "shapePin":
                globShapeCoord.push({lat: event.latLng.lat(), lng: event.latLng.lng()});
                globShapeCoord = shapeCoords;
                shape.setMap(null);
                shape = new google.maps.Polygon({
                    map: map,
                    paths: globShapeCoord,
                    strokeColor: '#FF0000',
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    fillColor: '#FF0000',
                    fillOpacity: 0.35
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
	
	var pollInfoWindows = [];

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
				var coorids = data.val().latLongs;
                var myLatLng = [];
                myLatLng.push({lat: coorids[0].lat, lng: coorids[0].lng});
                myLatLng.push({lat: coorids[1].lat, lng: coorids[1].lng});


                var lineDraw = new google.maps.Polyline({
                    path: coorids,
                    geodesic: true,
                    strokeColor: '#FF0000',
                    strokeOpacity: 1.0,
                    strokeWeight: 2,
                });

				lineDraw.setMap(map);
				break;
            case "shapePin":
                var coorids = data.val().latLongs;

                var shapeDraw = new google.maps.Polygon({
                    map: map,
                    paths: coorids,
                    strokeColor: '#FF0000',
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    fillColor: '#FF0000',
                    fillOpacity: 0.35,
                    //draggable: true,
                    geodesic: true
                    //editable: true
                });

                shapeDraw.setMap(map);
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
				initPollPin(data.val().pollID, myLatLng,map, pinIcons['pollPin'].icon, pollInfoWindows, data.key);
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
					"user": firebase.auth().currentUser.uid,
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
} //End function newMeetingPin(lat, lng)

function initPollPin(pollID, myLatLng, map, pinIcon, pollInfoWindows, markerID) {
	var pollName = '';
	
	pollRef = db.ref('Maps/public/map2/polls/' + pollID);
	
	var contentString = '';

	return pollRef.once("value", function(data) {
		pollName = data.val().pollName;
		contentString =
		'<div id="content"'+
			'<div id="siteNotice">'+
			'</div>'+
			'<h6 id="" class="firstHeading">' + 
				'<b>' + pollName + ':' + '</b>' + 
			'</h6>'+
			'<div id="bodyContent" class="pollPinContent">';
	}).then(function() {
		pollOptionsRef = db.ref('Maps/public/map2/polls/' + pollID + '/options/');
		
		pollOptionsRef.once("value", function(data) {
			contentString += 
				'<legend>Options</legend>' +
				'<fieldset>';
	
			var i = 1;
			for (var key in data.val()) {
				var radioGroupName = pollName.split(' ').join('-') + '-' + 'radio';
				var optionID = radioGroupName + '-' + i;

				contentString += 
					'<label for="' + key + '">' + data.val()[key].pollOption + '</label>' +
					'<input type="radio" name="' + radioGroupName + '" id="' + key + '" class="poll-pin-option" onclick="pollPinUserMadeChoice(\'' + optionID + '\',\'' + pollID + '\',\'' + key + '\')">' +
					'<br>';
	
				i++;
			} //End for (var key in data.val())

			contentString += 
					'</fieldset>' +
					'<br>' +
					'<button id="show-' + pollName.split(' ').join('-') +'" name="" class="show-markers poll-show-markers ui-button ui-widget rounded-corners" type="button" onclick="pollPinShowOtherMarkers(\'' + pollName.split(' ').join('-') + '\',\'' + pollID +'\',\'' + markerID + '\')">' +
						'Show Poll Markers' +
					'</button>' +
					'<button id="hide-' + pollName.split(' ').join('-') +'" name="" class="hide-markers poll-show-markers ui-button ui-widget rounded-corners" type="button" onclick="pollPinHideOtherMarkers(\'' + pollName.split(' ').join('-') + '\',\'' + pollID +'\')">' +
						'Hide Poll Markers' +
					'</button>' +
				'</div>' +
			'</div>';
		}).then(function() {
			var marker = new google.maps.Marker({
				position: myLatLng,
				map: map,
				title: 'pollPin',
				icon: pinIcon,
				"pollID": pollID
			});

			//Add the new poll if it does not already exist to the list
			if (!pollInfoWindows.some(function(poll) {return poll.pollID == pollID})) {
				var temp = new google.maps.InfoWindow({
					content: ''
				});

				pollInfoWindows.push({
					"pollID": pollID,
					"infoWindow": temp,
					"infoWindowContent": contentString,
					markers: [marker]
				})
			} //End if (!pollInfoWindows.some(function(poll) {return poll.pollID == pollID}))
			else {
				var poll = pollInfoWindows.find(function(data) { return data.pollID == pollID});
				poll.infoWindowContent = contentString;
				poll.markers.push(marker);
			} //End else

			marker.addListener('click', function() {
				var poll = pollInfoWindows.find(function(data) { return data.pollID == pollID});
				poll.infoWindow.close();
				poll.infoWindow.setContent(poll.infoWindowContent);
				poll.infoWindow.open(map, marker);

				if (pollPolylines.find(function(poll) {return poll.pollID == pollID})) {
					$('#show-' + pollName.split(' ').join('-')).hide();
					$('#hide-' + pollName.split(' ').join('-')).show();
				} //End if (pollPolylines.find(function(poll) {return poll.pollID == pollID}))
				else {
					$('#show-' + pollName.split(' ').join('-')).show();
					$('#hide-' + pollName.split(' ').join('-')).hide();
				} //End else

				$( ".poll-pin-option" ).checkboxradio({
					icon: false
				});

				pollPinDisplayUserChoice(pollID, pollInfoWindows);
			});
		});
	});
} //End function initPollPin(pollID, myLatLng, map, pinIcon, pollInfoWindows)

function newPollPin(lat, lng) {
	$('#poll-pin-dialog-textarea').each(function () {
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

	$('#poll-pin-dialog').dialog({
		autoOpen: false,
		modal: true,
		draggable: false,
		buttons: {},
		open: function() {
			$('#poll-starting-choice').show();
			$('#poll-after-choice-made').hide();
			$('#poll-pin-lat').val(lat);
			$('#poll-pin-lng').val(lng);
		}, //End open: function()
		close: function() {
			$('#poll-starting-choice').css('visibility', 'visible');
			$('#poll-after-choice-made').css('display', 'none');
			$('#poll-pin-dialog-textarea').val("");
			$('#poll-pin-dialog').dialog('option', 'title', '');
			$('#poll-pin-lat').val('');
			$('#poll-pin-lng').val('');
			$('#poll-new-choices').empty();
			$('#poll-list').empty();
			$('#poll-list').show();
			$('#poll-add-choices').empty();
			$('#poll-new-add-choice-btn').show();
		} //End close: function()
	});
	
	$('#poll-pin-dialog').dialog('open');
} //End function newPollPin(lat, lng)

function addPollPinToFirebase() {
	var pinRef = db.ref('Maps/public/map2/pins').push();
	var pollRef;

	if ($('#poll-new-poll').is(':visible')) {
		pollRef = db.ref('Maps/public/map2/polls').push();
		pollRef.set({
			"pollName": $('#poll-pin-dialog-textarea').val()
		});

		$('ul#poll-new-choices > li > input.poll-option-input').each(function() {
			db.ref('Maps/public/map2/polls/' + pollRef.key + '/options/').push().set({
				"pollOption": this.value
			});
		});
	} //End if ($('#poll-new-poll').is(':visible'))
	else if ($('#poll-add-to-poll').is(':visible')) {
		var id = $('ul#poll-list > li > button#' + $('#poll-pin-dialog').dialog('option', 'title').split(' ').join('-')).attr('name');

		pollRef = db.ref('Maps/public/map2/polls/' + id);

		$('ul#poll-add-choices > li > input.poll-option-input').each(function() {
			db.ref('Maps/public/map2/polls/' + pollRef.key + '/options/').push().set({
				"pollOption": this.value
			});
		});
	} //End else if ($('#poll-add-to-poll').is(':visible'))

	pinRef.set({
		"lat": parseFloat($('#poll-pin-lat').val()),
		"long": parseFloat($('#poll-pin-lng').val()),
		"pollID": pollRef.key,
		"type":"pollPin"
	});

	db.ref('Maps/public/map2/polls/' + pollRef.key + '/associatedPins/').push().set({
		"pinID": pinRef.key
	});
	
	$('#poll-pin-dialog').dialog('close');
} //End function addPollPinToFirebase()

function addNewPollChoice(choice) {
	var contentString =
		'<li>' +
			'<input id="" class="poll-option-input" type="text" name="" value="">' +
			'<button id="" class="poll-option-remove ui-button ui-widget ui-button-icon-only rounded-corners" type="button">' +
				'<span class="ui-button-icon ui-icon ui-icon-closethick"></span>' +
				'<span class="ui-button-icon-space"> </span>' +
			'</button>' +
		'</li>';

	if (choice == "new") {
		$('#poll-new-choices').append(contentString);
	} //End if (choice == "new")
	else if (choice == "add") {
		$('#poll-add-choices').append(contentString);
	} //End else if (choice == "add")
	else {
		console.log('addNewPollChoice(choice = ' + choice + '): How did this happen?');
	} //End else

	//$('#poll-new-add-choice-btn').hide();
} //End function addNewPollChoice(choice)

function pollPinShowOtherMarkers(pollName, pollID, markerID) {
	$('#show-' + pollName).hide();
	$('#hide-' + pollName).show();

	var pollRef = db.ref('Maps/public/map2/polls/' + pollID + '/associatedPins');

	pollRef.once('value', function(data) {
		var originMarkerRef = db.ref('Maps/public/map2/pins/' + markerID);
		originMarkerRef.once('value', function(originMarker) {
			for (var key in data.val()) {
				if (data.val()[key].pinID != markerID)
				{
					var pinRef = db.ref('Maps/public/map2/pins/' + data.val()[key].pinID);
					
					pinRef.once('value', function(data) {

						var polyline = new google.maps.Polyline({
							path: [
								{lat: parseFloat(originMarker.val().lat), lng: parseFloat(originMarker.val().long)},
								{lat: parseFloat(data.val().lat), lng: parseFloat(data.val().long)}
							],
							geodesic: true,
							strokeColor: '#FF0000',
							strokeOpacity: 1.0,
							strokeWeight: 2
						})

						polyline.setMap(map);

						pollPolylines.push({
							'id': key,
							'pollID': pollID,
							'polyline': polyline
						});
					});
				} //End if (data.val()[key].pinID != markerID)
			} //End for (var key in data.val())
		});
	});
} //End function pollPinShowOtherMarkers(pollName, pollID, markerID)

function pollPinHideOtherMarkers(pollName, pollID) {
	$('#show-' + pollName).show();
	$('#hide-' + pollName).hide();

	pollPolylines.forEach(function(poll) {
		if (poll.pollID == pollID) {
			poll.polyline.setMap(null);
		} //End if (poll.pollID == pollID)
	});

	pollPolylines = pollPolylines.filter(poll => poll.pollID != pollID);
} //End function pollPinHideOtherMarkers(pollName, pollID)

function pollPinUserMadeChoice(optionRadioButtonID, pollID, optionID) {
	user = firebase.auth().currentUser;
	if (user) {
		var pollVoteRef = db.ref('Maps/public/map2/polls/' + pollID + '/votes');
		
		pollVoteRef.once("value", function(data) {
	
			var userAlreadyVoted = false;
			for (var key in data.val()) {
				if (data.val()[key].user == user.uid) {
					db.ref('Maps/public/map2/polls/' + pollID + '/votes/' + key).set({
						"user": user.uid,
						"choice": optionID
					});

					userAlreadyVoted = true;
				} //End if (data.val()[key].user == user)
			} //End for (var key in data.val())

			if (!userAlreadyVoted) {
				var pollUserVoteRef = db.ref('Maps/public/map2/polls/' + pollID + '/votes').push();
				pollUserVoteRef.set({
					"user": user.uid,
					"choice": optionID
				});
			} //End if (!userAlreadyVoted)
		});
	} //End if (user)
	else {
		console.log('No user')
	} //End else
} //End function pollPinUserMadeChoice(optionRadioButtonID, pollID, optionID)

function pollPinDisplayUserChoice(pollID) {
	var user = firebase.auth().currentUser;

	if (user) {
		var pollVoteRef = db.ref('Maps/public/map2/polls/' + pollID + '/votes');
		
			pollVoteRef.once("value", function(data) {
	
			for (var key in data.val()) {
				if (data.val()[key].user == user.uid) {
					$('#' + data.val()[key].choice).prop('checked', true).change();
				} //End if (data.val()[key].user == user.uid)
			} //End for (var key in data.val())
		});
	} //End if (user)
} //End function pollPinDisplayUserChoice(pollID)

function getExistingPolls() {
	if ($('#poll-list').children().length == 0) {
		pollRef = db.ref('Maps/public/map2/polls/');
		
		pollRef.once("value", function(data) {
			for (var key in data.val()) {
				var pollName = data.val()[key].pollName.split(' ').join('-');

				$('#poll-list').append(
					'<li>' +
						'<button id="' + pollName +'" name="' + key + '" class="poll-option-name ui-button ui-widget rounded-corners" type="button" onclick="hidePollChoices(\'' + pollName + '\')">' +
							data.val()[key].pollName +
						'</button>' +
					'</li>'
				);
			} //End for (var key in data.val())
		});
	} //End if ($('#poll-list').children().length == 0)
} //End function getExistingPolls()

function hidePollChoices(name) {
	$('#poll-list').hide();
	$('#poll-pin-dialog').dialog('option', 'title', name.split('-').join(' '));
	$('#poll-add-add-choice-btn').show();
} //End function hideOtherPollChoices(name)

function pollStartingChoice(choice) {
	if (choice == "new") {
		$('#poll-starting-choice').hide();
		$('#poll-after-choice-made').show();
		$('#poll-new-poll').show();
		$('#poll-add-to-poll').hide();

		$('#poll-pin-dialog').dialog('option', 'title', 'New Poll Pin');
	} //End if (choice == "new")
	else if (choice == "add") {
		$('#poll-starting-choice').hide();
		$('#poll-after-choice-made').show();
		$('#poll-new-poll').hide();
		$('#poll-add-to-poll').show();

		$('#poll-pin-dialog').dialog('option', 'title', 'Add to Existing Poll');
		$('#poll-add-add-choice-btn').hide();
		getExistingPolls();
	} //End else if (choice == "add")
	else {
		console.log('pollStartingChoice(choice = ' + choice + '): How did this happen?');
	} //End else

	
	$('#poll-pin-dialog').dialog('option', 'buttons', {
		"Back": {
			id: 'poll-back-button',
			text: 'Back',
			click: function() {
				var title = $('#poll-pin-dialog').dialog('option', 'title');
				console.log('title: ' + title);
				if (title != 'New Poll Pin' && title != 'Add to Existing Poll') {
					$('#poll-add-choices').empty();
					$('#poll-add-add-choice-btn').hide();
					$('#poll-list').show();
					$('#poll-pin-dialog').dialog('option', 'title', 'Add to Existing Poll');
				} //End 
				else {
					$('#poll-starting-choice').show();
					$('#poll-after-choice-made').hide();
					$('#poll-new-poll').hide();
					$('#poll-add-to-poll').hide();
	
					$('#poll-pin-dialog').dialog('option', 'title', '');
					$('#poll-pin-dialog').dialog('option', 'buttons', {});
				} //End else
			}
		},
		"Post": {
			id: 'poll-post-button',
			text: 'Post',
			click: addPollPinToFirebase
		} 
	});

} //End function pollStartingChoice(choice)

function writeLine() {
    firebase.database().ref('Maps/public/map2/pins').push().set({
        "latLongs": globLineCoord,
        "type":"linePin"
    });
    globLineCoord = [];
}

function writeShape() {
    firebase.database().ref('Maps/public/map2/pins').push().set({
        "latLongs": globShapeCoord,
        "type":"shapePin"
    });
    globShapeCoord = [];
}

function addUser() {}
