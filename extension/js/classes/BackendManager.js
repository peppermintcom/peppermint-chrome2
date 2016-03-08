	
	function BackendManager ( ajax ) {
		
		var private = {

		};

		var public = {

			short_link_id_to_recording_data: function ( id ) {

				return new Promise( function ( resolve ) {

					resolve({

						long_url: "https://duw3fm6pm35xc.cloudfront.net/_oAqm47-jETljOd60kzauy/p6aIV4W6rj7c-dMTCoKnqd.mp3",
						transcription: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."

					});

				});

			}

		};

		return public;

	}
