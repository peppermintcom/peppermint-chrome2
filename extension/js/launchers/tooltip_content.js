
	( function () {

		var launcher_helper = new LauncherHelper( jQuery );

		launcher_helper.urls_to_templates( chrome.extension.getURL( "/" ), [

			[ 'tooltip', 'html/elements/tooltip.html' ]

		]).then( function ( t ) {

			var event_hub = new EventHub();
			
			var ba_tooltip = $( "<div id = 'peppermint_browser_action_tooltip' class = 'top' ></div>" )[0];
			var cb_tooltip = $( "<div id = 'peppermint_compose_button_tooltip' class = 'button' ></div>" )[0];

			var browser_action_tooltip = new Tooltip( jQuery, event_hub, t["tooltip"], ba_tooltip );
			var compose_button_tooltip = new Tooltip( jQuery, event_hub, t["tooltip"], cb_tooltip );

			new TooltipController(
				chrome,
				jQuery,
				event_hub,
				browser_action_tooltip,
				compose_button_tooltip
			);

		});

	} () )