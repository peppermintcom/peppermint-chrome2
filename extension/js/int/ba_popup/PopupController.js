
	function PopupController ( chrome, $, hub, moment ) {

		var state = {

			recording_data_id: 0,
			recording_data: null,
			recording: false,
			screen_id: "",
			transcript: false,
			urls: null,
			recording_details: null,
			finish_header_id: null,
			last_recording_ts: null

		};

		var view = {

			set_screen: function ( state ) {

				$( ".screen" ).hide();
				$( "#" + state.screen_id ).show();

			},

			set_recording: function ( state ) {

				if ( state.recording ) {

					$( "#history_footer_text" ).show();
					$( "#history_start_recording" ).hide();

				} else {

					$( "#history_footer_text" ).hide();
					$( "#history_start_recording" ).show();

				}

			},

			set_transcript: function ( state ) {

				if ( state.transcript ) {

					$( "#transcription_header" ).show();
					$( "#transcript" )[0].dataset.text = state.transcript;
					
					hub.fire( "text_change", { element: $( "#transcript" )[0] });

				} else {

					$( "#transcription_header" ).hide();
					$( "#transcript" )[0].dataset.text = state.transcript;

					hub.fire( "text_change", { element: $( "#transcript" )[0] });

				}

			},

			set_urls: function ( state ) {

				$( "#popup_finish_url" )[0].href = state.urls.short_url;
				$( "#popup_finish_url" ).text( state.urls.short_url );

				$( "#tumblr_logo" ).attr( "href", "http://www.tumblr.com/share/link?url=" + state.urls.short_url );
				$( "#twitter_logo" ).attr( "href", "https://twitter.com/intent/tweet?text=" + conv.rec_data_to_tweet( state.recording_data ) );
				$( "#facebook_logo" ).attr( "href", "https://www.facebook.com/sharer/sharer.php?u=" + state.urls.short_url );

				if ( state.data_url || state.urls.canonical_url ) {

					$( "#player" )[0].set_url( state.data_url || state.urls.canonical_url );
					$( "#player" )[0].enable();

				} else {

					$( "#player" )[0].disable();

				}

			},

			set_recording_detais: function ( state ) {

				$( "#timer" )[0].set_time( state.recording_details.time * 1000 );
				$( "#audio_visualizer" )[0].set_frequency_data( state.recording_details.frequency_data );

			},

			set_finish_header_id: function ( state ) {

				$( ".finish_header" ).hide();
				$( "#" + state.finish_header_id ).show();

			},

			set_player_enabled: function ( state ) {

				if ( state.player_enabled ) {

					$( "#player" )[0].enable();
					
				} else {

					$( "#player" )[0].disable();
				
				}

			},

			set_error_message: function ( state ) {

				$( "#error_message" ).text( state.error_message );

			},

			set_last_recording_ts: function ( state ) {

				var date_string = conv.ts_to_date_string( state.last_recording_ts );

				$( "#last_recording_date" ).text( date_string );

			}

		};

		var conv = {

			ts_to_date_string: function ( ts ) {

				return moment( ts ).format( 'MM/DD/YY, h:mm A' );

			},

			rec_data_to_tweet: function ( rec_data ) {

				var postfix = "... ";
				var host = "https://peppermint.com/";
				var trans_len = 140 - host.length;
				var transcript = rec_data.transcription_data ? rec_data.transcription_data.text : "";

				if ( transcript.length < 140 - " ".length - host.length ) {

					return transcript + " "  + rec_data.urls.short_url;

				} else {

					return transcript.slice( 0, 140 - host.length - postfix.length ) + postfix + rec_data.urls.short_url;

				}

			}

		};

		var handle = {

			/* hub */

				welcome_start_recording_click: function () {

					state.recording_data_id = Date.now();
					chrome.runtime.sendMessage({ receiver: "GlobalController", name: "start_recording", source: { name: "popup", recording_data_id: state.recording_data_id } })

					chrome.runtime.sendMessage( { 
						receiver: 'GlobalAnalytics', name: 'track_analytic', 
						analytic: { name: 'user_action', val: { 
							name: 'popupcontroller',
							action: 'click',
							element: 'popup_welcome_start_recording' } } 
					});

				},

				history_start_recording_click: function () {

					state.recording_data_id = Date.now();
					chrome.runtime.sendMessage({ receiver: "GlobalController", name: "start_recording", source: { name: "popup", recording_data_id: state.recording_data_id } })

				},

				recording_cancel_button_click: function () {

					chrome.runtime.sendMessage({ receiver: "GlobalController", name: "cancel_recording", source: { name: "popup", recording_data_id: state.recording_data_id } })

					chrome.runtime.sendMessage( { 
						receiver: 'GlobalAnalytics', name: 'track_analytic', 
						analytic: { name: 'user_action', val: { 
							name: 'popupcontroller',
							action: 'click',
							element: 'popup_recording_cancel_button' } } 
					});

				},

				recording_done_button_click: function () {
					
					state.finish_header_id = "finished_header";

					view.set_finish_header_id( state );

					chrome.runtime.sendMessage({ receiver: "GlobalController", name: "finish_recording", source: { name: "popup", recording_data_id: state.recording_data_id } })

					chrome.runtime.sendMessage( { 
						receiver: 'GlobalAnalytics', name: 'track_analytic', 
						analytic: { name: 'user_action', val: { 
							name: 'popupcontroller',
							action: 'click',
							element: 'popup_recording_done_button' } } 
					});

				},

				error_cancel_button_click: function () {

					state.screen_id = "start_screen";

					view.set_screen( state );

					chrome.runtime.sendMessage( { 
						receiver: 'GlobalAnalytics', name: 'track_analytic', 
						analytic: { name: 'user_action', val: { 
							name: 'popupcontroller',
							action: 'click',
							element: 'popup_error_cancel_button' } } 
					});

				},

				error_try_again_button_click: function () {

					state.recording_data_id = Date.now();
					chrome.runtime.sendMessage({ receiver: "GlobalController", name: "start_recording", source: { name: "popup", recording_data_id: state.recording_data_id } })

					chrome.runtime.sendMessage( { 
						receiver: 'GlobalAnalytics', name: 'track_analytic', 
						analytic: { name: 'user_action', val: { 
							name: 'popupcontroller',
							action: 'click',
							element: 'popup_error_try_again_button' } } 
					});

				},

				finish_start_new_button_click: function () {

					state.recording_data_id = Date.now();
					chrome.runtime.sendMessage({ receiver: "GlobalController", name: "start_recording", source: { name: "popup", recording_data_id: state.recording_data_id } })

					chrome.runtime.sendMessage( { 
						receiver: 'GlobalAnalytics', name: 'track_analytic', 
						analytic: { name: 'user_action', val: { 
							name: 'popupcontroller',
							action: 'click',
							element: 'popup_finish_start_new_button' } } 
					});

				},

				delete_transcription_button_click: function () {

					state.transcript = "";

					view.set_transcript( state );

					chrome.runtime.sendMessage({ receiver: "GlobalController", name: "delete_transcription", source: { name: "popup", recording_data_id: state.recording_data_id } })

					chrome.runtime.sendMessage( { 
						receiver: 'GlobalAnalytics', name: 'track_analytic', 
						analytic: { name: 'user_action', val: { 
							name: 'popupcontroller',
							action: 'click',
							element: 'popup_delete_transcription_button' } } 
					});

				},

				copy_to_clipboard_button_click: function () {

					chrome.runtime.sendMessage({
						receiver: "BackgroundHelper",
						name: "copy_to_clipboard",
						text: $( "#popup_finish_url" ).attr( "href" )
					});
					
					alert( "Link Copied to Clipboard!" );

				},

				send_on_gmail_click: function () {

					chrome.storage.local.set({

						send_on_gmail_rec_data_id: state.recording_data_id

					}, function () {

						chrome.tabs.create({

							url: "https://mail.google.com/mail/u/0/#inbox?compose=new"
						
						});

					});

				},

			/**/

			/* runtime */

				runtime_message: function ( message, sender, callback ) {

					if ( message.receiver === "Content" ) {

						if ( handle[ message.name ] && message.recording_data && message.recording_data.source.name === "popup" ) {

							handle[ message.name ]( message, sender, callback );

						}

					}

				},

				recording_started: function ( message ) {

					state.recording = true;
					state.screen_id = "recording_screen";

					view.set_recording( state );
					view.set_screen( state );

				},

				recording_not_started: function ( message ) {

					if ( message.error.name === "PermissionDeniedError" || message.error.name === "NavigatorUserMediaError" || message.error.name === "mediaDeviceFailedDueToShutdown" ) {
					
						chrome.runtime.sendMessage({ receiver: "BackgroundHelper", name: "open_welcome_page" });

					} else {

						if ( message.error.name === "already_recording" ) {

							state.error_message = "You are already recording!";

						} else if ( message.error.name === "" ) {

							state.error_message = "Your microphone is not working. Please check your audio settings and try again.";

						} else {

							state.error_message = "Your microphone is not working. Please check your audio settings and try again.";

						}
							
						state.screen_id = "error_screen";

						view.set_error_message( state );
						view.set_screen( state );

					}

				},

				recording_canceled: function ( message ) {

					state.recording = false;
					state.screen_id = "start_screen";

					view.set_recording( state );
					view.set_screen( state );

				},

				got_urls: function ( message ) {

					state.recording = false;
					state.screen_id = "finish_screen";
					state.transcript = "";
					state.player_enabled = true;
					state.urls = message.recording_data.urls;
					state.recording_data = message.recording_data;

					view.set_urls( state );
					view.set_player_enabled( state );
					view.set_transcript( state );
					view.set_screen( state );
					view.set_recording( state );
					chrome.runtime.sendMessage({ receiver: "BackgroundHelper", name: "copy_to_clipboard", text: message.recording_data.urls.short_url });

				},

				got_audio_data: function ( message ) {

					state.transcript = message.recording_data.transcription_data.text;
					state.player_enabled = true;
					state.data_url = message.recording_data.data_url;
					state.urls = message.recording_data.urls;
					state.recording_data = message.recording_data;

					view.set_transcript( state );
					view.set_player_enabled( state );
					view.set_urls( state );

				},

			/**/

			/* misc */

				start: function () {

					chrome.storage.local.set({ browser_action_popup_has_been_opened: true });

					chrome.runtime.sendMessage({ receiver: "GlobalController", name: "get_last_popup_recording" }, function ( data ) {

						if ( data ) {

							state.recording_data = data;
							state.recording_data_id = data.id;

							if ( data.state === "recording" ) {

								state.recording = true;
								state.screen_id = "recording_screen";

								view.set_recording( state );
								view.set_screen( state );

							} else {

								state.recording = false;
								state.screen_id = "finish_screen";
								state.transcript = data.transcription_data ? data.transcription_data.text : "";
								state.urls = data.urls;
								state.data_url = data.data_url;
								state.finish_header_id = "last_recording_header";
								state.last_recording_ts = data.timestamp;

								view.set_last_recording_ts( state );
								view.set_finish_header_id( state );
								view.set_urls( state );
								view.set_recording( state );
								view.set_screen( state );
								view.set_transcript( state );
								chrome.runtime.sendMessage({ receiver: "BackgroundHelper", name: "copy_to_clipboard", text: data.urls.short_url });

							}

						} else {

							state.recording = false;
							state.screen_id = "start_screen";

							view.set_recording( state );
							view.set_screen( state );

						}

					});

					( function tick () {

						if ( state.recording ) {

							chrome.runtime.sendMessage({ receiver: "GlobalController", name: "get_recording_details" }, function ( recording_details ) {

								state.recording_details = recording_details;

								view.set_recording_detais( state );

							});

						}

						requestAnimationFrame( tick );

					} () )

				}

			/**/

		};

		( function () {

			hub.add({

				welcome_start_recording_click: handle.welcome_start_recording_click,
				history_start_recording_click: handle.history_start_recording_click,
				recording_cancel_button_click: handle.recording_cancel_button_click,
				recording_done_button_click: handle.recording_done_button_click,
				error_cancel_button_click: handle.error_cancel_button_click,
				error_try_again_button_click: handle.error_try_again_button_click,
				finish_start_new_button_click: handle.finish_start_new_button_click,
				delete_transcription_button_click: handle.delete_transcription_button_click,
				copy_to_clipboard_button_click: handle.copy_to_clipboard_button_click,
				send_on_gmail_click: handle.send_on_gmail_click,
				start: handle.start

			});

			function create_click_dispatcher ( id ) {
				document.getElementById( id ).addEventListener( "click", function () {
					hub.fire( id + "_click" );
				});
			};

			[
				"delete_transcription_button",
				"copy_to_clipboard_button",
				"recording_cancel_button",
				"history_start_recording",
				"welcome_start_recording",
				"finish_start_new_button",
				"error_try_again_button",
				"recording_done_button",
				"error_cancel_button",
				"send_on_gmail"
			].forEach( create_click_dispatcher );

			chrome.runtime.onMessage.addListener( handle.runtime_message );

		} () );

	}
