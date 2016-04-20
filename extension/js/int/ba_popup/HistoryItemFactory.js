	
	function HistoryItemFactory ( chrome, jQuery, event_hub, HistoryItem, histry_item_template, Player, player_template ) {
		
		var public = {

			make_item: function ( recording_data ) {

				var player = new Player( jQuery, event_hub, player_template, document.createElement( "div" ) );

				return new HistoryItem(
					chrome,
					jQuery,
					event_hub,
					histry_item_template,
					document.createElement( "div" ),
					player,
					recording_data
				);

			}

		};

		return public;

	}
