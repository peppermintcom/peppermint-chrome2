
	$( document ).ready( function () {

		( function ( window, $, chrome ) {

			new Timer	( jQuery, $( "#v-timer-import" )	[0].import.querySelector( "template" ), $( "#timer" )	[0] );
			new Popup	( jQuery, $( "#v-popup-import" )	[0].import.querySelector( "template" ), $( "#popup" )	[0], "/img/" );
			new Player	( jQuery, $( "#v-player-import" )	[0].import.querySelector( "template" ), $( "#player" )	[0], "/img/" );

			chrome.extension.getBackgroundPage().popup_controller.init_popup_state( window.document );
			chrome.extension.getBackgroundPage().popup_controller.register_handlers( window.document );

		} ( window, jQuery, chrome ) );

	});
