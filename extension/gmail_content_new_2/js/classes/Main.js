	
	V.Model = function ( hub, window, $ ) {
		
		var obj = {
			
			try_recording: function ( callback ) {
				obj.audio_recorder.start( function ( started ) {
					if ( started ) {
						hub.fire({ name: 'recording_started' });
						callback( true );
					} else {
						hub.fire({ name: 'recording_failed' });
						callback( false );
					}
				});
			},
			
		};
		
		obj.audio_recorder = new V.AudioRecorder( window.Recorder, window.AudioContext, window.WORKER_PATH, window.navigator, window.FileReader );
		obj.uploader = new V.Uploader( $, hub );
		
		return {
			
			_obj_: obj,
			
			start_recording: function () {
				obj.try_recording( function ( success ) {
					
				});
			},
			
			stop_recording: function () {
				obj.audio_recorder.finish( function ( audio_data ) {
					var id = Math.ceil( Math.random() * Date.now() );
					obj.uploader.upload_audio( id, audio_data, function () {
						console.log('uploaded');
					});
					hub.fire({ name: 'recording_finished', audio_data: audio_data, id: id });
				});
			}

		};
	
	};
	
	( function () {
		
		var model_hub = new V.EventHub( 'model_hub', { window: window });
		var view_hub = new V.EventHub( 'view_hub', { window: window });
		var model = new V.Model( model_hub, window, jQuery );
		var view = new V.View( window, jQuery, view_hub );
		
		var controller = new V.Controller( view_hub, model_hub, view, model );
	
		model_hub.fire({ name: 'ready' });
		view_hub.fire({ name: 'ready' });
	
	} () );
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	