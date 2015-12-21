	
	Uploader = function ( ajax ) {
		
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
								"api_key": "abc123",
								"recorder": {
									"description": "Chrome Extension",
									"recorder_client_id": "chrome_extension" + Date.now()
								}
							}),
							success: function ( response ) {
								resolve( response.at );
							},
							error: function () {
								reject();
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
			
			upload: function ( signed_url, buffer ) {
				return new Promise( function ( resolve, reject ) {
					lib.upload( signed_url, buffer, resolve, reject );
				});
			}

		};
		
		var public = {
			
			upload_buffer: function ( buffer, sender_data ) {

				return new Promise( function ( resolve, reject ) {

					var state = {};

					g_state.token_promise
					.then( function ( token ) {

						state.token = token;

						return g_state.urls_promise;

					})
					.then( function ( urls ) {

						console.log( urls );

						state.signed_url = urls.signed_url;
						state.short_url = urls.short_url;

						g_state.urls_promise = g_state.token_promise.then( function ( token ) {
							return private.token_to_urls( token );
						});

						return private.upload( urls.signed_url, buffer );

					})
					.then( function () {

						resolve( state.short_url );

					})
					.catch( reject );

				});

			},
			
			upload_buffer_immediately: function ( buffer, sender_data ) {

				return new Promise( function ( resolve, reject ) {

					var state = {};

					g_state.token_promise
					.then( function ( token ) {

						state.token = token;

						return g_state.urls_promise;

					})
					.then( function ( urls ) {

						state.signed_url = urls.signed_url;
						state.short_url = urls.short_url;

						private.upload( urls.signed_url, buffer )
						.then( function () {
							console.log( "buffer uploaded" );
						});

						g_state.urls_promise = g_state.token_promise.then( function ( token ) {
							return private.token_to_urls( token );
						});

						resolve( state.short_url );

					})
					.catch( reject );

				});

			}
			
		};

		( function constructor () {

			g_state.token_promise = private.get_token();
			g_state.urls_promise = g_state.token_promise.then( function ( token ) {
				return private.token_to_urls( token );
			})

		} () )
		
		return public;
		
	};