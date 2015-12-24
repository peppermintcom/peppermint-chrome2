
	// Open the welcome page on install
	chrome.runtime.onInstalled.addListener(function (details) {
		if ( details.reason === "install" ) {
		    chrome.tabs.create({
		        url: chrome.extension.getURL("welcome_page/welcome.html"),
		        active: true
		    });
		}
	});

	// set up the open welcome page listener.
	chrome.runtime.onMessage.addListener( function ( message ) {
		console.log( message );
		if ( message === 'open_welcome_page' ) {
		    chrome.tabs.create({
		        url: chrome.extension.getURL("welcome_page/welcome.html"),
		        active: true
		    });
		}
	});

	// set up storage defaults
	chrome.storage.local.set({
		options_data: {
			reply_button_disabled: false
		}
	});

	//
	( function set_up_popup_controller ( window, jQuery ) {

		window.popup_controller = new PopupController(
			new WebAudioRecorderWrap( window.navigator, WebAudioRecorder, AudioContext, "/js/lib/WebAudioRecorder/" ),
			new Uploader( jQuery.ajax ),
			jQuery,
			new EventHub()
		);

	} ( window, jQuery ) );

	( function set_up_gmail_recorder ( chrome ) {

		window.background_recorder = new BackgroundRecorder(
			chrome.runtime,
			new WebAudioRecorderWrap( window.navigator, WebAudioRecorder, AudioContext, "/js/lib/WebAudioRecorder/" )
		);

	} ( chrome) );