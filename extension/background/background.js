
	var $ = $pmjQuery

	// Open the welcome page on install
	chrome.runtime.onInstalled.addListener(function (details) {
		if ( details.reason === "install" ) {
		    chrome.tabs.create({
		        url: chrome.extension.getURL("welcome_page/welcome.html"),
		        active: true
		    });
		}
	});

//////////////////////////////Transcript


		// Recording timeout limit is 5 minutes (300,000 milliseconds or 300 seconds)
		var RECORDING_TIMEOUT_LIMIT = 5 * 60 * 1000;
		
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

////////////////////////////////

	//Popup recording logic
	var popup_state = {

		page: null,
		page_status: null,
		recording_thread_id: null,
		audio_data_url: null,
		timestamp: null,
		last_recording_blob: null

	};

	var pop_doc = null;
	var timer;

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

			popup_state = {};
			popup_state.recording_thread_id = Date.now();

			$("#recorder")[0].start()
			.then( function () {

				start_timer();

				$( "#timer", pop_doc )[0].reset();
				$( "#timer", pop_doc )[0].start();
				$( "#popup", pop_doc ).show();
				$( "#popup", pop_doc )[0].set_page("recording_page");
				$( "#popup", pop_doc )[0].set_page_status("recording");
				popup_state.page = "recording_page";
				popup_state.page_status = "recording";

			})
			.catch( function ( error ) {

				if ( error.name === "PermissionDeniedError" ) {

					chrome.tabs.create({
						url: chrome.extension.getURL("/welcome_page/welcome.html")
					});
					console.log("permission denied");

				} else {

					$( "#popup", pop_doc ).show();
					$( "#popup", pop_doc )[0].set_page("microphone_error_page");
					popup_state.page = "microphone_error_page";

				}

			});

	};

	function init_popup_state ( pop_doc ) {

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
			};

			if ( popup_state.recording_url ) {

				copy_to_clipboard( popup_state.recording_url + " " + popup_state.transcript );
				$( "#popup", pop_doc )[0].set_url( popup_state.recording_url );

			};

			if ( popup_state.timestamp ) {

				$( "#timer", pop_doc )[0].set_time( Date.now() - popup_state.timestamp );
				$( "#timer", pop_doc )[0].continue();

			};

			if ( popup_state.progress ) {
				pop_doc.dispatchEvent( new CustomEvent( "upload_progress", {
					detail: {
						progress: popup_state.progress
					}
				}))
			};

			if ( popup_state.transcript ) {
				$( "#popup", pop_doc )[0].set_transcript( popup_state.transcript );
			};

	};

	function start_timer () {
		
		console.log("start_timer");
		
		// start audio transcription 
		document.dispatchEvent(new CustomEvent('start_audio_transcription', { bubbles: true }));
		
		transcriptionStartTime = Date.now();
		
		timer = setTimeout( function () {

			console.log( "timeout" );
			document.dispatchEvent( new CustomEvent("timeout") );

		}, RECORDING_TIMEOUT_LIMIT );

	};

	function stop_timer () {
		
		console.log("stop_timer");
		
		// stop audio transcription
		document.dispatchEvent( new CustomEvent('stop_audio_transcription', { bubbles: true }) ); 
		
		transcriptionStopTime = Date.now();
		
		var transcriptionDuration = transcriptionStopTime - transcriptionStartTime;
		
	    var eventDetails = {duration : transcriptionDuration};
	    
	    document.dispatchEvent(new CustomEvent('store_audio_duration', { bubbles: true, detail: eventDetails }));
		
		clearTimeout( timer );

	};

	function process_recording_blob ( blob, current_recording_thread_id ) {

		popup_state.last_recording_blob = blob; 

		$("#recorder")[0].blob_to_data_url( blob )
		.then( function ( data_url ) {

			console.log( data_url );
			
			$( "#player", pop_doc )[0].enable();
			$( "#player", pop_doc )[0].set_url( data_url );

			popup_state.audio_data_url = URL.createObjectURL( blob );

		});

		$("#recorder")[0].blob_to_buffer( blob )
		.then( function ( buffer ) {
			$("#uploader")[0].uploader.upload_buffer( buffer )
			.then( function ( url ) {
				if ( current_recording_thread_id === popup_state.recording_thread_id ) {

					console.log( "uploaded:", url );

					if ( popup_state.transcript ) {
						copy_to_clipboard( url + " " + popup_state.transcript );
					} else {
						copy_to_clipboard( url );
					}

					popup_state.recording_url = url;
					popup_state.page_status = "finished";
					popup_state.page = "popup_finish";

					$( "#popup", pop_doc )[0].set_url( url );
					$( "#popup", pop_doc )[0].set_transcript( popup_state.transcript );
					$( "#popup", pop_doc )[0].set_page("popup_finish");
					$( "#popup", pop_doc )[0].set_page_status("finished");
			
				} else {

					console.log( "aborted recording url:", url )

				}
			})
			.catch( function () {
				popup_state.page = "uploading_failed_page";
				$( "#popup", pop_doc )[0].set_page("uploading_failed_page");
			});
		});

	};

	function show_uploading_screen ( pop_doc ) {

		if ( pop_doc.defaultView ) {

			$( "#player", pop_doc )[0].reset();
			$( "#player", pop_doc )[0].disable();
			$( "#popup", pop_doc )[0].set_page_status("uploading");
			$( "#popup", pop_doc )[0].set_page("uploading_page");
		
		} else {
			console.log("popup is closed");
		}

		popup_state.page_status = "uploading";
		popup_state.page = "uploading_page";

	};

	document.addEventListener("update_audio_transcription", function(event){
		popup_state.transcript = event.detail.transcript;
	});

	window.transferControl = function ( popup_window ) {
		
		pop_doc = popup_window.document;

		init_popup_state( pop_doc )

		$( pop_doc ).on( "tick", "#timer", function () {
			popup_state.timestamp = $( "#timer", pop_doc )[0].get_timestamp();
		});

		$( pop_doc ).on( "popup_welcome_start_recording_click",  "#popup", function () {

			begin_recording();

		});

		$( pop_doc ).on( "error_cancel_button_click",  "#popup", function () {

			$( "#popup", pop_doc )[0].set_page("popup_welcome");
			popup_state.page = "popup_welcome";
			popup_state.recording_thread_id = Date.now();

		});

		$( pop_doc ).on( "error_try_again_button_click",  "#popup", function () {

			begin_recording();

		});

		$( pop_doc ).on( "recording_cancel_button_click",  "#popup", function () {

			stop_timer();
			$('#recorder')[0].cancel();
			$( "#popup", pop_doc )[0].set_page("popup_welcome");
			popup_state.page = "popup_welcome";
			popup_state.recording_thread_id = Date.now();

		});

		$( document ).on( "timeout", function () {

			current_recording_thread_id = popup_state.recording_thread_id;

			show_uploading_screen( pop_doc );

			$("#recorder")[0].finish()
			.then( function ( blob ) {
				
				process_recording_blob( blob, current_recording_thread_id );

			});

			alert("You have reached the maximum recording length of 5 minutes");

		});

		$( pop_doc ).on( "recording_done_button_click",  "#popup", function () {
			
			stop_timer();
			current_recording_thread_id = popup_state.recording_thread_id;

			show_uploading_screen();

			$("#recorder")[0].finish()
			.then( function ( blob ) {

				process_recording_blob( blob, current_recording_thread_id );

			})

		});

		$( pop_doc ).on( "restart_upload_click",  "#popup", function () {

			current_recording_thread_id = popup_state.recording_thread_id;

			show_uploading_screen();

			process_recording_blob( popup_state.last_recording_blob, current_recording_thread_id );

		});

		$( pop_doc ).on( "popup_finish_start_new_button_click",  "#popup", function () {

			begin_recording();

		});

		$( pop_doc ).on( "cancel_click", function  () {
			
			$( "#player", pop_doc )[0].reset();
			$( "#popup", pop_doc )[0].set_page("popup_welcome");
			popup_state.page = "popup_welcome";
			popup_state.recording_thread_id = Date.now();
			
		});

		$( document ).on( "upload_progress", function ( event ) {
		
			pop_doc.dispatchEvent( new CustomEvent( "upload_progress", {
				detail: {
					progress: event.originalEvent.detail.progress
				}
			}))
		
			popup_state.progress = event.originalEvent.detail.progress;
		
		});

	};
