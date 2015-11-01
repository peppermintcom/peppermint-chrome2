	
	V.Uploader = function ( $, hub ) {
		
		var obj = {
			
			get_token: function ( callback ) {
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
							callback( response.at );
						}
					}
				)
			},
			
			get_signed_url: function ( token, callback ) {
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
							callback( response.signed_url );
						}
					}
				);
			},
			
			upload: function ( url, audio_data, callback ) {
				$.ajax(
					url,
					{
						type: 'PUT',
						headers: {
							'Content-Type': 'audio/wav'
						},
						data: audio_data,
						success: callback,
						processData: false
					}
				);
			},
			
			get_canonical_url: function ( token, signed_url, callback ) {
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
							callback( response.canonical_url );
						}
					}
				);
			}
			
		};
		
		return {
			
			_obj_: obj,
			
			upload_audio: function ( id, audio_data, callback ) {
				console.log( audio_data );
				obj.get_token( function ( token ) {
					console.log( token );
					obj.get_signed_url( token, function ( signed_url ) {
						console.log( signed_url );
						obj.upload( signed_url, audio_data, function ( response ) {
							console.log( response );
							obj.get_canonical_url( token, signed_url, function ( canonical_url ) {
								console.log( canonical_url );
								hub.fire({ name: 'data_change', data_name: 'uploader', data: { url: canonical_url, id: id } });
							});
						});
					});
				});
			}
			
		}
		
	}