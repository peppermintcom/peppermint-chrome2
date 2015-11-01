	
	V.Uploader = function ( $ ) {
		
		var private = {
			
			token: false,
			signed_url: false,
			canonical_url: false,
			buffer: false,
			
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
								private.token = response.at;
								resolve();
							},
							error: function () {
								reject();
							}
						}
					)
				});
			},
			
			get_signed_url: function () {
				return new Promise( function ( resolve, reject ) {
					$.ajax(
						"https://qdkkavugcd.execute-api.us-west-2.amazonaws.com/prod/v1/uploads",
						{
							type: 'POST',
							data: JSON.stringify({
							  "content_type": "audio/wav"
							}),
							headers: {
								'Authorization': 'Bearer ' + private.token,
								'Content-Type': 'application/json'
							},
							success: function ( response ) {
								private.signed_url = response.signed_url;
								resolve();
							},
							error: function () {
								reject();
							}
						}
					);
				});
			},
			
			upload: function () {
				return new Promise( function ( resolve, reject ) {
					$.ajax(
						private.canonical_url,
						{
							url: private.signed_url,
							type: 'PUT',
							headers: {
								'Content-Type': 'audio/wav'
							},
							data: private.buffer,
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
							  "signed_url": private.signed_url
							}),
							headers: {
								'Authorization': 'Bearer ' + private.token,
								'Content-Type': 'application/json'
							},
							success: function ( response ) {
								private.canonical_url = response.canonical_url;
								console.log( private.canonical_url );
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
				private.buffer = buffer;
				return new Promise( function ( resolve, reject ) {
					private.get_token()
					.then( private.get_signed_url )
					.then( private.upload )
					.then( private.get_canonical_url )
					.then( resolve )
					.catch( reject );
				});
			}
			
		};
		
		return public;
		
	}