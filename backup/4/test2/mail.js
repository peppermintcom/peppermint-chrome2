
		
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
		
		
		
		function reply_button_click (event) {
			
		
				
				if (event.target.value=='stop and send') {
				
					alert( 'Recording Stopped and Sent' );
					event.target.value = 'reply via peppermint';
					stopRecording();
					
				}else{
			authorize(function(){

					alert( 'Press OK to start Recording' );
					event.target.value = 'stop and send';
					startRecording();
			})
				}
			
		}
		
		function startRecording(){		

				document.dispatchEvent(new CustomEvent('v_start'));
			
		}
		
		function stopRecording(){
			document.dispatchEvent(new CustomEvent('v_stop'));
		}
		
		document.addEventListener('recorder_ready',function(){
		
			setInterval( ping, 1000 );

		} )
	
	
	
	