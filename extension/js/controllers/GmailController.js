
	function GmailController ( chrome, $, event_hub, letter_manager ) {

		var state = {

			compose_button_id: undefined,
			recording: false,

		};

		var private = {

		};

		( function set_up_dom_event_handling () {

			event_hub.add({

<<<<<<< HEAD
					} else {
						
						Raven.log( 'GmailController	', 'begin_recording', 'Failed to begin recording', response.error );
=======
				peppermint_compose_button_click: function ( data ) {
>>>>>>> ba_popup_tabs

					if ( !state.recording ) {

						chrome.storage.local.set({ compose_button_has_been_used: true });

						state.compose_button_id = data.id;

						chrome.runtime.sendMessage({ receiver: "GlobalController", name: "start_recording", source: { name: "gmail" } })

					}

				},

				popup_recording_cancel_button_click: function () {

					chrome.runtime.sendMessage({ receiver: "GlobalController", name: "cancel_recording", source: { name: "gmail" } })

				},

				popup_recording_done_button_click: function () {

					chrome.runtime.sendMessage({ receiver: "GlobalController", name: "finish_recording", source: { name: "gmail" } })

				},

				popup_error_try_again_button_click: function () {

					if ( !state.recording ) {

						chrome.runtime.sendMessage({ receiver: "GlobalController", name: "start_recording", source: { name: "gmail" } })

					}
				
				},

				popup_error_cancel_button_click: function () {

					$("#peppermint_popup").hide();

				},

				peppermint_reply_button_click: function () {

					if ( $(".ams")[0] ) $(".ams")[0].click();
					
					var interval = setInterval( function () {
						if ( $( '#peppermint_compose_button' ).length > 0 ) {

							$( '#peppermint_compose_button' ).click();
							clearInterval( interval );

						}
					}, 20 );

					chrome.runtime.sendMessage( { 
						receiver: 'GlobalAnalytics', name: 'track_analytic', 
						analytic: { name: 'user_action', val: { 
							name: 'gmailcontroller',
							action: 'click',
							element: 'peppermint_compose_button',
							id: state.compose_button_id } } 
					});

				}

			});

			$( window ).unload( function () {

<<<<<<< HEAD
				chrome.runtime.sendMessage( { 
					receiver: 'GlobalAnalytics', name: 'track_analytic', 
					analytic: { name: 'user_action', val: { 
						name: 'gmailcontroller',
						action: 'click',
						element: 'popup_recording_cancel_button' } } 
				});

			},
=======
				if ( state.recording ) private.cancel_recording();
>>>>>>> ba_popup_tabs

			});

		} () );

<<<<<<< HEAD
				chrome.runtime.sendMessage( { 
					receiver: 'GlobalAnalytics', name: 'track_analytic', 
					analytic: { name: 'user_action', val: { 
						name: 'gmailcontroller',
						action: 'click',
						element: 'popup_recording_done_button' } } 
				});

			},
=======
		( function set_up_runtime_message_handling () {
>>>>>>> ba_popup_tabs

			var message_handlers = {

				recording_started: function ( message ) {

					$('#peppermint_popup').show();
					$('#peppermint_popup')[0].set_page("recording_page");
					$('#peppermint_popup')[0].set_page_status("recording");

<<<<<<< HEAD
				}

				chrome.runtime.sendMessage( { 
					receiver: 'GlobalAnalytics', name: 'track_analytic', 
					analytic: { name: 'user_action', val: { 
						name: 'gmailcontroller',
						action: 'click',
						element: 'popup_error_try_again_button' } } 
				});
			
			},
=======
					state.recording = true;
>>>>>>> ba_popup_tabs

				},

				recording_not_started: function ( message ) {

<<<<<<< HEAD
				chrome.runtime.sendMessage( { 
					receiver: 'GlobalAnalytics', name: 'track_analytic', 
					analytic: { name: 'user_action', val: { 
						name: 'gmailcontroller',
						action: 'click',
						element: 'popup_error_cancel_button' } } 
				});

			},
=======
					console.error( "Failed to begin recording", message.error );
>>>>>>> ba_popup_tabs

					if ( message.error.name === "PermissionDeniedError" || message.error.name === "NavigatorUserMediaError" ) {
						
						chrome.runtime.sendMessage({ receiver: "BackgroundHelper", name: "open_welcome_page" });
						
					} else if ( message.error.name === "already_recording" ) {

						$('#peppermint_popup')[0].set_error_message( "You are already recording!" );
						$('#peppermint_popup')[0].set_page("microphone_error_page");
						$('#peppermint_popup').show();

					} else {

<<<<<<< HEAD
						chrome.runtime.sendMessage( { 
							receiver: 'GlobalAnalytics', name: 'track_analytic', 
							analytic: { name: 'user_action', val: { 
								name: 'gmailcontroller',
								action: 'click',
								element: 'peppermint_reply_button' } } 
						});

=======
						$('#peppermint_popup')[0].set_error_message( "Your microphone is not working. Please check your audio settings and try again." );
						$('#peppermint_popup')[0].set_page("microphone_error_page");
						$('#peppermint_popup').show();
						
>>>>>>> ba_popup_tabs
					}

				},

				recording_canceled: function ( message ) {

					state.recording = false;
					$('#peppermint_popup').hide();

				},

				recording_details: function ( message ) {

					$( "#audio_visualizer" )[0].set_frequency_data( message.recording_details.frequency_data );
					$( "#peppermint_timer" )[0].set_time( message.recording_details.time * 1000 );

				},

				got_urls: function ( message ) {

					$( "#peppermint_popup" ).hide();
					letter_manager.add_link( state.compose_button_id, message.recording_data );  

				},

				got_audio_data: function ( message ) {

					state.recording = false;
					letter_manager.add_recording_data_to_a_letter( message.recording_data );

				}

			};

			chrome.runtime.onMessage.addListener( function ( message, sender, callback ) {

				if ( message.receiver === "Content" ) {

					if ( message_handlers[ message.name ] ) {

						message_handlers[ message.name ]( message, sender, callback );

					}

				}

			});

		} () );

	}

