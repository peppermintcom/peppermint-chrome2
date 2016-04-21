	
	function TwitterButtonInserter ( chrome, window, $, hub ) {
		
		var state = {

			interval: 0

		};

		var conv = {

			doc_to_button_container: function ( document ) {

				return document.querySelector( ".nav.right-actions" );

			}

		};

		var proc = {

			insert_compose_button: function ( container ) {

				$( container ).append(
					'<li role="complementary" aria-labelledby="global-new-tweet-button" class="topbar-tweet-btn">'+
						'<button style = "margin-left: 8px; padding: 0px 8px;" id="global-new-tweet-button" type="button" class="pep-compose-button js-global-new-tweet js-tooltip btn primary-btn tweet-btn js-dynamic-tooltip" data-placement="bottom" data-component-context="new_tweet_button" data-original-title="">'+
							'<img style = "height: 19px;" src = "'+ chrome.extension.getURL( "/img/white_mic.svg" ) +'" >'+
						'</button>'+
					'</li>'
				);

			}

		};

		var handle = {

			tick: function () {

				var container = conv.doc_to_button_container( window.document );

				if ( container ) {

					window.clearInterval( state.interval );
					proc.insert_compose_button( container );

				}

			},

			start: function () {

				state.interval = window.setInterval( handle.tick, 100 );
				
			}

		};

		( function () {

			hub.add({

				start: handle.start

			});

			$( document ).on( "click", ".pep-compose-button", function () { hub.fire( "compose_button_click" ) });

		} () )

	}
