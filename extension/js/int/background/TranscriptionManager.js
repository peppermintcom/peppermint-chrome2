
	function TranscriptionManager ( chrome, $, event_hub, lang ) {

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
				private.ended = true;
			},

			/**
			 * Fired when a speech recognition error occurs.
			 * The event must use the SpeechRecognitionError interface.
			 */
			onerror: function( event ) {
				private.log( "Transcription Error", event.error );
				private.error = true;
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

					private.speech_recognition.onend = null;
					private.speech_recognition.stop();
					return;
				
				}

				for ( var i = event.resultIndex; i < event.results.length; ++i ) {

					if ( event.results[i].isFinal ) {

						private.is_final = true;
						private.confidence = event.results[i][0].confidence;
						private.transcript += event.results[i][0].transcript;

					} else {

						private.is_final = false;

					}

				}

			
			}

		};

		var private = {

			transcript: "",

			is_final: true,

			ended: false,

			debugging: true,

			speech_recognition: null,

			confidence : 0.00,
			
			log: function () {

				if ( private.debugging ) console.trace( arguments );

			}

		};

		var public = {

			start: function () {

				chrome.storage.local.get( null, function ( items ) {

					lang = items.options_data.transcription_language;

					private.transcript = "";
					private.error = false;
					private.ended = false;
					private.speech_recognition.lang = lang;

					private.speech_recognition.start();

				});

			},

			cancel: function () {

				private.speech_recognition.stop();
				private.is_final = true;
				
			},

			finish: function () {

				return new Promise( function ( resolve ) {

					resolve({ text: "test1 test2 test3 test4 tst5 test5 liasifef ijeffff f f ffffffffffffff jf j fjjfeiojf test1 test2 test3 test4 tst5 test5 liasifef ijeffff f f ffffffffffffff jf j fjjfeiojf kasdf ds fsdk fsadfkl asf iof jweoif jwofij weof jweoif jwef wfewf asdf asdf adsf asdf asdf saf afe gweg test1 test2 test3 test4 tst5 test5 liasifef ijeffff f f ffffffffffffff jf j fjjfeiojf kasdf ds fsdk fsadfkl asf iof jweoif jwofij weof jweoif jwef wfewf asdf asdf adsf asdf asdf saf afe gweg test1 test2 test3 test4 tst5 test5 liasifef ijeffff f f ffffffffffffff jf j fjjfeiojf kasdf ds fsdk fsadfkl asf iof jweoif jwofij weof jweoif jwef wfewf asdf asdf adsf asdf asdf saf afe gweg test1 test2 test3 test4 tst5 test5 liasifef ijeffff f f ffffffffffffff jf j fjjfeiojf kasdf ds fsdk fsadfkl asf iof jweoif jwofij weof jweoif jwef wfewf asdf asdf adsf asdf asdf saf afe gweg test1 test2 test3 test4 tst5 test5 liasifef ijeffff f f ffffffffffffff jf j fjjfeiojf kasdf ds fsdk fsadfkl asf iof jweoif jwofij weof jweoif jwef wfewf asdf asdf adsf asdf asdf saf afe gweg test1 test2 test3 test4 tst5 test5 liasifef ijeffff f f ffffffffffffff jf j fjjfeiojf kasdf ds fsdk fsadfkl asf iof jweoif jwofij weof jweoif jwef wfewf asdf asdf adsf asdf asdf saf afe gweg kasdf ds fsdk fsadfkl asf iof jweoif jwofij weof jweoif jwef wfewf asdf asdf adsf asdf asdf saf afe gweg", language: lang, confidence_estimate: 1 });

					private.speech_recognition.stop();

					// var interval = setInterval( function () {

					// 	if ( private.is_final || private.error === true || private.ended === true ) {

					// 		console.log( "TRANSCRIPT:", private.transcript );

					// 		clearInterval( interval );
					// 		resolve({ text: private.transcript, language: lang, confidence_estimate: private.confidence });
					// 		private.transcript = '';

					// 	}

					// }, 50 );

				});

			}

		};

		( function constructor () {

			private.speech_recognition = new webkitSpeechRecognition();

			/**
			 * When the continuous attribute is set to false,
			 * the user agent must return no more than one final result in response to starting recognition,
			 * for example a single turn pattern of interaction. When the continuous attribute is set to true,
			 * the user agent must return zero or more final results representing multiple consecutive recognitions
			 * in response to starting recognition, for example a dictation.
			 *
			 * The default value must be false
			 */
			private.speech_recognition.continuous = true;

			/**
			 * Controls whether interim results are returned.
			 * When set to true, interim results should be returned.
			 * When set to false, interim results must NOT be returned.
			 * The default value must be false.
			 *
			 * Note, this attribute setting does not affect final results.
			 */
			private.speech_recognition.interimResults = true;

			$.extend( private.speech_recognition, event_handlers );
            
		} () )

		return public;

	}