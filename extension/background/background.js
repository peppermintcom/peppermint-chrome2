
var $ = $pmjQuery;

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

	}

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
			}

			if ( popup_state.recording_url ) {

				copy_to_clipboard( popup_state.recording_url + " " + popup_state.transcript );
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

			if ( popup_state.transcript ) {
				$( "#popup", pop_doc )[0].set_transcript( popup_state.transcript );
			}

	}

	function start_timer () {
		
		console.log("start_timer");
		
		timer = setTimeout( function () {

			console.log( "timeout" );
			document.dispatchEvent( new CustomEvent("timeout") );

		}, RECORDING_TIMEOUT_LIMIT );

	}

	function stop_timer () {
		
		console.log("stop_timer");
		
		clearTimeout( timer );

	}

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

					console.log( "aborted recording url:", url );

				}
			})
			.catch( function () {
				popup_state.page = "uploading_failed_page";
				$( "#popup", pop_doc )[0].set_page("uploading_failed_page");
			});
		});

	}

	function show_uploading_screen ( pop_doc ) {

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

	window.transferControl = function ( popup_window ) {
		
		pop_doc = popup_window.document;

		init_popup_state( pop_doc );

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

			show_uploading_screen( pop_doc );

			$("#recorder")[0].finish()
			.then( function ( blob ) {

				process_recording_blob( blob, current_recording_thread_id );

			});

		});

		$( pop_doc ).on( "restart_upload_click",  "#popup", function () {

			current_recording_thread_id = popup_state.recording_thread_id;

			show_uploading_screen( pop_doc );

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
			}));
		
			popup_state.progress = event.originalEvent.detail.progress;
		
		});

	};
