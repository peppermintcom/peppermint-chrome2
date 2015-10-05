
	( function () {
		
		var mock = {

			gmail_wrapper: {

				get_thread_data: function ( gmail_thread_id, callback ) {
					callback({
						last_gmail_message_id: '88888888'
					});
				},
				
				get_message_data: function ( gmail_message_id, callback ) {
					callback({
						subject: 'subject',
						raw_id: 'raw_id',
						references: 'refs'
					});
				},
			
				send_reply: function ( thread_id, raw, callback ) {
				
					setTimeout( callback, 10 );
					
				},

				send_new_mail: function ( raw, callback ) {
				
					setTimeout( callback, 10 );
					
				}

			}	
		
		}
		
		describe( "GmailWrapper", function () {
			
			describe( "get_header", function () {
				
				var gmail_wrapper = new V.GmailWrapper;
				
				it( "in an array of objects { name: , value: } returns the value field of an object with key, that matches a regex", function () {
					
					var arr = [
						{ name: 'a', value: '1' },
						{ name: 'b', value: '2' },
						{ name: 'c', value: '3' },
						{ name: 'd', value: '4' },
						{ name: 'e', value: '5' },
					];
					
					expect( gmail_wrapper._obj_.get_header( arr, /a/ ) ).toBe( '1' );
					expect( gmail_wrapper._obj_.get_header( arr, /d/ ) ).toBe( '4' );
					
				});
				
			});
			
		});
		
		describe( "Mail", function () {
			
			var mailer;
			
			beforeEach( function () {
				
				mailer = new V.Mail( mock.gmail_wrapper );
				
			});
			
			describe( "is_sending", function () {
				
				it( "returns true if new mail is sending", function () {
					
					mailer.send_new( 'audio_data', 'mail_data', function () {} );
					expect( mailer.is_sending() ).toBe( true );
					
				});
				
				it( "returns true if reply is sending", function () {
					
					mailer.send_reply( 'audio_data', 'mail_data', function () {} );
					expect( mailer.is_sending() ).toBe( true );
					
				});
				
				it( "returns false if new mail has been sent", function ( done ) {
					
					mailer.send_reply( 'audio_data', 'mail_data', function () {
						if ( mailer.is_sending() === false ) {
							done();
						} else {
							done.fail();
						}
					});
					expect( true ).toBe( true );
					
				});
				
				it( "returns false if reply has been sent", function ( done ) {
					
					mailer.send_reply( 'audio_data', 'mail_data', function () {
						if ( mailer.is_sending() === false ) {
							done();
						} else {
							done.fail();
						}
					});
					expect( true ).toBe( true );
					
				});
				
			});
			
			describe( "send_reply", function () {
				
				it( "calls back false if mail is sending", function () {
					
					mailer.send_reply( 'audio_data', 'mail_data', function () {} );
					mailer.send_reply( 'audio_data', 'mail_data', function ( response ) {
						expect( response ).toBe( false );
					});
					
				});
				
			});
			
			describe( "send_new", function () {
				
				it( "calls back false if mail is sending", function () {
					
					mailer.send_new( 'audio_data', 'mail_data', function () {} );
					mailer.send_new( 'audio_data', 'mail_data', function ( response ) {
						expect( response ).toBe( false );
					});
					
				});
				
			});
			
		});
		
	} () );
