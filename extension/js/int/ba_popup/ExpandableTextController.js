	
	function ExpandableTextController ( chrome, window, $, hub ) {
		
		var state = {

			template: ""

		};

		var conv = {

			get_template: function () {

				return new Promise ( function ( resolve ) {

					$.get( chrome.extension.getURL( "/html/elements/expandable_text.html" ), resolve );

				});

			},

			element_to_data: function ( element ) {

				var max_lines = parseInt( element.dataset.max_lines );
				var line_height = parseInt( element.dataset.line_height );
				var text_height = $( ".text", element ).height();
				var lines_amount = text_height / line_height;

				return { max_lines, line_height, text_height, lines_amount };

			}

		};

		var proc = {

			init_element: function ( element ) {

				element.innerHTML = state.template;
				$( element ).on( "click", ".show_more", handle.show_more_click );
				$( element ).on( "click", ".show_less", handle.show_less_click );

				proc.render_text( element );

			},

			render_text: function ( element ) {

				$( ".text", element ).css({ height: "initial" }).text( element.dataset.text );
				
				var data = element.ex_text_data = conv.element_to_data( element );
				console.log( data.text_height );

				if ( data.lines_amount <= data.max_lines ) {

					$( element ).css({ height: data.lines_amount * data.line_height });
					$( ".show_less", element ).hide();
					$( ".show_more", element ).hide();

				} else if ( data.lines_amount > data.max_lines ) {

					$( element ).css({ height: data.max_lines * data.line_height });
					$( ".text", element ).css({ height: ( data.max_lines - 1 ) * data.line_height });
					$( ".show_less", element ).hide();
					$( ".show_more", element ).show();

				}

			},

			shrink: function ( element ) {

				$( element ).css({ height: element.ex_text_data.max_lines * element.ex_text_data.line_height });
				$( ".text", element ).css({ height: ( element.ex_text_data.max_lines - 1 ) * element.ex_text_data.line_height });

				$( ".show_more", element ).show();
				$( ".show_less", element ).hide();

			},

			expand: function ( element ) {

				$( element ).css({ height: ( element.ex_text_data.lines_amount + 1 ) * element.ex_text_data.line_height });
				$( ".text", element ).css({ height: element.ex_text_data.lines_amount * element.ex_text_data.line_height });

				$( ".show_more", element ).hide();
				$( ".show_less", element ).show();

			}

		};

		var handle = {

			start: function () {

				conv.get_template()
				.then( function ( template ) {

					state.template = template;

					$( "div[data-element_name='expandable_text']" ).each( function ( index, element ) {

						proc.init_element( element );

					});

				});

			},

			text_change: function ( data ) {

				setTimeout( function () {

					proc.render_text( data.element );
					
				}, 1 );

			},

			show_more_click: function ( event ) {

				proc.expand( $( event.target ).closest( "div[data-element_name='expandable_text']" )[ 0 ] );

			},

			show_less_click: function ( event ) {

				proc.shrink( $( event.target ).closest( "div[data-element_name='expandable_text']" )[ 0 ] );

			}

		};

		( function () {

			hub.add({

				start: handle.start,
				text_change: handle.text_change

			})

		} () )

	}
