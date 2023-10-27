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
    register : false,
};

const ua = new JsSIP.UA(configuration);
let session = null;

uaEventHandling();
ua.start();

const callEventHandlers = {
    'progress': function(e) {
        console.log('call is in progress');
    },
    'failed': function(e) {
        console.log(`call failed originator: ${e.originator} with cause: ${e.cause}`);
    },
    'ended': function(e) {
        console.log(`call ended originator: ${e.originator} with cause: ${e.cause}`);
    },
    'confirmed': function(e) {
        console.log('call atendida');
    }
};

function audioListener(session){
    session.connection.addEventListener('addstream', e => {
        console.log('remote audio stream added');
        const audio = document.createElement('audio');
        audio.srcObject = e.stream;
        audio.play();
    });
}

const callOptions = {
    'eventHandlers'    : callEventHandlers,
    'mediaConstraints' : { 'audio': true, 'video': false },
    'pcConfig'         : {
        'rtcpMuxPolicy': 'require',
        'iceServers'   : [
            { 'urls': 'stun:stun.l.google.com:19302' }
        ]
    }
};

function uaEventHandling() {
    //events of UA class with their callbacks

    ua.on('registered', function (e) {
        console.trace("registered", e);
    });

    ua.on('unregistered', e => {
        console.trace("ua has been unregistered periodic registeration fails or ua.unregister()", e);
    });
    ua.on('registrationFailed', e => {
        console.trace("register failed", e);
    });
    ua.on('connected', e => {
        console.trace("connected to websocket");
    });

    ua.on('disconnected', e => {
        console.trace("disconnected");
        ua.stop();
    });
    ua.on('newRTCSession', e => {
        session = e.session;
        if (e.originator === 'local') {
            console.trace(e.request + ' start outgoing session');
            audioListener(session);
        }
        else {
            console.trace(e.request + ' start incoming session');
            //e.session.answer(options);
        }
    });

}

function dial() {
    const number = document.getElementById('number').value;
    session = ua.call(`sip:${number}@${domain}`, callOptions);
}

function hangup() {
    session.terminate();
}



