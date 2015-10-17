	
	V.Uploader = function ( $ ) {
		
		var obj = {
			
		};
		
		return {
			
			upload_audio: function ( id, audio_data, callback ) {
				$.ajax(
					'******/upload.php?id='+id,
					{
						type: 'POST',
						data: audio_data,
						success: callback,
						processData: false
					}
				);
			}
			
		}
		
	}