
	// FUNCTIONS
	function get_worker_path ( callback ) {

		var xhr = new XMLHttpRequest();
		xhr.open( 'GET', chrome.extension.getURL('/content_scripts/lib/recorderWorker.js'), true );
		xhr.onload = function () {
			callback(
				window.URL.createObjectURL(
					new Blob(
						[ xhr.responseText ],
						{ type: 'text/javascript' } 
					)
				)
			);
		}
		xhr.send();
		
	};

	function create_worker_path_constant( worker_path, callback ) {
		var s = document.createElement('script');
		s.innerHTML = "WORKER_PATH=" + "'" + worker_path + "';" +
		"EXTENSION_ID = " + "'" + chrome.runtime.id + "';";
		document.head.appendChild( s );
		callback();
	};
	
	function load_scripts_in_order ( scripts ) {
		if ( scripts.length > 0 ) {
			console.log( 'loading ' + scripts[ 0 ] );
			var s = document.createElement( 'script' );
			s.src = scripts[ 0 ];
			s.onload = function () {
				load_scripts_in_order( scripts.slice( 1 ) );
			}
			document.head.appendChild( s );
		}
	};

	
	// PROGRAM
	get_worker_path( function ( worker_path ) {
		create_worker_path_constant( worker_path, function () {
			load_scripts_in_order( [
				chrome.extension.getURL('/js/shims.js'),
				chrome.extension.getURL('/js/jquery-2.1.4.min.js'),
				chrome.extension.getURL('/js/jquery-ui-1.11.4/jquery-ui.min.js'),
				chrome.extension.getURL('/content_scripts/lib/recorder.js'),
				chrome.extension.getURL('/content_scripts/V.js'),
				chrome.extension.getURL('/content_scripts/GoogleAuthWrapper.js'),
				chrome.extension.getURL('/content_scripts/AudioRecorder.js'),
				chrome.extension.getURL('/content_scripts/PageData.js'),
				chrome.extension.getURL('/content_scripts/View.js'),
				chrome.extension.getURL('/content_scripts/Mail.js'),
				chrome.extension.getURL('/content_scripts/Main.js'),
				'https://apis.google.com/js/client.js?onload=v_client_load'
			] );
		} );
	} );
	
	