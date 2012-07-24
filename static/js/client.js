$(function() {
  /**
	* navR,navL are flags for controlling the albums navigation
	* first gives us the position of the album on the left
	* positions are the left positions for each of the 5 albums displayed at a time
	*/
  var navR,navL	= false;
	var first		= 1;
	var positions 	= {
		'0'		: 0,
		'1' 	: 170,
		'2' 	: 340,
		'3' 	: 510,
		'4' 	: 680,
	}
	
	var $ps_albums = $('#ps_albums');
	var $ps_container = $('#ps_container');
	var $ps_overlay = $('#ps_overlay');
	var $ps_close	= $('#ps_close');
	var $ps_slider = $('#ps_slider');
	
	/**
	* number of albums available
	*/
	var elems	= 0;
	
	
	/**
	* let's position all the albums on the right side of the window
	*/
	var hiddenRight 	= $(window).width() - $ps_albums.offset().left;
	$ps_albums.children('div').css('left', hiddenRight + 'px');
  
  
	//load images from flickr
  var apiKey = '5b021b40f8e60580ef0646fd89fc4caa';
  var userId = '76927994@N08';
  var perPage = '18';
  var baseUrl = "";
  
  var url = 'http://api.flickr.com/services/rest/?format=json&method=flickr.photosets.getList&api_key=' + apiKey + '&user_id=' + userId + '&jsoncallback=?';
  
  $.getJSON(url, function(data) {

    $.each(data.photosets.photoset, function(i, item) {
      if (i == 0)
        baseUrl = 'http://farm' + item.farm + '.static.flickr.com/';
      
      
      var album = $('<div id="' + item.id + '" class="ps_album" style="opacity:0;"><img /><div class="ps_desc"><h2>' + item.title._content + '</h2><span>' + item.description._content + '</span></div></div>');
      $("#ps_albums").append(album);
      
      if (i < 5)
        album.animate({'left': positions[i] + 'px','opacity':1}, 800);
      else
        album.css({'left': hiddenRight + 'px'});
      
      var photos_url = 'http://api.flickr.com/services/rest/?format=json&method=flickr.photosets.getPhotos&api_key=' + apiKey + '&photoset_id=' + item.id + '&jsoncallback=?';
      
      //Get first photo in photoset as thumbnail
      $.getJSON(photos_url, function(data) {
        var photo = data.photoset.photo[0];
        $('div#' + item.id + ' img').attr('src', baseUrl + photo.server + '/' + photo.id + '_' + photo.secret + '_s.jpg');
      })
      
    });
    
    elems = data.photosets.photoset.length;
    
    if (elems > 5)
      enableNavRight();
      
    /**
  	* when we click on an album,
  	* we load with AJAX the list of pictures for that album.
  	* we randomly rotate them except the last one, which is
  	* the one the User sees first. We also resize and center each image.
  	*/
  	$ps_albums.children('div').bind('click',function(){
  	  

  		var $elem = $(this);
  		
  		var album_name 	= 'album' + parseInt($elem.index() + 1);
  		var $loading 	= $('<div />',{className:'loading'});
  		$elem.append($loading);
  		$ps_container.find('img').remove();
  		
  		
  		var photos_url = 'http://api.flickr.com/services/rest/?format=json&method=flickr.photosets.getPhotos&api_key=' + apiKey + '&photoset_id=' + $elem.attr('id') + '&jsoncallback=?';
      
      //Get first photo in photoset as thumbnail
      $.getJSON(photos_url, function(data) {
        var items_count	= data.photoset.photo.length;
        
        $.each(data.photoset.photo, function(i, photo) {
          
          var smallPhotoURL = baseUrl + photo.server + '/' + photo.id + '_' + photo.secret + '_s.jpg';
          var thumbPhotoURL = baseUrl + photo.server + '/' + photo.id + '_' + photo.secret + '_t.jpg';
          var mediumPhotoURL = baseUrl + photo.server + '/' + photo.id + '_' + photo.secret + '_m.jpg';
          var largePhotoURL = baseUrl + photo.server + '/' + photo.id + '_' + photo.secret + '_b.jpg';

  				$('<img />').load(function(){
  					var $image = $(this);
  					resizeCenterImage($image);
  					$ps_container.append($image);  					
  					var r	= Math.floor(Math.random()*31)-20;
  					if(i < items_count){
  						$image.css({
  							'-moz-transform'	:'rotate('+r+'deg)',
  							'-webkit-transform'	:'rotate('+r+'deg)',
  							'transform'			:'rotate('+r+'deg)'
  						});
  					}
  					if(i == items_count-1){
  						$loading.remove();
  						$ps_container.show();
  						$ps_close.show();
  						$ps_overlay.show();
  					}
  				}).attr('src', largePhotoURL);
          
        });
      })
  	});
  });
  
  /**
	* next album
	*/
	$ps_slider.find('.next').bind('click',function(){
		if(!$ps_albums.children('div:nth-child('+parseInt(first+5)+')').length || !navR) return;
		disableNavRight();
		disableNavLeft();
		moveRight();
	});
	
	/**
	* we move the first album (the one on the left) to the left side of the window
	* the next 4 albums slide one position, and finally the next one in the list
	* slides in, to fill the space of the first one
	*/
	function moveRight () {
		var hiddenLeft 	= $ps_albums.offset().left + 163;

		var cnt = 0;
		$ps_albums.children('div:nth-child('+first+')').animate({'left': - hiddenLeft + 'px','opacity':0},500,function(){
				var $this = $(this);
				$ps_albums.children('div').slice(first,parseInt(first+4)).each(
					function(i){
						var $elem = $(this);
						$elem.animate({'left': positions[i] + 'px'},800,function(){
							++cnt;
							if(cnt == 4){
								$ps_albums.children('div:nth-child('+parseInt(first+5)+')').animate({'left': positions[cnt] + 'px','opacity':1},500,function(){
									//$this.hide();
									++first;
									if(parseInt(first + 4) < elems)
										enableNavRight();
									enableNavLeft();
								});
							}		
						});
					}
				);		
		});
	}

	/**
	* previous album
	*/
	$ps_slider.find('.prev').bind('click',function(){
		if(first==1  || !navL) return;
		disableNavRight();
		disableNavLeft();
		moveLeft();
	});

	/**
	* we move the last album (the one on the right) to the right side of the window
	* the previous 4 albums slide one position, and finally the previous one in the list
	* slides in, to fill the space of the last one
	*/
	function moveLeft () {
		var hiddenRight 	= $(window).width() - $ps_albums.offset().left;

		var cnt = 0;
		var last= first+4;
		$ps_albums.children('div:nth-child('+last+')').animate({'left': hiddenRight + 'px','opacity':0},500,function(){
				var $this = $(this);
				$ps_albums.children('div').slice(parseInt(last-5),parseInt(last-1)).each(
					function(i){
						var $elem = $(this);
						$elem.animate({'left': positions[i+1] + 'px'},800,function(){
							++cnt;
							if(cnt == 4){
								$ps_albums.children('div:nth-child('+parseInt(last-5)+')').animate({'left': positions[0] + 'px','opacity':1},500,function(){
									//$this.hide();
									--first;
									enableNavRight();
									if(first > 1)
										enableNavLeft();
								});
							}										
						});
					}
				);
		});
	}
	
	/**
	* disable or enable albums navigation
	*/
	function disableNavRight () {
		navR = false;
		$ps_slider.find('.next').addClass('disabled');
	}
	function disableNavLeft () {
		navL = false;
		$ps_slider.find('.prev').addClass('disabled');
	}
	function enableNavRight () {
		navR = true;
		$ps_slider.find('.next').removeClass('disabled');
	}
	function enableNavLeft () {
		navL = true;
		$ps_slider.find('.prev').removeClass('disabled');
	}		

	
	

	/**
	* when hovering each one of the images, 
	* we show the button to navigate through them
	*/
	$ps_container.live('mouseenter',function(){
		$('#ps_next_photo').show();
	}).live('mouseleave',function(){
		$('#ps_next_photo').hide();
	});

	/**
	* navigate through the images: 
	* the last one (the visible one) becomes the first one.
	* we also rotate 0 degrees the new visible picture 
	*/
	$('#ps_next_photo').bind('click',function(){
		var $current 	= $ps_container.find('img:last');
		var r			= Math.floor(Math.random()*41)-20;

		var currentPositions = {
			marginLeft	: $current.css('margin-left'),
			marginTop	: $current.css('margin-top')
		}
		var $new_current = $current.prev();

		$current.animate({
			'marginLeft':'250px',
			'marginTop':'-385px'
		},250,function(){
			$(this).insertBefore($ps_container.find('img:first'))
				  .animate({
						'marginLeft':currentPositions.marginLeft,
						'marginTop'	:currentPositions.marginTop
						},250);
		});
	});

	/**
	* close the images view, and go back to albums
	*/
	$('#ps_close').bind('click',function(){
		$ps_container.hide();
		$ps_close.hide();
		$ps_overlay.fadeOut(400);
	});

	/**
	* resize and center the images
	*/
	function resizeCenterImage($image){
		var theImage 	= new Image();
		theImage.src 	= $image.attr("src");
		var imgwidth 	= theImage.width;
		var imgheight 	= theImage.height;

		var containerwidth  = 460;
		var containerheight = 330;

		if(imgwidth	> containerwidth){
			var newwidth = containerwidth;
			var ratio = imgwidth / containerwidth;
			var newheight = imgheight / ratio;
			if(newheight > containerheight){
				var newnewheight = containerheight;
				var newratio = newheight/containerheight;
				var newnewwidth =newwidth/newratio;
				theImage.width = newnewwidth;
				theImage.height= newnewheight;
			}
			else{
				theImage.width = newwidth;
				theImage.height= newheight;
			}
		}
		else if(imgheight > containerheight){
			var newheight = containerheight;
			var ratio = imgheight / containerheight;
			var newwidth = imgwidth / ratio;
			if(newwidth > containerwidth){
				var newnewwidth = containerwidth;
				var newratio = newwidth/containerwidth;
				var newnewheight =newheight/newratio;
				theImage.height = newnewheight;
				theImage.width= newnewwidth;
			}
			else{
				theImage.width = newwidth;
				theImage.height= newheight;
			}
		}
		$image.css({
			'width'			:theImage.width,
			'height'		:theImage.height,
			'margin-top'	:-(theImage.height/2)-10+'px',
			'margin-left'	:-(theImage.width/2)-10+'px'	
		});
	}
	
});