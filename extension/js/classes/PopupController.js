
	function PopupController ( recorder, uploader, $, event_hub, transcription_manager ) {

		var popup_state = {

			page: null,
			page_status: null,
			recording_thread_id: null,
			audio_data_url: null,
			timestamp: null,
			last_recording_blob: null,
			pop_doc: null,
			transcript_promise: null,
			transcript: {text : ''}

		};

		var private = {

			copy_to_clipboard: function ( text ) {

				    var doc = document,
				        temp = doc.createElement("textarea"),
				        initScrollTop = doc.body.scrollTop;
				    doc.body.insertBefore(temp, doc.body.firstChild);
				    temp.value = text;
				    temp.focus();
				    doc.execCommand("SelectAll");
				    doc.execCommand("Copy", false, null);
				    temp.blur();
				    doc.body.scrollTop = initScrollTop;
				    doc.body.removeChild(temp);
			
			},

			begin_recording: function () {

				popup_state.recording_thread_id = Date.now();

				recorder.start()
				.then( function () {

					private.start_timer();
					
					transcription_manager.start();

					$( "#timer", popup_state.pop_doc )[0].reset();
					$( "#timer", popup_state.pop_doc )[0].start();
					$( "#popup", popup_state.pop_doc ).show();
					$( "#popup", popup_state.pop_doc )[0].set_page("recording_page");
					$( "#popup", popup_state.pop_doc )[0].set_page_status("recording");
					popup_state.page = "recording_page";
					popup_state.page_status = "recording";

				})
				.catch( function ( error ) {

					console.error( "Failed to begin recording", error );

					if ( error.name === "PermissionDeniedError" ) {

						chrome.tabs.create({
							url: chrome.extension.getURL("/welcome_page/welcome.html")
						});
						console.log("permission denied");

					} else {

						$( "#popup", popup_state.pop_doc ).show();
						$( "#popup", popup_state.pop_doc )[0].set_page("microphone_error_page");
						popup_state.page = "microphone_error_page";

					}

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

			process_recording_blob: function ( blob, current_recording_thread_id ) {

				popup_state.last_recording_blob = blob; 

				recorder.blob_to_data_url( blob )
				.then( function ( data_url ) {

					console.log( data_url );
					
					$( "#player", popup_state.pop_doc )[0].enable();
					$( "#player", popup_state.pop_doc )[0].set_url( data_url );

					popup_state.audio_data_url = URL.createObjectURL( blob );

				});

				recorder.blob_to_buffer( blob )
				.then( function ( buffer ) {

					uploader.upload_buffer( buffer )
					.then( function ( urls ) {

						popup_state.transcript_promise
						.then( function ( transcript ) {

							if ( current_recording_thread_id === popup_state.recording_thread_id ) {

								console.log( "uploaded:", urls.short );

								if ( transcript.text ) {
									private.copy_to_clipboard( urls.short + " " + transcript.text );
								} else {
									private.copy_to_clipboard( urls.short );
								}

								popup_state.transcript = transcript;
								popup_state.recording_url = urls.short;
								popup_state.page_status = "finished";
								popup_state.page = "popup_finish";

								$( "#popup", popup_state.pop_doc )[0].set_url( urls.short );
								$( "#popup", popup_state.pop_doc )[0].set_transcript( transcript.text );
								$( "#popup", popup_state.pop_doc )[0].set_page("popup_finish");
								$( "#popup", popup_state.pop_doc )[0].set_page_status("finished");
								
								uploader.upload_transcript( transcript ).then(function() {
									console.log("Transcription Uploaded Successfully");
									}, function () {
									console.log("Transcription Upload Failed!");
								});
								
							} else {

								console.log( "aborted recording url:", url );

							}

						})

					})
					.catch( function ( err ) {
						
						console.error( err );

						popup_state.page = "uploading_failed_page";
						$( "#popup", popup_state.pop_doc )[0].set_page("uploading_failed_page");
					
					});

				});

			},

			show_uploading_screen: function ( pop_doc ) {

				if ( pop_doc && pop_doc.defaultView ) {

					$( "#player", pop_doc )[0].reset();
					$( "#player", pop_doc )[0].disable();
					$( "#popup", pop_doc )[0].set_page_status("uploading");
					$( "#popup", pop_doc )[0].set_page("uploading_page");
				
				} else {
					console.log("popup is closed");
				}

				popup_state.page_status = "uploading";
				popup_state.page = "uploading_page";

			}

		};

		var public = {

			init_popup_state: function ( pop_doc ) {

				popup_state.pop_doc = pop_doc;

				$( "#popup", pop_doc ).css({ display: "block" }).show();
				$( "#popup", pop_doc )[0].set_page( popup_state.page || "popup_welcome" );
				if ( popup_state.page_status ) $( "#popup", pop_doc )[0].set_page_status( popup_state.page_status );

				if ( popup_state.audio_data_url ) {
					$( "#player", pop_doc )[0].disable();
					setTimeout( function () {
						console.log( "audio_data_url", popup_state.audio_data_url );
						$( "#player", pop_doc )[0].set_url( popup_state.audio_data_url );
						$( "#player", pop_doc )[0].enable();
					}, 100 );
				} else {
					$( "#player", pop_doc )[0].disable();
				}

				if ( popup_state.recording_url ) {

					private.copy_to_clipboard( popup_state.recording_url + " " + popup_state.transcript.text );
					$( "#popup", pop_doc )[0].set_url( popup_state.recording_url );

				}

				if ( popup_state.timestamp ) {

					$( "#timer", pop_doc )[0].set_time( Date.now() - popup_state.timestamp );
					$( "#timer", pop_doc )[0].continue();

				}

				if ( popup_state.progress ) {
					pop_doc.dispatchEvent( new CustomEvent( "upload_progress", {
						detail: {
							progress: popup_state.progress
						}
					}));
				}

				$( "#popup", pop_doc )[0].set_transcript( popup_state.transcript.text );

			},

			register_handlers: function ( pop_doc, event_hub ) {
				
				event_hub.add({

					tick: function () {

						popup_state.timestamp = $( "#timer", popup_state.pop_doc )[0].get_timestamp();

					},

					popup_welcome_start_recording_click: function () {

						private.begin_recording();

					},

					popup_error_cancel_button_click: function () {
						$( "#popup", popup_state.pop_doc )[0].set_page("popup_welcome");
						popup_state.page = "popup_welcome";
						popup_state.recording_thread_id = Date.now();
					},

					popup_error_try_again_button_click: function () {

						private.begin_recording();

					},

					popup_recording_cancel_button_click: function () {

						private.stop_timer();
						recorder.cancel();
						transcription_manager.cancel();
						
						$( "#popup", popup_state.pop_doc )[0].set_page("popup_welcome");
						popup_state.page = "popup_welcome";
						popup_state.recording_thread_id = Date.now();

					},

					popup_recording_done_button_click: function () {
						
						private.stop_timer();
						current_recording_thread_id = popup_state.recording_thread_id;

						private.show_uploading_screen( popup_state.pop_doc );

						popup_state.transcript_promise =  transcription_manager.finish();

						recorder.finish()
						.then( function ( blob ) {

							private.process_recording_blob( blob, current_recording_thread_id );

						});

					},

					popup_restart_upload_click: function () {

						current_recording_thread_id = popup_state.recording_thread_id;

						private.show_uploading_screen( popup_state.pop_doc );

						private.process_recording_blob( popup_state.last_recording_blob, current_recording_thread_id );

					},

					popup_finish_start_new_button_click: function () {

						private.begin_recording();

					},

					popup_cancel_uploading_click: function () {

						$( "#player", popup_state.pop_doc )[0].reset();
						$( "#popup", popup_state.pop_doc )[0].set_page("popup_welcome");
						popup_state.page = "popup_welcome";
						popup_state.recording_thread_id = Date.now();
					
					}

				})

			}

		};

		$( document ).on( "upload_progress",  function ( event ) {
		
			popup_state.pop_doc.dispatchEvent( new CustomEvent( "upload_progress", {
				detail: {
					progress: event.originalEvent.detail.progress
				}
			}));
		
			popup_state.progress = event.originalEvent.detail.progress;
		
		});

		event_hub.add({

			"timeout": function () {

				current_recording_thread_id = popup_state.recording_thread_id;

				private.show_uploading_screen( popup_state.pop_doc );

				popup_state.transcript_promise =  transcription_manager.finish();

				recorder.finish()
				.then( function ( blob ) {
					
					private.process_recording_blob( blob, current_recording_thread_id );

				});

				alert("You have reached the maximum recording length of 5 minutes");

			}

		});

		return public;

	}