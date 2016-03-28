
	function HistoryController ( chrome, $, hub, history_item_factory ) {

		var state = {

		};

		var private = {

		};

		( function () {

			chrome.runtime.sendMessage( { receiver: "GlobalController", name: "get_recording_data_arr" }, function ( recording_data_arr ) {

				for ( var i = recording_data_arr.length; i--; ) {

					$( "#history_items_container" ).append( history_item_factory.make_item( recording_data_arr[ i ] ) );

				}

			});

		} () );

		( function set_up_runtime_message_handling () {

			var message_handlers = {

				got_audio_data: function ( message ) {

					var item = $( "div[data-id='{{ID}}']".replace( "{{ID}}", message.recording_data.id ) )[ 0 ]

					if ( !item ) {

						item = history_item_factory.make_item( message.recording_data );
						$( "#history_items_container" ).prepend( item );
						item.set_state( "uploading" );
						
					}

				},

				recording_uploaded: function ( message ) {

					var item = $( "div[data-id='{{ID}}']".replace( "{{ID}}", message.recording_data.id ) )[ 0 ]

					item.set_state( "uploaded" );

				}

			};

			chrome.runtime.onMessage.addListener( function ( message, sender, callback ) {

				if ( message.receiver === "Content" && message.recording_data && ( message.recording_data.source.name === "popup" || message.recording_data.source.name === "popup_feedback" ) ) {

					if ( message_handlers[ message.name ] ) {

						message_handlers[ message.name ]( message );

					}

				}

			});

		} () );

	}
