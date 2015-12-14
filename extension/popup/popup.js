
	$( document ).ready( function () {

		( function ( window, $, chrome ) {

			new Popup	(		jQuery, $( "#v-popup-import" )		[0].import.querySelector( "template" ) );
			new Timer	(		jQuery, $( "#v-timer-import" )		[0].import.querySelector( "template" ) );
			new Player	(		jQuery, $( "#v-player-import" )		[0].import.querySelector( "template" ) );

			chrome.extension.getBackgroundPage().popup_controller.register_handlers( window.document );
			chrome.extension.getBackgroundPage().popup_controller.init_popup_state( window.document );

		} ( window, jQuery, chrome ) );

	});
