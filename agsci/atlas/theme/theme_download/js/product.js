$j(document).ready(function () {
	/* UP SELL */
	if($j('.box-up-sell .slides').size()){
		var owl = $j('.box-up-sell .slides');;
		$loop = true;
		if (owl.find('.item').length <= 1) 
		   $loop = false;
		owl.owlCarousel({
	    	nav: true, 
			slideSpeed: 300,
			paginationSpeed: 400,
			items : 4,
			loop: $loop,
			responsive:{
		        0:{ items:1,},
		        480:{ items:2,},
		        768:{ items:2,},
		        880:{ items:3,},
		        1024:{items:4,}
		    },
		    slideBy : 4,
		    margin:25,
	        navText:["<strong class='fa fa-angle-left'></strong>","<strong class='fa fa-angle-right'></strong>"],
	        onInitialized : function(){
				$j('.box-up-sell .slides .item .product-name a').dotdotdot({ellipsis	: '...'});
				$j('.box-up-sell .slides .item .top-list-info p').dotdotdot({ellipsis : '...'});
			},
			onRefreshed  :function(){
				IWD.Featured.Processor.setupItemHeight(owl);
				$j('.box-up-sell .slides .item .product-name a').dotdotdot({ellipsis	: '...'});
				$j('.box-up-sell .slides .item .top-list-info p').dotdotdot({ellipsis : '...'});
			}
	    });
	}
	
	/* MEDIA BOX */

	if($j(".product-image-gallery.standard").size()){
		var owl_main_slider = $j(".product-image-gallery.standard").owlCarousel({
			items : 1,
			navRewind : false,
			dots: true,
			nav: false,
		});

		owl_main_slider.on("translated.owl.carousel",  function(){
			jQuery(this).find(".owl-item > img").removeClass('visible');
			var active_img = jQuery(this).find(".owl-item.active > img");
			active_img.addClass('visible');
			if(typeof ProductMediaManager !=='undefined')
			{
				ProductMediaManager.destroyZoom();
				ProductMediaManager.createZoom($j(".no-touch .gallery-image.visible"));
			}
		});
	}

	
	/* PRODUCT SELECT BOX */
	$j('.product-view select').not(('[multiple=multiple]')).selectpicker();
	
	$j('.product-view select').not(('[multiple=multiple]')).change(function(e){
	    selectId = e.target.id;
	    try{
		    spConfig.configureElement(document.getElementById(selectId));
		    spConfig.reloadPrice();
		    $j('.product-view.configurable').find('.btn-group').removeClass('super-attribute-select');
	    }catch(e){
	    	//console.debug(e);
	    }
	});
	$j('.bootstrap-select').click(function(e){
	    $j('.product-view select').not(('[multiple=multiple]')).selectpicker('refresh');
	});
	
	/* GIFT CARD SELECT BOX */
	
	$j('.product-view.giftcard .bootstrap-select').click(function(e){
	    $id = $j(this).closest('.input-box').find('select').attr('id');
	    selector = '#'+$id;
		select = $$(selector);
		select = select[0];
		fireEvent(select, 'change');
   });
	
	/* ANCHOR LINK FOR FIXED HEADER */
	
	$j(".main-container a[href^='#']").click(function(){
		var target = $j(this).attr('href');
		if($j(target).size()){
			var height = $j('#header').height();
			var padding = $j(target).offset().top - height;
			$j('html, body').animate({scrollTop: padding}, 800);
			return false;
		}
		
	});

	/* DELETE PADDINGS FOR MAIN AREA*/
	if($j('.product-collateral').next().size() == 0){
		$j('.main-container').addClass('no-padding');
	}


	/* CHANGE BLOCK POSITIONS - 1199PX */	

	enquire.register('screen and (min-width: ' + 1200 + 'px)', {
	    match: function () {
	    	if ($j('.product-view .additional-note').length) {
	        	$j('.product-view .additional-info').append($j('.product-view .additional-note'));
	         }
	                	
	     }
	});
		
	enquire.register('screen and (min-width: ' + 768 + 'px) and (max-width: ' + 1199 + 'px )', {
    	match: function () {
    		if ($j('.product-view .additional-note').length) {
    			$j('.product-view .product-img-box').append($j('.product-view .additional-note'));
            }
                	
        }
     });
    
    enquire.register('screen and (max-width: ' + 767 + 'px)', {
    	match: function () {
    		if ($j('.product-view .additional-note').length) {
    			$j('.product-view .product-options-block').append($j('.product-view .additional-note'));
            }
    		setupTabSlider();
                	
        }
     });

    
    /* TABS SLIDER */
   
    enquire.register('screen and (min-width: ' + 768 + 'px)', {
    	match: function () {
    		tabContent = $j('.product-collateral .tabs-slide.tab-next .back').remove();
    		$j('.product-collateral .collateral-tabs .tab-container.current').append($j('.product-collateral .tabs-slide.tab-next .tab-content'));
    		$j('.collateral-tabs .tabs-slide.tab-first').removeClass('hideHeight');
    		$j('.collateral-tabs > .tabs-slide.tab-next').remove();
                	
        }
     });

	/* MOVE DOWN RIGHT NAVIGATION */

	if ($j('.product-2columns-right .col-main .product-collateral').length && $j('.product-2columns-right .main-container').length) {
		$j('.product-2columns-right .main-container').append($j('.product-2columns-right .col-main .product-collateral'));
	}

	enquire.register('screen and (max-width: ' + 767 + 'px)', {
		match: function () {
			$j('.col-right .block .block-content').addClass('no-display');
			$j('.col-right .block').addClass('toggle-mobile');
			if ($j('.product-2columns-right .col-right').length && $j('.product-2columns-right .product-collateral').length) {
				$j('.product-2columns-right .product-collateral').insertBefore($j('.product-2columns-right .col-right'));
			}

		},
		unmatch: function () {
			$j('.col-right .block .block-content').removeClass('no-display');
			$j('.col-right .block.toggle-mobile .title').removeClass('active');
			$j('.col-right .block').removeClass('toggle-mobile');
			if ($j('.product-2columns-right .main-container').length && $j('.product-2columns-right .product-collateral').length) {
				$j('.product-2columns-right .main-container').append($j('.product-2columns-right .product-collateral'));
			}
		}
	});
	/* TOGGLE NEWSLETTER BLOCK */
	$j(document).on('click','.col-right .block.toggle-mobile .title', function(){
		$j(this).closest('.block').find('.block-content').toggleClass('no-display');
		$j(this).toggleClass('active');
	});

	//hide-show more articles logic
	showMoreArticles();
	
});

//show more-less articles
function showMoreArticles(){
	countlist = 3;
	$j(".author-list .item ul").each(function(){
		$j(this).find(" > li").each(function(index){
			if(countlist <= index) {
				$j(this).addClass('hidden');
			}
		});
		if($j(this).find(" > li").size() <= countlist) {
			$j(this).closest('.item').find('.view-all-articles').addClass('hidden');
		}
	});
	$j(".author-list .item .view-all-articles").toggleClick(function(){
		$j(this).closest('.info').find('> ul li.hidden').addClass('showing').removeClass('hidden');
		$j(this).html('View Less');
	},function(){
		$j(this).closest('.info').find('> ul li.showing').addClass('hidden').removeClass('showing');
		$j(this).html('View All');
	});
}


function fireEvent(element,event)
{
	if (document.createEventObject){
		// dispatch for IE
		var evt = document.createEventObject();
		return element.fireEvent('on'+event,evt);
	}
	else{
		// dispatch for firefox + others
		var evt = document.createEvent('HTMLEvents');
		evt.initEvent(event, true, true );
		return !element.dispatchEvent(evt);
	}
}



function setupTabSlider(){
    
	viewportWidth = 0;   
	$j('.collateral-tabs .tabs-slide').each(function() {
		$j(this).css({'width' : document.body.offsetWidth + 'px'});
	});
	transformValue = 'translate3d(' + viewportWidth + 'px, 0, 0)';
	$j('.collateral-tabs').css({
	    'webkitTransform':transformValue,
	    'MozTransform':transformValue,
	    'msTransform':transformValue,
	    'OTransform':transformValue,
	    'transform':transformValue
	});
	
	
	$j(document).on('click','.collateral-tabs .tab-container h3.tab', function(){	
		contentData = $j(this).next();
		$j('.collateral-tabs').append("<div class='tabs-slide tab-next'></div>");
		$j('.collateral-tabs .tabs-slide.tab-next').append(contentData);
		contentData.prepend("<p class='back'><span>Back</span></p>");
		$j('.collateral-tabs .tabs-slide.tab-next').css({'width' : document.body.offsetWidth + 'px'});
		sliderPosition = -(document.body.offsetWidth);  
		transformValue = 'translate3d(' + (sliderPosition) + 'px, 0, 0)';
		$j('.collateral-tabs').css({
			'webkitTransform':transformValue,
			'MozTransform':transformValue,
			'msTransform':transformValue,
			'OTransform':transformValue,
			'transform':transformValue
		});		
		setTimeout(function() {
			$j('.collateral-tabs .tabs-slide.tab-first').addClass('hideHeight');
		}, 1);
		
		
	});
	$j(document).on('click','.collateral-tabs .back', function(){
		tabContent = $j('.product-collateral .tabs-slide.tab-next .back').remove();
		$j('.product-collateral .collateral-tabs .tab-container.current').append($j('.product-collateral .tabs-slide.tab-next .tab-content'));
		transformValue = 'translate3d(0, 0, 0)';
		$j('.collateral-tabs').css({
		    'webkitTransform':transformValue,
		    'MozTransform':transformValue,
		    'msTransform':transformValue,
		    'OTransform':transformValue,
		    'transform':transformValue
		});
		$j('.collateral-tabs .tabs-slide.tab-first').removeClass('hideHeight');
		setTimeout(function() {
			$j('.collateral-tabs > .tabs-slide.tab-next').remove();
		}, 250);

	});
}

$j(window).resize(function() {
	viewportWidth = document.body.offsetWidth;   
	$j('.collateral-tabs .tabs-slide').each(function() {
		$j(this).css({'width' : document.body.offsetWidth + 'px'});
	});
	sliderPosition = 0;
	if($j('.collateral-tabs .tab-next').size())
		sliderPosition = -(document.body.offsetWidth);
	transformValue = 'translate3d(' + sliderPosition + 'px, 0, 0)';
	$j('.collateral-tabs').css({
	    'webkitTransform':transformValue,
	    'MozTransform':transformValue,
	    'msTransform':transformValue,
	    'OTransform':transformValue,
	    'transform':transformValue
	});
});

function getUrlVars()
{
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}

$j(window).load(function () {
	/* scroll to review after click to pagination */
	if( getUrlVars()['p'] || getUrlVars()['limit']) {
		$j('.reviews-tab').trigger('click');
		var height = $j('#header').height();
		var padding = $j('#product-collateral').offset().top - height;
		$j('html, body').animate({scrollTop: padding}, 800);
	}
});

