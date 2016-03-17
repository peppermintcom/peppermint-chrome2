	
	function BackendManager ( ajax ) {
		
		var state = {

			api_key: "kLOtvTZkwzDISbKBVYGbkwLErE1VJPRyyWvnIXi1qhniGLar9Kr5mQ",
			api_root: "https://qdkkavugcd.execute-api.us-west-2.amazonaws.com/prod/v1/"

		};

		var private = {

		};

		var public = {

			short_url_to_recording_data: function ( short_url ) {

				return new Promise( function ( resolve, reject ) {

					ajax({

						url: state.api_root + "uploads",
						type: "GET",
						data: {
							"X-Api-Key": state.api_key,
							short_url: short_url
						},
						success: resolve,
						error: reject

					});

				});

			}

		};

		return public;

	}
