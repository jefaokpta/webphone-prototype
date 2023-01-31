const domain = secureData.domain;
const peer = secureData.peer;
const password = secureData.password;
let callSession;

const eventsListener = (event) => {

    switch (event.type) {
        case 'starting':
            console.log(':::::::::::::: INICIANDO SIP STACK')
            break;
        case 'started':
            console.log(':::::::::::::: SIP STACK COMPLETO')
            sipStack.newSession('register', {}).register()
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
            console.log(event)
            console.log('::::::::::::::::: LIGACAO DE ENTRADA de : ', event.newSession.getRemoteFriendlyName());
            callSession = event.newSession;
            break;
        case 'i_ao_request':
            console.log('I_AO_REQUEST', event);
            if (event.description === 'Ringing') {
                ringAudio.play();
                ringAudio.loop = true;
            } else {
                ringAudio.pause();
            }
            break;
        default:
            console.log('::::::::::::::::::::: EVENTO DESCONHECIDO = ', event.type);
            break;
    }
}


const sipStack = new SIPml.Stack({
    realm: domain, // mandatory: domain name
    impi: peer, // mandatory: authorization name (IMS Private Identity)
    impu: 'sip:' + peer + '@' + domain, // mandatory: valid SIP Uri (IMS Public Identity)
    password: password, // optional
    display_name: 'WebPhone Site JPBX', // optional
    websocket_proxy_url: 'wss://' + domain + ':8089/ws', // optional
    //outbound_proxy_url: 'udp://example.org:5060', // optional
    ice_servers: [{url: 'stun:stun.l.google.com:19302'}],
    enable_rtcweb_breaker: false, // optional
    events_listener: {events: '*', listener: eventsListener}, // optional: '*' means all events
    sip_headers: [ // optional
        {name: 'User-Agent', value: 'WEBPHONE JPBX'},
        {name: 'Organization', value: 'JPBX'}
    ]
})

window.onload = () => {
    sipStack.start()
}

const answerBtn = document.getElementById('answer');
const hangupBtn = document.getElementById('hangup');
const dialBtn = document.getElementById('dial');

answerBtn.addEventListener('click', () => {
    callSession.accept();
})
hangupBtn.addEventListener('click', () => {
    callSession.hangup();
})
dialBtn.addEventListener('click', () => {
    const number = document.getElementById('phoneInput').value;
    callSession = sipStack.newSession('call-audio', {
        audio_remote: document.getElementById('audio-remote'),
    });
    callSession.call(number);
})

function sendDtmf(dtmf) {
    callSession.dtmf(dtmf);
}

