
	( function () {
		
		describe( "UploaderModule", function () {
			
			var uploader = null;
			var data_manager = null;
			var uploader_module = null;
			
			beforeEach( function () {
				
				uploader = new V.Uploader();
				data_manager = new V.DataManager();
				uploader_module = new V.UploaderModule( data_manager, uploader );
				
			});
			
			describe( "public upload_buffer", function () {
				
				it( "modifies uploader_data on success", function ( done ) {
					
					spyOn( uploader, "upload_buffer" ).and.callFake( function ( buffer ) {
						return new Promise( function ( resolve, reject ) {
							resolve( "audio_url" );
						});
					});
				
					uploader_module.upload_buffer( 'buffer' ).then( function () {
						try {
							expect( data_manager["all_data"]["uploader_data"]["status"] ).toBe( "success" );
							expect( data_manager["all_data"]["uploader_data"]["url"] ).toBe( "audio_url" );
							done();
						} catch ( e ) {
							done.fail( e );
						}
					});
					
					
				});
				
				it( "modifies uploader_data on failure", function ( done ) {
					
					spyOn( uploader, "upload_buffer" ).and.callFake( function ( buffer ) {
						return new Promise( function ( resolve, reject ) {
							reject('asdf');
						});
					});
				
					uploader_module.upload_buffer( 'buffer' ).catch( function () {
						try {
							expect( data_manager["all_data"]["uploader_data"]["status"] ).toBe( "failure" );
							done();
						} catch ( e ) {
							done.fail( e );
						}
					});
					
					
				});
				
			});
			
		});

	} () )