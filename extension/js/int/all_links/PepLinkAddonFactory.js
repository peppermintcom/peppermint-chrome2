	
	function PepLinkAddonFactory ( chrome, jQuery, event_hub, PepLinkAddon, template ) {
		
		var public = {

			make_addon: function ( link, short_link_id ) {

				return new PepLinkAddon(
					chrome,
					jQuery,
					event_hub,
					template,
					document.createElement( "div" ),
					link
				);

			}

		};

		return public;

	}
