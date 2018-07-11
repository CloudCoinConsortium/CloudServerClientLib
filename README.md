# CloudServerClientLib
CloudServer Client Javascript Library

* Usage Example

<pre>
	function statusChange() {
                if (csc.getStatus() == 'Error') {
                        return
                }

		console.log('Status changed')
        }

        function onReceive(hash) {
		console.log('Someone sent coins to you. Download link https://escrow.cloudcoin.digital/cc.php?h=' + hash)
        }

        function onProgress(i) {
		console.log('Sending Coins. Progress ' + i + '%')
        }

        function onWord(word) {
		console.log('Secret word received from server: ' + word)
        }

	function onDone(hash) {
		console.log('Coins have been sent. Your change https://escrow.cloudcoin.digital/cc.php?h=' + hash)
	}

        var csc = new CloudServiceClient({
                'url' : 'wss://escrow.cloudcoin.digital/ws/',
                'onStatusChange' : statusChange,
                'onWord' : onWord,
                'onProgress' : onProgress,
                'onReceive' : onReceive,
		'onDone' : onDone
        })

	var stack = '{}'
	csc.sendCoins('potato', stack)
</pre>
