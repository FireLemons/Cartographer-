if(typeof jQuery === 'undefined' && typeof firebase === 'undefined'){
	document.getElementById('noInet').removeAttribute('hidden');
}

$(function(){
	$(".button-collapse").sideNav();
});