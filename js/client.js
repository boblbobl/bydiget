$(function() {
	var $loader	= $('#st_loading'); 
	var $list	= $('#st_nav');
	var $currImage = $('#st_main').children('img:first');

	function buildThumbs(){
		$list.children('li.album').each(function(){
			var $elem = $(this);
			var $thumbs_wrapper = $elem.find('.st_thumbs_wrapper');
			var $thumbs = $thumbs_wrapper.children(':first');
			//each thumb has 180px and we add 3 of margin
			var finalW = $thumbs.find('img').length * 183;
			$thumbs.css('width',finalW + 'px');
			//make this element scrollable
			makeScrollable($thumbs_wrapper, $thumbs);
		});
	}
	
	//clicking on the menu items (up and down arrow)
	//makes the thumbs div appear, and hides the current 
	//opened menu (if any)
	$list.find('.st_arrow_down').live('click',function(){
		var $this = $(this);
		hideThumbs();
		$this.addClass('st_arrow_up').removeClass('st_arrow_down');
		var $elem = $this.closest('li');
		$elem.addClass('current').animate({'height':'170px'},200);
		var $thumbs_wrapper = $this.parent().next();
		$thumbs_wrapper.show(200);
	});
	$list.find('.st_arrow_up').live('click',function(){
		var $this = $(this);
		$this.addClass('st_arrow_down').removeClass('st_arrow_up');
		hideThumbs();
	});
	
	//function to hide the current opened menu
	function hideThumbs(){
		$list.find('li.current')
			 .animate({'height':'50px'},400,function(){
				$(this).removeClass('current');
			 })
			 .find('.st_thumbs_wrapper')
			 .hide(200)
			 .andSelf()
			 .find('.st_link span')
			 .addClass('st_arrow_down')
			 .removeClass('st_arrow_up');
	}

	//makes the thumbs div scrollable
	//on mouse move the div scrolls automatically
	function makeScrollable($outer, $inner){
		var extra = 0;
		//Get menu width
		var divWidth = $outer.width();
		//Remove scrollbars
		$outer.css({
			overflow: 'hidden'
		});
		//Find last image in container
		var lastElem = $inner.find('img:last');
		$outer.scrollLeft(0);
		//When user move mouse over menu
		$outer.unbind('mousemove').bind('mousemove',function(e){
			var containerWidth = lastElem[0].offsetLeft + lastElem.outerWidth() + 2*extra;
			var left = (e.pageX - $outer.offset().left) * (containerWidth-divWidth) / divWidth - extra;
			$outer.scrollLeft(left);
		});
	}
	
	
	//load images from flickr
  
  var apiKey = '5b021b40f8e60580ef0646fd89fc4caa';
  var userId = '76927994@N08';
  var perPage = '18';
  
  var url = 'http://api.flickr.com/services/rest/?format=json&method=flickr.photosets.getList&api_key=' + apiKey + '&user_id=' + userId + '&jsoncallback=?';
  
  $.getJSON(url, function(data) {
    
    $.each(data.photosets.photoset, function(i, item) {
      $("#st_nav").append('<li class="album"><span class="st_link">' + item.title._content + '<span class="st_arrow_down"></span></span><div class="st_wrapper st_thumbs_wrapper"><div id="' + item.id + '" class="st_thumbs"></div></div></li>');
      
      
      var photos_url = 'http://api.flickr.com/services/rest/?format=json&method=flickr.photosets.getPhotos&api_key=' + apiKey + '&photoset_id=' + item.id + '&jsoncallback=?';

      $.getJSON(photos_url, function(data) {

        $.each(data.photoset.photo, function(j, photo){
          var baseUrl = 'http://farm' + item.farm + '.static.flickr.com/' + photo.server + '/' + photo.id + '_' + photo.secret;
          var smallPhotoURL = baseUrl + '_s.jpg';
          var thumbPhotoURL = baseUrl + '_t.jpg';
          var mediumPhotoURL = baseUrl + '_m.jpg';
          var largePhotoURL = baseUrl + '_b.jpg';

          if ((i == 0) && (j == 0)) {
            $currImage.attr('src', largePhotoURL);
          }

          $('#' + item.id).append('<img src="' + smallPhotoURL + '" alt="' + largePhotoURL + '" />');
        });
        
        //clicking on a thumb, replaces the large image
  			$('#' + item.id + ' img').bind('click',function(){
  				var $this = $(this);
  				$loader.show();
  				$('<img class="st_preview"/>').load(function(){
  					var $this = $(this);
  					var $currImage = $('#st_main').children('img:first');
  					$this.insertBefore($currImage);
  					$loader.hide();
  					$currImage.fadeOut(2000,function(){
  						$(this).remove();
  					});
  				}).attr('src',$this.attr('alt'));
  			}).bind('mouseenter',function(){
  				$(this).stop().animate({'opacity':'1'});
  			}).bind('mouseleave',function(){
  				$(this).stop().animate({'opacity':'0.7'});
  			});

      });
      
    });
    
    //calculates the width of the div element 
		//where the thumbs are going to be displayed
		
		//buildThumbs();

		//show current image
		$currImage.load(function() {
		  $currImage.fadeIn(3000);
		});

		//slide out the menu
		setTimeout(function(){
			$list.animate({'left':'0px'}, 500);
		}, 500);

		//remove loader
		$loader.hide();
		
  });
  
});