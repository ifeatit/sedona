(function($) {
		$.fn.animated = function(inEffect) {
			$(this).each(function() {
				var ths = $(this);
				ths.css("opacity", "0").addClass("animated").waypoint(function(dir) {
					if (dir === "down") {
						ths.addClass(inEffect).css("opacity", "1");
					};
				}, {
					offset: "80%"
				});

			});
		};
	})(jQuery);

(function runAnimation() {
	$(".features-list__item").animated("zoomIn");
	$(".promo-list__item").animated("zoomIn");
	$(".search-hotel__title").animated("fadeInDown");
	$(".search-hotel__description").animated("fadeInDown");
	$(".search-hotel-popup__btn-open").animated("bounceInLeft");
})();


