
	( function () {

		var launcher_helper = new LauncherHelper( jQuery );

		launcher_helper.urls_to_templates( chrome.extension.getURL( "/" ), [

			[ 'tooltip', 'html/elements/tooltip.html' ]

		]).then( function ( t ) {

			var event_hub = new EventHub();
			
			$( "<div id = 'peppermint_browser_action_tooltip' class = 'top' ></div>" ).appendTo( document.body );
			$( "<div id = 'peppermint_compose_button_tooltip' class = 'button' ></div>" ).appendTo( document.body );

			var browser_action_tooltip = new Tooltip( jQuery, event_hub, t["tooltip"], $( "#peppermint_browser_action_tooltip" )[0] );
			var compose_button_tooltip = new Tooltip( jQuery, event_hub, t["tooltip"], $( "#peppermint_compose_button_tooltip" )[0] );

			new TooltipController(
				chrome,
				jQuery,
				event_hub,
				browser_action_tooltip,
				compose_button_tooltip
			);

		});

	} () )