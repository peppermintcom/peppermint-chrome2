	
	VUploader = function ( $ ) {
		
		var private = {
			
			get_token: function () {
				return new Promise( function ( resolve, reject ) {
					$.ajax(
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
					)
				});
			},
			
			token_to_signed_url: function ( token ) {
				return new Promise( function ( resolve, reject ) {
					$.ajax(
						"https://qdkkavugcd.execute-api.us-west-2.amazonaws.com/prod/v1/uploads",
						{
							type: 'POST',
							data: JSON.stringify({
							  "content_type": "audio/wav"
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
					$.ajax(
						{
							url: signed_url,
							type: 'PUT',
							headers: {
								'Content-Type': 'audio/wav'
							},
							data: buffer,
							success: function () {
								resolve();
							},
							error: function () {
								reject();
							},
							processData: false
						}
					);
				});
			},
			
			get_canonical_url: function ( token, signed_url ) {
				return new Promise( function ( resolve, reject ) {
					$.ajax(
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
			}
			
		};
		
		var public = {
			
			upload_buffer: function ( buffer ) {

				return new Promise( function ( resolve, reject ) {

					var state = {};

					private.get_token()
					.then( function ( token ) {

						state.token = token;

						return private.token_to_signed_url( token );

					})
					.then( function ( signed_url ) {

						state.signed_url = signed_url;

						return private.upload( signed_url, buffer );


					})
					.then( function () {

						return private.get_canonical_url( state.token, state.signed_url );

					})
					.then( resolve )
					.catch( reject );

				});

			}
			
		};
		
		return public;
		
	}