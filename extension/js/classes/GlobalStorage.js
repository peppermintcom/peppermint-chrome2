	
	function GlobalStorage ( chrome, $, event_hub ) {
		
		var state = {

		};

		var private = {

		};

		var public = {

		};

		chrome.runtime.onMessage.addListener( function ( message, sender, callback ) {

			if ( message.receiver === "GlobalStorage" ) {

				if ( message.name === "get_last_popup_recording_data" ) {


				}

				return true;

			}

		});

		( function () {



		} () )

		return public;

	}
