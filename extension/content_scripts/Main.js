	
	V.Main = function ( window ) {
		
		var obj = {
			
			recording_a_reply: false,
			recording_a_new_mail: false,
			
			try_recording: function ( callback ) {
				obj.audio_recorder.start( function ( started ) {
					if ( started ) {
						obj.main_hub.fire({ name: 'recording_started' });
						callback( true );
					} else {
						obj.main_hub.fire({ name: 'recording_failed' });
						callback( false );
					}
				});
			},
			try_authorizing: function ( callback ) {
				if ( obj.google_auth_wrapper.is_authorized() ) {
					callback( true );
				} else {
					obj.google_auth_wrapper.auth( function ( authorized ) {
						if ( authorized ) {
							callback( true );
						} else {
							callback( false );
						}
					});
				}
			},
			
			init: function () {
				
				obj.web_request_manager = new V.WebRequestManager( obj.main_hub, window );
				obj.audio_recorder = new V.AudioRecorder( window.Recorder, window.AudioContext, window.WORKER_PATH, window.navigator, window.FileReader );
				obj.mail = new V.Mail( new V.GmailWrapper( gapi ) );
				obj.google_auth_wrapper = new V.GoogleAuthWrapper( gapi );
				obj.page_data = new V.PageData( window );
				obj.view = new V.View( window, jQuery, obj.view_hub );
				obj.controller = new V.Controller( obj.view_hub, obj.main_hub, obj.view, V.main );
				
				obj.main_hub.fire({ name: 'ready' });
				
			}
			
		};
		
		obj.main_hub = new V.EventHub( 'main_hub', { window: window });
		obj.view_hub = new V.EventHub( 'view_hub', { window: window });
		
		window.v_client_load = function () {

			var API_KEY = 'AIzaSyDOCP0xOiJ4SDKFFz1Iw5T_0zRP98NOku4';
		
			gapi.client.setApiKey( API_KEY );
			gapi.client.load( 'gmail', 'v1' ).then( obj.init );
			
		};
		
		return {
			
			_obj_: obj,
			
			enable_mail: function () {
				obj.web_request_manager.enable_mail();
			},
			disable_mail: function () {
				obj.web_request_manager.disable_mail();
			},
			
			start_reply: function () {
				if ( !obj.mail.is_sending() ) {
					obj.try_authorizing( function ( success ) {
						if ( success ) {
							obj.try_recording( function ( success ) {
								if ( success ) {
									obj.recording_a_reply = true;
								};
							});
						} else {
							
						}
					});
				}
			},
			
			start_compose: function ( data ) {
				obj.mail_data = data;
				if ( !obj.mail.is_sending() ) {
					if ( obj.google_auth_wrapper.is_authorized ) {
						obj.audio_recorder.start();
						obj.recording_a_new_mail = true;
						obj.main_hub.fire({ name: 'recording_started' });
					} else {
						obj.google_auth_wrapper.auth( function ( authorized ) {
							if ( authorized ) {
								obj.audio_recorder.start();
								obj.recording_a_new_mail = true;
								obj.main_hub.fire({ name: 'recording_started' });
							} else {
								obj.main_hub.fire({ name: 'recording_failed' });
							}
						});
					}
				}
			},
			
			cancel_recording: function () {
				obj.audio_recorder.cancel();
			},
			
			finalize_recording: function () {
				obj.main_hub.fire({ name: 'sending_data' });
				obj.audio_recorder.finish( function ( audio_data ) {
					if ( obj.recording_a_reply ) {
						obj.mail.send_reply( audio_data, obj.page_data.get_page_data(), function ( response ) {
							console.log( response );
							obj.main_hub.fire({ name: 'data_sent' });
						});
					} else if ( obj.recording_a_new_mail ) {
						obj.mail.send_new( audio_data, obj.mail_data, function ( response ) {
							console.log( response );
							obj.main_hub.fire({ name: 'data_sent' });
						});
					}
					obj.recording_a_new_mail = false;
					obj.recording_a_reply = false;
				});
			}
			
		};
		
	};
	
	V.main = new V.Main( window );
	
	
	