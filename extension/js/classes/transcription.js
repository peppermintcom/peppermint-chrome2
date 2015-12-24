/**
 * Transcription Result
 *
 * @param lang
 * @param transcription
 * @param duration
 * @param audioURL
 * @constructor
 */
function TranscriptionResult(lang, transcription, duration, audioURL) {

	this.audioURL = audioURL;
	this.language = lang;
	this.text = transcription.trim();
    this.duration = duration;

    /**
     * Returns the audio URL
     *
     * @returns {*}
     */
	this.getAudioURL = function() {
		return this.audioURL;
	};

    /**
     * Return the language
     *
     * @returns {*}
     */
	this.getLanguage = function() {
		return this.language;
	}

    /**
     * Returns the transcription text
     *
     * @returns {*}
     */
    this.getText = function() {
        return this.text;
    };

    /**
     * Returns the duration
     *
     * @returns {*}
     */
    this.getDuration = function() {
        return this.duration;
    };

    /**
     * Returns true if the result is valid and false otherwise
     *
     * @returns {*|boolean}
     */
    this.isValid = function() {
        return (this.text) && this.text.length > 0;
    };
}

/**
 * Transcription Object
 *
 * @param lang The language used for the transcription
 * @param resultsCallback The asynchronous callback function that will accept the results when the transcription is available
 * @constructor
 */
function Transcription(lang) {

    this.language = lang || window.navigator.language;

    this.getLanguage = function() {
        return this.language;
    };

    this.setLanguage = function(lang) {
        this.language = lang;
    };

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

    // instantiate the recognition object and set up event handlers
    var peppermintRecognition = new webkitSpeechRecognition();

    var transcriptionLanguage = lang;

    var transcriptionCallback = null;

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
    peppermintRecognition.onstart = function( resultCallback ) {
        transcriptionCallback = resultCallback;
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

        transcriptionCallback(new TranscriptionResult(transcriptionLanguage, peppermintFinalAudioTranscript, transcriptionDuration, ""));
    };

	this.start = function() {

        transcriptionStartTime = Date.now();

        peppermintFinalAudioTranscript = "";
        peppermintRecognition.lang = transcriptionLanguage;
        peppermintRecognition.start();

	};

	this.stop = function() {

        transcriptionStopTime = Date.now();

        peppermintRecognition.stop();
	};
}

(function ($) {


    var transcriptionResults = null;

    var transcription = new Transcription(transcriptionLanguage, function(results) {

        transcriptionResults = results;

        var eventDetails = {transcript : transcriptionResults.getText(), duration : transcriptionResults.getDuration()};

    });

	
} ($pmjQuery));