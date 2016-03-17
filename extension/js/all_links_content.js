
	( function () {

		var launcher_helper = new LauncherHelper( jQuery );

		launcher_helper.urls_to_templates( chrome.extension.getURL( "/" ), [
		
			chrome.extension.getURL( "/templates/pep_link_addon.html" )
		
		])
		.then( function ( templates ) {

			var event_hub = new EventHub();
			var pep_link_addon_factory = new PepLinkAddonFactory( jQuery, PepLinkAddon, templates[ 0 ] );

			new AllLinksController(
				jQuery,
				event_hub,
				pep_link_addon_factory,
				new BackendManager( jQuery.ajax )
			);

		})

	} () )