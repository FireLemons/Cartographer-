var map;//var to hold google maps object
var mapID = window.localStorage.getItem('mapID');
var currentPinSelection = 'none';

//globals to manage states of markers being edited before being saved
var tempLineCoord = [];
var tempShapeCoord = [];
var tempLine;
var tempShape;


var pollPolylines = [];

// Cordova is ready
function onDeviceReady() {
	var options = {
		timeout: 30000
	};
	
	watchID = navigator.geolocation.watchPosition(onSuccess, onError, options);
}

// DOM has loaded
$(function(){
	if(!(firebase || jQuery)){
		document.getElementById('noInet').display = 'block';
	}
	
	$(window).resize(function(){
		sizeMap();
	});
	
	//Controls for hiding/showing the pin selection menu
	$('#pinHide').click(function(){
		$('#legend').animate({
			width: 'toggle'
		}, 500, function(){
			$(this).children().hide();
			$('#pinShow').show();
			$(this).animate({width:'toggle'}, 500);
		});
	});
	
	$('#pinShow').click(function(){
		$("#legend").animate({
			width: 'toggle'
		}, 500, function(){
			$(this).children().show();
			$('#pinShow').hide();
			$(this).animate({
				width: 'toggle'
			}, 500);
		});
	});

	//Make selected pin in UI obvious
	$('.pin').click(function(){
		$('.pin').removeClass('selected');
		$(this).addClass('selected');
		
		Materialize.toast($(this).attr('data-toast') + ' Selected', 1400);
	});
	
	//Enable editing mode for multinode markers
	$('#linePin, #shapePin').click(function(){
		if(this.id === currentPinSelection){
			return;//don't trigger event if state already correct
		}
		
		clearTempLineShape();
		currentPinSelection = this.id;
		
		tempLineCoord = [];
		tempShapeCoord = [];
		
		map.setOptions({draggableCursor: 'url(img/icons/editing.png), pointer', draggingCursor: 'url(img/icons/editing.png), pointer'});
		$('#content').addClass('editing', function(){
			sizeMap();
		});
		
		var markerType = this.id;
		var saveButton = $('#confirmMarker');
		
		saveButton.unbind('click');//remove previous click listeners
		
		if(markerType == 'linePin'){
			saveButton.click(writeLine);
		} else if(markerType == 'shapePin') {
			saveButton.click(writeShape);
		}
	});
	
	//Exit editing mode for multinode markers
	$('#cancelMarker').click(function(){
		unsetPin();
		clearTempLineShape();
		exitEdit();
	});
	
	/*
	 * Init pin modals
	 */
	$('#text-pin-dialog').dialog();
	$('#text-pin-dialog-textarea').css('style', 'height: 10px');
	$('#text-pin-dialog').dialog('close');
  
	$('#meeting-pin-dialog').dialog();
	$('#meeting-pin-dialog-textarea').css('style', 'height: 10px');
	$('#meeting-pin-dialog').dialog('close');
  
	$('#poll-pin-dialog').dialog();
	$('#poll-pin-dialog-textarea').css('style', 'height: 10px');
	$('#poll-pin-dialog').dialog('close');
  
	$('ul#poll-new-choices').on('click', 'button', function(e) {
		e.preventDefault();
		$(this).parent().remove();
		//$('#poll-new-add-choice-btn').show();
	});
  
	$('ul#poll-add-choices').on('click', 'button', function(e) {
		e.preventDefault();
		$(this).parent().remove();
		//$('#poll-new-add-choice-btn').show();
	});
});

// onSuccess Geolocation
//
function onSuccess(position) {
    var element = document.getElementById('geolocation');
    element.innerHTML = 
	'Latitude: '           + position.coords.latitude              + '<br />' +
    'Longitude: '          + position.coords.longitude             + '<br />' +
    'Altitude: '           + position.coords.altitude              + '<br />' +
    'Accuracy: '           + position.coords.accuracy              + '<br />' +
    'Altitude Accuracy: '  + position.coords.altitudeAccuracy      + '<br />' +
    'Heading: '            + position.coords.heading               + '<br />' +
    'Speed: '              + position.coords.speed                 + '<br />' +
    'Timestamp: '          + position.timestamp                    + '<br />';
    
    //Write to firebase.
	user = firebase.auth().currentUser;

	if(user){
		db.ref('Users/' + user.uid + '/locs/').push().set({
			lat: position.coords.latitude,
			lng: position.coords.longitude
		});
        
        var ref = db.ref('Users/' + user.uid + '/locs/');
        ref.once("value", function(data) {
			// do some stuff once
			locs = data.toJSON();
			keys = Object.keys(data.toJSON());
			points = [];
			
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

document.addEventListener('deviceready', onDeviceReady, false);

function initMap(){
	//load map data from DB
	mapRef.once('value', function(data){
		var mapData = data.val();
		var lastPinID;
		
		if(!mapData){//load default map view if not one selected
			mapData = {
				center: {
					lat: 38.94457585473687,
					lng: -92.32607690901631
				},
				zoom: 5
			};
			
			$('#load').fadeOut();
		}else{
			if(mapData.pins){//Store id of most recent pin from db
				lastPinID = Object.keys(mapData.pins).reverse()[0];
			}else{//no pins => hide load screen
				$('#load').fadeOut();
			}
		}
		
		map = new google.maps.Map(document.getElementById('map'), {
			center: mapData.center,
			zoom: mapData.zoom
		});
		
		var customMapTypeId = 'custom_style';
		var customMapType = new google.maps.StyledMapType([
			{
				stylers: [
					{
						gamma: 0.4
					},
					{
						hue: '#92c27c'
					},
					{
						visibility: 'simplified'
					},
					{
						weight: 0.20
					}
				]
			},
			{
				elementType: 'labels',
				stylers: [
					{
						visibility: 'on'
					}
				]
			},
			{
				featureType: 'water',
				stylers: [
					{
						color: '#5294ff'
					}
				]
			},
			{
				featureType: 'poi',
				elementType: 'labels.icon',
				stylers: [
					{
						visibility: 'off'
					}
				]
			},
		], {
			name: 'Trippy'
		});
                
		var pinIcons = {
			basicPin: {
				htmlID: 'basicPin',
				name: 'Basic',
				icon: {
					url: 'img/icons/point.png',
					scaledSize: new google.maps.Size(40, 40)
				}
			},
			textPin: {
				htmlID: 'textPin',
				name: 'Text',
				icon: {
					url: 'img/icons/text.png',
					scaledSize: new google.maps.Size(40, 40)
				}
			},
			meetingPin: {
				htmlID: 'meetingPin',
				name: 'Meeting',
				icon: {
					url: 'img/icons/event.svg',
					scaledSize: new google.maps.Size(40, 40)
				}
			},
			linePin: {
				htmlID: 'linePin',
				name: 'Line',
				icon: {
					url: 'img/icons/line.svg',
					scaledSize: new google.maps.Size(40, 40)
				}
			},
			picturePin: {
				htmlID: 'picturePin',
				name: 'Picture',
				icon: {
					url: 'img/icons/picture.png',
					scaledSize: new google.maps.Size(40, 40)
				}
			},
			pollPin: {
				htmlID: 'pollPin',
				name: 'Poll',
				icon: {
					url: 'img/icons/poll.png',
					scaledSize: new google.maps.Size(40, 40)
				}
			},
			shapePin: {
				htmlID: 'shape-pin',
				name: 'Shape',
				icon: {
					url: 'img/icons/area.png',
					scaledSize: new google.maps.Size(40, 40)
				}
			}
		};
		
		map.mapTypes.set(customMapTypeId, customMapType);
		map.setMapTypeId(customMapTypeId);
                
		//Tapping/clicking on map triggers marker creation
		google.maps.event.addListener(map, 'click', function( event ){
			switch (currentPinSelection){
				case 'none':
					//do nothing
					break;
				case 'basicPin':
					mapRef.child('pins').push().set({
						lat: event.latLng.lat(),
						'long': event.latLng.lng(),
						type: 'basicPin'
					});
					break;
				case 'textPin':
					newTextPin(event.latLng.lat(), event.latLng.lng());
					break;
				case 'meetingPin':
					newMeetingPin(event.latLng.lat(), event.latLng.lng());
					break;
				case 'linePin':
					if(!tempLine){//init new google line object if not done already
						tempLine = new google.maps.Polyline({
							clickable: false,
							map: map,
							path: tempLineCoord,
							strokeColor: '#b35600',
							strokeOpacity: 1.0,
							strokeWeight: 2,
						});
					}
				
					tempLineCoord.push({
						lat: event.latLng.lat(),
						lng: event.latLng.lng()
					});
					
					tempLine.setPath(tempLineCoord);
					tempLine.setMap(map);
					break;
				case 'picturePin':
					mapRef.child('pins').push().set({
						lat: event.latLng.lat(),
						'long': event.latLng.lng(),
						type: 'picturePin'
					  });
					break;
				case 'pollPin':
					newPollPin(event.latLng.lat(), event.latLng.lng());
					break;
				case 'shapePin':
					if(!tempShape){
						tempShape = new google.maps.Polygon({
							clickable: false,
							map: map,
							paths: tempShapeCoord,
							fillColor: '#b35600',
							fillOpacity: 0.35,
							strokeColor: '#b35600',
							strokeOpacity: 0.8,
							strokeWeight: 2
						});
					}
				
					tempShapeCoord.push({
						lat: event.latLng.lat(), 
						lng: event.latLng.lng()
					});
					
					tempShape.setPath(tempShapeCoord);
					break;
				default:
					console.error('Attempted to create undefined pin.');
					break;
			} //End switch (currentPinSelection)                              
		});
		var pollInfoWindows = [];
		
		//load all pins
		var commentsRef = mapRef.child('pins');
		
		commentsRef.on('child_added', function(data) {
			if(lastPinID === data.key){
				$('#load').fadeOut();
			}
			
			switch (data.val().type) {
				case 'basicPin':
					var myLatLng = {
						lat: data.val().lat,
						lng: data.val().long
					};
					var marker = new google.maps.Marker({
						position: myLatLng,
						map: map,
						title: 'basicPin',
						icon: pinIcons['basicPin'].icon
					});
					break;
				case 'textPin':
					var myLatLng = {
						lat: data.val().lat,
						lng: data.val().long
					};
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
						textPinWindow.setOptions({
							maxWidth: maxWidth
						});
						textPinWindow.open(map, marker);
					});
					break;
				case 'meetingPin':
					var myLatLng = {lat: data.val().lat, lng: data.val().long};
					var today = new Date();
				   
					if (data.val().day >= today.getDate() && 
						data.val().month >= today.getMonth() && 
						data.val().year >= today.getFullYear()){
				   
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
						/*
						 * MAKE IT REDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD
						 */
						//Remove the meeting marker, it is past the meeting date
						console.log('Attempting to remove an old meeting pin');
						console.dir(data.key);
						mapRef.child('pins').child(data.key).remove();
					} //End else
					break;
				case 'linePin':
					var coorids = data.val().latLongs;
					var myLatLng = [];
					myLatLng.push({
						lat: coorids[0].lat,
						lng: coorids[0].lng
					});
					myLatLng.push({
						lat: coorids[1].lat,
						lng: coorids[1].lng
					});       

					var lineDraw = new google.maps.Polyline({
						clickable: false,
						path: coorids,
						geodesic: true,
						strokeColor: '#b35600',
						strokeOpacity: 1.0,
						strokeWeight: 2,
					});
						   
					lineDraw.setMap(map);
					break;
				case 'shapePin':
					var coorids = data.val().latLongs;
				   
					var shapeDraw = new google.maps.Polygon({
						clickable: false,
						map: map,
						paths: coorids,
						strokeColor: '#b35600',
						strokeOpacity: 0.8,
						strokeWeight: 2,
						fillColor: '#b35600',
						fillOpacity: 0.35,
						geodesic: true
					});
						   
					shapeDraw.setMap(map);
					break;
				case 'picturePin':
					var myLatLng = {
						lat: data.val().lat,
						lng: data.val().long
					};
					var marker = new google.maps.Marker({
						position: myLatLng,
						map: map,
						title: 'picturePin',
						icon: pinIcons['picturePin'].icon
					});
					break;
				case 'pollPin':
					var myLatLng = {
						lat: data.val().lat,
						lng: data.val().long
					};
					
					initPollPin(data.val().pollID, myLatLng,map, pinIcons['pollPin'].icon, pollInfoWindows, data.key);
					break;
				default:
					console.error('Unknown marker type from database');
					break;
			} //End switch (data.val().type)
		});
			
		//listen for changes in votes in order to update a poll's results
		var pollVotesRef = db.ref('Maps/public/' + mapID + '/polls');
		pollVotesRef.once('value', function(data) {
			for (var pollKey in data.val()) {
				var voteRef = db.ref('Maps/public/' + mapID + '/polls/' + pollKey + '/votes');
				voteRef.on('child_added', function(data) {
					//data.ref.parent.ref.parent.key is the key to the poll that contains the specific voteRef
					//For some reason using pollKey didn't work, it would just be the last pollKey in the loop for all of the event listeners
					var parentPollKey = data.ref.parent.ref.parent.key;
										 
					pollPinDisplayVotes(parentPollKey);

					var userVoteRef = db.ref('Maps/public/' + mapID + '/polls/' + parentPollKey + '/votes/' + data.key);
					userVoteRef.on('value', function(data) {
						pollPinDisplayVotes(data.ref.parent.ref.parent.key);
					});
				 });
			} //End for (var key in data.val())
		});
		
		var legend = document.getElementById('legend');
		map.controls[google.maps.ControlPosition.LEFT_TOP].push(legend);
	});
}

/*****************************************************
 * General Functions
 *****************************************************/

function correctPinSize(pin){
	pin.each(function () {
		if (this.scrollHeight > 48) {
			this.setAttribute('style', 'height:' + (this.scrollHeight) + 'px;overflow-y:hidden;');
		} //End if (this.scrollHeight > 48)
		else {
			this.setAttribute('style', 'height:48px; overflow-y:hidden;');
		} //End else
	}).on('input', function () {
		this.style.height = 'auto';
		this.style.height = (this.scrollHeight) + 'px';
	});
}

function selectPin(selectedPin) {
    currentPinSelection = selectedPin;
}

function unsetPin(){
	currentPinSelection = 'none';
	
	$('.pin').removeClass('selected');
	$('#noMarker').addClass('selected');
}

function sizeMap(){
	$('#map').height($('#content').height() - $('#editFinish').height());
}
/*****************************************************
 * Text Pin Functions
 *****************************************************/

function initTextPinWindow(user, userText) {
	var contentString = 
	'<div id="content">' +
		'<div id="siteNotice"></div>' +
		'<h6 id="" class="firstHeading">' +
			'<b>' + user + ':' + '</b>' +
		'</h6>' +
		'<div id="bodyContent" class="textPinContent">' +
			'<p>' + userText + '</p>' +
		'</div>' +
	'</div>';
	
	var textInfoWindow = new google.maps.InfoWindow({
		content: contentString
	});
	
	return textInfoWindow;
} //End function initTextPinWindow(user, userText)

function newTextPin(lat, lng) {
	correctPinSize($('#text-pin-dialog-textarea'));
	
	$('#text-pin-dialog').dialog({
		autoOpen: false,
		modal: true,
		draggable: false,
		buttons: {
			Post: function() {
				console.log("Attempting to create a new text pin.");
				console.log('lat: ' + lat + ' lng: ' + lng);
				mapRef.child('pins').push().set({
					lat: lat,
					'long': lng,
					user: firebase.auth().currentUser.uid,
					text: $('#text-pin-dialog-textarea').val(),
					type: 'textPin'
				});
                                 
				$('#text-pin-dialog').dialog('close');
			}
		},
		close: function() {
			$('#text-pin-dialog-textarea').val('');
		}
	});
	
	$('#text-pin-dialog').dialog('open');
} //End function newTextPin(lat, lng)

/*****************************************************
 * Meeting Pin Functions
 *****************************************************/

function initMeetingPin(user, meetingText, day, month, year) {
	var contentString = 
	'<div id="content">'+
		'<div id="siteNotice"></div>'+
		'<p id="" class="firstHeading">' +
			'<b>Meeting Date:</b> ' + (month + 1).toString() + '/' + (day + 1).toString() + '/' + year +
		'</p>'+
		'<div id="bodyContent" class="textPinContent">' +
			'<p><b>Purpose:</b> ' + meetingText + '</p>' +
		'</div>' +
	'</div>';
	
	var meetingInfoWindow = new google.maps.InfoWindow({
		content: contentString
	});
	
	return meetingInfoWindow;
	
} //End function initMeetingPin(user, meetingDate, meetingText) {

function newMeetingPin(lat, lng) {
	correctPinSize($('#meeting-pin-dialog-textarea'));
    
	$('#meeting-pin-dialog').dialog({
		autoOpen: false,
		modal: true,
		draggable: false,
		buttons: {
			Post: function() {
				//Check for a valid date, ie. needs to be in the future, not the past
				var date = $("#meetingPinDatePicker").datepicker('getDate');
				var today = new Date();
                                    
				if (date != null) {
					if (date.getDate() >= today.getDate() && date.getMonth() >= today.getMonth() && date.getFullYear() >= today.getFullYear()){
						mapRef.child('pins').push().set({
							lat: lat,
							'long': lng,
							day: date.getDate(),
							month: date.getMonth(),
							year: date.getFullYear(),
							meetingText: $('#meeting-pin-dialog-textarea').val(),
							type: 'meetingPin'
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

/*****************************************************
 * Poll Pin Functions
 *****************************************************/

function initPollPin(pollID, myLatLng, map, pinIcon, pollInfoWindows, markerID) {
    var pollName = '';
	
    pollRef = db.ref('Maps/public/' + mapID + '/polls/' + pollID);
    
    var contentString = '';
    
    return pollRef.once('value', function(data) {
		pollName = data.val().pollName;
			contentString =
			'<div id="poll-infoWindow-' + pollID + '">'+
				'<div id="siteNotice"></div>'+
				'<h6 id="" class="firstHeading">' +
					'<b>' + pollName + ':' + '</b>' +
				'</h6>'+
				'<div id="bodyContent" class="pollPinContent">';
		}).then(function() {
			pollOptionsRef = db.ref('Maps/public/' + mapID + '/polls/' + pollID + '/options/');
			
			pollOptionsRef.once("value", function(data) {
				contentString +=
					'<legend>Options</legend>' +
					'<fieldset>';
                                                    
					var i = 1;
					for (var key in data.val()) {
						var radioGroupName = pollName.split(' ').join('-') + '-' + 'radio';
						var optionID = radioGroupName + '-' + i;
                                                    
						contentString +=
						'<label for="' + key + '">' + data.val()[key].pollOption +
							'<input type="radio" name="' + ''/*radioGroupName*/ + '" id="' + key + '" class="poll-pin-option" onclick="pollPinUserMadeChoice(\'' + pollID + '\',\'' + key + '\')">' +
						'</label>' +
						'<label id="votes-' + key + '" class="votes-label ' + pollID  +'" for=""> Votes: ' + '' + '0</label>' +
						'<br>';
                                                    
						i++;
					} //End for (var key in data.val())
                                                    
                                                    contentString +=
                                                    '</fieldset>' +
                                                    '<br>' +
                                                    '<div id="" class="poll-marker-display-buttons">' +
                                                    '<button id="show-' + pollID +'" name="" class="poll-show-markers ui-button ui-widget rounded-corners" type="button" onclick="pollPinShowOtherMarkers(\'' + pollID + '\')">' +
                                                    'Show Poll Markers' +
                                                    '</button>' +
                                                    '<button id="hide-' + pollID +'" name="" class="poll-show-markers ui-button ui-widget rounded-corners" type="button" onclick="pollPinHideOtherMarkers(\'' + pollID +'\')">' +
                                                    'Hide Poll Markers' +
                                                    '</button>' +
                                                    '</div>' +
                                                    '</div>' +
                                                    '</div>';
                                                    }).then(function() {
                                                            var maxWidth = 325;
                                                            var marker = new google.maps.Marker({
                                                                                                position: myLatLng,
                                                                                                map: map,
                                                                                                title: 'pollPin',
                                                                                                icon: pinIcon,
                                                                                                "pollID": pollID,
                                                                                                "pinID": markerID
                                                                                                });
                                                            
                                                            //Add the new poll if it does not already exist to the list
                                                            if (!pollInfoWindows.some(function(poll) {return poll.pollID == pollID})) {
                                                            var temp = new google.maps.InfoWindow({
                                                                                                  content: ''
                                                                                                  });
                                                            
                                                            pollInfoWindows.push({
                                                                                 "pollID": pollID,
                                                                                 "infoWindow": temp,
                                                                                 "infoWindowContent": contentString
                                                                                 })
                                                            } //End if (!pollInfoWindows.some(function(poll) {return poll.pollID == pollID}))
                                                            else {
                                                            var poll = pollInfoWindows.find(function(data) { return data.pollID == pollID});
                                                            poll.infoWindowContent = contentString;
                                                            } //End else
                                                            
                                                            marker.addListener('click', function() {
                                                                               var poll = pollInfoWindows.find(function(data) { return data.pollID == pollID});
                                                                               poll.infoWindow.close();
                                                                               poll.infoWindow.setContent(poll.infoWindowContent);
                                                                               poll.infoWindow.setOptions({maxWidth:maxWidth});
                                                                               poll.infoWindow.open(map, marker);
                                                                               
                                                                               //$('#poll-infoWindow-' + pollName.split(' ').join('-')).css('width', '200px');
                                                                               
                                                                               $('#show-' + pollID).attr('name', marker.pinID);
                                                                               
                                                                               $('#show-' + pollID).show();
                                                                               $('#hide-' + pollID).hide();
                                                                               
                                                                               $( ".poll-pin-option" ).checkboxradio({
                                                                                                                     icon: false
                                                                                                                     });
                                                                               
                                                                               pollPinDisplayUserChoice(pollID, pollInfoWindows);
                                                                               pollPinDisplayVotes(pollID);
                                                                               });
                                                            });
                                });
} //End function initPollPin(pollID, myLatLng, map, pinIcon, pollInfoWindows)

function newPollPin(lat, lng) {
    correctPinSize($('#poll-pin-dialog-textarea'));
    
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
    var pinRef = mapRef.child('pins').push();
    var pollRef;
    
    if ($('#poll-new-poll').is(':visible')) {
        pollRef = db.ref('Maps/public/' + mapID + '/polls').push();
        pollRef.set({
                    "pollName": $('#poll-pin-dialog-textarea').val()
                    });
        
        $('ul#poll-new-choices > li > input.poll-option-input').each(function() {
                                                                     db.ref('Maps/public/' + mapID + '/polls/' + pollRef.key + '/options/').push().set({
                                                                                                                                              "pollOption": this.value
                                                                                                                                              });
                                                                     });
    } //End if ($('#poll-new-poll').is(':visible'))
    else if ($('#poll-add-to-poll').is(':visible')) {
        var id = $('ul#poll-list > li > button#' + $('#poll-pin-dialog').dialog('option', 'title').split(' ').join('-')).attr('name');
        
        pollRef = db.ref('Maps/public/' + mapID + '/polls/' + id);
        
        $('ul#poll-add-choices > li > input.poll-option-input').each(function() {
                                                                     optionRef = db.ref('Maps/public/' + mapID + '/polls/' + pollRef.key + '/options/').push();
                                                                     optionRef.set({
                                                                                   "pollOption": this.value
                                                                                   });
                                                                     
                                                                     optionRef.on('child_added', function(data) {
                                                                                  $('div#poll-infoWindow-' + pollRef.key + ' > div.pollPinContent > fieldset').append(
                                                                                                                                                                      '<label for="' + optionRef.key + '">' + data.val() +
                                                                                                                                                                      '<input type="radio" name="' + ''/*radioGroupName*/ + '" id="' + optionRef.key + '" class="poll-pin-option" onclick="pollPinUserMadeChoice(\'' + pollRef.key + '\',\'' + optionRef.key + '\')">' +
                                                                                                                                                                      '</label>' +
                                                                                                                                                                      '<label id="votes-' + optionRef.key + '" class="votes-label ' + pollRef.key  +'" for=""> Votes: ' + '' + '0</label>' +
                                                                                                                                                                      '<br>'
                                                                                                                                                                      );
                                                                                  
                                                                                  $( ".poll-pin-option:visible" ).checkboxradio({
                                                                                                                                icon: false
                                                                                                                                });
                                                                                  });
                                                                     });
    } //End else if ($('#poll-add-to-poll').is(':visible'))
    
    pinRef.set({
               "lat": parseFloat($('#poll-pin-lat').val()),
               "long": parseFloat($('#poll-pin-lng').val()),
               "pollID": pollRef.key,
               "type":"pollPin"
               });
    
    db.ref('Maps/public/' + mapID + '/polls/' + pollRef.key + '/associatedPins/').push().set({
                                                                                    "pinID": pinRef.key
                                                                                    });
    
    var voteRef = db.ref('Maps/public/' + mapID + '/polls/' + pollRef.key + '/votes');
    voteRef.on('child_added', function(data) {
               var parentPollKey = data.ref.parent.ref.parent.key;
               
               pollPinDisplayVotes(parentPollKey)
               
               var userVoteRef = db.ref('Maps/public/' + mapID + '/polls/' + parentPollKey + '/votes/' + data.key);
               userVoteRef.on('value', function(data) {
                              pollPinDisplayVotes(data.ref.parent.ref.parent.key);
                              });
               });
    
    $('#poll-pin-dialog').dialog('close');
} //End function addPollPinToFirebase()

function addNewPollChoice(choice) {
    var contentString =
    '<li>' +
    '<input id="" class="poll-option-input" maxlength="20" type="text" name="" value="">' +
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

function pollPinShowOtherMarkers(pollID) {
    pollPinHideOtherMarkers(pollID);
    
    $('#show-' + pollID).hide();
    $('#hide-' + pollID).show();
    
    var markerID = $('#show-' + pollID).attr('name')
    
    var pollRef = db.ref('Maps/public/' + mapID + '/polls/' + pollID + '/associatedPins');
    
    pollRef.once('value', function(data) {
                 var originMarkerRef = mapRef.child('pins').child(markerID);
                 originMarkerRef.once('value', function(originMarker) {
                                      for (var key in data.val()) {
                                      if (data.val()[key].pinID != markerID)
                                      {
                                      var pinRef = mapRef.child('pins').child(data.val()[key].pinID);
                                      
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
} //End function pollPinShowOtherMarkers(pollID, markerID)

function pollPinHideOtherMarkers(pollID) {
	$('#show-' + pollID).show();
	$('#hide-' + pollID).hide();
	
	pollPolylines.forEach(function(poll) {
		if (poll.pollID == pollID) {
			poll.polyline.setMap(null);
		} //End if (poll.pollID == pollID)
	});
    
    pollPolylines = pollPolylines.filter(poll => poll.pollID != pollID);
} //End function pollPinHideOtherMarkers(pollID)

//*
function pollPinDisplayVotes(pollID) {
    var user = firebase.auth().currentUser;
    if (user) {
        var pollVoteRef = db.ref('Maps/public/' + mapID + '/polls/' + pollID + '/votes');
        
		pollVoteRef.once('value', function(data) {
			var votes = [];
			var voteFilter = function(vote) { 
				return vote.choice == data.val()[key].choice 
			};
			
			for (var key in data.val()) {
				if (votes.some(voteFilter)) {
					votes.find(voteFilter).voteCount += 1;
				} //End
				else {
					votes.push({
						voteCount: 1,
						choice: data.val()[key].choice
					});
				} //End else
			} //End for (var key in data.val())
                         
			$('label.votes-label.' + pollID +':visible').text(' Votes: 0');
                         
			votes.forEach(function(data) {
				$('#votes-' + data.choice).text(' Votes: ' + data.voteCount);
			});
		});
		
        $('#poll-infoWindow-' + pollID + ' > div#bodyContent > fieldset > label > input').prop('checked', false).change();
        $('#poll-infoWindow-' + pollID + ' > div#bodyContent > fieldset > label > input#' + optionID).prop('checked', true).change();
    } //End if (user)
    else {
        console.log('No user')
    } //End else
} //End
//*/

function pollPinUserMadeChoice(pollID, optionID) {
    var user = firebase.auth().currentUser;
    if (user) {
        var pollVoteRef = db.ref('Maps/public/' + mapID + '/polls/' + pollID + '/votes');
        
		pollVoteRef.once('value', function(data) {
			var userAlreadyVoted = false;
			
			for (var key in data.val()) {
				if (data.val()[key].user == user.uid) {
					db.ref('Maps/public/' + mapID + '/polls/' + pollID + '/votes/' + key).set({
						user: user.uid,
						choice: optionID
					}).then(function() {
						pollPinDisplayVotes(pollID);
					});
						 
					userAlreadyVoted = true;
				} //End if (data.val()[key].user == user)
			} //End for (var key in data.val())
							 
			if (!userAlreadyVoted) {
				var pollUserVoteRef = db.ref('Maps/public/' + mapID + '/polls/' + pollID + '/votes').push();
				pollUserVoteRef.set({
					"user": user.uid,
					"choice": optionID
				}).then(function() {
					pollPinDisplayVotes(pollID);
				});
			} //End if (!userAlreadyVoted)
		});
        
        $('#poll-infoWindow-' + pollID + ' > div#bodyContent > fieldset > label > input').prop('checked', false).change();
        $('#poll-infoWindow-' + pollID + ' > div#bodyContent > fieldset > label > input#' + optionID).prop('checked', true).change();
    } //End if (user)
    else {
        console.log('No user')
    } //End else
} //End function pollPinUserMadeChoice(pollID, optionID)

function pollPinDisplayUserChoice(pollID) {
    var user = firebase.auth().currentUser;
    if (user) {
        var pollVoteRef = db.ref('Maps/public/' + mapID + '/polls/' + pollID + '/votes');
        
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
    var pollList = $('#poll-list');
    
    if (pollList.children().length == 0) {
        pollRef = db.ref('Maps/public/' + mapID + '/polls/');
        
        pollRef.once("value", function(data) {
                     for (var key in data.val()) {
                     var pollName = data.val()[key].pollName.split(' ').join('-');
                     
                     pollList.append(
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
        console.error('pollStartingChoice(choice = ' + choice + '): How did this happen?');
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
	if(tempLineCoord && tempLineCoord.length > 0){
		mapRef.child('pins').push().set({
			latLongs: tempLineCoord,
			type: 'linePin'
		});
	}
	
	clearTempLineShape();
	exitEdit();
}

function writeShape() {
	if(tempShapeCoord && tempShapeCoord.length > 0){
		mapRef.child('pins').push().set({
			latLongs: tempShapeCoord,
			type: 'shapePin'
		});
	}
	
	clearTempLineShape();
	exitEdit();
}

function clearTempLineShape(){
	tempLineCoord = [];
	tempShapeCoord = [];
	
	if(tempLine){
		tempLine.setMap(null);
		tempLine = null;
	}
	
	if(tempShape){
		tempShape.setMap(null);
		tempShape = null;
	}
}

function exitEdit(){
	map.setOptions({draggableCursor: '', draggingCursor: ''});
		
	$('#content').removeClass('editing', function(){
		sizeMap();
	});
}