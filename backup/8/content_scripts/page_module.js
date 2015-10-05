	
	( function ( storage ) {
		
		// PAGE MANAGER 
		( function () {
			
			var ajax = {
				
				get: function ( url, success_callback, failure_callback ) {
					
					var request = new XMLHttpRequest();
					request.open('GET', url, true);

					request.onload = function() {
					  if (request.status >= 200 && request.status < 400) {
						// Success!
						success_callback( request.responseText );
					  } else {
						// We reached our target server, but it returned an error
						failure_callback();
					  }
					};

					request.onerror = function() {
					  // There was a connection error of some sort
					  failure_callback();
					};

					request.send();

				},
				
				post: function ( url, data, success_callback, failure_callback ) {
					
					var request = new XMLHttpRequest();
					request.open('POST', url, true);

					request.onload = function() {
					  if (request.status >= 200 && request.status < 400) {
						// Success!
						success_callback( request.responseText );
					  } else {
						// We reached our target server, but it returned an error
						failure_callback();
					  }
					};

					request.onerror = function() {
					  // There was a connection error of some sort
					  failure_callback();
					};
					
					request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
					request.send( data );

				}
			
			};
			
			function get_data_from_page () {
				return {
					thread_id: location.href.match(/[^\/]+$/)[0],
					to: document.querySelector('.iw').firstElementChild.getAttribute('email')
				};
			}

			function get_contacts ( data ) {
		
				function normalize_contacts ( contacts ) {
					for ( var i = 0; i < contacts.length; i++ ) {
						contacts[i] = [ contacts[i][1], contacts[i][2] ];
					}
					return contacts;
				};
				
				function get_emails_from_contacts ( contacts ) {
					for ( var i = 0; i < contacts.length; i++ ) {
						contacts[i] = contacts[i][2];
					}
					return contacts;
				};

				ajax.post(
					'/mail/u/0/?view=au&ik='+GLOBALS[9],
					'',
					function( response ){ 
						data.callback(
							get_emails_from_contacts(
								JSON.parse(
									response.replace( ")]}'", '' ).replace( /'/g, '"' )
								)[0][0][1]
							)
						)
					},
					function(){
						data.callback( false );
					}
				)
			}
			
			v.add({
				
				'contacts_request': function ( data ) {

					
				},
				
			});
			
		} () );
		
		// BUTTONS
		( function () {
			
			function add_hover_efect ( element, idle_url, hover_url ) {
				
				element.addEventListener( 'mouseenter', function () {
					element.style.backgroundImage = 'url(chrome-extension://' + EXTENSION_ID + '/img/' + hover_url + ')'
				});
				
				element.addEventListener( 'mouseleave', function () {
					element.style.backgroundImage = 'url(chrome-extension://' + EXTENSION_ID + '/img/' + idle_url + ')'
				});
				
			};
		
			var button_manager = {
				
				can_add_reply_button: function () {
					if ( document.querySelector('.cf.ix') && !document.getElementById( 'v_reply_button' ) ) {
						button_manager.add_reply_button();
					}
				},
				
				can_add_compose_button: function () {
					if ( document.querySelector('.Cq.aqL') && !document.getElementById( 'v_compose_button' ) ) {
						button_manager.add_compose_button();
					}
				},
				
				create_reply_button: function () {
					
					var button = document.createElement('div');
					button.id = 'v_reply_button';
					button.style.backgroundImage = 'url(chrome-extension://' + EXTENSION_ID + '/img/btn_02.png)';
				
					add_hover_efect( button, 'btn_02.png', 'btn_02_hover.png' );
				
					button.addEventListener( 'click', function () {
						v.fire({ name: 'reply_button_click' });
					});
					
					return button;
				
				},
				
				create_compose_button: function () {
					
					var button = document.createElement('div');
					button.id = 'v_compose_button';
					button.className = "G-Ni J-J5-Ji";
					button.style.backgroundImage = 'url(chrome-extension://' + EXTENSION_ID + '/img/btn_03.png)';
					
					add_hover_efect( button, 'btn_03.png', 'btn_03_hover.png' );
					
					button.addEventListener( 'click', function () {
						v.fire({ name: 'compose_button_click' });
					});
					
					return button;
					
				},
				
				add_reply_button: function () {

					var table = document.querySelector('.cf.ix'),
					tbody = table.tBodies[0],
					row = tbody.rows[0],
					cell = document.createElement('td');
					
					row.appendChild( cell );
					cell.appendChild( button_manager.create_reply_button() );
					table.style.tableLayout = 'auto';
					
				},
				
				add_compose_button: function () {
					
					var container = document.querySelector('.Cq.aqL').firstElementChild.firstElementChild;
					container.appendChild( button_manager.create_compose_button() );
			
				},
			
			};
	
			v.add({
				
				'reply_button_click': function () {
					v.fire({ name: 'mail_is_sending', callback: function ( sending ) {
						if ( !sending ) {
							v.fire({ name: 'authorize_request', callback: function ( authorized ) {
								if ( authorized ) {
									v.fire({ name: 'start_recording_request', callback: function ( response ) {
										if ( response ) {
											v.fire({ name: 'set_storage', key: 'recording_initiator', value: 'reply' });
											v.fire({ name: 'recording_started' });
										} else {
											v.fire({ name: 'recording_failed' });
										}
									} });
								} else {
									v.fire({ name: 'authorize_request_failed' });
								}
							} });
						}
					} });
				},
				'compose_button_click': function () {
					v.fire({ name: 'mail_is_sending', callback: function ( sending ) {
						if ( !sending ) {
							v.fire({ name: 'authorize_request', callback: function ( authorized ) {
								if ( authorized ) {
									v.fire({ name: 'start_recording_request', callback: function ( response ) {
										if ( response ) {
											v.fire({ name: 'set_storage', key: 'recording_initiator', value: 'compose' });
											v.fire({ name: 'recording_started' });
										} else {
											v.fire({ name: 'recording_failed' });
										}
									} });
								} else {
									v.fire({ name: 'authorize_request_failed' });
								}
							} });
						}
					} });
				},
				
				'ready': function () {
					
					setInterval( function ping () {
						if ( button_manager.can_add_reply_button() ) {
							button_manager.add_reply_button();
						}
						if ( button_manager.can_add_compose_button() ) {
							button_manager.add_compose_button();
						}
					}, 3000 );

				}
				
			});
	
		} () );
		
		// POPUP
		( function () {
			
			function add_hover_efect ( element, idle_url, hover_url ) {
				
				element.addEventListener( 'mouseenter', function () {
					element.style.backgroundImage = 'url(chrome-extension://' + EXTENSION_ID + '/img/' + hover_url + ')'
				});
				
				element.addEventListener( 'mouseleave', function () {
					element.style.backgroundImage = 'url(chrome-extension://' + EXTENSION_ID + '/img/' + idle_url + ')'
				});
				
			};
		
			var popup_manager = {
				
				popup: null,
				
				template: "\
					<div id = 'v_popup_recording' >\
						<img class = 'v_popup_logo' src = 'chrome-extension://"+EXTENSION_ID+"/img/spinner.gif' >\
						<div class = 'v_popup_status' >Recording Your Message...</div>\
						<div class = 'v_popup_button left' id = 'v_popup_cancel_button' style = 'background-image: url(chrome-extension://"+EXTENSION_ID+"/img/btn_cancel_popup.png)' ></div>\
						<div class = 'v_popup_button right' id = 'v_popup_done_button' style = 'background-image: url(chrome-extension://"+EXTENSION_ID+"/img/btn_done_popup.png)' ></div>\
					</div>\
					<div id = 'v_popup_error' >\
						<img class = 'v_popup_logo' src = 'chrome-extension://"+EXTENSION_ID+"/img/icon_mic_off.png' >\
						<div class = 'v_popup_status' >Your microphone is not working. Please check your audio settings and try again</div>\
						<div class = 'v_popup_button left' id = 'v_error_cancel_button' style = 'background-image: url(chrome-extension://"+EXTENSION_ID+"/img/btn_cancel_popup.png)' ></div>\
						<div class = 'v_popup_button right' id = 'v_error_done_button' style = 'background-image: url(chrome-extension://"+EXTENSION_ID+"/img/btn_done_popup.png)' ></div>\
					</div>\
					<div id = 'v_popup_receiver' >\
						<h4>Send an audio to...</h4>\
						<div class = 'ui-widget' id = 'v_popup_search' >\
							<input id = 'v_popup_receiver_input' >\
							<div id = 'v_popup_receiver_search_icon' ></div>\
						</div>\
					</div>\
					",
				
				show: : function ( status ) {
					if ( status === 'recording' ) {
						popup_manager.popup.style.display = 'block';
						popup_manager.popup.querySelector('#v_popup_recording').style.display = 'block';
						popup_manager.popup.querySelector('#v_popup_receiver').style.display = 'none';
						popup_manager.popup.querySelector('#v_popup_error').style.display = 'none';
					} else if ( status === 'receiver' ) {
						popup_manager.popup.style.display = 'block';
						popup_manager.popup.querySelector('#v_popup_recording').style.display = 'none';
						popup_manager.popup.querySelector('#v_popup_receiver').style.display = 'block';
						popup_manager.popup.querySelector('#v_popup_error').style.display = 'none';
					} else if ( status === 'error' ) {
						popup_manager.popup.style.display = 'block';
						popup_manager.popup.querySelector('#v_popup_recording').style.display = 'none';
						popup_manager.popup.querySelector('#v_popup_receiver').style.display = 'none';
						popup_manager.popup.querySelector('#v_popup_error').style.display = 'block';
					}
				},
				
				add: function () {
					document.body.appendChild( popup_manager.create() );
				},
			
				hide: function () {
					popup_manager.popup.style.display = 'none';
				},
				
				create: function () {
				
					var popup = document.createElement( 'div' );
					popup.id = 'v_popup';
					popup.innerHTML = popup_manager.template;
					popup_manager.popup = popup;

					add_hover_efect( popup.querySelector('#v_error_done_button'), 'btn_done_popup.png', 'btn_done_popup_hover.png' );
					add_hover_efect( popup.querySelector('#v_popup_done_button'), 'btn_done_popup.png', 'btn_done_popup_hover.png' );
					add_hover_efect( popup.querySelector('#v_popup_cancel_button'), 'btn_cancel_popup.png', 'btn_cancel_popup_hover.png' );
					add_hover_efect( popup.querySelector('#v_error_cancel_button'), 'btn_cancel_popup.png', 'btn_cancel_popup_hover.png' );
					
					popup.querySelector('#v_popup_done_button').addEventListener( 'click', function () {
						v.fire({ name: 'popup_done_click' });
					});
					popup.querySelector('#v_popup_cancel_button').addEventListener( 'click', function () {
						v.fire({ name: 'popup_cancel_click' });
					});
					popup.querySelector('#v_error_cancel_button').addEventListener( 'click', function () {
						v.fire({ name: 'popup_error_cancel_click' });
					});
					popup.querySelector('#v_error_done_button').addEventListener( 'click', function () {
						v.fire({ name: 'popup_error_done_click' });
					});			
					
					v.fire({ name: 'contacts_request', callback: function ( contacts ) {
						$( '#v_popup_receiver_input', popup ).autocomplete({ source: contacts });
					} });

					return popup;
				
				}
				
			};
			
			v.add({
				
				'ready': function () {
					popup_manager.add();
				}
				
				"recording_started": function () {
					popup_manager.show( 'recording' );
				},
				"recording_failed": function () {
					popup_manager.show( 'errorr' );
				},
				"authorize_request_failed": function () {
					popup_manager.hide();
				},
				
				"popup_cancel_click": function () {
					popup_manager.hide();
				},
				"popup_receiver_done_click": function () {
					popup_manager.hide();
				}
				"popup_error_cancel_click": function () {
					popup_manager.hide();
				}
				
			});
		
		} () );
		
		// NOTIFIER
		( function () {
		
			var notify_manager = {
				
				notifier: null,
			
				add: function () {
					notify_manager.notifier = notify_manager.create();
					document.body.appendChild( notify_manager.notifier );
				},
				
				show: function () {
					notify_manager.notifier.style.display = 'block';
				},
				
				hide: function () {
					notify_manager.notifier.style.display = 'none';
				},
				
				write: function ( text ) {
					notify_manager.notifier.innerHTML = text;
				},
				
				create: function () {
				
					var notifier = document.createElement( 'div' );
					notifier.id = 'v_notifier';
				
					return notifier;
				
				}
				
			};
			
			v.add({
				
				'ready': function () {
					notify_manager.add();
				},
				
				"send_data_request": function () {
					notify_manager.write( "Sending via Peppermint..." );
					notify_manager.show();
				},
				"send_data_success": function () {
					notify_manager.write( "Sent" );
					setTimeout( function () {
						notify_manager.hide();
					}, 3000);
				},
				
			});
			
		} () );
		
		
		v.add({
			
			
			'set_storage': function ( data ) {
				storage[ data.key ] = data.value;
			},
			'get_storage': function ( data ) {
				data.callback( storage[ data.key ] );
			},

			
			"popup_done_click": function () {
				v.fire({ name: 'get_storage', key: 'recording_initiator', callback: function ( initiator ) {
					if ( initiator === 'reply' ) {
						v.fire({ name: 'hide_panel' });
						v.fire({ name: 'finish_recording_request', callback: function ( data ) {
							v.fire({ name: 'send_data_request', reply: true, audio_data: data, mail_data: get_data_from_page(), callback: function () {
								v.fire({ name: 'send_data_success' });
							} });
						} });
					} else if ( initiator === 'compose' ) {
						v.fire({ name: 'pause_recording_request' });
						v.fire({ name: 'show_panel', status: 'receiver' });
					}
				} })
			},

			"popup_cancel_click": function () {
				v.fire({ name: 'cancel_recording_request' });
			},

			"popup_error_done_click": function () {
				v.fire({ name: 'authorize_request', callback: function () {
					v.fire({ name: 'start_recording_request', callback: function ( response ) {
						if ( response ) {
							v.fire({ name: 'recording_started' });
						} else {
							v.fire({ name: 'recording_failed' });
						}
					} });
				} });
			},

			"popup_receiver_done_click": function () {
				v.fire({ name: 'finish_recording_request', callback: function ( data ) {
					v.fire({ name: 'send_data_request', compose: true, audio_data: data, mail_data: {receiver:'bash.vlas@gmail.com'}, callback: function () {
						v.fire({ name: 'send_data_success' });
					} });
				} });
			},

			"gmail_api_ready": function () {				
				v.fire({ name: 'ready' });
			}

			
		});
		
		
	} ( {} ) );
	