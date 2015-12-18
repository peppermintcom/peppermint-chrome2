	
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
			
			token_to_signed_url: function ( token, sender_data ) {
				return new Promise( function ( resolve, reject ) {
					ajax(
						"https://qdkkavugcd.execute-api.us-west-2.amazonaws.com/prod/v1/uploads",
						{
							type: 'POST',
							data: JSON.stringify({
							  content_type: "audio/mpeg",
							  sender_name: sender_data.sender_name,
							  sender_email: sender_data.sender_email
							}),
							headers: {
								'Authorization': 'Bearer ' + token,
								'Content-Type': 'application/json'
							},
							success: function ( response ) {
								resolve( response.signed_url );
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
			
			get_canonical_url: function ( token, signed_url ) {
				return new Promise( function ( resolve, reject ) {
					ajax(
						"https://qdkkavugcd.execute-api.us-west-2.amazonaws.com/prod/v1/record",
						{
							type: 'POST',
							data: JSON.stringify({
							  "signed_url": signed_url
							}),
							headers: {
								'Authorization': 'Bearer ' + token,
								'Content-Type': 'application/json'
							},
							success: function ( response ) {
								resolve( response.canonical_url );
							},
							error: function () {
								reject();
							}
						}
					);
				});
			},

			get_short_url: function ( token, signed_url ) {
				return new Promise( function ( resolve, reject ) {
					ajax(
						"https://qdkkavugcd.execute-api.us-west-2.amazonaws.com/prod/v1/record",
						{
							type: 'POST',
							data: JSON.stringify({
							  "signed_url": signed_url
							}),
							headers: {
								'Authorization': 'Bearer ' + token,
								'Content-Type': 'application/json'
							},
							success: function ( response ) {
								resolve( response.short_url );
							},
							error: function () {
								reject();
							}
						}
					);
				});
			}
		};
		
		var public = {
			
			upload_buffer: function ( buffer, sender_data ) {

				return new Promise( function ( resolve, reject ) {

					var state = {};

					private.get_token()
					.then( function ( token ) {

						state.token = token;

						return private.token_to_signed_url( token, sender_data );

					})
					.then( function ( signed_url ) {

						state.signed_url = signed_url;

						return private.upload( signed_url, buffer );


					})
					.then( function () {

						return private.get_short_url( state.token, state.signed_url );

					})
					.then( resolve )
					.catch( reject );

				});

			},

			upload_buffer_silently: function ( buffer, sender_data ) {

				return new Promise( function ( resolve, reject ) {

					var state = {};

					private.get_token()
					.then( function ( token ) {

						state.token = token;

						return private.token_to_signed_url( token, sender_data );

					})
					.then( function ( signed_url ) {

						state.signed_url = signed_url;

						private.upload( signed_url, buffer );
						
						return private.get_short_url( state.token, state.signed_url );

					})
					.then( resolve )
					.catch( reject );

				});

			}
			
		};
		
		return public;
		
	};