	
	Uploader = function ( chrome, $, event_hub, sender_data ) {

		var g_state = {

			token_promise: null,
			endpoint: "https://qdkkavugcd.execute-api.us-west-2.amazonaws.com/prod/v1/",
			api_key: "kLOtvTZkwzDISbKBVYGbkwLErE1VJPRyyWvnIXi1qhniGLar9Kr5mQ"

		}

		var private = {
			
			upload_transcription: function ( token, transcription_data ) {
				return new Promise( function ( resolve, reject ) {
					
					if (transcription_data.text === undefined || transcription_data.text !== undefined && transcription_data.text.length < 1) {
                        reject("no data found for transcription"); 				
						return;
					}
					
					$.ajax(
						"https://qdkkavugcd.execute-api.us-west-2.amazonaws.com/prod/v1/transcriptions",
						{
							type: 'POST',
							data: JSON.stringify({
							  audio_url: transcription_data.audio_url,
							  language: transcription_data.language,
							  confidence : transcription_data.confidence_estimate,
							  text : transcription_data.text
							}),
							headers: {
								'Authorization': 'Bearer ' + token,
								'Content-Type': 'application/json',
								'X-Api-Key' : 'kLOtvTZkwzDISbKBVYGbkwLErE1VJPRyyWvnIXi1qhniGLar9Kr5mQ'
							},
							success: function ( response ) {
								resolve( response );
							},
							error: function () {
								reject();
							}
						}
					);
				});
			},
			
			upload: function ( signed_url, buffer ) {
				return new Promise( function ( resolve, reject ) {
					lib.upload( signed_url, buffer, resolve, reject );
				});
			},
			
			upload_until_success: function ( signed_url, buffer ) {
				return new Promise( function ( resolve, reject ) {
					lib.upload( signed_url, buffer, resolve, function () {
						console.log( "failed to upload buffer" );
						setTimeout( function () {
							private.upload_until_success( signed_url, buffer ).then( resolve );
						}, 1000 );
					});
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

					xhr.onerror = reject;

					private.data_url_to_buffer( recording_data.data_url )
					.then( function ( buffer ) {

						xhr.send( buffer );
						
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
			
			upload_buffer: function ( token, urls, buffer, transcription_data ) {

				return new Promise( function ( resolve, reject ) {

					var state = {};
                    
                    state.token = token;
                    state.signed_url = urls.signed_url;
                    state.short_url = urls.short_url;
                    state.canonical_url = urls.canonical_url;

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

					})
					.catch( function () {
                        
                        Raven.captureMessage("error in upload_buffer");

						reject();

					});

				})

			},

			delete_transcription: function ( recording_data ) {
				
				g_state.token_promise.then( function ( token ) {

					$.ajax({

						type: "DELETE",
						headers: {
							'Authorization': 'Bearer ' + token,
							'Content-Type': 'application/json',
							'X-Api-Key' : 'kLOtvTZkwzDISbKBVYGbkwLErE1VJPRyyWvnIXi1qhniGLar9Kr5mQ'
						},
						url: g_state.last_transcription_url,
						success: function () {
							console.log( "transcription deleted" );
						}

					});

				});

			}

		};

		( function constructor () {

            event_hub.fire( 'class_load', { name: 'Uploader' } );

		} () )
		
		return public;
		
	};