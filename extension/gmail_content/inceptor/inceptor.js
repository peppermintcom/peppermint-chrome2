
	( function ( $, chrome, document ) {

		function insert_script( src ) {
			return new Promise( function ( resolve ) {

				var script = document.createElement( 'script' );
				script.onload = function () {
					resolve();
				};
				script.src = src;

				document.head.appendChild( script );

			});
		}

		function get_import_inserter ( id, path ) {
			return function () {
				return new Promise( function ( resolve ) {
					var link = document.createElement( 'link' );
					link.rel = 'import';
					link.id = id;
					link.href = 'chrome-extension://' + chrome.runtime.id + '/' + path;
					link.onload = function () {
						resolve();
					};
					document.head.appendChild( link );
				});
			};
		}

		function inject_local_storage () {
			chrome.storage.local.get( null, function ( items ) {
				window.localStorage.peppermint_storage_items = JSON.stringify( items ); 
			});
		}

		inject_local_storage();

		document.addEventListener( "open_welcome_page", function () {
			chrome.runtime.sendMessage( "open_welcome_page" );
		});

		insert_script( "chrome-extension://"+chrome.runtime.id+"/gmail_content/js/lib/jquery.min.js" )
		.then( function () {

			insert_script( chrome.extension.getURL( "/gmail_content/controller/controller.js" ) )
			.then( function () {
				
				get_import_inserter( 'v-player-import', 'gmail_content/v-elements/v-player/v-player.html' )();
				get_import_inserter( 'v-timer-import', 'gmail_content/v-elements/v-timer/v-timer.html' )();
				get_import_inserter( 'v-popup-import', 'gmail_content/v-elements/v-popup/v-popup.html' )();
				get_import_inserter( 'v-mini-popup-import', 'gmail_content/v-elements/v-mini-popup/v-mini-popup.html' )();
				get_import_inserter( 'v-recorder-import', 'gmail_content/v-elements/v-recorder/v-recorder.html' )();
				get_import_inserter( 'v-button-inserter-import', 'gmail_content/v-elements/v-button-inserter/v-button-inserter.html' )();
				get_import_inserter( 'v-uploader-import', 'gmail_content/v-elements/v-uploader/v-uploader.html' )();
				get_import_inserter( 'v-letter-manager-import', 'gmail_content/v-elements/v-letter-manager/v-letter-manager.html' )();
				
				get_import_inserter( 'v-inceptor', 'gmail_content/inceptor/inceptor.html' )()
				.then( function () {
					var inceptor_import = document.querySelector('#v-inceptor').import;
					inceptor_import.body.innerHTML = inceptor_import.body.innerHTML
					.replace( /{{URL_PREFIX}}/g, chrome.extension.getURL( "/gmail_content/v-elements" ) );
					for ( var i = 0; i < inceptor_import.body.children.length; i++ ) {
						$( document.body ).append( $( inceptor_import.body.children[i] ).clone() );
					}	
				});
			});
			
			insert_script( chrome.extension.getURL( "/gmail_content/transcription/transcription.js" ) )
				.then(function() {
					
			});

		});

	} ( $pmjQuery, chrome, document ) );

