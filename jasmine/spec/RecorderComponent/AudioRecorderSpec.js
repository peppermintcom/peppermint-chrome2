
	( function () {
		
		describe( "AudioRecorder", function () {
			
			var audio_api_wrap = null;
			var audio_recorder = null;
			
			beforeEach( function () {
				
				audio_api_wrap = new V.AudioApiWrap();
				audio_recorder = new V.AudioRecorder( audio_api_wrap );
				
			});
			
			describe( "public start", function () {
				
				it( "resolves true if recording allowed", function ( done ) {
					
					spyOn( audio_api_wrap, "get_stream" ).and.callFake( function () {
						return new Promise( function ( resolve ) {
							resolve( true );
						});
					});
					
					spyOn( audio_api_wrap, "stream_to_recorder" ).and.callFake( function () {
						return new Promise( function ( resolve ) {
							resolve( true );
						});
					});
					
					audio_recorder.start().then( function ( started ) {
						if ( started === true ) {
							done();
						} else {
							done.fail();
						};
					});
					
					expect( true ).toBe( true );
					
				});
				
				it( "resolves false if recording was not allowed", function ( done ) {
					
					spyOn( audio_api_wrap, "get_stream" ).and.callFake( function () {
						return new Promise( function ( resolve ) {
							resolve( false );
						});
					});
					
					audio_recorder.start().then( function ( started ) {
						if ( started === false ) {
							done();
						} else {
							done.fail();
						};
					});
					
					expect( true ).toBe( true );
					
				});
				
			});
			
		});
		
	} () )
	
	