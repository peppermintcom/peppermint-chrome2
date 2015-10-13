
	V.Controller = function ( view_hub, model_hub, view, model ) {
		
		view_hub.add({
		
			'compose_button_start_click': function () {
				model.start_recording();
			},
		
			'compose_button_stop_click': function () {
				model.stop_recording();
			}
			
		});
		
		model_hub.add({
			
			"ready": function () {
				view.add_components();
			},
			
			"recording_started": function () {
				view.components.compose_button.make_active();
			},		
			
			"recording_finished": function ( data ) {
				view.components.compose_button.make_idle();
				view.components.letter.add_audio( data );
			}
			
		});
		
	};
	
	
	
	
	
	