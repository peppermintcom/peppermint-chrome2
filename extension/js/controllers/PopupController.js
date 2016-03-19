
	function PopupController ( chrome, $, event_hub ) {

		var popup_state = {

			page: null,
			page_status: null,
			recording_thread_id: null,
			audio_data_url: null,
			timestamp: null,
			last_recording_blob: null,
			transcript_promise: null,
			transcript: {text : ''},
			recording_url: null

		};

		var private = {

			begin_recording: function () {

				chrome.runtime.sendMessage( { receiver: "GlobalRecorder", name: "start" }, function ( response ) {

					if ( response.started ) {

						private.start_timer();
						
						$( "#timer" )[0].reset();
						$( "#timer" )[0].start();
						$( "#popup" ).show();
						$( "#popup" )[0].set_page("recording_page");
						$( "#popup" )[0].set_page_status("recording");
						popup_state.page = "recording_page";
						popup_state.page_status = "recording";

					} else {

						console.error( "Failed to begin recording", response.error );

						if ( response.error.name === "PermissionDeniedError" ) {

							chrome.tabs.create({
								url: chrome.extension.getURL("/welcome_page/welcome.html")
							});
							console.log("permission denied");

						} else {

							$( "#popup" ).show();
							$( "#popup" )[0].set_page("microphone_error_page");
							popup_state.page = "microphone_error_page";

						}

					}
					

				});

			},

			cancel_recording: function () {

				chrome.runtime.sendMessage( { receiver: "GlobalRecorder", name: "cancel" }, function ( response ) {

					$( "#popup" )[0].set_page("popup_welcome");
					popup_state.page = "popup_welcome";
					popup_state.recording_thread_id = Date.now();

				});

			},

			finish_recording: function () {

				return new Promise( function ( resolve ) {

					private.stop_timer();
					current_recording_thread_id = popup_state.recording_thread_id;

					private.show_uploading_screen();

					chrome.runtime.sendMessage( { receiver: "GlobalUploader", name: "get_urls" }, function ( urls ) {

						console.log( "urls", urls );

						chrome.runtime.sendMessage( { receiver: "GlobalRecorder", name: "finish", recording_data: { urls } }, function ( recording_data ) {

							console.log( "recording_data", recording_data );

						});

					});

				});

			},

			start_timer: function () {
				
				popup_state.timer = setTimeout( function () {

					event_hub.fire( "timeout" );

				}, 5 * 60 * 1000 );

			},

			stop_timer: function () {
				
				clearTimeout( popup_state.timer );

			},

			show_uploading_screen: function () {

				$( "#player" )[0].reset();
				$( "#player" )[0].disable();
				$( "#popup" )[0].set_page_status("uploading");
				$( "#popup" )[0].set_page("uploading_page");
				
				popup_state.page_status = "uploading";
				popup_state.page = "uploading_page";

			},

			init_popup_state: function ( popup_state ) {

				$( "#popup" ).css({ display: "block" }).show();
				$( "#popup" )[0].set_page( popup_state.page || "popup_welcome" );
				if ( popup_state.page_status ) $( "#popup" )[0].set_page_status( popup_state.page_status );

				if ( popup_state.audio_data_url ) {
					$( "#player" )[0].disable();
					setTimeout( function () {
						console.log( "audio_data_url", popup_state.audio_data_url );
						$( "#player" )[0].set_url( popup_state.audio_data_url );
						$( "#player" )[0].enable();
					}, 100 );
				} else {
					$( "#player" )[0].disable();
				}

				if ( popup_state.recording_url ) {

					private.copy_to_clipboard( popup_state.recording_url );
					$( "#popup" )[0].set_url( popup_state.recording_url );

				}

				if ( popup_state.timestamp ) {

					$( "#timer" )[0].set_time( Date.now() - popup_state.timestamp );
					$( "#timer" )[0].continue();

				}

				if ( popup_state.progress ) {
					document.dispatchEvent( new CustomEvent( "upload_progress", {
						detail: {
							progress: popup_state.progress
						}
					}));
				}

				$( "#popup" )[0].set_transcript( popup_state.transcript.text );

			}

		};

		chrome.runtime.onMessage.addListener( function ( data ) {

			if ( data.name === "recording_data_uploaded" ) {

				console.log( data );

				$.extend( popup_state, {

					page: "popup_finish",
					page_status: "finished",
					audio_data_url: data.recording_data.urls.long,
					transcript: data.recording_data.transcription_data,
					recording_url: data.recording_data.urls.short_url

				});

			}

		});

		event_hub.add({

			popup_welcome_start_recording_click: function () {

				private.begin_recording();

			},

			popup_recording_cancel_button_click: function () {

				private.cancel_recording();

			},

			popup_recording_done_button_click: function () {
				
				private.finish_recording();

			},

			timeout: function () {

				current_recording_thread_id = popup_state.recording_thread_id;

				private.show_uploading_screen();

				popup_state.transcript_promise =  transcription_manager.finish();

				recorder.finish()
				.then( function ( blob ) {
					
					private.process_recording_blob( blob, current_recording_thread_id );

				});

				alert("You have reached the maximum recording length of 5 minutes");

			},

			tick: function () {

				popup_state.timestamp = $( "#timer" )[0].get_timestamp();

			},

			popup_error_cancel_button_click: function () {
				$( "#popup" )[0].set_page("popup_welcome");
				popup_state.page = "popup_welcome";
				popup_state.recording_thread_id = Date.now();
			},

			popup_error_try_again_button_click: function () {

				private.begin_recording();

			},

			popup_restart_upload_click: function () {

				current_recording_thread_id = popup_state.recording_thread_id;

				private.show_uploading_screen();

				private.process_recording_blob( popup_state.last_recording_blob, current_recording_thread_id );

			},

			popup_finish_start_new_button_click: function () {

				private.begin_recording();

			},

			popup_cancel_uploading_click: function () {

				$( "#player" )[0].reset();
				$( "#popup" )[0].set_page("popup_welcome");
				popup_state.page = "popup_welcome";
				popup_state.recording_thread_id = Date.now();
			
			},

			popup_delete_transcription_button_click: function () {

				$( "#popup" )[ 0 ].set_transcript( false );
				popup_state.transcript = { text: "" };
				uploader.delete_transcription();

			}

		});

		( function constructor () {

			chrome.storage.local.get( null, function ( items ) {

				private.init_popup_state( items.popup_state );

			});

			( function tick () {

				chrome.runtime.sendMessage( { receiver: "GlobalRecorder", name: "get_frequency_data" }, function ( frequency_data ) {

					if ( frequency_data ) {

						$( "#audio_visualizer" )[0].set_frequency_data( frequency_data );
						
					}

				});

				requestAnimationFrame( tick );

			} () )


		} () );

	}