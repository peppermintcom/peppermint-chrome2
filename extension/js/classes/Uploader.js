	
	Uploader = function ( ajax, sender_data, utilities, event_hub ) {
		
		var lib = {

			upload: function ( url, buffer, success_callback, failure_callback ) {

				var xhr = new XMLHttpRequest();
				xhr.open( 'PUT', url, true );

				xhr.onload = success_callback;
				xhr.onerror = failure_callback;
				xhr.setRequestHeader( "Content-Type", "audio/mpeg" );

				xhr.upload.onprogress = function( e ) {

					if ( e.lengthComputable ) {

						document.dispatchEvent( new CustomEvent( "upload_progress", {
							detail: {
								progress: parseInt( ( e.loaded / e.total ) * 100 )
							}
						}));

					}

				};

				xhr.send( buffer );

				document.dispatchEvent( new CustomEvent( "upload_progress", {
					detail: {
						progress: 0
					}
				}));

			}

		};

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
					
					ajax(
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

			token_to_urls_promise: function ( token, sender_data ) {
				return new Promise( function ( resolve, reject ) {
					private.token_to_urls( token, sender_data )
					.then( function( urls ) {
						resolve( urls );
					})
					.catch( function () {
                        Raven.captureMessage("failed to get urls");
						console.log( "failed to get urls" );
						setTimeout( function () {
							private.token_to_urls_promise( token, sender_data ).then( resolve );
						}, 1000 );
					});
				});
			}

		};
		
		var public = {

			upload_recording_data: function ( recording_data ) {

				return new Promise ( function ( resolve, reject ) {



				});

			},
			
			get_token_promise: function () {

				return new Promise( function ( resolve ) {

					ajax(
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

					ajax(
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

					ajax({

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