
	V.StorageManager = function ( chrome ) {
		
		return {
			
			"set": function ( obj_to_save ) {
				
				chrome.storage.local.set( obj_to_save );
				
			},
			
			"get": function ( callback ) {
				chrome.storage.local.get( null, callback );
			}
			
		}
		
	};

	V.Inceptor = function () {
		
		var obj = {
			
			load_scripts_in_order: function ( scripts, callback ) {
				if ( scripts.length > 0 ) {
					console.log( 'loading ' + scripts[ 0 ] );
					var s = document.createElement( 'script' );
					s.src = scripts[ 0 ];
					s.onload = function () {
						obj.load_scripts_in_order( scripts.slice( 1 ) );
					}
					document.head.appendChild( s);
				} else {
					callback();
				}
			},
			
			load_templates_in_order: function ( templates ) {
				if ( templates.length > 0 ) {
					console.log( 'loading ' + templates[ 0 ][ 0 ] );
					var s = document.createElement( 'link' );
					s.rel = 'import';
					s.id = templates[ 0 ][ 0 ];
					s.href = templates[ 0 ][ 1 ];
					s.onload = function () {
						obj.load_templates_in_order( templates.slice( 1 ) );
					}
					document.head.appendChild( s );
				}
			}
			
		};
		
		return {
		
			get_worker_path: function ( callback ) {

				var xhr = new XMLHttpRequest();
				xhr.open( 'GET', chrome.extension.getURL('/gmail_content/js/lib/recorderWorker.js'), true );
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
				
			},
			
			add_global: function ( name, value, callback ) {
				var s = document.createElement('script');
				s.innerHTML = "window."+name+"="+JSON.stringify( value )+";";
				document.head.appendChild( s );
				if ( callback ) callback();
			},
			
			load_scripts_in_order: obj.load_scripts_in_order,
			
			load_templates_in_order: obj.load_templates_in_order

		
		}
		
	};
	
	( function ( chrome, window ) {
		
		var obj = {};
		
		obj.hub = new V.EventHub( 'inceptor_hub', { window: window, chrome: chrome });
		obj.inceptor = new V.Inceptor();
		obj.storage_manager = new V.StorageManager( chrome );
		
		obj.hub.add({
			
			'enable_mail_request_1': function () {
				obj.hub.fire({
					name: 'enable_mail_request_2',
					runtime: true
				});
			},
			
			'disable_mail_request_1': function () {
				obj.hub.fire({
					name: 'disable_mail_request_2',
					runtime: true
				});
			},
			
			'mail_intercepted_1': function ( data ) {
				var new_data = {};
				new_data.name = 'mail_intercepted_2';
				new_data.custom_event = true;
				new_data.to = data.to;
				new_data.body = data.body;
				new_data.subject = data.subject;
				obj.hub.fire( new_data );
			}
			
		});
	
		obj.inceptor.get_worker_path( function ( worker_path ) {
			obj.storage_manager.get( function ( items ) {
				obj.inceptor.add_global( "PEPPERMINT_STORAGE", items );
				obj.inceptor.add_global( "EXTENSION_ID", chrome.runtime.id );
				obj.inceptor.add_global( "WORKER_PATH", worker_path, function () {
					obj.inceptor.load_scripts_in_order([
						chrome.extension.getURL('/gmail_content/js/shims.js'),
						chrome.extension.getURL('/gmail_content/js/lib/jquery.min.js'),
						chrome.extension.getURL('/gmail_content/js/lib/recorder.js'),
						chrome.extension.getURL('/gmail_content/js/classes/V.js'),
						chrome.extension.getURL('/gmail_content/js/classes/AudioRecorder.js'),
						chrome.extension.getURL('/gmail_content/js/classes/Uploader.js'),
						chrome.extension.getURL('/gmail_content/js/classes/View.js'),
						chrome.extension.getURL('/gmail_content/js/classes/Controller.js'),
						chrome.extension.getURL('/gmail_content/js/classes/Main.js')
					], function () {
						obj.inceptor.load_templates_in_order([
							[ 'v-player-import', chrome.extension.getURL('/gmail_content/v-elements/v-player.html') ],
							[ 'v-popup-import', chrome.extension.getURL('/gmail_content/v-elements/v-popup.html') ]
						]);
					});
				});
			});
		});
	
	} ( chrome, window ) );
	
	
	
	
	
	
	