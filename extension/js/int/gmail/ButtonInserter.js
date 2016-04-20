	
	function ButtonInserter ( chrome, $, event_hub, template, element, insert_reply_button, RecordingButton, recording_button_template ) {

		var proc = {

			insert_compose_button: function () {

				$(".I5").each( function ( index, container ) {

					if ( $( "#peppermint_compose_button", container ).length === 0 ) {

						var id = Date.now() + '-' + Math.random() + '-' + Math.random() + '-' + Math.random();
						var button = $( "#peppermint_compose_button", element.shadowRoot ).clone();
						
						container.dataset.id = id;
						button[0].dataset.id = id;
						
						button.on( 'click', function () {
							event_hub.fire( "peppermint_compose_button_click", { id } );

							chrome.runtime.sendMessage( { 
								receiver: 'GlobalAnalytics', name: 'track_analytic', 
								analytic: { name: 'click', val: { name : 'peppermint_compose_button_click' } } 
							});	
						});

						$( ".a8X.gU>div", container ).append( button );
			
						var recording_button = document.createElement( "div" );

						$( recording_button ).css({
							width: "19px",
							height: "19px"
						});

						$( ".v_compose_button_icon", button ).append(
							new RecordingButton(
								chrome,
								$,
								event_hub,
								recording_button_template,
								recording_button,
								{ stop_icon: false }
							)
						);

						recording_button.set_static_color( "rgba( 0, 0, 0, 1 )" );

					}

				});

			},

			insert_dropdown_button: function () {

				$(".b7.J-M").each( function ( index, container ) {
					if ( $( "#v_dropdown_button", container ).length === 0 ) {

						var button = $( "#v_dropdown_button", element.shadowRoot ).clone();

						button.on( "click", function () {
							event_hub.fire( "peppermint_reply_button_click", { type: "dropdown_button" } );

							chrome.runtime.sendMessage( { 
								receiver: 'GlobalAnalytics', name: 'track_analytic', 
								analytic: { name: 'click', val: { name : 'peppermint_dropdown_button_click' } } 
							});	
						});

						$( container ).children('div:eq(2)').after( button );

					}
				});

			},

			insert_reply_button: function () {

				$(".gH.acX").each( function ( index, container ) {
					if ( $( "#v_reply_button", container ).length === 0 ) {

						var button = $( "#v_reply_button", element.shadowRoot ).clone();

						button.on( "click", function () {
							event_hub.fire( "peppermint_reply_button_click", { type: "button" } );

							chrome.runtime.sendMessage( { 
								receiver: 'GlobalAnalytics', name: 'track_analytic', 
								analytic: { name: 'click', val: { name : 'peppermint_reply_button_click' } } 
							});	
						});

						$( container ).prepend( button );

					}
				});
				
				$(".a3s").each( function ( index, element ) {
					$("a[href^='https://peppermint.com/reply']", element ).each( function ( index, element) {
						var link = $(element);
						
						if ( link.attr('id') !== 'peppermintReply' ) {
							
							link.attr('id','peppermintReply');
				
							link.on( "click", function () {
								event.preventDefault();
								event_hub.fire( "peppermint_reply_button_click", { type: "button" } );

								chrome.runtime.sendMessage( { 
									receiver: 'GlobalAnalytics', name: 'track_analytic', 
									analytic: { name: 'click', val: { name : 'peppermint_reply_link_click' } } 
								});	
							})

						};
					})
					
				});

			},					

			replace_mock_player: function () {

				var pep_email = $( ".a3s table[alt='peppermint_email']" )[0];

				if ( pep_email && pep_email.querySelector( "span[alt='long_url']" ) ) {

					 var urls = {
						 long: pep_email.querySelector( "span[alt='long_url']" ).getAttribute( "title" ),
						 short: pep_email.querySelector( "span[alt='short_url']" ).getAttribute( "title" )
					 };
					 
					var audio_element = $( "<audio controls ></audio>" )[ 0 ];
					audio_element.src = urls.long;

					$( pep_email ).find( "table[alt='buttons']" ).after( audio_element );
					$( pep_email ).find( "table[alt='buttons']" ).remove();
					$( pep_email ).attr( "alt", "" );

					// if audio can't be reached, swap to an error message/icon
					// $.ajax({
					//	 type: 'HEAD',
					//	 url: urls.cloudfront_ssl,
					//	 complete: function(xhr, textStatus) {
							 
					//		 if( xhr.status == 403 || xhr.status == 404 )
					//		 {
					//			 Raven.captureMessage("invalid audio URL");
								 
					//			 $.get(chrome.extension.getURL('/html/templates/audio-player-error.html')
					//				 , function(template_html) {
									 
					//				 $( mock_player ).next().html(
					//					 template_html
					//					 .replace( "{{EXTENSION_ROOT}}", chrome.extension.geteURL("/") )
					//				 );
									 
					//			 });

								// chrome.runtime.sendMessage( { 
								// 	receiver: 'GlobalAnalytics', name: 'track_analytic', 
								// 	analytic: { name: 'setup', val: { 
								// 		name: 'buttoninserter',
								// 		action: 'replace_mock_player',
								// 		element: 'player_error_img',
								// 		url: urls.short } } 
								// });

					//		 }
					//	 }
					// });

					chrome.runtime.sendMessage( { 
						receiver: 'GlobalAnalytics', name: 'track_analytic', 
						analytic: { name: 'setup', val: { 
							name: 'buttoninserter',
							action: 'replace_mock_player',
							element: 'audio_player',
							url: urls.short } } 
					});

				}

			}

		};

		var handle = {

			start: function () {

				setInterval( tick, 50 );

			},

			tick: function () {

				proc.insert_compose_button();
				proc.insert_dropdown_button();
				proc.replace_mock_player();
				if ( insert_reply_button ) private.insert_reply_button();

			}

		};

		( function constructor () {

			element.createShadowRoot().appendChild( document.importNode( template.content, true ) );

		} () );

	};
	