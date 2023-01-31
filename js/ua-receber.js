const domain = secureData.domain;
const peer = secureData.peer;
const password = secureData.password;
let callSession;
const callAudio = new Audio();

const mainEventsListener = (event) => {
    switch (event.type) {
        case 'starting':
            console.log(':::::::::::::: INICIANDO SIP STACK')
            break;
        case 'started':
            console.log(':::::::::::::: SIP STACK COMPLETO')
            sipStack.newSession('register', {}).register()
            break;
        case 'i_new_call':
            event.newSession.setConfiguration({
                events_listener: {events: '*', listener: incomingCallEventsListener},
            })
            console.log('::::::::::::::::: LIGACAO DE ENTRADA DE : ', event.newSession.getRemoteFriendlyName());
            callAudio.src = 'assets/ringing.mp3';
            playAudio()
            callSession = event.newSession;
            break;
        default:
            console.log('::::::::::::::::::::: EVENTO DESCONHECIDO = ', event.type);
            break;
    }
}
const outboundCallEventsListener = (event) => {
    switch (event.type) {
        case 'i_ao_request':
            console.log('I_AO_REQUEST', event);
            if (event.description === 'Ringing') {
                playAudio()
            }
            break;
        case 'terminated':
            pauseAudio()
            break;
        case 'terminating':
            pauseAudio()
            break;
        case 'connected':
            pauseAudio()
            break;
        default:
            console.log('>>>>>>>>>>>>>>> OUT CALL EVENT DESCONHECIDO = ', event.type);
            break;
    }
}
const incomingCallEventsListener = (event) => {
    switch (event.type) {
        case 'terminated':
            pauseAudio()
            break;
        case 'terminating':
            pauseAudio()
            break;
        case 'connected':
            pauseAudio()
            break;
        default:
            console.log('<<<<<<<<<<<<<<< IN CALL EVENT DESCONHECIDO = ', event.type);
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
    events_listener: {events: '*', listener: mainEventsListener}, // optional: '*' means all events
    sip_headers: [ // optional
        {name: 'User-Agent', value: 'WEBPHONE JPBX'},
        {name: 'Organization', value: 'JPBX'}
    ]
})

window.onload = () => {
    sipStack.start()
}

const answerBtn = document.getElementById('answer');
const rejectBtn = document.getElementById('reject');
const hangupBtn = document.getElementById('hangup');
const dialBtn = document.getElementById('dial');

rejectBtn.addEventListener('click', () => {
    callSession.reject();
})
answerBtn.addEventListener('click', () => {
    callSession.accept();
})
hangupBtn.addEventListener('click', () => {
    callSession.hangup();
})
dialBtn.addEventListener('click', () => {
    callAudio.src = 'assets/calling.mp3';
    const number = document.getElementById('phoneInput').value;
    callSession = sipStack.newSession('call-audio', {
        audio_remote: document.getElementById('audio-remote'),
        events_listener: {events: '*', listener: outboundCallEventsListener}
    });
    callSession.call(number);
})

function playAudio() {
    callAudio.play();
    callAudio.loop = true;
}
function pauseAudio() {
    callAudio.pause();
    callAudio.src = '';
}

function sendDtmf(dtmf) {
    callSession.dtmf(dtmf);
}

// avoid page to be closed while a call is in progress
window.onbeforeunload = () => {
    if (callSession) {
        callSession.hangup();
    }
}

