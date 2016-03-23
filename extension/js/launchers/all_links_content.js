
	( function () {

		var launcher_helper = new LauncherHelper( jQuery );

		launcher_helper.urls_to_templates( chrome.extension.getURL( "/" ), [
		
			[ "addon", "html/elements/pep_link_addon.html" ]
		
		])
		.then( function ( t ) {

			var event_hub = new EventHub();
			var pep_link_addon_factory = new PepLinkAddonFactory( jQuery, event_hub, PepLinkAddon, t["addon"] );

			new AllLinksController(
				jQuery,
				event_hub,
				pep_link_addon_factory,
				new BackendManager( jQuery.ajax )
			);

		})

	} () )