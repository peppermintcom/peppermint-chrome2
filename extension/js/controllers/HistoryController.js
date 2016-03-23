
	function HistoryController ( chrome, $, hub, history_item_factory ) {

		var state = {

		};

		var private = {

		};

		( function () {

			chrome.runtime.sendMessage( { receiver: "GlobalStorage", name: "get_recording_data_arr" }, function ( recording_data_arr ) {

				for ( var i = 0; i < recording_data_arr.length; i++ ) {

					$( "#history_items_container" ).append( history_item_factory.make_item( recording_data_arr[ i ] ) );

				}

			});

		} () )

	}
