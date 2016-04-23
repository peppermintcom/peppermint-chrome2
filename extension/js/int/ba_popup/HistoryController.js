
	function HistoryController ( chrome, $, hub, history_item_factory ) {

		var state = {

		};

		var proc = {


		};

		var handle = {

			runtime_message: function ( message, sender, callback ) {

				if ( message.receiver === "Content" && message.recording_data && ( message.recording_data.source.name === "popup" || message.recording_data.source.name === "popup_feedback" ) ) {

					if ( handle[ message.name ] ) {

						handle[ message.name ]( message );

					}

				}

			},

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

			},

			start: function () {

				chrome.runtime.sendMessage( { receiver: "GlobalController", name: "get_recording_data_arr" }, function ( recording_data_arr ) {

					for ( var i = recording_data_arr.length; i--; ) {

						if ( recording_data_arr[ i ].state !== "recording" ) {

							$( "#history_items_container" ).append( history_item_factory.make_item( recording_data_arr[ i ] ) );
							
						}

					}

				});

			}

		};

		( function set_up_runtime_message_handling () {

			hub.add({

				start: handle.start

			});

			chrome.runtime.onMessage.addListener( handle.runtime_message );

		} () );

	}
