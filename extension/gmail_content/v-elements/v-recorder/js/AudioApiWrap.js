
	VAudioApiWrap = function ( Recorder, AudioContext, worker_path, navigator, FileReader ) {
		
		var public = {
			
			stream_to_recorder: function ( stream ) {
				return new Recorder(
					( new AudioContext() ).createMediaStreamSource( stream ),
					{
						workerPath: worker_path,
						numChannels: 1
					}
				);
			},
			
			blob_to_buffer: function ( blob ) {
				return new Promise( function ( resolve ) {
					var reader = new FileReader();
					reader.readAsArrayBuffer( blob );
					reader.onloadend = function () {
						resolve( reader.result );
					};
				});
			},

			blob_to_data_url: function ( blob ) {
				return new Promise( function ( resolve ) {
					var reader = new FileReader();
					reader.readAsDataURL( blob );
					reader.onloadend = function () {
						resolve( reader.result );
					};
				});
			},
			
			get_stream: function () {
				return new Promise( function ( resolve ) {
					navigator.getUserMedia(
						{
							audio: true
						},
						function ( stream ) {
							resolve( stream );
						},
						function () {
							resolve( false );
						}
					);
				});
			}
			
		};
		
		return public;
		
	};
	