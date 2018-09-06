$(function(){
	//load navBar from html file
	$('#nav').load('nav.html', function(){
		//correct map height once nav bar height can be measured
		sizeContent();
	});
	//keep map height corrected when resizing the window
	$(window).resize(sizeContent);
});

//correct height of content below nav bar
function sizeContent(){
	$('#content').height($(window).height() - $('#nav').height());
}