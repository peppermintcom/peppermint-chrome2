
	// FUNCTIONS
	function get_worker_path ( callback ) {

		var xhr = new XMLHttpRequest();
		xhr.open( 'GET', chrome.extension.getURL('/content_scripts/recorderWorker.js'), true );
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
				console.log( 'loaded ' + scripts[ 0 ] );
				load_scripts_in_order( scripts.slice( 1 ) );
			}
			document.head.appendChild( s );
		}
	};

	
	// PROGRAM
	get_worker_path( function ( worker_path ) {
		create_worker_path_constant( worker_path, function () {
			load_scripts_in_order( [
				chrome.extension.getURL('/content_scripts/core_module.js'),
				chrome.extension.getURL('/content_scripts/recorder.js'),
				chrome.extension.getURL('/content_scripts/record_module.js'),
				chrome.extension.getURL('/content_scripts/mail_module.js'),
				chrome.extension.getURL('/content_scripts/page_module.js'),
				'https://apis.google.com/js/client.js?onload=v_client_load'
			] );
		} );
	} );
	
	