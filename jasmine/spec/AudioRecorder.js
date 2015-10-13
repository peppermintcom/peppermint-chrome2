
	( function () {
		
		var mock = {
			
			Recorder: function () {
				
				return {
					
					record: function () {},

					stop: function () {},
					
					exportWAV: function ( callback ) {
						callback( new Blob );
					}
					
				}
				
			},
			
			AudioContext: function () {
				
				return {
					
					createMediaStreamSource: function () {}
					
				}
				
			},
			
			workerPath: '',
			
			navigator: {
				
				getUserMedia: function () {
					
				}
				
			},
			
			FileReader: function () {
				
				var this_obj = {
					
					readAsDataURL: function ( blob ) {
						
						this_obj.result = 'data:audio/wav;base64,audio';
						this_obj.onloadend();
						
					}
					
				};
				
				return this_obj;
				
			}
			
		};
		
		describe( "AudioRecorder", function () {
			
			var audio_recorder;
			
			describe( "start", function () {
				
				beforeAll( function () {
					audio_recorder = new V.AudioRecorder( mock.Recorder, mock.AudioContext, mock.workerPath, mock.navigator, mock.FileReader );
				});
				
				it( "calls back true if audio is enabled", function () {
				
					spyOn( mock.navigator, 'getUserMedia' ).and.callFake( function ( data, success_callback, failure_callback ) {
						success_callback();
					});
					
					audio_recorder.start( function ( response ) {
						expect( response ).toBe( true );
					} );
					
				});
				
				it( "calls back false if audio is disabled", function () {
				
					spyOn( mock.navigator, 'getUserMedia' ).and.callFake( function ( data, success_callback, failure_callback ) {
						failure();
					});
					
					audio_recorder.start( function ( response ) {
						expect( response ).toBe( true );
					} );
					
				});
				
				it( "calls back true if recorder already started", function () {
					
					audio_recorder.start( function () {} );				
					
					audio_recorder.start( function ( response ) {
						expect( response ).toBe( true );
					} );				
					
				});
				
			});
			
			describe( "finish", function () {
				
				beforeAll( function () {
					audio_recorder = new V.AudioRecorder( mock.Recorder, mock.AudioContext, mock.workerPath, mock.navigator, mock.FileReader );
				});
				
				it( 'calls back false if recorder was not started', function () {
					
					audio_recorder.finish( function ( response ) {
						expect( response ).toBe( false );
					});
					
				});
				
				xit( 'calls back long base64 data string ', function () {
					
					spyOn( mock.navigator, 'getUserMedia' ).and.callFake( function ( data, success_callback, failure_callback ) {
						success_callback();
					});
					
					audio_recorder.start( function () {} );
					audio_recorder.finish( function ( response ) {
						expect( response ).toBe( 'audio' );
					});
					
				});
				
			});
			
		});

	} () )