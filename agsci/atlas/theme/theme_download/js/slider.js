window.hasOwnProperty = function (obj) {return (this[obj]) ? true : false;};
if (!window.hasOwnProperty('IWD')){IWD = {};}
IWD = IWD||{};
IWD.AutoRelatedProducts = {
    default_settings: {
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
	    loop: true,
	    margin:25,
        navText:["<strong class='fa fa-angle-left'></strong>","<strong class='fa fa-angle-right'></strong>"] ,
        onInitialized : function(){	
        	IWD.Featured.Processor.setupItemHeight(block);
			$j('.iwd-auto-related-products-slide .item .product-name a').dotdotdot({ellipsis	: '...'});
			$j('.iwd-auto-related-products-slide .item .top-list-info p').dotdotdot({ellipsis : '...'});
    	},
    	onRefreshed  :function(){
    		IWD.Featured.Processor.setupItemHeight(block);
			$j('.iwd-auto-related-products-slide .item .product-name a').dotdotdot({ellipsis	: '...'});
			$j('.iwd-auto-related-products-slide .item .top-list-info p').dotdotdot({ellipsis : '...'});
    	}
    },

    initSlider: function(block, settings, general_settings){
        var slider = $j(block);
        general_settings = $j.extend(IWD.AutoRelatedProducts.default_settings, general_settings);
        settings = $j.extend(general_settings, settings);
        slider.owlCarousel(settings);
    },
    
    
	
    /*initHeight: function(){
        IWD.AutoRelatedProducts.updateHeight();
        $j(window).resize(function(){IWD.AutoRelatedProducts.updateHeight();});
    },

    updateHeight: function(){
    	$j('.iwd-auto-related-products-slider .item .info .product-name a').dotdotdot({ellipsis	: '...'});
    	IWD.Featured.Processor.setupItemHeight(block);
       
    }*/
};


