	
	V.PopupModule = function ( data_manager, popup_hub, popup ) {
		
		var private = {
			
			
			
		};
		
		var public = {
		
			set_page: function ( page_name ) {
				popup.set_page( page_name );
				data_manager.update_data( 'popup_data', { page_name: page_name });
			},
			
			open: function () {
				popup.open();
				data_manager.update_data( 'popup_data', { state: 'opened' });
			},
			
			close: function () {
				popup.close();
				data_manager.update_data( 'popup_data', { state: 'closed' });
			}

		};
		
		return public;
		
	}