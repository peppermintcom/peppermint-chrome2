
	function AudioVisualizer ( chrome, $, event_hub, element ) {
		
		var private = {
			
			get_table_string: function ( rows, cols ) {

				var row_string = "<tr>";
				for ( var i = cols; i--; ) row_string += "<td></td>";
				row_string += "</tr>";

				var table_string = "<table>";
				for ( var i = rows; i--; ) table_string += row_string;
				table_string += "</table>";

				return table_string;

			}

		};
		
		var public = {

			set_frequency_data: function ( frequency_data ) {

				var rows = $( "tbody", element )[ 0 ].rows;

				for ( var i = 0; i < rows.length; i++ ) {

					var cells = rows[ i ].cells;

					for ( var j = 0; j < cells.length; j++ ) {

						var frequency_rows = Math.floor( rows.length * frequency_data[ j * 4 ] / 256 / 2 );
						if ( i <= frequency_rows ) {
							cells[ j ].classList.add( "active" );
						} else {
							cells[ j ].classList.remove( "active" );
						}

					}

				}

			}

		};

		( function constructor () {

			$( element ).append( private.get_table_string( 20, 50 ) );

			$.extend( element, public );

		} () )

		return element;
			
	};
