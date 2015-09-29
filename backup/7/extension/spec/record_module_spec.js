	
	WORKER_PATH = '../extension/content_scripts/recorderWorker.js';
	
	describe( "recorder_module", function () {
		
		describe( "recorder", function () {
		
			describe( "create_recorder", function () {
				
				beforeAll( function ( done ) {
					done();
				});
				
				it( "calls back true if the recorder is already created", function () {
					
					V.record_module.recorder.recorder = true;
					V.record_module.recorder.stream = true;
					
					spyOn( window.navigator, 'getUserMedia' ).and.callFake( function ( data, success_callback, failure_callback ) {
						success_callback();
					});
					spyOn( V.record_module.recorder, 'create_recorder_from_stream' ).and.callFake( function () { } );
					
					V.record_module.recorder.create_recorder( function ( response ) {
						expect( response ).toBe( true );
					});
					
					V.record_module.recorder.recorder = null;
					V.record_module.recorder.stream = null;
					
				});
				
				it( "calls back true if access to microphone was allowed", function () {
					spyOn( window.navigator, 'getUserMedia' ).and.callFake( function ( data, success_callback, failure_callback ) {
						success_callback();
					});
					spyOn( V.record_module.recorder, 'create_recorder_from_stream' ).and.callFake( function () { } );
					V.record_module.recorder.create_recorder( function ( response ) {
						expect( response ).toBe( true );
					});
				});
				
				it( "calls back false if access to microphone was denied", function () {
					spyOn( window.navigator, 'getUserMedia' ).and.callFake( function ( data, success_callback, failure_callback ) {
						failure_callback();
					});
					spyOn( V.record_module.recorder, 'create_recorder_from_stream' ).and.callFake( function () { } );
					V.record_module.recorder.create_recorder( function ( response ) {
						expect( response ).toBe( false );
					});
				});
				
				it( "creates recorder and stream properties if access was allowed", function ( done ) {
					
					V.record_module.recorder.create_recorder( function ( response ) {
						
						if ( response === true ) {
							var recorder = V.record_module.recorder.recorder;
							var stream = V.record_module.recorder.stream;
							if ( recorder instanceof Recorder && ( stream instanceof webkitMediaStream || stream instanceof MediaStream ) ) {
								done();
							}
						}
						
					} );
					
					expect( true ).toBe( true );
					
				});
		
			});
		
			describe( "delete_recorder", function () {
				
				beforeAll( function ( done ) {
					V.record_module.recorder.create_recorder( function () {
						done();
					});
				});

				it( "deletes a recorder", function () {
					
					var recording_existed = V.record_module.recorder.delete_recorder();
					
					expect( V.record_module.recorder.recorder ).toBe( null );
					expect( V.record_module.recorder.stream ).toBe( null );
					
				});
		
			});
			
			describe( "get_audio_data", function () {
				
				afterAll( function () {
					V.record_module.recorder.delete_recorder();
				});

				it( "gets audio data", function ( done ) {
					
					V.record_module.recorder.create_recorder( function () {
						setTimeout(function(){
							V.record_module.recorder.get_audio_data( function ( data ) {
								if ( data.length > 1000 ) {
									done();
								} else {
									done.fail( 'data is less than 1000 characters' );
								}
							});
						},1000);
					});
					
					expect( true ).toBe( true );
					
				});
		
			});
			
		});
		
	});
	