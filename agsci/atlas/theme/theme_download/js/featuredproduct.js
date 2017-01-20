var IWD=IWD||{};

IWD.Featured = {
	config:null,
};

IWD.Featured.Processor = {		
	init: function(){	
		IWD.Featured.Processor.changeProducts();
		IWD.Featured.Processor.setupSlider();
	},
	
	changeProducts:function(){
		$j('.featured-products #category-filter').on('change', function() {
			$j('.iwd-featured-ajax-loader').addClass('showloader');
			$j.ajax({
	            url: IWD.Featured.Processor.getBaseUrl() + "iwdfeaturedproduct/ajax/getCollectionByCategory",
	            type: "POST",
	            data: {category_id: this.value},
	            success: function(result) {
	                if(result.error) {
	                	alert(result.error);
	                } else {	
	                	$j('.featured-products .slides-parent').html(result.data).addClass('hide-content');
	                	IWD.Featured.Processor.setupSlider();
	                	$j('.iwd-featured-ajax-loader').removeClass('showloader');
	                	
	                	
	                }
	            }
	        });
		});
	},

	getBaseUrl: function() {
        var protocol = window.location.protocol;
        var domain =  window.location.host+'/extensions';

        return protocol + '//' + domain + '/';
    },
    
    setupSlider: function(){
    	
    	if($j('.cms-home .featured-products .slides').size()){
    		var owl = $j('.cms-home .featured-products .slides');
    		owl.each(function () {
    		    var el = $j(this);
    		    $loop = true;
    		    if (el.find('.item').length <= 1) 
    		    	$loop = false;
    		    el.owlCarousel({
        			nav: true, 
        			slideSpeed: 300,
        			paginationSpeed: 400,
        			items : 4,
        			responsive:{
        		        0:{ items:1,},
        		        480:{ items:2,},
        		        768:{ items:2,},
        		        880:{ items:3,},
        		        1024:{items:4,}
        		    },
        		    slideBy : 4,
        		    margin:18,
        		    loop: $loop,
        			navText:["<strong class='fa fa-angle-left'></strong>","<strong class='fa fa-angle-right'></strong>"],
        			onInitialized : function(){	
                		$j('.cms-home .featured-products .slides-parent').removeClass('hide-content');
						$j('.item .product-name a').dotdotdot({ellipsis	: '...'});
						$j('.item .top-list-info p').dotdotdot({ellipsis : '...'});
        			},
        			onRefreshed  :function(){
        				IWD.Featured.Processor.setupItemHeight(el);
						$j('.item .product-name a').dotdotdot({ellipsis	: '...'});
						$j('.item .top-list-info p').dotdotdot({ellipsis : '...'});
        			}
        			
        		});
    		});    
    		
    	}
    },
    
    setupItemHeight: function(el){
    	el.find('.item-inner').removeAttr('style');
    	maxHeight = el.find('.owl-stage-outer').height() - 3;
    	el.find('.item-inner').css({'min-height': maxHeight+'px'});
    },
    
    setupItemHeightStart: function(){
    	var images = $j(".featured-products .slides img");
    	var loadedImgNum = 0;
    	images.on('load', function(){
    	  loadedImgNum += 1;
    	  if (loadedImgNum == images.length) {
    		    $j('.featured-products .slides .item-inner').removeAttr('style');
    	    	maxHeight = $j('.featured-products .slides .owl-stage-outer').height() - 3;
    	    	$j('.featured-products .slides .item-inner').css({'min-height': maxHeight+'px'});
    	  }
    	});
    	
    }
   
		
};

$j(window).load(function(){
	if (typeof($ji)=="undefined"){
		console.log('IWD jQuery Library undefined');
	}else{
		IWD.Featured.Processor.init();
	}
});

