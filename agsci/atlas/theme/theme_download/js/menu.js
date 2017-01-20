$j(document).ready(function() {
	$j('.nav-primary').setup_navigation();
}); 
/*
$j(function(){
	$j('.nav').setup_navigation();
});
*/
var keyCodeMap = {
        48:"0", 49:"1", 50:"2", 51:"3", 52:"4", 53:"5", 54:"6", 55:"7", 56:"8", 57:"9", 59:";",
        65:"a", 66:"b", 67:"c", 68:"d", 69:"e", 70:"f", 71:"g", 72:"h", 73:"i", 74:"j", 75:"k", 76:"l",
        77:"m", 78:"n", 79:"o", 80:"p", 81:"q", 82:"r", 83:"s", 84:"t", 85:"u", 86:"v", 87:"w", 88:"x", 89:"y", 90:"z",
        96:"0", 97:"1", 98:"2", 99:"3", 100:"4", 101:"5", 102:"6", 103:"7", 104:"8", 105:"9"
}

$j.fn.setup_navigation = function(settings) {

	settings = jQuery.extend({
		menuHoverClass: 'show-menu',
	}, settings);
	
	// Add ARIA role to menubar and menu items
	$j(this).attr('role', 'menubar').find('li').attr('role', 'menuitem');
	
	var top_level_links = $j(this).find('> li > a');

	// Added by Terrill: (removed temporarily: doesn't fix the JAWS problem after all)
	// Add tabindex="0" to all top-level links 
	// Without at least one of these, JAWS doesn't read widget as a menu, despite all the other ARIA
	//$j(top_level_links).attr('tabindex','0');
	
	// Set tabIndex to -1 so that top_level_links can't receive focus until menu is open
	$j(top_level_links).next('nav')
		.find('a');
	
	// Adding aria-haspopup for appropriate items
	$j(top_level_links).each(function(){
		if($j(this).next('nav').length > 0)
			$j(this).parent('li').attr('aria-haspopup', 'true');
	});
	
	$j(top_level_links).focus(function(){
		$j(this).closest('nav')
			// Removed by Terrill 
			// The following was adding aria-hidden="false" to root ul since menu is never hidden
			// and seemed to be causing flakiness in JAWS (needs more testing) 
			// .attr('aria-hidden', 'false') 
			.find('.'+settings.menuHoverClass)
				.attr('aria-hidden', 'true')
				.removeClass(settings.menuHoverClass)
				.trigger('hoverEnd')
				.find('a');
		$j(this).next('nav')
			.attr('aria-hidden', 'false')
			.addClass(settings.menuHoverClass)
			.trigger('hoverStart');
	});
	
	$j(top_level_links).mouseout(function(){
		$j(this).closest('nav')
		// Removed by Terrill 
		// The following was adding aria-hidden="false" to root ul since menu is never hidden
		// and seemed to be causing flakiness in JAWS (needs more testing) 
		// .attr('aria-hidden', 'false') 
		.find('.'+settings.menuHoverClass)
			.attr('aria-hidden', 'true')
			.removeClass(settings.menuHoverClass)
			.trigger('hoverEnd')
			.find('a');
	})
	
	// Bind arrow keys for navigation
	$j(top_level_links).keydown(function(e){
		if(e.keyCode == 37) {
			e.preventDefault();
			// This is the first item
			if($j(this).parent('li').prev('li').length == 0) {
				$j(this).parents('nav').find('> li').last().find('a').first().focus();
			} else {
				$j(this).parent('li').prev('li').find('a').first().focus();
			}
		} else if(e.keyCode == 38) {
			e.preventDefault();
			if($j(this).parent('li').find('nav').length > 0) {
				$j(this).parent('li').find('nav')
					.attr('aria-hidden', 'false')
					.addClass(settings.menuHoverClass)
					.trigger('hoverStart')
					.find('a')
						.last().focus();
			}
		} else if(e.keyCode == 39) {
			e.preventDefault();
			// This is the last item
			if($j(this).parent('li').next('li').length == 0) {
				$j(this).parents('nav').find('> li').first().find('a').first().focus();
			} else {
				$j(this).parent('li').next('li').find('a').first().focus();
			}
		} else if(e.keyCode == 40) {
			e.preventDefault();
			if($j(this).parent('li').find('nav').length > 0) {
				$j(this).parent('li').find('nav')
					.attr('aria-hidden', 'false')
					.addClass(settings.menuHoverClass)
					.trigger('hoverStart')
					.find('a')
						.first().focus();
			}
		} else if(e.keyCode == 13 || e.keyCode == 32) {
			// If submenu is hidden, open it
			e.preventDefault();
			$j(this).parent('li').find('ul[aria-hidden=true]')
					.attr('aria-hidden', 'false')
					.addClass(settings.menuHoverClass)
					.trigger('hoverStart')
					.find('a')
						.first().focus();
		} else if(e.keyCode == 27) {
			e.preventDefault();
			$j('.'+settings.menuHoverClass)
				.attr('aria-hidden', 'true')
				.removeClass(settings.menuHoverClass)
				.trigger('hoverEnd')
				.find('a');
		} else {
			$j(this).parent('li').find('nav[aria-hidden=false] a').each(function(){
				if($j(this).text().substring(0,1).toLowerCase() == keyCodeMap[e.keyCode]) {
					$j(this).focus();
					return false;
				}
			});
		}
	});
	
	
	var links = $j(top_level_links).parent('li').find('nav').find('a');
	$j(links).keydown(function(e){
		if(e.keyCode == 38) {
			e.preventDefault();
			// This is the first item
			if($j(this).parent('li').prev('li').length == 0) {
				$j(this).parents('nav').parents('li').find('a').first().focus();
			} else {
				$j(this).parent('li').prev('li').find('a').first().focus();
			}
		} else if(e.keyCode == 40) {
			e.preventDefault();
			if($j(this).parent('li').next('li').length == 0) {
				$j(this).parents('nav').parents('li').find('a').first().focus();
			} else {
				$j(this).parent('li').next('li').find('a').first().focus();
			}
		} else if(e.keyCode == 27 || e.keyCode == 37) {
			e.preventDefault();
			$j(this)
				.parents('nav').first()
					.prev('a').focus()
					.parents('nav').first().find('.'+settings.menuHoverClass)
						.attr('aria-hidden', 'true')
						.removeClass(settings.menuHoverClass)
						.trigger('hoverEnd')
						.find('a');
		} else if(e.keyCode == 32) {
			e.preventDefault();
			window.location = $j(this).attr('href');
		} else {
			var found = false;
			$j(this).parent('li').nextAll('li').find('a').each(function(){
				if($j(this).text().substring(0,1).toLowerCase() == keyCodeMap[e.keyCode]) {
					$j(this).focus();
					found = true;
					return false;
				}
			});
			
			if(!found) {
				$j(this).parent('li').prevAll('li').find('a').each(function(){
					if($j(this).text().substring(0,1).toLowerCase() == keyCodeMap[e.keyCode]) {
						$j(this).focus();
						return false;
					}
				});
			}
		}
	});

		
	// Hide menu if click or focus occurs outside of navigation
	$j(this).find('a').last().keydown(function(e){ 
		if(e.keyCode == 9) {
			// If the user tabs out of the navigation hide all menus
			$j('.'+settings.menuHoverClass)
				.attr('aria-hidden', 'true')
				.removeClass(settings.menuHoverClass)
				.trigger('hoverEnd')
				.find('a');
		}
	});
	$j(document).click(function(){ $j('.'+settings.menuHoverClass).attr('aria-hidden', 'true').removeClass(settings.menuHoverClass).find('a'); });
	$j(this).click(function(e){
		e.stopPropagation();
	});
}