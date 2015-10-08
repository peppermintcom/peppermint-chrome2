
	var
		API_KEY = 'AIzaSyDOCP0xOiJ4SDKFFz1Iw5T_0zRP98NOku4',
		CLIENT_ID = '10346040300-81s5iin2daqci67lrht3i1hqradsedvq.apps.googleusercontent.com',
		SCOPE = 'https://www.googleapis.com/auth/gmail.compose https://www.googleapis.com/auth/gmail.modify';

	function v_client_load () {
		
		gapi.client.setApiKey( API_KEY );
		gapi.client.load( 'gmail', 'v1' ).then(function(){
			V.notifyObservers( 'gmail_api_ready' );
		});
		
	}

	( function () {
		
		// CONSTANTS
		var
			MAIL_TEXT = "MIME-Version: 1.0\n\
Content-Type: multipart/mixed; boundary=frontier\n\
From: me\n\
To: {{RECEIVER}}\n\
In-Reply-To: {{THREAD_ID}}\n\
References: {{REFERENCES}}\n\
Subject: PepperMint Voice Mail\n\
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
{{DATA}}\n\
--frontier--";
		
		// FUNCTIONS
		function get_raw_mail ( mail_text ) {
			return btoa( mail_text ).replace( /\//gm,'_').replace( /\+/gm,'-');
		}
		
		function get_references_from_messages ( messages ) {
			var references = '';
			messages.forEach( function ( message ) {
				references += message.id + ' ';
			});
			return references.trim();
		}
		
		function send_mail ( audio_data, mail_data, callback ) {
			
			gapi.client.gmail.users.threads.get({
			  'userId': 'me',
			  'id': mail_data.thread_id
			}).execute( function ( response ) {
				console.log( MAIL_TEXT.replace( '{{RECEIVER}}', mail_data.to ).replace( '{{THREAD_ID}}', mail_data.thread_id ).replace( '{{REFERENCES}}', get_references_from_messages( response.messages ) ) );
				gapi.client.gmail.users.messages.send({
					'userId': 'me',
					'resource': {
						'threadId': mail_data.thread_id,
						'raw': get_raw_mail( MAIL_TEXT.replace( '{{RECEIVER}}', mail_data.to ).replace( '{{THREAD_ID}}', mail_data.thread_id ).replace( '{{REFERENCES}}', get_references_from_messages( response.messages ) ).replace( '{{DATA}}', audio_data ) )
					}
				}).execute(function(response){
					console.log( response );
					callback();
				});
			});
			
		}

		function authorize ( callback ) {
			
			gapi.auth.authorize(
				{
					client_id: CLIENT_ID,
					scope: SCOPE,
					immediate: false
				},
				function ( token_obj ) {
					console.log( token_obj );
					if ( typeof callback === 'function' ) callback();
				}
			);		
			
		}

		V.addObservers({
			
			'send_data_request': function ( data, callback ) {
				console.log( data );
				send_mail( data.audio_data, data.mail_data, callback );
			},
			
			'authorize_request': function ( data, callback ) {
				authorize( callback );
			}
			
		});
		
	} () );
	
	
	
	
	