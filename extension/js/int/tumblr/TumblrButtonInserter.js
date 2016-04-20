	
	function TumblrButtonInserter ( $, hub ) {
		
		var state = {

			inserted: false

		};

		var private = {

			document_to_container: function ( document ) {

				return $( "#user_tools", document )[ 0 ];

			},

			container_has_button: function ( container ) {
				
				return container.dataset.has_button === "1";

			},

			insert_button: function ( container ) {
				
				container.dataset.has_button = "1";

				var button = $( "<img src = '{{SRC}}' >".replace( "{{SRC}}", chrome.extension.getURL( "/img/white_tumblr_mic.svg" ) ) );

				button.css({ height: "20px" });

				var button_wrap = $(
					'<div class="tab iconic" id="account_button">'+
						'<button tabindex="7" class="tab_anchor" aria-haspopup="true" title="Peppermint" >'+
							'<i class="icon_user_settings" id = "pep_button_wrap" ></i>'+
						'</button>'+
						'<span class="tab_notice tab-notice--outlined ">'+
							'<span class="tab_notice_value">0</span>'+
						'</span>'+
					'</div>'
				);

				button_wrap.on( "click", function () {

					hub.fire( "tumblr_mic_button_click" );

				});

				$( "#pep_button_wrap", button_wrap ).append( button );
				$( container ).prepend( button_wrap );

			}

		};

		( function () {

			( function tick () {

				var container = private.document_to_container( document );

				if ( container && !private.container_has_button( container ) ) {

					state.inserted = true;
					private.insert_button( container );

				}

				if ( ! state.inserted ) requestAnimationFrame( tick );

			} () )

		} () )

	}
