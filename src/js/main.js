//SCROLL TO
function scroll2(positon, speed) {
	if(!positon) positon = 0;
		else positon = $(positon).offset().top;

	if(!speed) speed = 500;

	 $('html,body').animate({
		scrollTop: positon
	}, speed);

	return false;
}



$(function(){
	//Have JS
	$('html').removeClass('no-js');


	//MODAL
	$('.js-pop').magnificPopup({
		type: 'inline',
		midClick: true,
		closeBtnInside: true,
		closeMarkup: '<button type="button" class="mfp-close mfp-new-close"><svg><use xlink:href="#icn-cross"/></svg></button>',
		alignTop: false,
		removalDelay: 300,
		mainClass: 'my-mfp-slide-bottom',
		focus: '.field:first-child',

		callbacks: {
			beforeOpen: function() {
				if($(window).width() < 700) this.st.focus = false;
					else this.st.focus = '.field:first-child';
			}
		}
	});

	$(document).on('click', '.mfp-close', function (e) {
			e.preventDefault();
			$.magnificPopup.close();
	});


	//TEL
	$('.js-tel, input[type="tel"]').mask("+7(999) 999-99-99", { placeholder:"+7(___) ___-__-__" });

});