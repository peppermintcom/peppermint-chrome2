	
	Uploader = function ( chrome, $, event_hub, sender_data ) {

		var g_state = {

			token_promise: null,
			endpoint: "https://qdkkavugcd.execute-api.us-west-2.amazonaws.com/prod/v1/",
			api_key: "kLOtvTZkwzDISbKBVYGbkwLErE1VJPRyyWvnIXi1qhniGLar9Kr5mQ"

		}

		var private = {
			
			upload_transcription: function ( recording_data ) {
				
				return new Promise( function ( resolve, reject ) {
					
					if ( recording_data.transcription_data.text ) {

						$.ajax(
							g_state.endpoint + "transcriptions",
							{
								type: 'POST',
								data: JSON.stringify({
								  audio_url: recording_data.urls.canonical_url,
								  language: recording_data.transcription_data.language,
								  confidence : recording_data.transcription_data.confidence_estimate,
								  text : recording_data.transcription_data.text
								}),
								headers: {
									'Authorization': 'Bearer ' + recording_data.urls.token,
									'Content-Type': 'application/json',
									'X-Api-Key' : g_state.api_key
								},
								success: function ( response ) {
									resolve( response );
								},
								error: function ( error ) {
									reject( error );
								}
							}
						);

					} else {

                        reject( new Error("No transcription to upload") ); 				
						return;

					}

				});
				
			},
			
			data_url_to_buffer: function ( data_url ) {

				return new Promise ( function ( resolve ) {

					var xhr = new XMLHttpRequest();
					xhr.open( "GET", data_url, true );
					xhr.responseType = "arraybuffer";

					xhr.onload = function ( e ) {

						resolve( xhr.response );

					};

					xhr.send();

				});

			}

		};
		
		var public = {

			upload_recording_data: function ( recording_data ) {

				return new Promise ( function ( resolve, reject ) {

					var xhr = new XMLHttpRequest();
					xhr.open( 'PUT', recording_data.urls.signed_url, true );
					xhr.setRequestHeader( "Content-Type", "audio/mpeg" );

					xhr.onload = function () {

						resolve( xhr.respose );

					};

					private.upload_transcription( recording_data )
					.then( function ( response ) {

						event_hub.fire( "transcription_uploaded", { recording_data_id: recording_data.id, transcription_url: response.transcription_url } );

					})
					.catch( function ( error ) {
						
						Raven.log( 'uploader', 'upload_recording_data', 'Failed to upload transcription', error, true );

					});	

					xhr.onerror = reject;

					private.data_url_to_buffer( recording_data.data_url )
					.then( function ( buffer ) {

						xhr.send( buffer );
						
					});

					chrome.runtime.sendMessage( { 
						receiver: 'GlobalAnalytics', name: 'track_analytic', 
						analytic: { name: 'processing_action', val: { 
							name: 'uploader',
							action: 'upload_recording_data',
							id: recording_data.id } } 
					});

				});

			},
			
			get_token_promise: function () {

				return new Promise( function ( resolve ) {

					$.ajax(
						g_state.endpoint + "recorder",
						{
							type: 'POST',
							data: JSON.stringify({
								"api_key": g_state.api_key,
								"recorder": {
									"description": "Chrome Extension",
									"recorder_client_id": "chrome_extension_" + Date.now()
								}
							}),
							success: function ( response ) {
								resolve( response.at );
							},
							error: function () {
								setTimeout( function () {
									public.get_token_promise().then( resolve );
								}, 1000 );
							}
						}
					);

				});

			},
			
			get_urls_promise: function ( token_promise ) {

				return new Promise( function ( resolve ) {

					token_promise.then( function ( token ) {

						$.ajax(
							"https://qdkkavugcd.execute-api.us-west-2.amazonaws.com/prod/v1/uploads",
							{
								type: 'POST',
								data: JSON.stringify({
								  content_type: "audio/mpeg",
								  sender_name: sender_data ? sender_data.sender_name : '',
								  sender_email: sender_data ? sender_data.sender_email : ''
								}),
								headers: {
									'Authorization': 'Bearer ' + token,
									'Content-Type': 'application/json'
								},
								success: function ( response ) {
									response.token = token;
									resolve( response );
								},
								error: function () {
									setTimeout( function () {
										public.get_urls_promise( token_promise, sender_data ).then( resolve );
									}, 1000 );
								}
							}
						);

					});

				});

			},

			delete_transcription: function ( recording_data ) {

				$.ajax({

					url: recording_data.transcription_url,
					type: "DELETE",
					headers: {
						'Authorization': 'Bearer ' + recording_data.urls.token,
						'Content-Type': 'application/json',
						'X-Api-Key' : g_state.api_key
					},
					success: function () {

						chrome.runtime.sendMessage( { 
							receiver: 'GlobalAnalytics', name: 'track_analytic', 
							analytic: { name: 'user_action', val: { 
								name: 'uploader',
								action: 'delete_transcription',
								id: recording_data.id } } 
						});

						console.log( "Transcription deleted" );
					}

				});

			}

		};

		( function constructor () {

		} () )
		
		return public;
		
	};
