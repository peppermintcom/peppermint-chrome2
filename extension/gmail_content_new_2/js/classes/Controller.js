
	V.Controller = function ( view_hub, model_hub, view, model ) {
		
		view_hub.add({
		
			'compose_button_start_click': function () {
				model.start_recording();
			},
			'compose_button_stop_click': function () {
				model.stop_recording();
			},
			
			'popup_done_click': function () {
				view.components.popup.hide();
				model.stop_recording();
			},
			'popup_cancel_click': function () {
				view.components.popup.hide();
				model.stop_recording();
			}
			
		});
		
		model_hub.add({
			
			"ready": function () {
				view.add_components();
			},
			
			"recording_started": function () {
				view.components.compose_button.make_active();
				view.components.popup.show_recording();
			},		
			"recording_finished": function ( data ) {
				view.components.compose_button.make_idle();
				view.components.letter.add_placeholder_link( data );
			},
			"data_change": function ( data ) {
				
				var options = {
					
					'uploader': function ( data ) {
						
						view.components.letter.add_real_link( data );
						
					}
					
				};
				
				if ( options[ data.data_name ] ) options[ data.data_name ]( data.data );
				
			}
			
		});
		
	};
	
	
	
	
	
	