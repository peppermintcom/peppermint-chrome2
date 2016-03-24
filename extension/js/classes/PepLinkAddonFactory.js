	
	function PepLinkAddonFactory ( jQuery, PepLinkAddon, template ) {
		
		var public = {

			make_addon: function ( link, long_url, transcription ) {

				return new PepLinkAddon(
					jQuery,					
					template,
					document.createElement( "div" ),
					long_url,
					transcription,
					link
				);

			}

		};

		return public;

	}
