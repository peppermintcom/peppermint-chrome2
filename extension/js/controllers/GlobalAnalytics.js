	
	function GlobalAnalytics ( chrome, $, hub ) {
		
		var state = {

		};

		var private = {

			message_handler: function ( message, sender, callback ) {

				if ( message.receiver === "GlobalAnalytics" ) {

					if ( message.name === "" ) {
						

					}

					return true;

				}

			}

		};

		hub.add({

			background_message: function ( message ) {

				private.message_handler( message );

			}

		});

		chrome.runtime.onMessage.addListener( private.message_handler );

	}
