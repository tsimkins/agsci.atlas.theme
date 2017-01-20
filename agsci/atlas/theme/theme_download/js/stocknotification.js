;
var IWD=IWD||{};
IWD.StockNotification = {
		
		requestUrl: null,
		currentBlock : null,
		container:null,
		init: function(){
			$ji('.request-notice').click(function(e){
				
				e.preventDefault();		
				IWD.StockNotification.sendRequestNotify($ji(this));
			});
			
			$ji('.btn-notify').click(function(e){
				e.preventDefault();		
				$ji('.modal-notify').hide();//hide all
				IWD.StockNotification.currentBlock = $ji(this).data('id')
				$ji('#modal-notify-'+IWD.StockNotification.currentBlock).fadeIn();
			});
			
			$ji('a.close-notification').click(function(e){
				e.preventDefault();
				$ji(this).closest('.modal-notify').hide();
			});
		},
		
		sendRequestNotify: function(button){
			IWD.StockNotification.container  = button.closest('.stock-notification');
			var email = IWD.StockNotification.container.find('input[name="email_notification"]').val();
			var product = IWD.StockNotification.container.find('[name="product_id"]').val();
			var parent = IWD.StockNotification.container.find('input[name="parent_id"]').val();
			var radius = IWD.StockNotification.container.find('[name="radius"]').val();
			var zip_stock = IWD.StockNotification.container.find('input[name="zip_stock"]').val();
			
			if (!IWD.StockNotification.validateEmail(email)){
				
				IWD.StockNotification.container.find('.stock-notification-message').html('Please enter a valid email address.').addClass('error');
				return;
			}
			
			
			$ji.post(IWD.StockNotification.requestUrl,{"email":email, "radius":radius, "zip_stock":zip_stock, "id":product,'parent':parent}, function(response){
				IWD.StockNotification.applyError(response);
				IWD.StockNotification.applyResponse(response);
			},'json');
		}, 
		
		applyError: function(response){
			if (typeof(response.error)!='undefined' && response.error==true){
				IWD.StockNotification.container.find('.stock-notification-message').html(response.message).removeClass('success').addClass('error');
			}
			
		},
		
		applyResponse: function(response){
			if (typeof(response.error)!='undefined' && response.error==false){
				IWD.StockNotification.container.find('.stock-notification-header').hide();
				
				IWD.StockNotification.container.find('.stock-notification-message').html(response.message).removeClass('error').addClass('success');
				
				IWD.StockNotification.closeExistModal();
			}
			
		},
		
		validateEmail: function(email){  
			   var emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;   
			   return emailPattern.test(email);  
		},
		
		closeExistModal:function(){
			if ($ji('#modal-notify-'+IWD.StockNotification.currentBlock).length){
				setTimeout(function(){
					$ji('#modal-notify-'+IWD.StockNotification.currentBlock).fadeOut();
				}, 2000);
			}
		}
		
		
		
};
if (typeof(jQueryIWD)!="undefined"){
	$ji(document).ready(function(){
			IWD.StockNotification.init();
	});
}else{
	console.log('IWD jQuery undefined');
};