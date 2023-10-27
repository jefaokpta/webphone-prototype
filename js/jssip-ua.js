/**
 * @author Jefferson Alves Reis (jefaokpta) < jefaokpta@hotmail.com >
 * Date: 27/10/23
 */
const domain = secureData.domain;
const peer = secureData.peer;
const password = secureData.password;
const socket = new JsSIP.WebSocketInterface(`wss://${domain}:8089/ws`)
const configuration = {
    sockets  : [ socket ],
    uri      : `sip:${peer}@` + domain,
    password : password,
};

const ua = new JsSIP.UA(configuration);
var session;

ua.start();

// Register callbacks to desired call events
const eventHandlers = {
    'progress': function(e) {
        console.log('call is in progress');
    },
    'failed': function(e) {
        console.log(e)
        console.log('call failed with cause: '+ e);
    },
    'ended': function(e) {
        console.log(e)
        console.log('call ended with cause: '+ e);
    },
    'confirmed': function(e) {
        console.log('call confirmed');
    }
};

const options = {
    'eventHandlers'    : eventHandlers,
    'mediaConstraints' : { 'audio': true, 'video': false },
};

function dial() {
    const number = document.getElementById('number').value;
    session = ua.call(`sip:${number}@${domain}`, options);
    if (session) {
        session.connection.addEventListener('addstream', (e) => {
            const audio = document.createElement('audio');
            audio.srcObject = e.stream;
            audio.play();
        });
    }
}
function hangup() {
    session.terminate();
}

