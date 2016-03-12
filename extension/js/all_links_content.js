
	( function () {

		var event_hub = new EventHub();

		new AllLinksController(
			jQuery,
			event_hub,
			new PeppermintLinkMaker ( jQuery, chrome ),
			new BackendManager( jQuery.ajax )
		);

	} () )