
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
			
			load_scripts_in_order: function ( scripts ) {
				if ( scripts.length > 0 ) {
					console.log( 'loading ' + scripts[ 0 ] );
					var s = document.createElement( 'script' );
					s.src = scripts[ 0 ];
					s.onload = function () {
						obj.load_scripts_in_order( scripts.slice( 1 ) );
					}
					document.head.appendChild( s);
				}
			}
			
		};
		
		return {
		
			get_worker_path: function ( callback ) {

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
				
			},
			
			add_global: function ( name, value, callback ) {
				var s = document.createElement('script');
				s.innerHTML = "window."+name+"="+JSON.stringify( value )+";";
				document.head.appendChild( s );
				if ( callback ) callback();
			},
			
			load_scripts_in_order: obj.load_scripts_in_order

		
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
						chrome.extension.getURL('/js/shims.js'),
						chrome.extension.getURL('/js/jquery.min.js'),
						chrome.extension.getURL('/content_scripts/lib/recorder.js'),
						chrome.extension.getURL('/js/V.js'),
						chrome.extension.getURL('/content_scripts/GoogleAuthWrapper.js'),
						chrome.extension.getURL('/content_scripts/AudioRecorder.js'),
						chrome.extension.getURL('/content_scripts/PageData.js'),
						chrome.extension.getURL('/content_scripts/View.js'),
						chrome.extension.getURL('/content_scripts/Controller.js'),
						chrome.extension.getURL('/content_scripts/Mail.js'),
						chrome.extension.getURL('/content_scripts/WebRequestManager.js'),
						chrome.extension.getURL('/content_scripts/Main.js'),
						'https://apis.google.com/js/client.js?onload=v_client_load'
					]);
				});
			});
		});
	
	} ( chrome, window ) );
	
	
	
	
	
	
	