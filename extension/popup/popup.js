
	$( document ).ready( function () {

		( function ( window, $, chrome, utilities ) {

            function add_metric ( metric, log_result ){
                
                if(!utilities)
                    utilities = new Utilities( chrome, $, 'popup_popup' );
                    
                utilities.add_metric( metric, function ( result ) {
                    if(log_result)
                        console.log({ metric, result });
                });
            };
            
			var event_hub = new EventHub();

			new Timer	( jQuery, $( "#v-timer-import" )	[0].import.querySelector( "template" ), $( "#timer" )	[0], event_hub );
			new Popup	( jQuery, $( "#v-popup-import" )	[0].import.querySelector( "template" ), $( "#popup" )	[0], "/img/", event_hub );
			new Player	( jQuery, $( "#v-player-import" )	[0].import.querySelector( "template" ), $( "#player" )	[0], "/img/" );
			new AudioVisualizer ( jQuery, $( "#audio_visualizer" )[ 0 ], chrome );

			chrome.extension.getBackgroundPage().popup_controller.init_popup_state( window.document );
			chrome.extension.getBackgroundPage().popup_controller.register_handlers( window.document, event_hub );

			chrome.storage.local.set({
				"browser_action_popup_has_been_opened": true
			})
            
            ( function constructor () {
            
                add_metric({ name: 'class-load', val: { class: 'popup_popup' } });

            } () );

		} ( window, jQuery, chrome ) );

	});
