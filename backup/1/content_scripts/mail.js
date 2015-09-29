
	( function () {
		
		
		
		var gmail = null,
		audio = null;
	
		function add_reply_button () {
	
			var table = document.querySelector('.cf.ix'),
			tbody = table.tBodies[0],
			row = tbody.rows[0],
			cell = document.createElement('td'),
			button = document.createElement('input');
			
			row.appendChild(cell);
			cell.appendChild(button);
			table.style.tableLayout='auto';
			button.value = 'Reply via peppermint';
			button.type = 'button'
			button.id = 'v_button';
			
			return button;
		
		}
		
		function ping () {

			if ( document.querySelector('.cf.ix') && !document.getElementById( 'v_button' ) ) {
				var button = add_reply_button();
				button.onclick = reply_button_click;
			}

		}
		
		
		
		function reply_button_click () {
			
			navigator.webkitGetUserMedia(
				{audio:true},
				function ( localMediaStream ) {
					audio = document.createElement('audio');
					audio.src = window.URL.createObjectURL(localMediaStream);
				},
				function () {}
			)
			
		}
		
		
		
		setInterval( ping, 50 );
		
		
		
	} () )