(function ($) {

	"use strict";

	$.fn.paymentInfo = function (method) {

		// Global variables.
		var methods,
			helpers,
			ccDefinitions,
			opts,
			pluginName = "paymentInfo";

		// Credit card regex patterns.
		ccDefinitions = {
			'visa': /^4/,
			'mc': /^5[1-5]/,
			'amex': /^3(4|7)/,
			'disc': /^6011/
		};

		helpers = {

			// Determine if the number being give corresponds to a credit card
			// regex pattern. If it does, break the loop and return the credit card type.

			getCreditCardType: function (number) {

				var ccType;

				$.each(ccDefinitions, function (i, v) {

					if (v.test(number)) {
						ccType = i;
						return false;
					}

				});

				return ccType;

			},

			// Our matchNumbers function. Probably does more than it should.
			// Will revisit.

			matchNumbers: function (el) {

				// Check the card type to see if it's an Amex. If it is, update the mask to reflect

				if (ccType === "amex") {
					el.inputmask({ mask: "9999 999999 99999" });
				} else {
					el.inputmask({ mask: "9999 9999 9999 9999" });
				}
			},

		};

		methods = {

			init: function (options) {

				// Get a copy of our configuration options
				opts = $.extend({}, $.fn.paymentInfo.defaults, options);


				// Loop through our fieldset, find our inputs and initialize them.
				return this.each(function () {

					$(this)
						.prepend("<span class='" + opts.cardImageClass + "'></span>")
						.find("." + opts.cardNumberClass)
							.inputmask({ mask: "9999 9999 9999 9999" })
						.end();
				})
			},
		};

		// Plugin methods API
		if (methods[method]) {
			return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		}
		if (typeof method === "object" || !method) {
			return methods.init.apply(this, arguments);
		}
		return $.error("Method does not exist in plugin");

	};

	// Plugin config options.
	$.fn.paymentInfo.defaults = {
		cardNumberClass: "card-number",
	};

}(jQuery));

$(".credit-card-group").paymentInfo();