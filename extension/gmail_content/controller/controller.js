
	( function ( $ ) {
		
		var State = function () {

			var private = {

			};

			var public = {

				set_recording_id: function ( recording_id ) {
					private.recording_id = recording_id;
				},
				get_recording_id: function () {
					return private.recording_id;
				},
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

		var g_state = new State();
		var timer;
		
		var transcriptionStartTime = 0;
		var transcriptionStopTime = 0;
		
		/**
		 * Whether or not the logger should send data to the console
		 */
		var transcriptionDebug = true;

		/** 
		 * This is the final copy of the transcribed audio content
		 */
		var peppermintFinalAudioTranscript = '';

		/**
		 * Are we currently allowed to transcribe audio data to text?
		 */
		var recognizing = false;

		/**
		 * This is the language that will be used for the transcription
		 * 
		 * This attribute will set the language of the recognition for the request, using a valid BCP 47 language tag.
		 */
		var transcriptionLanguage = window.navigator.language;

		// instantiate the recognition object and set up event handlers
		var peppermintRecognition = new webkitSpeechRecognition();

		/**
		 * When the continuous attribute is set to false, 
		 * the user agent must return no more than one final result in response to starting recognition, 
		 * for example a single turn pattern of interaction. When the continuous attribute is set to true, 
		 * the user agent must return zero or more final results representing multiple consecutive recognitions 
		 * in response to starting recognition, for example a dictation. 
		 * 
		 * The default value must be false
		 */
		peppermintRecognition.continuous = true;    

		/**
		 * Controls whether interim results are returned. 
		 * When set to true, interim results should be returned. 
		 * When set to false, interim results must NOT be returned. 
		 * The default value must be false.
		 *  
		 * Note, this attribute setting does not affect final results.
		 */
		peppermintRecognition.interimResults = false;

		/**
		 * Logger
		 */
		function transcriptionLogger(message) {
			if (!transcriptionDebug) {
				return false;
			}
			
			console.log(message + "\n");
			
			return true;
		}

		/**
		 * Fired when the recognition service has started to listen to the audio with the intention of recognizing
		 */
		peppermintRecognition.onstart = function() {
			recognizing = true;
			transcriptionLogger("Starting Speech Recognition for Audio Transcription for Language " + transcriptionLanguage);
		};

		/**
		 * Fired when the service has disconnected. 
		 * The event must always be generated when the session ends no matter the reason for the end.
		 */
		peppermintRecognition.onend = function() {
		    recognizing = false;
		    transcriptionLogger("Speech Recognition for Audio Transcription has ended for Language " + transcriptionLanguage);
		    transcriptionLogger(peppermintFinalAudioTranscript);
		};

		/**
		 * Fired when a speech recognition error occurs. 
		 * The event must use the SpeechRecognitionError interface.
		 */
		peppermintRecognition.onerror = function(event) {
			var error_type = event.error;
			transcriptionLogger("Error Type is: " + error_type);
		};

		/**
		 * Fired when the speech recognizer returns a final result 
		 * with no recognition hypothesis that meet or exceed the confidence threshold. 
		 * The event must use the SpeechRecognitionEvent interface. 
		 * The results attribute in the event may contain 
		 * speech recognition results that are below the confidence threshold or may be null.
		 */
		peppermintRecognition.onnomatch = function(event) {
			transcriptionLogger("No-Match Error: no recognition hypothesis that met or exceeded the confidence threshold");
		};

		/**
		 * Fired when the speech recognizer returns a result. 
		 * The event must use the SpeechRecognitionEvent interface.
		 */
		peppermintRecognition.onresult = function(event) {
			
		    if (typeof(event.results) == 'undefined') {
		      peppermintRecognition.onend = null;
		      peppermintRecognition.stop();
		      return;
		    }
		    
		    for (var i = event.resultIndex; i < event.results.length; ++i) {
		      if (event.results[i].isFinal) {
		    	  peppermintFinalAudioTranscript += event.results[i][0].transcript;
		      }
		    }
		    
		    var transcriptionDuration = transcriptionStopTime - transcriptionStartTime;
		    var eventDetails = {transcript : peppermintFinalAudioTranscript, duration : transcriptionDuration};
		    
		    
		    document.dispatchEvent(new CustomEvent('update_audio_transcription', { bubbles: true, detail : eventDetails }));
		};

		/**
		 * Initiates the speech recognition
		 */
		function startSpeechRecognition()
		{
			transcriptionLanguage = window.navigator.language;
			peppermintFinalAudioTranscript = "";
			peppermintRecognition.lang = transcriptionLanguage;
			peppermintRecognition.start();
		}

		/**
		 * Stops the speech recognition
		 */
		function stopSpeechRecognition()
		{
			peppermintRecognition.stop();
		}

		console.log("transcription logic is loaded");

		document.addEventListener("start_audio_transcription", function(event){
			console.log("start_audio_transcription received");
			startSpeechRecognition();
		});

		document.addEventListener("stop_audio_transcription", function(event){
			console.log("stop_audio_transcription received");
			stopSpeechRecognition();
		});

		function start_timer() {
			
			console.log("start_timer");
			
			// start audio transcription 
			document.dispatchEvent(new CustomEvent('start_audio_transcription', { bubbles: true }));
			
			transcriptionStartTime = Date.now();
			
			timer = setTimeout( function () {
				document.dispatchEvent( new CustomEvent( "timeout" ) );
			}, 1000 * 60 * 5 );
		}

		function stop_timer() {
			
			console.log("stop_timer");
			
			// stop audio transcription
			document.dispatchEvent(new CustomEvent('stop_audio_transcription', { bubbles: true })); 
			
			transcriptionStopTime = Date.now();
			
			var transcriptionDuration = transcriptionStopTime - transcriptionStartTime;
			
		    var eventDetails = {duration : transcriptionDuration};
		    
		    document.dispatchEvent(new CustomEvent('store_audio_duration', { bubbles: true, detail: eventDetails }));
			
			clearTimeout( timer );
		}

		$( document ).on( "compose_button_click", function ( event ) {

			console.log("compose_button_click");
			
			if ( g_state.get_compose_button_id() ) return;

			g_state.set_compose_button_id( event.target.dataset["id"] );

			$( 'v-recorder' )[0].start()
			.then( function () {

				start_timer();
				$("v-timer")[0].reset();
				$("v-timer")[0].start();
				$('#popup').show();
				$('#popup')[0].set_page("recording_page");
				$('#popup')[0].set_page_status("recording");

			})
			.catch( function ( error ) {

				if ( error.name === "PermissionDeniedError" ) {

					chrome.tabs.create({
						url: chrome.extension.getURL("/welcome_page/welcome.html")
					});
					console.log("permission denied");

				} else {

					$('#popup').show();
					$('#popup')[0].set_page("microphone_error_page");

				}

			});

		});

		$( document ).on( "reply_button_click", function () {

			$(".ams:contains('Reply')").click();
			setTimeout( function () {
				$('#v_compose_button').click()
			}, 100 );

		});

		$( document ).on( "error_cancel_button_click", "#popup", function () {

			$("#popup").hide();
			g_state.set_compose_button_id( undefined );

		});

		$( document ).on( "error_try_again_button_click", "#popup", function () {


			$( 'v-recorder' )[0].start()
			.then( function () {

				start_timer();
				$("v-timer")[0].reset();
				$("v-timer")[0].start();
				$('#popup').show();
				$('#popup')[0].set_page("recording_page");
				$('#popup')[0].set_page_status("recording");

			})
			.catch( function ( error ) {

				if ( error.name === "PermissionDeniedError" ) {

					chrome.tabs.create({
						url: chrome.extension.getURL("/welcome_page/welcome.html")
					});
					console.log("permission denied");

				} else {

					$('#popup').show();
					$('#popup')[0].set_page("microphone_error_page");

				}

			});

		});

		$( document ).on( "recording_cancel_button_click", "#popup", function () {

			stop_timer();
			$( 'v-recorder' )[0].cancel();
			$('#popup').hide();
			g_state.set_compose_button_id( undefined );

		});

		$( document ).on( "timeout", function () {

			var state = new State();
			var timestamp = Date.now();
			g_state.set_recording_id(  timestamp );
			state.set_recording_id( timestamp );

			$("#mini_popup_player")[0].reset();
			$("#mini_popup_player")[0].disable();
			$("#popup").hide();
			$("#mini_popup")[0].reset();
			$("#mini_popup")[0].set_state("uploading");
			$("#mini_popup").show();
				
			$( 'v-recorder' )[0].finish()
			.then( function ( blob ) {

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
						if ( g_state.get_recording_id() === state.get_recording_id() ) {

							g_state.set_audio_url( url );
							$("#mini_popup").hide();
							console.log( "uploaded:", url );

							$("#mini_popup_player")[0].pause();

							$("#letter_manager")[0].add_link( g_state.get_audio_url(), g_state.get_compose_button_id() );

							g_state.set_compose_button_id( undefined );

						} else {

							console.log( "aborted recording url:", url )

						}
					})
					.catch( function () {
						$("#mini_popup")[0].set_state("uploading_failed");
					});
				});

			});

			alert("You have reached the maximum recording length of 5 minutes");

		});

		$( document ).on( "recording_done_button_click", "#popup", function () {

			stop_timer();
			var state = new State();
			var timestamp = Date.now();
			g_state.set_recording_id(  timestamp );
			state.set_recording_id( timestamp );  
			
			$("#mini_popup_player")[0].reset();
			$("#mini_popup_player")[0].disable();
			$("#popup").hide();
			$("#mini_popup")[0].reset();
			$("#mini_popup")[0].set_state("uploading");
			$("#mini_popup").show();
				
			$( 'v-recorder' )[0].finish()
			.then( function ( blob ) {

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
						if ( g_state.get_recording_id() === state.get_recording_id() ) {

							g_state.set_audio_url( url );
							$("#mini_popup").hide();
							console.log( "uploaded:", url );

							$("#mini_popup_player")[0].pause();

							$("#letter_manager")[0].add_link( g_state.get_audio_url(), g_state.get_compose_button_id() );

							g_state.set_compose_button_id( undefined );

						} else {

							console.log( "aborted recording url:", url )

						}
					})
					.catch( function () {
						$("#mini_popup")[0].set_state("uploading_failed");
					});
				});

			})

		});

		$( document ).on( "cancel_click", "#mini_popup", function () {

			$("#mini_popup").hide();

			$("#mini_popup_player")[0].pause();
			g_state.set_recording_id( undefined );
			g_state.set_compose_button_id( undefined );

		});

		$( document ).on( "try_again_click", "#mini_popup", function () {

			var state = new State();
			var timestamp = Date.now();
			g_state.set_recording_id(  timestamp );
			state.set_recording_id( timestamp );

			$("#mini_popup_player")[0].reset();
			$("#mini_popup_player")[0].disable();
			$("#popup").hide();
			$("#mini_popup")[0].reset();
			$("#mini_popup")[0].set_state("uploading");
			$("#mini_popup").show();
				
			( function ( blob ) {

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
						if ( g_state.get_recording_id() === state.get_recording_id() ) {

							g_state.set_audio_url( url );
							$("#mini_popup").hide();
							console.log( "uploaded:", url );

							$("#mini_popup_player")[0].pause();

							$("#letter_manager")[0].add_link( g_state.get_audio_url(), g_state.get_compose_button_id() );

							g_state.set_compose_button_id( undefined );

						} else {

							console.log( "aborted recording url:", url )

						}
					})
					.catch( function () {
						$("#mini_popup")[0].set_state("uploading_failed");
					});
				});

			} ( g_state.last_recording_blob ) );

		});

	} ( $pmjQuery ) );
