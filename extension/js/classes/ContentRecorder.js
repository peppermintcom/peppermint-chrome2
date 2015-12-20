
	function ContentRecorder ( runtime, event_hub ) {

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
						function ( data_url ) {
								
							console.log( data_url );
							resolve( public.data_url_to_blob( data_url ) );
						
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
			},

			data_url_to_blob: function ( dataURL ) {

			    var BASE64_MARKER = ';base64,';
			    if (dataURL.indexOf(BASE64_MARKER) == -1) {
			      var parts = dataURL.split(',');
			      var contentType = parts[0].split(':')[1];
			      var raw = decodeURIComponent(parts[1]);

			      return new Blob([raw], {type: contentType});
			    }

			    var parts = dataURL.split(BASE64_MARKER);
			    var contentType = parts[0].split(':')[1];
			    var raw = window.atob(parts[1]);
			    var rawLength = raw.length;

			    var uInt8Array = new Uint8Array(rawLength);

			    for (var i = 0; i < rawLength; ++i) {
			      uInt8Array[i] = raw.charCodeAt(i);
			    }

			    return new Blob([uInt8Array], {type: contentType});
			}

		};

		return public;

	}