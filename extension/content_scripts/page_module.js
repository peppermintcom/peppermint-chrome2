	
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
					v.fire({ name: 'authorize_request', callback: function () {
						v.fire({ name: 'start_recording_request', callback: function ( response ) {
							if ( response ) {
								v.fire({ name: 'recording_started' });
							} else {
								v.fire({ name: 'recording_failed' });
							}
						} });
					} });
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
					v.fire({ name: 'authorize_request', callback: function () {
						v.fire({ name: 'start_recording_request', callback: function ( response ) {
							if ( response ) {
								v.fire({ name: 'recording_started' });
							} else {
								v.fire({ name: 'recording_failed' });
							}
						} });
					} });
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
			
			init: function () {
				v.add({
					
				});
			}
			
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
					<div class = 'v_popup_button right' id = 'v_error_record_button' style = 'background-image: url(chrome-extension://"+EXTENSION_ID+"/img/btn_record_popup.png)' ></div>\
				</div>\
				",
			
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

				add_hover_efect( popup.querySelector('#v_popup_done_button'), 'btn_done_popup.png', 'btn_done_popup_hover.png' );
				add_hover_efect( popup.querySelector('#v_popup_cancel_button'), 'btn_cancel_popup.png', 'btn_cancel_popup_hover.png' );
				add_hover_efect( popup.querySelector('#v_error_cancel_button'), 'btn_cancel_popup.png', 'btn_cancel_popup_hover.png' );
				add_hover_efect( popup.querySelector('#v_error_record_button'), 'btn_record_popup.png', 'btn_record_popup_hover.png' );
				
				popup.querySelector('#v_popup_done_button').addEventListener( 'click', function () {
					v.fire({ name: 'popup_done_click' });
				});

				popup.querySelector('#v_popup_cancel_button').addEventListener( 'click', function () {
					v.fire({ name: 'popup_cancel_recording_click' });
				});

				popup.querySelector('#v_error_cancel_button').addEventListener( 'click', function () {
					v.fire({ name: 'popup_error_cancel_click' });
				});

				popup.querySelector('#v_error_record_button').addEventListener( 'click', function () {
					v.fire({ name: 'popup_record_click' });
				});
				
				return popup;
			
			},
			
			init: function () {
				
				v.add({
					
					"show_panel": function ( data ) {
						if ( data.status === 'recording' ) {
							popup_manager.popup.style.display = 'block';
							popup_manager.popup.querySelector('#v_popup_recording').style.display = 'block';
							popup_manager.popup.querySelector('#v_popup_error').style.display = 'none';
						} else if ( data.status === 'error' ) {
							popup_manager.popup.style.display = 'block';
							popup_manager.popup.querySelector('#v_popup_error').style.display = 'block';
							popup_manager.popup.querySelector('#v_popup_recording').style.display = 'none';
						}
					},
					"hide_panel": function () {
						popup_manager.popup.style.display = 'none';
					},
					
					"popup_done_click": function () {
						v.fire({ name: 'hide_panel' });
						v.fire({ name: 'finish_recording_request', callback: function ( data ) {
							v.fire({ name: 'send_data_request', audio_data: data, mail_data: get_data_from_page(), callback: function () {
								v.fire({ name: 'send_data_success' });
							} });
						} });
					},
					"popup_error_cancel_click": function () {
						v.fire({ name: 'hide_panel' });
					},
					"popup_cancel_recording_click": function () {
						v.fire({ name: 'cancel_recording_request' });
						v.fire({ name: 'hide_panel' });
					},
					"popup_record_click": function () {
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
					
					"gmail_api_ready": function () {
						popup_manager.add();
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
					"recording_started": function () {
						v.fire({ name: 'show_panel', status: 'recording' });
					},
					"recording_failed": function () {
						v.fire({ name: 'show_panel', status: 'error' });
					}
					
				});
				
			}
			
		};
		
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
			
			},
			
			init: function () {
				v.add({
					
					"gmail_api_ready": function () {
						notify_manager.add();
					}
					
				});
			}
			
		};
		
		function get_data_from_page () {
			return {
				thread_id: location.href.match(/[^\/]+$/)[0],
				to: document.querySelector('.iw').firstElementChild.getAttribute('email')
			};
		}
		
		function ping () {
			if ( button_manager.can_add_reply_button() ) {
				button_manager.add_reply_button();
			}
			// if ( button_manager.can_add_compose_button() ) {
				// button_manager.add_compose_button();
			// }
		}

		// BOOTSTRAP
		popup_manager.init();
		button_manager.init();
		notify_manager.init();
		
		v.add({
			
			"gmail_api_ready": function () {
				setInterval( ping, 3000 );
			}
			
		});
		
	} () );
	