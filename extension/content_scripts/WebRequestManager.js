
	V.WebRequestManager = function ( hub, window ) {
		
		return {
			
			enable_mail: function () {
				hub.fire({
					custom_event: true,
					name: 'enable_mail_request_1'
				});
			},
			
			disable_mail: function () {
				hub.fire({
					custom_event: true,
					name: 'disable_mail_request_1'
				});
			}
			
		}
		
	};
	
	
	
	
	
	