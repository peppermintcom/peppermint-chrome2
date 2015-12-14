
	( function ( $ ) {
		
		var State = function () {

			var private = {

			};

			var public = {

				set_compose_button_id: function ( id ) {
					private.compose_button_id = id;
				},
				get_compose_button_id: function () {
					return private.compose_button_id;
				},
				get_audio_url: function () {
					return private.audio_url;
				},
				set_audio_url: function ( url ) {
					private.audio_url = url;
				}

			};

			return public;

		};

		var RECORDING_TIMEOUT_LIMIT = 5 * 60 * 1000;
		
		var g_state = new State();
		var timer;

		function start_timer () {
			
			console.log("start_timer");
			
			// start audio transcription 
			document.dispatchEvent(new CustomEvent('start_audio_transcription', { bubbles: true }));
			
			timer = setTimeout( function () {
				document.dispatchEvent(new CustomEvent("timeout"));
			}, RECORDING_TIMEOUT_LIMIT );
		
		}

		function stop_timer () {
			
			console.log("stop_timer");
			
			// stop audio transcription
			document.dispatchEvent(new CustomEvent('stop_audio_transcription', { bubbles: true })); 
			
			clearTimeout( timer );
		}

		function copy_to_clipboard ( text ) {
			    
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
	
		}

		function begin_recording () {

			$( 'v-recorder' )[0].start()
			.then( function () {

				start_timer();
				$("v-timer")[0].reset();
				$("v-timer")[0].start();
				$('#popup').show();
				$('#popup')[0].center();
				$('#popup')[0].set_page("recording_page");
				$('#popup')[0].set_page_status("recording");

			})
			.catch( function ( error ) {

				if ( error.name === "PermissionDeniedError" ) {

					console.log("permission denied");
					document.dispatchEvent( new CustomEvent( "open_welcome_page" ) );


				} else {

					$('#popup').show();
					$('#popup')[0].set_page("microphone_error_page");

				}

			});

		}

		function show_uploading_screen () {

			$("#mini_popup_player")[0].reset();
			$("#mini_popup_player")[0].disable();
			$("#popup").hide();
			$("#mini_popup")[0].reset();
			$("#mini_popup")[0].set_state("uploading");
			$("#mini_popup").show();

		}

		function process_recording_blob ( blob ) {

			var recording_id = Date.now();
			g_state.recording_id = recording_id;

			g_state.last_recording_blob = blob;

			$( 'v-recorder' )[0].blob_to_data_url( blob )
			.then( function ( data_url ) {

				$("#mini_popup_player")[0].enable();
				$("#mini_popup_player")[0].set_url( data_url );

			});

			$( 'v-recorder' )[0].blob_to_buffer( blob )
			.then( function ( buffer ) {

				$( 'v-uploader' )[0].uploader.upload_buffer( buffer )

				.then( function ( url ) {
					if ( g_state.recording_id === recording_id ) {

						g_state.set_audio_url( url );
						$("#mini_popup").hide();

						$( document ).one( "click", function () {
							copy_to_clipboard( url );
						});

						console.log( "uploaded:", url );

						$("#mini_popup_player")[0].pause();

						$("#letter_manager")[0].add_link( g_state.get_audio_url(), g_state.get_compose_button_id() );

						g_state.set_compose_button_id( undefined );

					} else {

						console.log( "aborted recording url:", url );

					}
				})
				.catch( function () {
					$("#mini_popup")[0].set_state("uploading_failed");
				});

			});

		}

		$( document ).on( "compose_button_click", function ( event ) {

			console.log("compose_button_click");
			
			if ( g_state.get_compose_button_id() ) return;

			g_state.set_compose_button_id( event.target.dataset.id );

			begin_recording();

		});

		$( document ).on( "reply_button_click", function () {

			$(".ams:contains('Reply')").click();
			setTimeout( function () {
				$('#v_compose_button').click();
			}, 100 );

		});

		$( document ).on( "error_cancel_button_click", "#popup", function () {

			$("#popup").hide();
			g_state.set_compose_button_id( undefined );

		});

		$( document ).on( "error_try_again_button_click", "#popup", function () {

			begin_recording();

		});

		$( document ).on( "recording_cancel_button_click", "#popup", function () {

			stop_timer();
			$( 'v-recorder' )[0].cancel();
			$('#popup').hide();
			g_state.set_compose_button_id( undefined );

		});

		$( document ).on( "timeout", function () {

			stop_timer();
			
			show_uploading_screen();
				
			$( 'v-recorder' )[0].finish()
			.then( function ( blob ) {
				process_recording_blob( blob );
			});

			alert("You have reached the maximum recording length of 5 minutes");

		});

		$( document ).on( "recording_done_button_click", "#popup", function () {

			stop_timer();

			show_uploading_screen();
				
			$( 'v-recorder' )[0].finish()
			.then( function ( blob ) {
				process_recording_blob( blob );
			});

		});

		$( document ).on( "cancel_click", "#mini_popup", function () {

			$("#mini_popup").hide();

			$("#mini_popup_player")[0].pause();
			g_state.set_recording_id( undefined );
			g_state.set_compose_button_id( undefined );

		});

		$( document ).on( "try_again_click", "#mini_popup", function () {

			stop_timer();

			show_uploading_screen();
			
			process_recording_blob( g_state.last_recording_blob );

		});

	} ( $pmjQuery ) );
