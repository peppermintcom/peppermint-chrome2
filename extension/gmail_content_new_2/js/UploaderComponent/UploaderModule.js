	
	V.UploaderModule = function ( data_manager, uploader ) {
		
		var private = {
			
			upload_success: function ( url ) {
				data_manager.update_data( 'uploader_data', { status: 'success', url: url });
			},
			upload_failure: function () {
				data_manager.update_data( 'uploader_data', { status: 'failure' });
			}
			
		};
		
		var public = {
			
			upload_buffer: function ( buffer ) {
				return new Promise( function ( resolve, reject ) {
					uploader.upload_buffer( buffer )
					.then( function ( url ) {
						private.upload_success( url );
						resolve();
					})
					.catch( function () {
						private.upload_failure();
						reject();
					});
				})
			}

		};
		
		return public;
		
	}