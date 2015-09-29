
		// INITIAL CODE
		
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
			
			alert( 'Recording Started' );
			event.target.value = 'stop and send';
			event.target.onclick = stopRecording;
			startRecording();
			
		}
		
		
		
		setInterval( ping, 1000 );
		
		
	// GMAIL API

	function client_load () {
		
        gapi.client.setApiKey('AIzaSyDOCP0xOiJ4SDKFFz1Iw5T_0zRP98NOku4');
        gapi.client.load('gmail', 'v1').then(function(){});
		
	}

	function send_mail (data) {
		
		var request = gapi.client.gmail.users.messages.send({
			'userId': 'me',
			'resource': {
				'raw':btoa("MIME-Version: 1.0\n\
Content-Type: multipart/mixed; boundary=frontier\n\
From: me\n\
To: bash.vlas@gmail.com\n\
\n\
This is a message with multiple parts in MIME format.\n\
--frontier\n\
Content-Type: text/html\n\
\n\
I sent you an audio reply with <a href='http://peppermint.com'>peppermint.com</a>\n\
--frontier\n\
Content-Type: audio/wav\n\
Content-Transfer-Encoding: base64\n\
Content-Disposition: attachment\n\
\n\
"+data+"\n\
--frontier--" ).replace( /\//gm,'_').replace( /\+/gm,'-')			
			}
			
		});
		
		request.execute(function(response){
			console.log(response);
		});
		
	}

	function authorize (callback) {
		
		gapi.auth.authorize(
			{
				client_id:'10346040300-81s5iin2daqci67lrht3i1hqradsedvq.apps.googleusercontent.com',
				scope:'https://www.googleapis.com/auth/gmail.compose',
				immediate: true
			},
			function ( token_obj ) {
				console.log( token_obj );
				callback();
			}
		);		
		
	}

	function send_data (data) {

		authorize(function(){
			send_mail(data)
		})
		
	}
	
	// Recording
	function startRecording () {
		chrome.runtime.sendMessage({
			comand: 'start'
		});
	}
	
	function stopRecording () {
		chrome.runtime.sendMessage({
			comand: 'stop'
		},function(data){
			console.log(data);
			send_mail(data);
		})
	}
	
	// chrome.runtime.onMessage.addListener(function(message){
		// console.log(message)
		// if(message.comand='response'){
			// console.log(message.data)
		// }
	// })

	
	
	
	
	