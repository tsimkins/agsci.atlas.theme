$j(document).ready(function () {

	/* HOME FIXED HEADER */
	$j(window).scroll(function(){
		if($j('body').hasClass('cms-home'))
			setupFixedHeader();
	});
	
	setupContentPadding();
	
	$j(window).on('scroll touchmove  touch' , function(event) { //	touchmove scrollstart gesturechange
	  var height = $j(window).scrollTop();
	  var headerOffset = $j('#header').offset().top;
	 
	  if($j('a.skip-link.skip-cart').hasClass('skip-active'))
	  {
	     if(!elements.minicart)
	         elements.headers = height;
	     elements.minicart = true;
	     $j('#header').css('position', 'absolute');
	     $j('#header').css('top', elements.headers+'px');
	  
	  }
	  if((!$j('a.skip-link.skip-cart').hasClass('skip-active') && elements.minicart) )
	  {
	     elements.minicart = false;	        
	     $j('#header').css('position', 'fixed');
	     $j('#header').css('top', 0+'px');
	  
	  }
	   
	  if(headerOffset > height && $j('a.skip-link.skip-cart').hasClass('skip-active')){
		     
		  if(headerOffset > (height+elements.treshold) )
		  {
			  $j('#header').css('position', 'fixed');
			  $j('#header').css('top', 0+'px');
			  $j('.skip-link.skip-cart').trigger('click');
		  }
		  else
		  {
			  $j('#header').css('top', height+'px');
		  }
	  }
	  
	  if($j('a.skip-link.skip-cart').hasClass('skip-active') && elements.minicart  )
	  {
		  if(!$j('.minicart-wrapper').isOnScreen(0.6, 0))
		  {	  
			  $j('#header').css('position', 'fixed');
			  $j('#header').css('top', 0+'px');
			  $j('.skip-link.skip-cart').trigger('click');
		   }
	  }

	  if($j('a.skip-link.skip-nav').hasClass('skip-active'))
	  {
	     if(!elements.navigation)
	         elements.headers = height;
	     elements.navigation = true;
	     $j('#header').css('position', 'absolute');
	     $j('#header').css('top', elements.headers+'px');
	  
	  }
	  if(!$j('a.skip-link.skip-nav').hasClass('skip-active') && elements.navigation     )
	  {
	     elements.navigation = false;
	     $j('#header').css('position', 'fixed');
	     $j('#header').css('top', 0+'px');
	  
	  }

	  if(headerOffset > height && $j('a.skip-link.skip-nav').hasClass('skip-active')){
	     
		  if(headerOffset > (height+elements.treshold) )
		  {
			  $j('#header').css('position', 'fixed');
			  $j('#header').css('top', 0+'px');
			  $j('.skip-link.skip-nav').trigger('click');
		  }
		  else
		  {
			  $j('#header').css('top', height+'px');
		  }
	  }
	  
	  if($j('a.skip-link.skip-nav').hasClass('skip-active') && elements.navigation  )
	  {
		  if(!$j('#nav').isOnScreen(0.6, 0))
		  {	  
			  $j('#header').css('position', 'fixed');
			  $j('#header').css('top', 0+'px');
			  $j('.skip-link.skip-nav').trigger('click');
		  }
	  }
	});  
	
	/* HOME TOOGLE MENU LOGIC */
	$j('body').on('click touchstart', function(event){
		   element = $j(event.target);
		   if(element.parents('.skip-link').length == 1 || element.hasClass('skip-link'))
			   return;
		   var parent = $j('.skip-content');
		   var link = $j('.skip-link');

		   if (element.parents('.skip-content').length == 0) {
			  parent.removeClass('skip-active');
			  link.removeClass('skip-active');
		   }
	});
	
	/* HOME MENU LOGIC */
	$i = 1
	$j('body a').each(function(){
		$j(this).attr('tabIndex', $i);
		$i++;
	});
	
	$j(document).on('mouseleave','.page-header .header-nav-block > div#header-nav', function(e){ 
		
		if(!$j(e.target).closest('#nav').length)
			$j('#header-nav #nav > .child').remove();
		
	});
	
	enquire.register('(min-width: ' + 1024 + 'px)', {
        match: function () {
        	$j(document).on('mouseenter touchstart','.nav-primary > li', function(e){ 	
        		customMenu($j(this));
        	});
        	
        	$j('.header-nav .child').on('hoverStart', function() {
        		$this = $j(this).closest('li');
        		customMenu($this);
        	});
        	
        	$j('.header-nav .child').on('hoverEnd', function() {
        		$j('#header-nav #nav > .child').remove();
        	});
        },
        unmatch: function () {       
        	$j('#header-nav #nav > .child').remove();
        	$j('.nav-primary > li').unbind('mouseenter mouseleave');
        }
    });
	
	
	
	
	/* HOME SEARCH LOGIC */
	$j(".page-header .header-search").toggleClick(	
			
			
			function() {
				var searchW = 330;
				if($j(window).width() < 1150){
					searchW = 250;
				}
		    	$j('#search_mini_form_fixed .input-box').show();
		    	$j('#header-search').addClass('start-opened');
		    	$j('#search_mini_form_fixed .input-box').animate({ width: searchW + 'px', left: '0'}, 1000, function(){
		    		$j('#header-search').addClass('opened');
		    			setTimeout(function(){
		    				if($j('#header-search').hasClass('opened') && !$j('#search_mini_form_fixed .input-box #search_fixed').is(":focus")) {
		    					$j(".page-header .header-search").trigger('click');
		    				}
		    					
			    		}, 2000);

		    		 
		    	});
		    },
		    function() {
		    	
		    	$j('#search_mini_form_fixed .input-box').animate({ width: '0',left: '0'}, 1000, function(){
		    		$j('#search_mini_form_fixed .input-box').hide();
		    		$j('#header-search').removeClass('opened').removeClass('start-opened');
		    	});
		    }
	    
   	 );
	
	$j("#search_fixed").on('change',function(){
		$j("#search").val($j(this).val());
	});
	$j("#search").on('change',function(){
		$j("#search_fixed").val($j(this).val());
	});
	
	/* SETUP BACKGROUND LOGIC */
	$j('.setup-bg').each(function(){
		var background_image = $j(this).find(' > img ');
		if(typeof background_image !=='undefined')
		{	
			var src = background_image.attr('src');
		    $j(this).css("background-image", "url('"+src+"')");
		    $j(this).closest('.home-slider')
		    	$j(this).find(' > img ').remove();
		}
	});
	
	/* HOME PAGE SLIDER */
	if($j('.home-slider').size() && $j('.home-slider .item').size() > 1){
		var owl = $j('.home-slider');
		owl.owlCarousel({
			nav: true, 
			slideSpeed: 300,
			paginationSpeed: 400,
			items:1,
			navText:["<strong class='fa fa-angle-left'></strong>","<strong class='fa fa-angle-right'></strong>"],
			loop:true,
			onInitialized : function(){	
				 $j('.home-slider .item').height($j(window).height());
			},
			
		});
		current = $j('.home-slider .owl-item.active').index();
		changeSearchPosition(current);
		owl.on('changed.owl.carousel',function(property){
		    current = property.item.index;
		    changeSearchPosition(current);
		    $j('.home-slider .item').height($j(window).height());
		});
		owl.on('resized.owl.carousel',function(property){
		    current = property.item.index;
		    changeSearchPosition(current);    
		    $j('.home-slider .item').height($j(window).height());
		});
		
	}
	/* IF NO SLIDER */
	setupSearchMargin();
	
	
	/* HOME FEATURED BLOCK */
	$j('.featured-products select#category-filter').selectpicker();

	/* CONTACT US */
	$j('#contactForm select#department').selectpicker().css({'display':'inline-block'});
	
	
	/* FOOTER  LOGIC */
	enquire.register('(max-width: ' + 767 + 'px)', {
        match: function () {
        	$j('.footer-container').addClass('mobile');
        },
        unmatch: function () {       
        	$j('.footer-container').removeClass('mobile');
        }
    });
	
	$j(".footer-container .item h3").toggleClick(		
			function() {
				if($j('.footer-container').hasClass('mobile')){
					$j(this).closest('.item').addClass('opened');	 
					alignFooter();
				}	 
			 },
			 function() {
				 if($j('.footer-container').hasClass('mobile')){
					 $j(this).closest('.item').removeClass('opened');
					 alignFooter();
				 }
					 
			 }
	);
});

function customMenu($this){
	$j('#header-nav #nav > .child').remove();
	if($this.hasClass('parent')){
		$nav = $this.find('nav');
		$nav_clone = $nav.clone();
		$j('#header-nav #nav').append($nav_clone);
	}	
}

function featuredNewsDots(){
	$j(".featured-news .inner .news .info .desc").dotdotdot({ellipsis	: '...', after: 'a.link-learn', callback: dotdotdotCallback});
	$j('.featured-news .inner .news .info .product-name').dotdotdot({ellipsis	: '...'});
	enquire.register('(min-width: ' + 1024 + 'px)', {
        match: function () {
        	rightBlockHeight = $j(".featured-news .inner .news-col.right").innerHeight();
        	leftBlockHeight = rightBlockHeight - $j(".featured-news .inner .news-col .title").innerHeight() - 25; 
        	if ( (navigator.appVersion.indexOf("Mac")!=-1) && (navigator.userAgent.toLowerCase().indexOf('chrome') > -1)){
        		leftBlockHeight = leftBlockHeight + 1;
        	}
        		
        	$j(".featured-news .inner .news-col.left .news").css({'min-height':leftBlockHeight+'px', 'max-height':leftBlockHeight+'px'});
        	descHeight = leftBlockHeight - $j(".featured-news .news-col.left .info .product-name").innerHeight() - 90;
        	var obj = 	$j(".featured-news .news-col.left .info .desc");
        	obj.dotdotdot({ellipsis	: '...', height: descHeight, after: 'a.link-learn'});
        },
        unmatch: function () {       
        	$j(".featured-news .news-col.left .info .desc").trigger("destroy");
        	var obj = 	$j(".featured-news .news-col.left .info .desc");
        	obj.dotdotdot({ellipsis	: '...', after: 'a.link-learn'});
        }
    });
	
}

function changeSearchPosition(current){
	
	currentEl = $j('.home-slider').find(".owl-item").eq(current).find('h2');
	searchEl = $j('.home-search');
	topPosition = currentEl.position().top + currentEl.outerHeight(true);
	searchEl.animate({
		 top: topPosition
	 	}, 500,function(){		 
	 });
	
}

function setupFixedHeader(){
	var scrollTop = $j(window).scrollTop();
	if(scrollTop > 20){
		if(!$j('.page-header').hasClass('fixed-position')){
			$j('.page-header').addClass('fixed-position');
		}
			
	}
		
	else{
		if($j('.page-header').hasClass('fixed-position')){
			$j('.page-header').removeClass('fixed-position');
			$j('.page-header').addClass('scroll-top');
			if($j('#header-search').hasClass('opened'))
				$j(".page-header .header-search").trigger('click');
		}
			
	}
		
}

function setupContentPadding(){
	var height = $j('.page-header').innerHeight();
	heightContainer = height + 25;
	$j('.main-container').css({'padding-top':heightContainer+'px'});
	$j('.home-slider .item .inner').css({'padding-top':height+'px'});
}

function setupSearchMargin(){
	if ($j('.home-slider').size() && $j('.home-slider .item').size() == 1){
		$j('.home-slider .item').height($j(window).height());
		currentEl = $j('.home-slider').find('h2');
		searchEl = $j('.home-search');
		topPosition = currentEl.position().top + currentEl.outerHeight(true);
		searchEl.animate({
			 top: topPosition
		 	}, 500,function(){		 
		 });
	}
	
}

function alignFooter(){
	var height = jQuery('.footer-container').innerHeight() - 2;
	jQuery('.empty-footer').css('height',height+'px');
}

/*clicktoggle instead of deprecated Toggle function*/
$j.fn.toggleClick = function(){

 var functions = arguments ;

 return this.click(function(){
         var iteration = $j(this).data('iteration') || 0;
         functions[iteration].apply(this, arguments);
         iteration = (iteration + 1) % functions.length ;
         $j(this).data('iteration', iteration);
 });
};

(function( func ) {
    $j.fn.addClass = function() { // replace the existing function on $.fn
        func.apply( this, arguments ); // invoke the original function
        this.trigger('classChanged'); // trigger the custom event
        return this; // retain $j chainability
    }
})($j.fn.addClass); // pass the original function as an argument

(function( func ) {
	$j.fn.removeClass = function() {
        func.apply( this, arguments );
        this.trigger('classChanged');
        return this;
    }
})($j.fn.removeClass);


/*fixed header*/
$j.fn.isOnScreen = function(x, y){
    
    if(x == null || typeof x == 'undefined') x = 1;
    if(y == null || typeof y == 'undefined') y = 1;
    
    var win = $j(window);
    
    var viewport = {
        top : win.scrollTop(),
        left : win.scrollLeft()
    };
    viewport.right = viewport.left + win.width();
    viewport.bottom = viewport.top + win.height();
    
    var height = this.outerHeight();
    var width = this.outerWidth();
 
    if(!width || !height){
        return false;
    }
    
    var bounds = this.offset();
    bounds.right = bounds.left + width;
    bounds.bottom = bounds.top + height;
    
    var visible = (!(viewport.right < bounds.left || viewport.left > bounds.right || viewport.bottom < bounds.top || viewport.top > bounds.bottom));
    
    if(!visible){
        return false;  
    }
    
    var deltas = {
        top : Math.min( 1, ( bounds.bottom - viewport.top ) / height),
        bottom : Math.min(1, ( viewport.bottom - bounds.top ) / height),
        left : Math.min(1, ( bounds.right - viewport.left ) / width),
        right : Math.min(1, ( viewport.right - bounds.left ) / width)
    };
    
    return (deltas.left * deltas.right) >= x && (deltas.top * deltas.bottom) >= y;
    
};
var elements = {
	    navigation: false,
	    minicart: false,
        headers: 0,
        treshold: 5,
}

function dotdotdotCallback(isTruncated, originalContent) {
    if (!isTruncated) {
     $j('.link-learn', this).remove();   
    }
}

function moveCurrentFilter(){
	/* CHANGE BLOCK POSITIONS - 1023PX */	
    enquire.register('screen and (max-width: ' + 767 + 'px)', {
            match: function () {
            	if ($j('.sidebar .block.block-layered-nav').length && $j('.sidebar .block.block-layered-nav .current-filters').length) {
            		$j('.sidebar .block.block-layered-nav .current-filters').insertBefore($j('.block-layered-nav .block-content'));
            		$j('.sidebar .block.block-layered-nav .current-filters-header').insertBefore($j('.block-layered-nav .block-content'));
            		
            	}
                	
            },
            unmatch: function () {
            	if ($j('.sidebar .block.block-layered-nav').length && $j('.sidebar .block.block-layered-nav .current-filters').length) {
            		$j('.sidebar .block.block-layered-nav .current-filters-header').insertAfter($j('div.block-layered-nav .category-block'));
            		$j('.block-layered-nav .current-filters').insertAfter($j('div.block-layered-nav .category-block'));
            		
            	}
            }
     });
}

/* TRIGGER CLICK TO REVIEW TAB */
function openReviewTab(){
	if($j('.collateral-tabs .tab-content.current').find('.back').size()){
		$j('.collateral-tabs .tab-content.current .back').trigger('click');
		setTimeout(function() {
			$j('h3.reviews-tab').trigger('click');
		}, 251);
	}
	else {
		$j('.reviews-tab').trigger('click');
	}
}

/* TRIGGER CLICK TO DOWNLOAD TAB */
function openDownloadTab(){
	if($j('.collateral-tabs .tab-content.current').find('.back').size()){
		$j('.collateral-tabs .tab-content.current .back').trigger('click');
		setTimeout(function() {
			$j('h3.downloads-tab').trigger('click');
		}, 251);
	}
	else {
		$j('.downloads-tab').trigger('click');
	}
}

$j(window).resize(function () {
	/* HOME FEATURED NEWS */
	featuredNewsDots();
	
	setupContentPadding();
	
	/* IF NO SLIDER */
	setupSearchMargin();
	
	/* SETUP EMPTY FOOTER HEIGHT */
	alignFooter();

});

$j(window).load(function () {
	/* HOME FEATURED NEWS */
	featuredNewsDots();
	
	/* SETUP EMPTY FOOTER HEIGHT */
	alignFooter();

});

Varien.searchForm.addMethods({
	initSearchAutocomplete : function(url, destinationElement){
        new Ajax.Autocompleter(
            this.field,
            destinationElement,
            url,
            {
                paramName: this.field.name,
                method: 'get',
                minChars: 2,
                updateElement: this._selectSearchAutocompleteItem.bind(this),
                onShow : function(element, update) {
                    if(!update.style.position || update.style.position=='absolute') {
                        update.style.position = 'absolute';
                        Position.clone(element, update, {
                            setHeight: false,
                            offsetTop: element.offsetHeight
                        });
                    }
                    Effect.Appear(update,{duration:0});
                }

            }
        );
    },

    _selectSearchAutocompleteItem : function(element){
        if(element.title){
            this.field.value = element.title;
        }
        //this.form.submit();
    }
});

RegionUpdaterLicense = Class.create();
RegionUpdaterLicense.prototype = Object.create(RegionUpdater.prototype);
RegionUpdaterLicense.prototype._checkRegionRequired = function(){};