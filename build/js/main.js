$(function(){


	//MODAL
	$('.js-pop, [data-form]').magnificPopup({
		type: 'inline',
		midClick: true,
		closeBtnInside: true,
		closeMarkup: '<button type="button" class="mfp-close mfp-new-close"><svg><use xlink:href="#icn-cross"/></svg></button>',
		alignTop: false,
		removalDelay: 300,
		mainClass: 'my-mfp-slide-bottom',
	});

	$(document).on('click', '.mfp-close', function (e) {
			e.preventDefault();
			$.magnificPopup.close();
	});


});