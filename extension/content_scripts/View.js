	
	V.View = function ( window, $, hub ) {
		
		function add_hover_efect ( element, idle_url, hover_url ) {
			
			element.on( 'mouseenter', function () {
				element.css({ backgroundImage: 'url(chrome-extension://' + EXTENSION_ID + '/img/' + hover_url + ')' });
			});
			
			element.on( 'mouseleave', function () {
				element.css({ backgroundImage: 'url(chrome-extension://' + EXTENSION_ID + '/img/' + idle_url + ')' });
			});
			
		};
		
		var Buttons = function ( hub ) {
			
			var obj = {
				
				enabled: true,
				
				can_add_reply_button: function () {
					if ( window.document.querySelector('.cf.ix') && !window.document.getElementById( 'v_reply_button' ) ) {
						obj.add_reply_button();
					}
				},
				
				can_add_compose_button: function () {
					if ( window.document.querySelector('.Cq.aqL') && !window.document.getElementById( 'v_compose_button' ) ) {
						obj.add_compose_button();
					}
				},
				
				create_reply_button: function () {
					
					var button = window.document.createElement('div');
					button.id = 'v_reply_button';
					button.style.backgroundImage = 'url(chrome-extension://' + EXTENSION_ID + '/img/btn_reply.png)';
				
					add_hover_efect( $( button ), 'btn_reply.png', 'btn_reply_hover.png' );
				
					$( button ).on( 'click', function () {
						if ( obj.enabled ) hub.fire({ name: 'reply_button_click' });
					});
					
					return button;
				
				},
				
				create_compose_button: function () {
					
					var button = window.document.createElement('div');
					button.id = 'v_compose_button';
					button.className = "G-Ni J-J5-Ji";
					button.style.backgroundImage = 'url(chrome-extension://' + EXTENSION_ID + '/img/btn_03.png)';
					
					add_hover_efect( $( button ), 'btn_03.png', 'btn_03_hover.png' );
					
					$( button ).on( 'click', function () {
						if ( obj.enabled ) hub.fire({ name: 'compose_button_click' });
					});
					
					return button;
					
				},
				
				add_reply_button: function () {

					var table = window.document.querySelector('.cf.ix'),
					tbody = table.tBodies[0],
					row = tbody.rows[0],
					cell = window.document.createElement('td');
					
					row.appendChild( cell );
					cell.appendChild( obj.create_reply_button() );
					table.style.tableLayout = 'auto';
					
				},
				
				add_compose_button: function () {
					
					var container = window.document.querySelector('.Cq.aqL').firstElementChild.firstElementChild;
					container.appendChild( obj.create_compose_button() );
			
				},
			
			};
			
			return {
				
				add: function () {
					setInterval( function ping () {
						if ( obj.can_add_reply_button() ) {
							obj.add_reply_button();
						}
						if ( obj.can_add_compose_button() ) {
							obj.add_compose_button();
						}
					}, 3000 );
				},
				
				disable: function () {
					obj.enabled = false;
				},
				
				enable: function () {
					obj.enabled = true;
				}
				
			};
			
		};
		
		var Dropdown = function ( hub ) {
			
			var obj = {
		
				enabled: true,
		
				template:'<div class="J-N" role="menuitem" id="v_dropdown_button" style="-webkit-user-select: none;">\
							<div class="J-N-Jz"><div><div id=":17d" class="cj">\
								<img class="mI f4 J-N-JX" src="chrome-extension://'+EXTENSION_ID+'/img/icon_replyviapep.png" alt="">\
								Reply via Peppermint\
							</div>\
						</div>',
				
				create: function () {
					
					var element = $( obj.template );
					
					element.click( function () {
						if ( obj.enabled ) hub.fire({ name: 'dropdown_button_click' });
					});
					
					return element;
					
				},
				
				can_add: function () {
					
					if ( $('.b7.J-M>div:first-child').length > 0 ) {
						if ( $('#v_dropdown_button').length === 0 ) {
							return true;
						} else {
							return false;
						};
					} else {
						return false;
					};
					
				},
				
				add: function ( element ) {
					
					$('.b7.J-M>div:first-child').after( element );
					
				}
			
			};
			
			return {
				
				add: function () {
					setInterval( function ping () {
						if ( obj.can_add() ) {
							obj.add(
								obj.create()
							);
						}
					}, 3000 );
				},
				
				disable: function () {
					obj.enabled = false;
				},
				
				enable: function () {
					obj.enabled = true;
				}
				
			};
			
		};
		
		var Popup = function ( hub ) {

			var obj = {
				
				popup: null,
				
				template: "\
					<div id = 'v_popup_recording' >\
						<img class = 'v_popup_logo' src = 'chrome-extension://"+EXTENSION_ID+"/img/recording_no_delay.gif' >\
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
					",
				
				show: function ( status ) {
					if ( status === 'recording' ) {
						$( obj.popup ).show();
						$( '#v_popup_recording', obj.popup ).show();
						$( '#v_popup_error' ).hide();
					} else if ( status === 'error' ) {
						$( obj.popup ).show();
						$( '#v_popup_recording', obj.popup ).hide();
						$( '#v_popup_error' ).show();
					}
				},
				
				add: function () {
					window.document.body.appendChild( obj.create() );
				},
			
				hide: function () {
					$( obj.popup ).hide();
				},
				
				create: function () {
				
					var popup = window.document.createElement( 'div' );
					popup.id = 'v_popup';
					popup.innerHTML = obj.template;
					obj.popup = popup;

					add_hover_efect( $('#v_error_done_button', popup ), 'btn_done_popup.png', 'btn_done_popup_hover.png' );
					add_hover_efect( $('#v_popup_done_button', popup ), 'btn_done_popup.png', 'btn_done_popup_hover.png' );
					add_hover_efect( $('#v_popup_cancel_button', popup ), 'btn_cancel_popup.png', 'btn_cancel_popup_hover.png' );
					add_hover_efect( $('#v_error_cancel_button', popup ), 'btn_cancel_popup.png', 'btn_cancel_popup_hover.png' );
					
					$('#v_popup_done_button', popup ).on( 'click', function () {
						hub.fire({ name: 'popup_done_click' });
					});
					$('#v_popup_cancel_button', popup ).on( 'click', function () {
						hub.fire({ name: 'popup_cancel_click' });
					});
					$('#v_error_cancel_button', popup ).on( 'click', function () {
						hub.fire({ name: 'popup_error_cancel_click' });
					});
					$('#v_error_done_button', popup ).on( 'click', function () {
						hub.fire({ name: 'popup_error_done_click' });
					});					
					$( window.document ).on( 'click', '.ui-menu-item', function ( event ) {
						hub.fire({ name: 'receiver_selected', receiver: event.target.innerHTML });
					});
					$('#v_popup_receiver_input', popup ).on( 'keypress', function ( event ) {
						if ( event.keyCode === 13 ) {
							hub.fire({ name: 'receiver_selected', receiver: $('#v_popup_receiver_input').val() });
						}
					});
					$('#v_popup_receiver_close', popup ).on( 'click', function () {
						hub.fire({ name: 'popup_receiver_close_click' });
					});
					
					return popup;
				
				}
				
			};
			
			return {
				
				add: function () {
					obj.add();
				},
				
				hide: function () {
					obj.hide();
				},
				
				show_recording: function () {
					obj.show('recording');
				},
				
				show_error: function () {
					obj.show( 'error' );
				}
				
			};
		
		};
		
		var Notifier = function ( hub ) {
		
			var obj = {
				
				notifier: null,
			
				add: function () {
					obj.notifier = obj.create();
					window.document.body.appendChild( obj.notifier );
				},
				
				show: function () {
					obj.notifier.style.display = 'block';
				},
				
				hide: function () {
					obj.notifier.style.display = 'none';
				},
				
				write: function ( text ) {
					obj.notifier.innerHTML = text;
				},
				
				create: function () {
				
					var notifier = window.document.createElement( 'div' );
					notifier.id = 'v_notifier';
				
					return notifier;
				
				}
				
			};
			
			return {
				
				add: function () {
					obj.add();
				},
				
				notify_sending: function ( status ) {
					obj.write( "Sending via Peppermint..." );
					obj.show();
				},
				
				notify_sent: function () {
					obj.write( "Sent" );
					setTimeout( function () {
						obj.hide();
					}, 3000);
				}
				
			}
			
		};
		
		var ComposeManager = function ( hub, window ) {
			
			var obj = {
				
				open: function () {
					window.location.href += "?compose=new";
				},
				
				add_record_and_send: function () {
					
				}
				
			};
			
			return {
				
				open: obj.open
				
			};
			
		};
		
		var obj = {
			
		};
		
		obj.components = {};
		obj.components.buttons =  new Buttons( hub );
		obj.components.dropdown = new Dropdown( hub );
		obj.components.popup = new Popup( hub );
		obj.components.notifier = new Notifier( hub );
		obj.components.compose_manager = new ComposeManager( hub, window );
		
		return {
			
			components: obj.components,
			
			add_components: function () {
				obj.components.notifier.add();
				obj.components.popup.add();
				obj.components.dropdown.add();
				obj.components.buttons.add();
			},
			
			disable_buttons: function () {
				obj.components.buttons.disable();
				obj.components.dropdown.disable();
			},
			
			enable_buttons: function () {
				obj.components.buttons.enable();
				obj.components.dropdown.enable();
			}
			
		};
		
	};
	
	
	
	
	
	
	
	
	
	