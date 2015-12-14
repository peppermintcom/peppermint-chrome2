(function ($) {
	
	var RECORDING_TIMEOUT_LIMIT = 5 * 60 * 1000;
	
	var transcriptionStartTime = 0;
	var transcriptionStopTime = 0;
	
	/**
	 * This is the language that will be used for the transcription
	 * 
	 * This attribute will set the language of the recognition for the request, using a valid BCP 47 language tag.
	 */
	var transcriptionLanguage = window.navigator.language;
	
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
		peppermintFinalAudioTranscript = '';
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
		
		transcriptionStartTime = Date.now();
	});

	document.addEventListener("stop_audio_transcription", function(event){
		
		console.log("stop_audio_transcription received");
		stopSpeechRecognition();
		
		transcriptionStopTime = Date.now();
		
		var transcriptionDuration = transcriptionStopTime - transcriptionStartTime;
		
	    var eventDetails = {duration : transcriptionDuration};
	    
	    document.dispatchEvent(new CustomEvent('store_audio_duration', { bubbles: true, detail: eventDetails }));
	});
	
} ($pmjQuery));