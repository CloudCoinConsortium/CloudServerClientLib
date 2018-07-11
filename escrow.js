

(function(window) {

	function CloudServiceClient(_settings) {
		var _iref = {};

		var STATUS_CONNECTED = 1,
			STATUS_ERROR = 2,
			STATUS_DISCONNECTED = 3
			STATUS_SENDING = 4
			STATUS_DONE = 5
			STATUS_REQUEST_RECIPIENT = 6
			STATUS_WAITING_RECIPIENT = 7

		var PACKET_TYPE_INIT = 1,
			PACKET_TYPE_WORD = 2,
			PACKET_TYPE_COINS = 3
			PACKET_TYPE_PROGRESS = 4
			PACKET_TYPE_DONE = 5,	
			PACKET_TYPE_REQUEST_RECIPIENT = 6
			PACKET_TYPE_OK = 7
			PACKET_TYPE_HASH = 8
			PACKET_TYPE_RECIPIENT_REPLY = 9

		var settings = {
			'url': null,
			'timeout': 10,
			'onStatusChange' : null,
			'onWord' : null,
			'onReceive' : null,
			'onDone' : null
		};


		_iref.status = STATUS_DISCONNECTED
		_iref.errorMsg = ""

		_iref.extend = function(dst, src) {
			for (var property in src) {
				if (src.hasOwnProperty(property)) 
					dst[property] = src[property]
			}

			return dst
		}

		_iref.setOption = function(name, value) {
			if (!(name in settings))
				return false

			this.settings[name] = value

			return true
		}

		_iref.getOption = function(name) {
			if (!(name in settings))
				return undefined

			return this.settings[name]
		}

		_iref.getError = function() {
			return this.errorMsg
		}

		_iref.getStatus = function() {
			var r = {}

			r[STATUS_DISCONNECTED] = "Disconnected",
			r[STATUS_ERROR] = "Error",
			r[STATUS_CONNECTED] = "Connected"
			r[STATUS_SENDING] = "Sending Coins"
			r[STATUS_DONE] = "Coins sent"
			r[STATUS_REQUEST_RECIPIENT] = "Waiting for recipient"
			r[STATUS_WAITING_RECIPIENT] = "Waiting for recipient"

			return r[this.status]
		}

		_iref.sendCoins = function(sh, amount, stack) {
			if (!amount)
				amount = 0;

			amount = parseInt(amount)

			this.ws.send(JSON.stringify({
				'type' : PACKET_TYPE_COINS,
				'word' : sh,
				'amount' : amount,
				'stack' : stack
			}))

			_iref.setStatus(STATUS_SENDING);

		}

		_iref.setStatus = function(newStatus) {
			this.status = newStatus
			if (typeof (_iref.settings.onStatusChange) === 'function') {
				_iref.settings.onStatusChange()
			}

		}

		_iref.setError = function(msg) {
			this.errorMsg = msg
			this.setStatus(STATUS_ERROR);
		}

		_iref.init = function() {
			var iref = this
			this.ws = new WebSocket(this.settings['url'])
			var ws = this.ws

			ws.onopen = function(e) {
				ws.send(JSON.stringify({
					'type' : PACKET_TYPE_INIT
				}))
				_iref.setStatus(STATUS_CONNECTED);
			}

			ws.onerror = function(e) {
				_iref.setError("Internal error")
			}

			ws.onmessage = function(message) {

				data = JSON.parse(message['data'])
				if (data['result'] !== 'success') {
					_iref.setError(data['message']);
					return
				}

				switch (data['type']) {
					case PACKET_TYPE_WORD:
						if (typeof (_iref.settings.onWord) === 'function') {
							_iref.settings.onWord(data['data'])
						}
						return
					case PACKET_TYPE_PROGRESS:
						if (typeof (_iref.settings.onProgress) === 'function') {
							_iref.settings.onProgress(data['data'])
						}
						return
					case PACKET_TYPE_DONE:
						_iref.setStatus(STATUS_DONE);

						hash = data['data']
						if (typeof (_iref.settings.onDone) === 'function') {
							_iref.settings.onDone(hash)
						}

						return
					case PACKET_TYPE_OK:
						if (_iref.status == STATUS_REQUEST_RECIPIENT) {
							_iref.setStatus(STATUS_WAITING_RECIPIENT)
						}
						return

					case PACKET_TYPE_RECIPIENT_REPLY:
						if (_iref.status != STATUS_WAITING_RECIPIENT) {
							_iref.setError('Protocol error')
							return
						}
					
						reply = data['data']

					case PACKET_TYPE_HASH:
						hash = data['data']

						if (typeof (_iref.settings.onReceive) === 'function') {
							_iref.settings.onReceive(hash)
						}
						break;
					default:
						_iref.setError("Invalid packet " +  data['type'])
						return				
				}

			}

			ws.onclose = function(e) {
				_iref.setStatus(STATUS_DISCONNECTED)
			}
		}


		_iref.settings = _iref.extend(settings, _settings)
		_iref.init()
	
		return _iref

	}

	window.CloudServiceClient = CloudServiceClient

})(window)
