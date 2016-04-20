	
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
						'<button id="global-new-tweet-button" type="button" class="js-global-new-tweet js-tooltip btn primary-btn tweet-btn js-dynamic-tooltip" data-placement="bottom" data-component-context="new_tweet_button" data-original-title="">'+
							'<span class="Icon Icon--tweet Icon--large"></span>'+
							'<span class="text">Твитнуть</span>'+
						'</button>'+
					'</li>'
				);

			}

		};

		var handle = {

			tick: function () {

				console.log( 1 );

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

		} () )

	}
