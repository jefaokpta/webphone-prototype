
const domain = secureData.domain;
const peer = secureData.peer;
const password = secureData.password;
let callSession;
let sipStack;
let registerSession;
// todo: descarregar audio de ring para botao play nao ativar o audio
const ringAudio = new Audio();
const phone = document.getElementById('phone');

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
            ringAudio.pause();
            ringAudio.src = '';
            break;
        case 'connecting':
            console.log(':::::::::::::: CONECTANDO AO SERVER')
            break;
        case 'connected':
            console.log(':::::::::::::: ATENDIDO OU REGISTRADO')
            ringAudio.pause();
            break;
        case 'i_new_message':
            console.log('::::::::::::::::: EVENTO NOVA MENSAGEM: ');
            break;
        case 'i_new_call':
            console.log('::::::::::::::::: EVENTO LIGACAO DE ENTRADA: ');
            break;
        case 'i_ao_request':
            console.log('I_AO_REQUEST', event);
            if(event.description === 'Ringing') {
                ringAudio.play();
                ringAudio.loop = true;
            } else{
                ringAudio.pause();
            }
            break;
        default:
            console.log('::::::::::::::::::::: EVENTO DESCONHECIDO = ', event);
            break;
    }
}

function doCall() {
    ringAudio.src = '/assets/calling.mp3';
    callSession = sipStack.newSession('call-audio', {
        video_local: document.getElementById('video-local'),
        video_remote: document.getElementById('video-remote'),
        audio_remote: document.getElementById('audio-remote'),
        events_listener: { events: '*', listener: eventsListener } // optional: '*' means all events
    });

    // const telNumber = '1132931515'
    // const telNumber = '08007627777'
    // const telNumber = '1142325502'
    // const telNumber = '11938065778'

    callSession.call(phone.value);


}

function hangup() {
    callSession.hangup();
}

function sendDTMF9() {
    callSession.dtmf(9);
}
function sendDTMF2() {
    callSession.dtmf(2);
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
    });
}

const registerBtn = document.getElementById('register');

registerBtn.addEventListener('click', function () {
    registerSession = sipStack.newSession('register', {
        events_listener: { events: '*', listener: eventsListener }// optional: '*' means all events
    });
    registerSession.register();
});

const answerBtn = document.getElementById('answer');

answerBtn.addEventListener('click', function () {
    registerSession.accept();
})

function startSipStack() {
    sipStack.start();
}

window.onload = function () {
    this.createSipStack();
};
