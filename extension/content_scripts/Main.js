	
	V.Main = function ( window ) {
		
		var obj = {
			
			hub: new V.EventHub(),
			
			mail: null,
			audio_recorder: null,
			google_auth_wrapper: null,
			page_data: null,
			view: null,
			
			recording_a_reply: false,
			recording_a_new_mail: false,
			
			receiver: null
			
		};
		
		obj.hub.add({
			
			"gmail_api_ready": function () {
				
				obj.audio_recorder = new V.AudioRecorder( window.Recorder, window.AudioContext, window.WORKER_PATH, window.navigator, window.FileReader );
				obj.mail = new V.Mail( new V.GmailWrapper( gapi ) );
				obj.google_auth_wrapper = new V.GoogleAuthWrapper( gapi );
				obj.page_data = new V.PageData( window );
				obj.view = new V.View( window, jQuery, obj.hub );
				
				obj.hub.fire({ name: 'ready' });
				
			},
			
			"compose_button_click": function () {
				obj.page_data.get_contacts( function ( contacts ) {
					obj.hub.fire({ name: 'contacts_available', contacts: contacts });
				});
			},
			
			"receiver_selected": function ( data ) {
				obj.receiver = data.receiver;
				if ( !obj.mail.is_sending() ) {
					if ( obj.google_auth_wrapper.is_authorized() ) {
						obj.audio_recorder.start( function ( started ) {
							if ( started ) {
								obj.hub.fire({ name: 'recording_started' });	
								obj.recording_a_new_mail = true;
							} else {
								obj.hub.fire({ name: 'recording_failed' });	
							}
						});
					} else {
						obj.google_auth_wrapper.auth( function ( authorized ) {
							if ( authorized ) {
								obj.audio_recorder.start( function ( started ) {
									if ( started ) {
										obj.hub.fire({ name: 'recording_started' });
										obj.recording_a_new_mail = true;
									} else {
										obj.hub.fire({ name: 'recording_failed' });	
									}
								});
							}
						});
					}
				}
			},
			
			"reply_button_click": function () {
				if ( !obj.mail.is_sending() ) {
					if ( obj.google_auth_wrapper.is_authorized() ) {
						obj.audio_recorder.start( function ( started ) {
							if ( started ) {
								obj.hub.fire({ name: 'recording_started' });	
								obj.recording_a_reply = true;
							} else {
								obj.hub.fire({ name: 'recording_failed' });	
							}
						});
					} else {
						obj.google_auth_wrapper.auth( function ( authorized ) {
							if ( authorized ) {
								obj.audio_recorder.start( function ( started ) {
									if ( started ) {
										obj.hub.fire({ name: 'recording_started' });
										obj.recording_a_reply = true;
									} else {
										obj.hub.fire({ name: 'recording_failed' });	
									}
								});
							}
						});
					}
				}
			},
			
			"popup_done_click": function () {
				obj.hub.fire({ name: 'sending_data' });
				obj.audio_recorder.finish( function ( audio_data ) {
					if ( obj.recording_a_reply ) {
						obj.mail.send_reply( audio_data, obj.page_data.get_page_data(), function ( response ) {
							console.log( response );
							obj.hub.fire({ name: 'data_sent' });
						});
					} else if ( obj.recording_a_new_mail ) {
						obj.mail.send_new( audio_data, { receiver: obj.receiver }, function ( response ) {
							console.log( response );
							obj.hub.fire({ name: 'data_sent' });
						});
					}
					obj.recording_a_new_mail = false;
					obj.recording_a_reply = false;
				});
			},
			
			"popup_cancel_click": function () {
				obj.audio_recorder.cancel();
			},
			
			"popup_error_done_click": function () {
				
			},
			
			"popup_receiver_done_click": function () {
				if ( !obj.mail.is_sending() ) {
					if ( obj.google_auth_wrapper.is_authorized ) {
						obj.audio_recorder.start();
						obj.recording_a_new_mail = true;
						obj.hub.fire({ name: 'recording_started' });
					} else {
						obj.google_auth_wrapper.auth( function ( authorized ) {
							if ( authorized ) {
								obj.audio_recorder.start();
								obj.recording_a_new_mail = true;
								obj.hub.fire({ name: 'recording_started' });
							} else {
								obj.hub.fire({ name: 'recording_failed' });
							}
						});
					}
				}
			}

		});
	
		window.v_client_load = function () {

			var API_KEY = 'AIzaSyDOCP0xOiJ4SDKFFz1Iw5T_0zRP98NOku4';
		
			gapi.client.setApiKey( API_KEY );
			gapi.client.load( 'gmail', 'v1' ).then(function(){
				obj.hub.fire({ name: 'gmail_api_ready' });
			});
			
		};
		
		return {
			
			_obj_: obj
			
		};
		
	};
	
	V.main = new V.Main( window );
	