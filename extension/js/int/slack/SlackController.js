	
	function SlackController ( chrome, $, hub, button ) {
		
		var state = {

			recording: false,
			recording_data_id: 0

		};

		var private = {

		};

		var public = {

		};

		var message_handlers = {

			recording_started: function ( message ) {

				state.recording = true;
				button.start();

			},

			recording_canceled: function ( message ) {

				state.recording = false;
				button.stop();

			},

			got_urls: function ( message ) {

				state.recording = false;
				button.stop();

				var target = $( "#message-input" );

				if ( target.val() === "" ) {

					target.val( message.recording_data.urls.short_url );
					
				} else {

					target.val( target.val() + " " + message.recording_data.urls.short_url );

				}

				
			}

		};

		var event_handlers = {

			recording_button_click: function () {

				if ( state.recording ) {

					chrome.runtime.sendMessage({ receiver: "GlobalController", name: "finish_recording", source: { name: "slack", recording_data_id: state.recording_data_id } });

				} else {
					
					state.recording_data_id = Date.now();
					chrome.runtime.sendMessage({ receiver: "GlobalController", name: "start_recording", source: { name: "slack", recording_data_id: state.recording_data_id } });
				
				}

			}

		};

		( function () {

			hub.add( event_handlers );

			chrome.runtime.onMessage.addListener( function ( message, sender, callback ) {

				if ( message.receiver === "Content" ) {

					if ( message_handlers[ message.name ] && message.recording_data && message.recording_data.source.recording_data_id === state.recording_data_id ) {

						message_handlers[ message.name ]( message, sender, callback );

					} else if ( message_handlers[ message.name ] && message.name === "recording_details" ) {

						message_handlers[ message.name ]( message, sender, callback );

					}

				}

			});

		} () );

		return public;

	}
