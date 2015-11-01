	
	V.DataManager = function () {
		
		var all_data = {
			
			audio_data: {},
			uploader_data: {}
			
		}
		
		return {
			
			all_data : all_data,
		
			update_data: function ( data_name, data ) {
				Object.keys( data ).forEach( function ( key ) {
					all_data[ data_name ][ key ] = data[ key ];
				});
			}

		};
		
	};
	