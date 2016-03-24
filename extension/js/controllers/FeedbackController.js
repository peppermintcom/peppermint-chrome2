
	function FeedbackController ( chrome, $, event_hub ) {

		var private = {

		};

		( function set_up_dom_event_handling () {

			event_hub.add({

				feedback_start_click: function () {

					chrome.runtime.sendMessage({ receiver: "GlobalController", name: "start_recording", source: { name: "popup_feedback" } })

				},

				feedback_cancel_click: function () {

					chrome.runtime.sendMessage({ receiver: "GlobalController", name: "cancel_recording", source: { name: "popup_feedback" } })

				},

				feedback_finish_click: function () {
					
					chrome.runtime.sendMessage({ receiver: "GlobalController", name: "finish_recording", source: { name: "popup_feedback" } })

				}

			});

			function create_click_dispatcher ( id ) {
				document.getElementById( id ).addEventListener( "click", function () {
					event_hub.fire( id + "_click" );
				});
			};

			[
				"feedback_start",
				"feedback_cancel",
				"feedback_finish"
			].forEach( create_click_dispatcher );

		} () );

		( function set_up_runtime_message_handling () {

			var message_handlers = {

				recording_started: function ( message ) {
					
					$( "#feedback_audio_visualizer" ).css( "opacity", "1" );
					$( "#feedback_timer" ).css( "opacity", "1" );
					$( "#feedback_start" ).hide();
					$( "#feedback_buttons" ).show();

				},

				recording_not_started: function ( message ) {

					console.error( "Failed to begin recording", message.error );

				},

				recording_canceled: function ( message ) {

					$( "#feedback_audio_visualizer" ).css( "opacity", "0" );
					$( "#feedback_timer" ).css( "opacity", "0" );
					$( "#feedback_start" ).show();
					$( "#feedback_buttons" ).hide();

				},

				recording_details: function ( message ) {

					$( "#feedback_audio_visualizer" )[0].set_frequency_data( message.recording_details.frequency_data );
					$( "#feedback_timer" )[0].set_time( message.recording_details.time * 1000 );

				},

				got_urls: function ( message ) {

					$( "#feedback_audio_visualizer" ).css( "opacity", "0" );
					$( "#feedback_timer" ).css( "opacity", "0" );
					$( "#feedback_start" ).show();
					$( "#feedback_buttons" ).hide();

					$( "#feedback_thank_you" ).animate({ opacity: 1 });

					setTimeout( function () { $( "#feedback_thank_you" ).animate({ opacity: 0 }); }, 2000 );

				}

			};

			chrome.runtime.onMessage.addListener( function ( message, sender, callback ) {

				if ( message.receiver === "Content" && message.target && message.target.name === "popup_feedback" ) {

					if ( message_handlers[ message.name ] ) {

						message_handlers[ message.name ]( message );

					}

				}

			});

		} () );

		( function init () {

			chrome.runtime.sendMessage( { receiver: "GlobalController", name: "get_last_popup_feedback_recording" }, function ( data ) {

				if ( data && data.state === "recording" ) {
					
					$( "#feedback_audio_visualizer" ).css( "opacity", "1" );
					$( "#feedback_timer" ).css( "opacity", "1" );
					$( "#feedback_start" ).hide();
					$( "#feedback_buttons" ).show();

				} else {

					$( "#feedback_audio_visualizer" ).css( "opacity", "0" );
					$( "#feedback_timer" ).css( "opacity", "0" );
					$( "#feedback_start" ).show();
					$( "#feedback_buttons" ).hide();

				}

			});

		} () );

	}