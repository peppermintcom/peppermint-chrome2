
	function ContentRecorder ( runtime ) {

		var public = {

			start: function () {
				return new Promise( function ( resolve, reject ) {

					runtime.sendMessage(
						{
							class_name: "BackgroundRecorder",
							method_name: "start"
						},
						function ( response ) {
							if ( response.started ) {
								resolve();
							} else {
								reject( response.error );
							}
						}
					);

				});
			},

			cancel: function () {
				runtime.sendMessage({
					class_name: "BackgroundRecorder",
					method_name: "cancel"
				});
			},

			finish: function () {
				return new Promise( function ( resolve, reject ) {

					runtime.sendMessage(
						{
							class_name: "BackgroundRecorder",
							method_name: "finish"
						},
						function () {

							resolve( chrome.getBackgroundPage() );
							console.log( blob_url );

							$.ajax({
								url: blob_url,
								type: 'GET',
								dataType: 'blob',
								success: function ( blob ) {
								
									console.log( blob );
									resolve( blob );
								
								}
							})
						
						}
					);

				});
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
				return new Promise ( function ( resolve ) {

					var reader = new FileReader();
					reader.onloadend = function () {
						resolve( reader.result );
					};
					reader.readAsDataURL( blob );
					
				});
			}

		};

		return public;

	}