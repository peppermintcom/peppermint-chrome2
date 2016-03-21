	
	Uploader = function ( chrome, $, event_hub, sender_data ) {

		var g_state = {
			token_promise: null
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

                        reject( "No transcription to upload" ); 				
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
			
            get_token_urls: function () {

				return new Promise( function ( resolve, reject ) {

					var data = {};

					var xhr = new XMLHttpRequest();
					xhr.open( 'PUT', recording_data.urls.signed_url, true );
					xhr.setRequestHeader( "Content-Type", "audio/mpeg" );

					xhr.onload = function () {

						resolve( xhr.respose );

					};

					private.upload_transcription( recording_data )
					.then( function ( response ) {

						recording_data.transcription_url = response.transcription_url;

						chrome.runtime.sendMessage({ receiver: "GlobalStorage", name: "update_recording_data", recording_data });

					})
					.catch( function ( error ) {

						console.log( "Failed to upload transcription", error );

					});	

					xhr.onerror = reject;

					private.data_url_to_buffer( recording_data.data_url )
					.then( function ( buffer ) {

						xhr.send( buffer );
						
					});

				});

			},
            
			upload_buffer: function ( token, urls, buffer, transcription_data ) {

				return new Promise( function ( resolve, reject ) {

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

                    if(!transcription_data){
                        
                        console.log('no transcription data found');
                        
                    } else {
                        
                        transcription_data.audio_url = urls.canonical_url;
                        
                        private.upload_transcription( state.token, transcription_data )
                        .then( function ( response ) {
                            console.log( response );
                            g_state.last_transcription_url = response.transcription_url;
                        })
                        .catch( function ( error ) {
                            
                            Raven.captureException(error);

                            console.log(error);

                        });
                        
                    }              
												
					private.upload_until_success( urls.signed_url, buffer )
                    .then( function () {
                      
						resolve( true );

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
							console.log( "Transcription deleted" );
						}

					});

			}

		};

		( function constructor () {

			g_state.token_promise = private.get_token();
			
			setInterval( function () {

				g_state.urls_promise = g_state.token_promise.then( function ( token ) {
					g_state.urls_promise = private.token_to_urls_promise( token, sender_data );
					return private.token_to_urls_promise( token, sender_data );
				});
				
			}, 2 * 60 * 1000 );

			g_state.urls_promise = g_state.token_promise.then( function ( token ) {
				g_state.urls_promise = private.token_to_urls_promise( token, sender_data );
				return private.token_to_urls_promise( token, sender_data );
			});
            
            event_hub.fire( 'class_load', { name: 'Uploader' } );

		} () )
		
		return public;
		
	};