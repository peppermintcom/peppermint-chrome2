
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

		var mail_sender = {
			
			mail_raw_template: "MIME-Version: 1.0\n\
Content-Type: multipart/mixed; boundary=frontier\n\
From: me\n\
To: {{RECEIVER}}\n\
In-Reply-To: {{MESSAGE_ID}}\n\
References: {{REFERENCES}}\n\
Subject: {{SUBJECT}}\n\
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
--frontier--",

			get_parsed_mail: function ( receiver, subject, message_id, references, audio_data) {
				return mail_sender.mail_raw_template
						.replace( '{{RECEIVER}}', receiver )
						.replace( '{{SUBJECT}}', subject )
						.replace( '{{MESSAGE_ID}}', message_id )
						.replace( '{{REFERENCES}}', references )
						.replace( '{{DATA}}', audio_data )
						.replace( /\//gm,'_').replace( /\+/gm,'-');
			},

			get_raw_mail: function ( receiver, subject, message_id, references, audio_data) {
				return btoa(
					mail_sender.mail_raw_template
						.replace( '{{RECEIVER}}', receiver )
						.replace( '{{SUBJECT}}', subject )
						.replace( '{{MESSAGE_ID}}', message_id )
						.replace( '{{REFERENCES}}', references )
						.replace( '{{DATA}}', audio_data )
				).replace( /\//gm,'_').replace( /\+/gm,'-');
			},
			
			get_subject_from_response: function ( response ) {
				var subject = '';
				response.payload.headers.forEach( function ( header ) {
					if ( /subject/i.test( header.name ) ) subject = header.value;
				});
				return subject;
			},
			
			get_references_from_response: function ( response ) {
				var references = '';
				response.payload.headers.forEach( function ( header ) {
					if ( /references/i.test( header.name ) ) references = header.value;
				});
				return references;
			},
			
			get_message_id_from_response: function ( response ) {
				var message_id = '';
				response.payload.headers.forEach( function ( header ) {
					if ( /message-id/i.test( header.name ) ) message_id = header.value;
				});
				return message_id;
			},
			
			get_thread: function ( thread_id, callback ) {
				gapi.client.gmail.users.threads.get({
					'userId': 'me',
					'id': thread_id
				}).execute( callback );
			},
			
			get_message: function ( message_id, callback ) {
				gapi.client.gmail.users.messages.get({
				  'userId': 'me',
				  'id': message_id
				}).execute( callback );
			},
			
			reply_to_message: function ( receiver, audio_data, response, callback ) {
				
				var message_id = mail_sender.get_message_id_from_response( response );
				var subject = mail_sender.get_subject_from_response( response );
				var references = ( mail_sender.get_references_from_response( response ) + ' ' + message_id ).trim();
				console.log( mail_sender.get_parsed_mail( receiver, subject, message_id, references, 'audio data' ) );
				console.log( response.threadId );
				
				gapi.client.gmail.users.messages.send({
					'userId': 'me',
					'resource': {
						'thread_id': response.threadId,
						'raw': mail_sender.get_raw_mail( receiver, subject, message_id, references, audio_data )
					}
				}).execute(function(response){
					console.log( response );
					callback();
				});
			
			},
			
			send_mail: function ( audio_data, mail_data, callback ) {
				mail_sender.get_thread( mail_data.thread_id, function ( response ) {
					mail_sender.get_message( response.messages.pop().id, function ( response ) {
						mail_sender.reply_to_message( mail_data.to, audio_data, response, callback );
					});
				});
			}

		};
		
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
			
		};

		V.addObservers({
			
			'send_data_request': function ( data, callback ) {
				console.log( data );
				mail_sender.send_mail( data.audio_data, data.mail_data, callback );
			},
			
			'authorize_request': function ( data, callback ) {
				authorize( callback );
			}
			
		});
		
	} () );
	
	
	
	
	