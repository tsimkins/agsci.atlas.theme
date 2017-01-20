var fotorama;
$j(document).ready(function () {

	/* move product name */
	if($j('.product-essential .product-name').size() && $j('.main .breadcrumbs').size()){
		$j('.product-essential .product-name').insertAfter($j('.main .breadcrumbs'));
	}

	/* SLIDER SETUP */
    var $fotoramaDiv  = $j('.product-2columns-right .fotorama').fotorama({
		nav: 'thumbs',
		allowfullscreen: false,
		arrows: 'always',
		shadows: 'false',
		thumbwidth: 140,
		thumbheight: 93,
		thumbmargin: 15,
		thumbborderwidth: 1
	});
    fotorama = $fotoramaDiv.data('fotorama');
    $j('.fotorama').on('fotorama:ready ' + 'fotorama:show ' + 'fotorama:load ' + 'fotorama:showend ', function () {
        fotoramaResize();
    });
    $j(window).resize(function(){
    	if($j('.product-2columns-right .fotorama').size())
			fotoramaResize();
    });

    /* multiple navigation */

    var content, location, stack, oltoc, numdigits, wlh, target, targetOffset, dest;

    dest = $j('.product-shop .std.multi-page .article-navigation');
	content = $j('.product-shop .std.multi-page');

	if (!content) {return;}

	location = window.location.href;
	if (window.location.hash) {
	    location = location.substring(0, location.lastIndexOf(window.location.hash));
	}
	stack = [];
	// Get headers in document order
	$j(content).find('*').not('.comment > h3').not('.documentActions > h2').not('#addthis > h2').not('.publication > h2').not('.publication > div > h3').not('#relatedItems > h2').filter(function() { return /^h[1234]$/.test(this.tagName.toLowerCase()) })
	    .not('.documentFirstHeading').not('.portletHeader').each(function(i) {

	    var level, ol, li;

	    level = this.nodeName.charAt(1);

	    // size the stack to the current level
	    while (stack.length < level) {
	        ol = $j('<ol>');
	        if (stack.length) {
	            li = $j(stack[stack.length - 1]).children('li:last');
	            if (!li.length) {
	                // create a blank li for cases where, e.g., we have a subheading before any headings
	                li = $j('<li>').appendTo($j(stack[stack.length - 1]));
	            }
	            li.append(ol);
	        }
	        stack.push(ol);
	    }

	    while (stack.length > level) {stack.pop();}

	    $j(this).before($j('<a name="section-' + i + '" />'));
	    $j('<li>').append(
	        $j('<a />').attr('href', '#section-' + i)
	                .text($j(this).text()))
	        .appendTo($j(stack[stack.length - 1]));
	});
	if (stack.length) {
	    var oltoc = $j(stack[0]);
	    // first level is a level with at least two entries #11160
	    var i = 1;
	    while(oltoc.children('li').length == 1){
	        oltoc = $j(stack[i]);
	        i += 1;
	    }

	    if (i <= stack.length) {
	        $j('.toc').show();
	    }

	    numdigits = oltoc.children().length.toString().length;
	    //Use a clever class name to add margin that's MUCH easier to customize
	    dest.append(oltoc);
	}
	else{
		$j('.article-navigation').addClass('hidden');
	}

	//scroll to element now.
	$j(document).on('click','.article-navigation li a', function(){
		wlh = $j(this).attr('href');
	    if (wlh) {
	    	target = $j(wlh);
	        target = $j('[name="' + wlh.slice(1) +'"]');
	        var height = $j("#header").addClass('mini').height();
	        $j("#header").removeClass('mini');
	        targetOffset = target.offset();
	        var padding = targetOffset.top - height;
	        if (targetOffset) {
	        	$j('html,body').animate({scrollTop: padding}, 800);
	        }
	    }
	});

	//toggle open navigation
	$j(document).on('click','.article-navigation .collapse-header', function(){
		$j(this).closest('.article-navigation').toggleClass('opened');
	});

});

function fotoramaResize(){
	var imgHeight = $j('.fotorama .fotorama__stage__frame > .fotorama__img').height() / 2;
	$j('.fotorama .fotorama__arr').css({'top':imgHeight+'px'});
    enquire.register('(max-width: 1199px)', {
        match: function () {
            var newHeight = 0;
            var currentContainer = $j(".fotorama__active");
            newHeight = currentContainer.find('.text-block').innerHeight();
            newHeight += currentContainer.find(' > .fotorama__img').height();
            fotorama.resize({
                height: newHeight
            });
        },
        unmatch: function () {
            newHeight = 0;
            var currentContainer = $j(".fotorama__active");
            newHeight = currentContainer.find(' > .fotorama__img').height();
            fotorama.resize({
                height: ''
            });
        }
    });
}