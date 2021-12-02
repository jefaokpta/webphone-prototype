
const domain = secureData.domain;
const peer = secureData.peer;
const password = secureData.password;
let callSession;
let sipStack;

const eventsListener = (event) => {
    switch (event.type) {
        case 'started':
            console.log(':::::::::::::: COMECOU')
            break;
        case 'm_permission_accepted':
            console.log(':::::::::::::: PARECE Q TA CHAMANDO')
            break;
        case 'terminating':
            console.log(':::::::::::::: DESLIGANDO')
            break;
        case 'terminated':
            console.log(':::::::::::::: DESLIGADO')
            break;
        case 'connecting':
            console.log(':::::::::::::: CONECTANDO AO SERVER')
            break;
        case 'connected':
            console.log(':::::::::::::: ATENDIDO OU REGISTRADO')
            break;
        case 'i_new_message':
            console.log('::::::::::::::::: EVENTO NOVA MENSAGEM: ');
            break;
        case 'i_new_call':
            console.log('::::::::::::::::: EVENTO LIGACAO DE ENTRADA: ');
            break;
        default:
            console.log('::::::::::::::::::::: EVENTO DESCONHECIDO = ' + event.type);
            break;
    }
}

function doCall() {
    callSession = sipStack.newSession('call-audio', {
        video_local: document.getElementById('video-local'),
        video_remote: document.getElementById('video-remote'),
        audio_remote: document.getElementById('audio-remote'),
        events_listener: { events: '*', listener: eventsListener } // optional: '*' means all events
    });
    callSession.call('1001001');
}

function hangup() {
    callSession.hangup();
}


function createSipStack() {
    sipStack = new SIPml.Stack({
        realm: domain, // mandatory: domain name
        impi: peer, // mandatory: authorization name (IMS Private Identity)
        impu: 'sip:' + peer + '@' + domain, // mandatory: valid SIP Uri (IMS Public Identity)
        password: password, // optional
        display_name: 'WebPhone Site JPBX', // optional
        websocket_proxy_url: 'wss://' + domain + ':8089/ws', // optional
        //outbound_proxy_url: 'udp://example.org:5060', // optional
        ice_servers: [{ url: 'stun:stun.l.google.com:19302' }],
        enable_rtcweb_breaker: false, // optional
        sip_headers: [ // optional
            { name: 'User-Agent', value: 'WEBPHONE JPBX' },
            { name: 'Organization', value: 'JPBX' }
        ]
    }
    );
}

var registerBtn = document.getElementById('register');
registerBtn.addEventListener('click', function () {
    const registerSession = sipStack.newSession('register', {
        events_listener: { events: '*', listener: eventsListener }// optional: '*' means all events
    });
    registerSession.register();
});

window.onload = function () {
    this.createSipStack();
    sipStack.start();
};
