
	function TranscriptionManager ( $, lang ) {

		var event_handlers = {

			/**
			 * Fired when the recognition service has started to listen to the audio with the intention of recognizing
			 */
			onstart: function() {
				private.log( "Starting Speech Recognition for Audio Transcription for Language " + lang );
			},

			/**
			 * Fired when the service has disconnected.
			 * The event must always be generated when the session ends no matter the reason for the end.
			 */
			onend: function() {
				private.log( "Speech Recognition for Audio Transcription has ended for Language " + lang );
			},

			/**
			 * Fired when a speech recognition error occurs.
			 * The event must use the SpeechRecognitionError interface.
			 */
			onerror: function( event ) {
				private.log( "Transcription Error", event.error );
			},

			/**
			 * Fired when the speech recognizer returns a final result
			 * with no recognition hypothesis that meet or exceed the confidence threshold.
			 * The event must use the SpeechRecognitionEvent interface.
			 * The results attribute in the event may contain
			 * speech recognition results that are below the confidence threshold or may be null.
			 */
			onnomatch: function( event ) {
				private.log( "No-Match Error: no recognition hypothesis that met or exceeded the confidence threshold" );
			},

			/**
			 * Fired when the speech recognizer returns a result.
			 * The event must use the SpeechRecognitionEvent interface.
			 */
			onresult: function( event ) {

				if ( typeof( event.results ) == 'undefined' ) {

					private.speach_recognition.onend = null;
					private.speach_recognition.stop();
					return;
				
				}

				for ( var i = event.resultIndex; i < event.results.length; ++i ) {

					if ( event.results[i].isFinal ) {

						private.is_final = true;
						private.transcript += event.results[i][0].transcript;
						console.log( private.transcript );

					} else {

						private.is_final = false;
						console.log( private.transcript + event.results[i][0].transcript );

					}

				}

			
			}

		};

		var private = {

			transcript: "",

			is_final: true,

			debugging: true,

			speach_recognition: null,

			log: function ( text ) {

				if ( private.debugging ) console.log( text );

			}

		};

		var public = {

			start: function () {

				private.transcript = "";

				private.speach_recognition.lang = lang;

				private.speach_recognition.start();

			},

			cancel: function () {
			
				private.speach_recognition.stop();
				private.is_final = true;
				
			},

			finish: function () {
				return new Promise( function ( resolve ) {

					private.speach_recognition.stop();

					var interval = setInterval( function () {

						if ( private.is_final ) {

							clearInterval( interval );
							resolve( private.transcript );
							private.transcript = '';

						}

					}, 50 );

				});
			}

		};

		( function constructor () {

			private.speach_recognition = new webkitSpeechRecognition();

			/**
			 * When the continuous attribute is set to false,
			 * the user agent must return no more than one final result in response to starting recognition,
			 * for example a single turn pattern of interaction. When the continuous attribute is set to true,
			 * the user agent must return zero or more final results representing multiple consecutive recognitions
			 * in response to starting recognition, for example a dictation.
			 *
			 * The default value must be false
			 */
			private.speach_recognition.continuous = true;

			/**
			 * Controls whether interim results are returned.
			 * When set to true, interim results should be returned.
			 * When set to false, interim results must NOT be returned.
			 * The default value must be false.
			 *
			 * Note, this attribute setting does not affect final results.
			 */
			private.speach_recognition.interimResults = true;

			$.extend( private.speach_recognition, event_handlers );

		} () )

		return public;

	}