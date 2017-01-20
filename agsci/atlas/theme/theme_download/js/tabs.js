var IWD=IWD||{};

IWD.Tabs = {
	config:null
};

IWD.Tabs.Processor = {		
	init: function(){	
		
		$ji('.super-attribute-select').change(function(el){ 		
			IWD.Tabs.Processor.getSimpleInfo();
		});
		
		$ji('.product-view.configurable .product-options .bootstrap-select').click(function(e){
		    $id = $ji(this).closest(".input-box").find('select').attr('id');
		    selector = '#'+$id;
			select = $$(selector);
			select = select[0];
			IWD.Tabs.Processor.fireEvent(select, 'change');
	   });
	},

	getSimpleInfo: function(){
		var simpleProductId = spConfig.getIdOfSelectedProduct();
		$tab = $j('.product-view .collateral-tabs .tab-simple');
		if(simpleProductId){
			var value = product_simple_data[simpleProductId].value;
			$tab.find('.message').addClass('hidden');
			if(value == null)
				$tab.find('.value').html('There are no any informations');
			else{
				$tab.find('.value').html(value);
			}
				
		}
		else{
			$tab.find('.message').removeClass('hidden');
			$tab.find('.value').html('');
		}
	},
	
	fireEvent: function(element,event)
	{
		if (document.createEventObject)
		{
		// dispatch for IE
		var evt = document.createEventObject();
		return element.fireEvent('on'+event,evt);
		}
		else
		{
		// dispatch for firefox + others
		var evt = document.createEvent("HTMLEvents");
		evt.initEvent(event, true, true );
		return !element.dispatchEvent(evt);
		}
	},
	    
		
};

if (typeof(Product) == "undefined"){
    Product = [];
    Product.Config = Class.create();
}

Product.Config.prototype.getIdOfSelectedProduct = function()
{
     var existingProducts = new Object();
 
     for(var i=this.settings.length-1;i>=0;i--)
     {
         var selected = this.settings[i].options[this.settings[i].selectedIndex];
         if(selected.config)
         {
         	for(var iproducts=0;iproducts<selected.config.products.length;iproducts++)
         	{
         		var usedAsKey = selected.config.products[iproducts]+"";
         		if(existingProducts[usedAsKey]==undefined)
         		{
         			existingProducts[usedAsKey]=1;
         		}
         		else
         		{
         			existingProducts[usedAsKey]=existingProducts[usedAsKey]+1;
         		}
             }
         }
     }
 
     for (var keyValue in existingProducts)
     {
     	for ( var keyValueInner in existingProducts)
         {
         	if(Number(existingProducts[keyValueInner])<Number(existingProducts[keyValue]))
         	{
         		delete existingProducts[keyValueInner];
         	}
         }
     }
 
     var sizeOfExistingProducts=0;
     var currentSimpleProductId = "";
     for ( var keyValue in existingProducts)
     {
     	currentSimpleProductId = keyValue;
     	sizeOfExistingProducts=sizeOfExistingProducts+1
     }
 
     if(sizeOfExistingProducts==1)
     {
    	 return currentSimpleProductId;
     }
     return false;
}

$j(window).load(function(){
	if (typeof($j)=="undefined"){
		console.log('IWD jQuery Library undefined');
	}else{
		IWD.Tabs.Processor.init();
	}
});

