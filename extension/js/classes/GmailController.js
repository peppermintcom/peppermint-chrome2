
	function GmailController ( recorder, uploader, event_hub, chrome, letter_manager, $, tooltip, tooltip_top ) {

		var state = {

			recording_id: undefined,
			compose_button_id: undefined,
			last_recording_blob: undefined,
			recording: false,
			uploading: false,
			timer: null

		};

		var private = {

			start_timer: function () {

				clearTimeout( state.timer );

				state.timer = setTimeout( function () {

					event_hub.fire( "timeout" );

				}, 5 * 60 * 1000 );

			},

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

				chrome.storage.local.set({ compose_button_has_been_used: true });
				tooltip.stop();
				$( tooltip ).hide();

				recorder.start()
				.then( function () {

					private.start_timer();

					$("#peppermint_timer")[0].reset();
					$("#peppermint_timer")[0].start();
					$('#peppermint_popup').show();
					$('#peppermint_popup')[0].set_page("recording_page");
					$('#peppermint_popup')[0].set_page_status("recording");

					state.recording = true;
					state.recording_id = Date.now();

				})
				.catch( function ( error ) {

					if ( error.name === "PermissionDeniedError" ) {
						
						console.log("permission denied");
						chrome.runtime.sendMessage( "open_welcome_page" );
						
					} else {
						
						console.log( error );
						$('#peppermint_popup').show();
						$('#peppermint_popup')[0].set_page("microphone_error_page");
						
					}

				});

			},

			show_uploading_screen: function () {

				$("#peppermint_mini_popup_player")[0].reset();
				$("#peppermint_mini_popup_player")[0].disable();
				$("#peppermint_popup").hide();
				$("#peppermint_mini_popup")[0].reset();
				$("#peppermint_mini_popup")[0].set_state("uploading");
				$("#peppermint_mini_popup").show();

			},

			process_recording_blob: function ( blob ) {

				var recording_id = Date.now();

				state.recording_id = recording_id;
				state.last_recording_blob = blob;

				recorder.blob_to_data_url( blob )
				.then( function ( data_url ) {

					$("#peppermint_mini_popup_player")[0].enable();
					$("#peppermint_mini_popup_player")[0].set_url( data_url );

				});

				recorder.blob_to_buffer( blob )
				.then( function ( buffer ) {

					uploader.upload_buffer( buffer )
					.then( function ( url ) {

						if ( state.recording_id === recording_id ) {

							state.audio_url = url;

							$("#peppermint_mini_popup").hide();

							$( document ).one( "click", function () {
								private.copy_to_clipboard( url );
							});

							console.log( "uploaded:", url );
							$("#peppermint_mini_popup_player")[0].pause();
							letter_manager.add_link( state.audio_url, state.compose_button_id );
							state.compose_button_id = undefined;

						} else {

							console.log( "aborted recording url:", url );

						}

					})
					.catch( function ( err ) {

						console.error( err );
						$("#peppermint_mini_popup")[0].set_state("uploading_failed");

					});

				});
			},

			clear_the_state: function () {

				clearTimeout( state.timer );

				state = {

					recording_id: undefined,
					compose_button_id: undefined,
					last_recording_blob: undefined,
					recording: false,
					uploading: false

				};

			},

			finish_recording: function () {

				clearTimeout( state.timer );

				recorder.finish()
				.then( function ( blob ) {

					state.recording = false;
					private.process_recording_blob( blob );

				});

			}

		};

		event_hub.add({

			"timeout": function () {
				
				private.show_uploading_screen();
				private.finish_recording();

				alert("You have reached the maximum recording length of 5 minutes");
			
			},

			"tooltip_close_button_click": function () {

				tooltip.stop();
				$( tooltip_top ).hide();
				chrome.storage.local.set({ compose_button_has_been_used: true });

			},

			popup_error_try_again_button_click: function () {

				if ( !state.recording && !state.uploading ) {

					private.begin_recording();

				}
			
			},

			popup_recording_done_button_click: function () {

				private.show_uploading_screen();
				private.finish_recording();

			},

			popup_error_cancel_button_click: function () {

				$("#peppermint_popup").hide();
				private.clear_the_state();

			},

			popup_recording_cancel_button_click: function () {

				recorder.cancel();
				$('#peppermint_popup').hide();
				private.clear_the_state();

			},

			mini_popup_try_again_click: function () {

				private.show_uploading_screen();
				
				private.process_recording_blob( state.last_recording_blob );

			},

			mini_popup_cancel_click: function () {

				$("#peppermint_mini_popup").hide();
				$("#peppermint_mini_popup_player")[0].pause();
				private.clear_the_state();

			},

			peppermint_compose_button_click: function ( data ) {
debugger;
				if ( !state.recording && !state.uploading ) {

					state.compose_button_id = data.id;

					private.begin_recording();

				}

			},

			peppermint_reply_button_click: function () {

				if ( $(".ams")[0] ) $(".ams")[0].click();
				
				var interval = setInterval( function () {
					if ( $( '#peppermint_compose_button' ).length > 0 ) {

						$( '#peppermint_compose_button' ).click();
						clearInterval( interval );

					}
				}, 20 );

			}

		});

		( function constructor () {

			chrome.storage.local.get( null, function ( items ) {
			
				if ( ! items[ 'compose_button_has_been_used' ] ) {

					tooltip.stick_to( "#peppermint_compose_button" );

					$( tooltip_top ).show();
					
				}
			
			});

		} () );

	}

