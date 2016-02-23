	
	Uploader = function ( ajax, sender_data ) {
		
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
			token_promise: null
		}

		var private = {
			
			get_token: function () {
				return new Promise( function ( resolve, reject ) {
					ajax(
						"https://qdkkavugcd.execute-api.us-west-2.amazonaws.com/prod/v1/recorder",
						{
							type: 'POST',
							data: JSON.stringify({
								"api_key": "kLOtvTZkwzDISbKBVYGbkwLErE1VJPRyyWvnIXi1qhniGLar9Kr5mQ",
								"recorder": {
									"description": "Chrome Extension",
									"recorder_client_id": "chrome_extension" + Date.now()
								}
							}),
							success: function ( response ) {
								resolve( response.at );
							},
							error: function () {
								setTimeout( function () {
									private.get_token().then( resolve );
								}, 1000 );
							}
						}
					);
				});
			},
			
			token_to_urls: function ( token, sender_data ) {
				return new Promise( function ( resolve, reject ) {
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
								reject();
							}
						}
					);
				});
			},
			
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
						console.log( "failed to get urls" );
						setTimeout( function () {
							private.token_to_urls_promise( token, sender_data ).then( resolve );
						}, 1000 );
					});
				});
			}

		};
		
		var public = {
			
            get_token_urls: function () {

				return new Promise( function ( resolve, reject ) {

					var data = {};

					g_state.token_promise
					.then( function ( token ) {

						data.token = token;
                        
                        g_state.urls_promise = g_state.token_promise.then( function ( token ) {
                            g_state.urls_promise = private.token_to_urls_promise( token, sender_data );
                            return private.token_to_urls_promise( token, sender_data );
                        });

						return g_state.urls_promise;
					})
                    .then( function ( urls ) {
                        
                        data.urls = urls;
                        
                        resolve ( data );
                    })
					.catch( function () {

						reject();

					})

				});

			},
            
			upload_buffer: function ( token, urls, buffer, transcription_data ) {

				return new Promise( function ( resolve, reject ) {

					var state = {};
                    
                    state.token = token;
                    state.signed_url = urls.signed_url;
                    state.short_url = urls.short_url;
                    state.canonical_url = urls.canonical_url;

                    transcription_data.audio_url = urls.canonical_url;

                    private.upload_transcription( state.token, transcription_data )
                    .then( function ( response ) {
                    	console.log( response );
                    	g_state.last_transcription_url = response.transcription_url;
                    });                    
												
					private.upload_until_success( urls.signed_url, buffer )
                    .then( function () {
                      
						resolve( true );

					})
					.catch( function () {

						reject();

					});

				})

			},
			
			upload_buffer_immediately: function ( token, urls, buffer, transcription_data ) {

				return new Promise( function ( resolve, reject ) {

					var state = {};

					state.token = token;
                    state.signed_url = urls.signed_url;
                    state.short_url = urls.short_url;
                    state.canonical_url = urls.canonical_url;

					transcription_data.audio_url = urls.canonical_url;
                        
					private.upload_transcription( state.token, transcription_data )
					.then( function ( response ) {
						console.log( response );
						g_state.last_transcription_url = response.transcription_url;
					});
					
					private.upload_until_success( urls.signed_url, buffer )
                    .then( function () {
                      
						resolve( true );

					})
					.catch( function () {

						reject();

					});

				});

			},

			delete_transcription: function () {
				
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

		} () )
		
		return public;
		
	};