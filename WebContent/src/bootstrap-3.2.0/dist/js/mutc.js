/* Time between background changes (in milliseconds) */
var timeoutBetweenBGChange = 5000;

/* List of changing backgrounds */
var backgrounds = [
  'url(\'http://xavier.w.caron.free.fr/mutcwebsiteproject/img/Background.jpg\')', 
  'url(\'http://xavier.w.caron.free.fr/mutcwebsiteproject/img/Background2.jpg\')', 
  'url(\'http://xavier.w.caron.free.fr/mutcwebsiteproject/img/Background3.jpg\')'];

/* Current displayed background index */
var current = 0;

/* Loaded when the page is displayed */
$(function(){
	/* Change background */
	nextBackground();
	
	/* Load header content */
    $("#header").load("header.html");	

	/* Load footer content */
    $("#footer").load("footer.html", function() {
		/* Twitter links related */
		window.twttr = (function (d, s, id) {
			  var t, js, fjs = d.getElementsByTagName(s)[0];
			  if (d.getElementById(id)) return;
			  js = d.createElement(s); js.id = id;
			  js.src= "https://platform.twitter.com/widgets.js";
			  fjs.parentNode.insertBefore(js, fjs);
			  return window.twttr || (t = { _e: [], ready: function (f) { t._e.push(f) } });
		}(document, "script", "twitter-wjs"));
		
		/* Facebook links related */
		(function(d, s, id){
			 var js, fjs = d.getElementsByTagName(s)[0];
			 if (d.getElementById(id)) {return;}
			 js = d.createElement(s); js.id = id;
			 js.src = "//connect.facebook.net/en_US/sdk.js";
			 fjs.parentNode.insertBefore(js, fjs);
		}(document, 'script', 'facebook-jssdk'));
		
		/* When footer has loaded, display FB like banner */
		displayFBLikeButton();
		
		/* When all page content has loaded, add current year to needed places */
		displayCurrentYear();
	}); 
});

/* Function to adjust the size of the displayed Facebook like button depending on screen size */
function displayFBLikeButton(){
	var smallFBLike = '<div class="fb-like" data-href="http://www.facebook.com/melbourneunitennis" data-layout="standard" data-action="like" data-show-faces="true" data-share="false" width="225px"></div>';

	var bigFBLike = '<div class="fb-like" data-href="http://www.facebook.com/melbourneunitennis" data-layout="standard" data-action="like" data-show-faces="true" data-share="false"></div>';
	
	var width = $(window).width();
	if(width >= 768){
		$('#fb-btn').append(bigFBLike);
	} else{
		$('#fb-btn').append(smallFBLike);
	}
}

/* Function to display the current year on some parts of the page */
function displayCurrentYear(){
	var currYear = new Date().getFullYear();
	var elements = document.getElementsByClassName('currDate');
	for(var i=0; i<elements.length; i++){
		elements[i].innerHTML = currYear;
	}
}

/* Function to get a cleaned Facebook date according to offset */
function getCleanedFBDate(FBdate){
	var iniDate = FBdate;
	iniDate = iniDate.split('+');
	var date = new Date(iniDate[0]);
	var dateOffset = new Date(date.getTime() + (date.getTimezoneOffset() * 60000));
	return dateOffset;
}

/* Function to display Facebook MUTC page events */
function displayEvents(response){
	var upcoming_events = '';
	var past_events = '';
	
	var countFuture = 0;
	var countPast = 0;
	
	past_events += '<div class="row">';
	upcoming_events += '<div class="row">';
	
	var noUpcomingEvent = '<p>Nothing decided yet, but keep an eye on this section!</p>';
	var hasUpcomingEvent = false;
	
	for(var i=0; i<response.data.length; i++){
		var date = getCleanedFBDate(response.data[i].start_time);
		var hours = date.getHours()<10?'0'+date.getHours():date.getHours();
		var min = date.getMinutes()<10?'0'+date.getMinutes():date.getMinutes();
		var dateProper = $.datepicker.formatDate('DD, d MM, yy', date)+' @ '+hours+':'+min;
		var location = 'TBA';
		if(response.data[i].location != undefined){
			location = response.data[i].location;
		}
		
		if(date.getTime() > new Date().getTime()){
			hasUpcomingEvent = true;
			// Future event
			if(countFuture%2==0 && countFuture!=0){
				upcoming_events += '</div><div class="row">';
			}
			upcoming_events += '<div class="col-md-6"><div class="shadow padding15 bg-grey margin5"><h2>'+response.data[i].name+'</h2><p><b>When? </b>'+dateProper+'</p><p><b>Where? </b>'+location+'</p><p><a href="https://www.facebook.com/events/'+response.data[i].id+'" target=_blank><button type="button" class="btn btn-primary">More Info</button></a></p></div></div>';
			countFuture++;
		} else{
			if(countPast%3==0 && countPast!=0){
				past_events += '</div><div class="row">';
			}
			past_events += '<div class="col-md-4"><div class="shadow padding15 bg-grey margin5"><h2>'+response.data[i].name+'</h2><p><b>When? </b>'+dateProper+'</p><p><b>Where? </b>'+location+'</p><p><a href="https://www.facebook.com/events/'+response.data[i].id+'" target=_blank><button type="button" class="btn btn-primary">More Info</button></a></p></div></div>';
			countPast++;
		}
	}
	past_events += '</div>';
	upcoming_events += '</div>';
	
	if(document.getElementById('event_div') != null){
		document.getElementById('event_div').innerHTML = past_events;
	}
	if(hasUpcomingEvent){
		document.getElementById('up_event_div').innerHTML = upcoming_events;
	} else{
		document.getElementById('up_event_div').innerHTML = noUpcomingEvent;
	}
}

/* Function to display Facebook MUTC page messages feed */
function displayFeed(response){
	var feed_content = '';
	var count = 0;
	feed_content += '<div class="row">';
	
	for(var i=0; i<response.data.length; i++){
		if(response.data[i].message != undefined){
			var date = getCleanedFBDate(response.data[i].created_time);
			var dateProper = $.datepicker.formatDate('DD, d MM, yy', date);
			var title = 'News';
			var picture = response.data[i].picture;
			var pictureContent = '';
			if(picture != undefined){
				pictureContent = '<hr><p><img class="img-thumbnail img-responsive" src="'+picture+'" style="display:block;margin-left: auto;margin-right: auto;"></p>';
			}
			var likes = '';
			if(response.data[i].likes != undefined){
				likes = '<p style="text-align:right;"><span class="glyphicon glyphicon-thumbs-up"></span> <span class="badge">'+response.data[i].likes.data.length+'</span></p>';
			}
			var properMessage = cleanMessageWithLink(response.data[i].message);
			if(response.data[i].name != undefined){
				title = response.data[i].name;
			}
			var size = '<div class="col-md-4">';
			if(properMessage.length > 500){
				size = '<div class="col-md-8">';
			}
			if(count == 0){
				size = '<div class="col-md-12">';
			}
			feed_content += size+'<div class="shadow padding15 bg-grey margin5"><h2>'+title+'</h2><p><b>'+dateProper+'</b></p><p>'+properMessage+'</p>'+likes+pictureContent+'</div></div>';
			count++;
		}
	}
	feed_content += '</div>';
	
	document.getElementById('feed_div').innerHTML = feed_content;
}

/* Function to clean a Facebook post message and replace text link with a button */
function cleanMessageWithLink(message){
	var str = message;
	
	//(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$
	var patt = new RegExp("(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]?(:[0-9]?)?(\/.*)?($|\s|\n)");
	var res = patt.exec(str);
	
	if(res != null){
		res[0] = replaceAll(res[0], "\n", "");
		
		/*
		// Tests here:
		str = str.replace(res[0], 'https://www.youtube.com/watch?v=9yk2CDPhdMU');
		res[0] = 'https://www.youtube.com/watch?v=9yk2CDPhdMU';
		*/
		
		var youtubeEmbeded = '';
		if(res[0].indexOf("youtube") > -1){
			var videoLink = res[0].split('v=')[1];
			youtubeEmbeded = '<br><div class="video-container"><iframe width="800" height="450" src="http://www.youtube.com/embed/'+videoLink+'?controls=0&amp;showinfo=0" frameborder="0" allowfullscreen></iframe></div><br>';
		}
		
		if(youtubeEmbeded != ''){
			str = str.replace(res[0], youtubeEmbeded);
		} else{
			str = str.replace(res[0], '<br><a href="'+res[0]+'" target=_blank><button type="button" class="btn btn-primary"><span class="glyphicon glyphicon-link"></span> Link</button></a><br>');
		}
	}
	
	str = replaceAll(str, "\n", "<br>");
	str = replaceAll(str, "--", "");
	
	return str;
}

var albumCount = 0;

/* Function to display album contents */
function displayAlbums(response){
	var album_content = '';
	
	for(var i=0; i<response.data.length; i++){
		var name = response.data[i].name;
		if(name != 'Profile Pictures' && name != 'Cover Photos' && name != 'Timeline Photos' && name != 'Mobile Uploads'){
			var date = getCleanedFBDate(response.data[i].updated_time);
			var dateProper = $.datepicker.formatDate('DD, d MM, yy', date);
			var albumLink = response.data[i].link;
			var albumId = response.data[i].id;
			
			displayOneAlbum(dateProper, name, albumId, albumLink);
		}
	}
}

/* Function to get info on one album and display it */
function displayOneAlbum(date, name, albumId, albumLink){
	FB.api(
		"/"+albumId+"/picture?access_token=1491362084470419|-0883jiZIdvd2IrPMZ4Cb-Gbnb8",
		function (resp) {
		  if (resp && !resp.error) {
			var displayContent = '';
			var size = '<div class="col-md-4">';
			
			var img = '<div class="img-thumbnail album-img" style="background-image: url('+resp.data.url+')"></div>';
			
			/*displayContent += '<a href="'+albumLink+'" target="_blank">'+size+'<div class="shadow padding15 bg-grey margin5"><div class="thumbnail">'+img+'<div class="caption"><h2>'+name+'</h2><p><b>'+date+'</b></p></div></div></div></div></a>';*/
			
			displayContent += '<a href="'+albumLink+'" target="_blank">'+size+'<div class="thumbnail padding15 bg-grey margin5">'+img+'<div class="caption"><h2>'+name+'</h2><p><b>'+date+'</b></p></div></div></div></a>';
			
			$('#album_div').append(displayContent);
			albumCount++;
		  }
		}
	);
}

/* Function to display the next background header */
function nextBackground() {
	var bg = $('#content');
	bg.animate({ opacity: 1 }, 700,function(){
		//finished animating, minifade out and fade new back in           
		bg.animate({ opacity: 0.7 }, 300,function(){
			//swap out bg src                
			bg.css('background-image', backgrounds[current]);
			current = ++current % backgrounds.length;
			//animate fully back in
			bg.animate({ opacity: 1 }, 500,function(){
				//set timer for next
				setTimeout(nextBackground, timeoutBetweenBGChange);
			});
		});
	});
}

/* Function to replace all occurrences of a string in a given string */
function replaceAll(str, search, replacement){
	str = str.split(search).join(replacement);
	return str;
}