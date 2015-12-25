	
	function ButtonInserter ( $, insert_reply_button, template, element, img_url, event_hub ) {

		var private = {

			insert_compose_button: function () {
				setInterval( function () {

					$(".I5").each( function ( index, container ) {

						if ( $( "#peppermint_compose_button", container ).length === 0 ) {

							var id = Date.now() + '-' + Math.random() + '-' + Math.random() + '-' + Math.random();
							var button = $( "#peppermint_compose_button", element.shadowRoot ).clone();
							
							container.dataset.id = id;
							button[0].dataset.id = id;
							
							button.on( 'click', function () {
								event_hub.fire( "peppermint_compose_button_click", { id } );
							});

							$( ".a8X.gU>div", container ).append( button );

						}

					});

				}, 50 );
			},

			insert_dwopdown_button: function () {
				setInterval( function () {
					$(".b7.J-M").each( function ( index, container ) {
						if ( $( "#v_dropdown_button", container ).length === 0 ) {

							var button = $( "#v_dropdown_button", element.shadowRoot ).clone();

							button.on( "click", function () {
								event_hub.fire( "peppermint_reply_button_click" );
							});

							$( container ).children('div:eq(2)').after( button );

						}
					});
				}, 50 );
			},

			insert_reply_button: function () {
				setInterval( function () {

					$(".gH.acX").each( function ( index, container ) {
						if ( $( "#v_reply_button", container ).length === 0 ) {

							var button = $( "#v_reply_button", element.shadowRoot ).clone();

							button.on( "click", function () {
								event_hub.fire( "peppermint_reply_button_click" );
							});

							$( container ).prepend( button );

						}
					});
					
					$(".a3s").each( function ( index, element ) {
					   $("img[src*='player.png']", element )
                        .each( function ( index, element) {
                            if(!$(element).data('checked')){
                                $(element).attr('data-checked','true');
                                embed_message_audio(element);
                            }
                        });	
					});
					
				}, 50 );
			}

		};
                                
		var public = {

		};

		( function constructor () {

			template.innerHTML = template.innerHTML.replace( /{{IMG_URL}}/g, img_url );
			element.createShadowRoot().appendChild( document.importNode( template.content, true ) );

			$.extend( element, public );

			private.insert_compose_button();
			private.insert_dwopdown_button();
			if ( insert_reply_button ) private.insert_reply_button();

		} () );
        
        function embed_message_audio(element){
                        
			var parentTable = function (element) {
                return $(element).closest('table').parents('table')[1];
            } (element);
            
            var audioLink = function(element) {
                return $(parentTable).prev().find('input[name="audio_player"]');                
            } (element);            
		  
            if(audioLink.length > 0){                
                var script = '<audio controls src="' + audioLink.first().val() + '"></audio>'
                
                $('input[name="audio_player"]').replaceWith(script);
                
                $(parentTable).remove();
            }
        }

		return element;

	};
	