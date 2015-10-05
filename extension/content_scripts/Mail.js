
	V.GmailWrapper = function ( gapi ) {
	
		var obj = {
			
			get_header: function ( headers, header_regex ) {
				var searched_header = '';
				headers.forEach( function ( header ) {
					if ( header_regex.test( header.name ) ) searched_header = header.value;
				});
				return searched_header;
			}
			
		};
	
		return {
			
			_obj_: obj,
			
			get_thread_data: function ( gmail_thread_id, callback ) {
				
				gapi.client.gmail.users.threads.get({
					'userId': 'me',
					'id': gmail_thread_id
				}).execute( function ( response ) {
					callback({
						last_gmail_message_id: response.messages.pop().id
					});
				});
				
			},
			
			get_message_data: function ( gmail_message_id, callback ) {
				
				gapi.client.gmail.users.messages.get({
				  'userId': 'me',
				  'id': gmail_message_id
				}).execute( function ( response ) {
					callback({
						subject: obj.get_header( response.payload.headers, /subject/i ),
						raw_id: obj.get_header( response.payload.headers, /message-id/i ),
						references: (
							obj.get_header( response.payload.headers, /references/i ) + ' ' +
							obj.get_header( response.payload.headers, /message-id/i )
						).trim()
					});
				});
				
			},
			
			send_reply: function ( thread_id, raw, callback ) {

				gapi.client.gmail.users.messages.send({
					'userId': 'me',
					'resource': {
						'thread_id': thread_id,
						'raw': raw
					}
				}).execute( function ( response ) {
					callback( response );
				});
				
			},
			
			send_new_mail: function ( raw, callback ) {

				gapi.client.gmail.users.messages.send({
					'userId': 'me',
					'resource': {
						'raw': raw
					}
				}).execute( function ( response ) {
					callback( response );
				});
				
			}
			
		};
		
	};
	
	V.Mail = function ( gmail_wrapper ) {
		
		var obj = {

			sending: false,
		
			get_raw_reply: function ( data ) {
				return btoa("MIME-Version: 1.0\n\
Content-Type: multipart/mixed; boundary=frontier\n\
From: me\n\
To: {{RECEIVER}}\n\
References: {{REFERENCES}}\n\
In-Reply-To: {{MESSAGE_ID}}\n\
Subject: Re:{{SUBJECT}}\n\
\n\
This is a message with multiple parts in MIME format.\n\
--frontier\n\
Content-Type: text/html\n\
\n\
I sent you an audio reply with <a href='http://peppermint.com'>Peppermint.com</a>\n\
--frontier\n\
Content-Type: audio/wav\n\
Content-Transfer-Encoding: base64\n\
Content-Disposition: attachment; filename={{FILENAME}}\n\
\n\
{{DATA}}\n\
--frontier--"
					.replace( '{{RECEIVER}}', data.receiver )
					.replace( '{{SUBJECT}}', data.subject )
					.replace( '{{REFERENCES}}', data.references )
					.replace( '{{MESSAGE_ID}}', data.references )
					.replace( '{{FILENAME}}', data.filename )
					.replace( '{{DATA}}', data.audio_data )
				).replace( /\//gm,'_').replace( /\+/gm,'-');
			},
			get_raw_new_mail: function ( data ) {
				return btoa("MIME-Version: 1.0\n\
Content-Type: multipart/mixed; boundary=frontier\n\
From: me\n\
To: {{RECEIVER}}\n\
Subject: {{SUBJECT}}\n\
\n\
This is a message with multiple parts in MIME format.\n\
--frontier\n\
Content-Type: text/html\n\
\n\
I sent you an audio reply with <a href='http://peppermint.com'>Peppermint.com</a>\n\
--frontier\n\
Content-Type: audio/wav\n\
Content-Transfer-Encoding: base64\n\
Content-Disposition: attachment; filename={{FILENAME}}\n\
\n\
{{DATA}}\n\
--frontier--"
					.replace( '{{RECEIVER}}', data.receiver )
					.replace( '{{SUBJECT}}', data.subject )
					.replace( '{{FILENAME}}', data.filename )
					.replace( '{{DATA}}', data.audio_data )
				).replace( /\//gm,'_').replace( /\+/gm,'-');
			},
			create_filename : function () {
				var date = new Date();
				var filename = 'Peppermint-audio-'+date.getFullYear()+'/'+(date.getMonth()+1)+'/'+date.getDate()+'-'+date.getHours()+':'+date.getMinutes()+'.wav';
				return filename;
			},
			
			send_reply_mail: function ( audio_data, mail_data, callback ) {
				if ( !obj.sending ) {
					gmail_wrapper.get_thread_data( mail_data.thread_id, function ( thread_data ) {
						gmail_wrapper.get_message_data( thread_data.last_gmail_message_id, function ( message_data ) {
							obj.sending = true;
							gmail_wrapper.send_reply(
								mail_data.thread_id,
								obj.get_raw_reply({
									receiver: mail_data.receiver,
									subject: message_data.subject,
									message_id: message_data.raw_id,
									references: message_data.references,
									filename: obj.create_filename(),
									audio_data: audio_data
								}),
								function ( response ) {
									obj.sending = false;
									callback( response );
								}
							);
						});
					});
				} else {
					callback( false );
				}
			},
			send_new_mail: function ( audio_data, mail_data, callback ) {
				if ( !obj.sending ) {
					obj.sending = true;
					gmail_wrapper.send_new_mail(
						obj.get_raw_new_mail({
							receiver: mail_data.receiver,
							subject: 'Peppermint Voice Mail',
							filename: obj.create_filename,
							audio_data: audio_data
						}),
						function ( response ) {
							obj.sending = false;
							callback( response );
						}
					);
				} else {
					callback( false );
				}
			},
		
		};
		
		return {
			
			_obj_: obj,
			
			is_sending: function () {
				return obj.sending;
			},
			
			send_reply: function ( audio_data, mail_data, callback ) {
				obj.send_reply_mail( audio_data, mail_data, callback );
			},
			
			send_new: function ( audio_data, mail_data, callback ) {
				obj.send_new_mail( audio_data, mail_data, callback );
			}
		
		};
		
	};
	