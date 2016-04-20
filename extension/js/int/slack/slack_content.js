
	( function () {
		
		new ErrorReporter( chrome, $, 'slack' );

		var launcher_helper = new LauncherHelper( jQuery );

		launcher_helper.urls_to_templates( chrome.extension.getURL( "/" ), [

			[ 'recording_button', 'html/elements/recording_button.html' ]

		]).then( function ( t ) {

			var event_hub = new EventHub();
			var button = $( "<div></div>" ).appendTo( document.body )[ 0 ];

			new RecordingButton( chrome, jQuery, event_hub, t["recording_button"], button, { stop_icon: true } );

			new SlackButtonInserter(
				jQuery,
				event_hub,
				button
			);

			new SlackController(
				chrome,
				jQuery,
				event_hub,
				button
			);

		});

	} () );

	( function constructor () {
        
        chrome.runtime.sendMessage( { 
			receiver: 'GlobalAnalytics', name: 'track_analytic', 
			analytic: { name: 'setup', val: { type: 'page_load', name : 'slack_content.js' } } 
		});

	} () );

