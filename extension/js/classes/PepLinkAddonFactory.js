	
	function PepLinkAddonFactory ( jQuery, event_hub, PepLinkAddon, template ) {
		
		var public = {

			make_addon: function ( link, long_url, transcription ) {

				return new PepLinkAddon(
					jQuery,
					event_hub,
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
