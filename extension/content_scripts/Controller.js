
	V.Controller = function ( view_hub, main_hub, view, main ) {
		
		view_hub.add({
		
			'compose_button_click': function () {
				// view.disable_buttons();
				view.components.compose_manager.open();
				main.disable_mail();
			},
			"reply_button_click": function () {
				main.start_reply();
				view.disable_buttons();	
			},			
			"dropdown_button_click": function () {
				main.start_reply();
			},
			
			"popup_done_click": function () {
				view.components.notifier.notify_sending();
				main.finalize_recording();
				view.components.popup.hide();
			},		
			"popup_cancel_click": function () {
				main.cancel_recording();
				view.components.popup.hide();
				view.enable_buttons();
			},
			"popup_receiver_done_click": function () {
				view.components.popup.hide();
			},
			"popup_error_cancel_click": function () {
				view.components.popup.hide();
				view.enable_buttons();
			}
			
		});
		
		main_hub.add({
			
			"ready": function () {
				view.add_components();
			},
			
			"recording_started": function () {
				view.components.popup.show_recording();
			},		
			
			"recording_failed": function () {
				view.components.popup.show_error();
			},
			
			"authorize_request_failed": function () {
				view.components.popup.hide();
				view.enable_buttons();
			},
		
			"data_sent": function () {
				view.enable_buttons();
				view.components.notifier.notify_sent();
			},
			
			"mail_intercepted_2": function ( data ) {
				main.start_compose( data );
				main.enable_mail();
				view.components.popup.show_recording();
			}
			
		});
		
	};
	
	
	
	
	
	