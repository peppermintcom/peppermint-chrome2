
	V.PageData = function ( window ) {

		var obj = {};

		return {
			
			_obj_: obj,
			
			get_page_data () {
				return {
					thread_id: window.location.href.match(/[^\/]+$/)[0],
					receiver: window.document.querySelector('.iw').firstElementChild.getAttribute('email')
				};
			}
			
		};
		
	};