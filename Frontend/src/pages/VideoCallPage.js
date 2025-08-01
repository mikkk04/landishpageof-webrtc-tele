// src/pages/VideoCallPage.js

import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import Peer from 'simple-peer';
import { useAuth } from '../context/AuthContext.js';
import { MdMic, MdMicOff, MdVideocam, MdVideocamOff, MdCallEnd } from 'react-icons/md';
import './VideoCall.css';

// ... (DebugPanel, RemoteVideo, LocalVideo components remain the same) ...
const DebugPanel = ({ debugInfo }) => (
    <div className="debug-panel">
        <h4>Debug Info</h4>
        <p><strong>Socket Status:</strong> {debugInfo.socketStatus}</p>
        <p><strong>Local Stream:</strong> {debugInfo.localStreamStatus}</p>
        <p><strong>Peer Status:</strong> {debugInfo.peerStatus}</p>
        <p><strong>Remote Stream:</strong> {debugInfo.remoteStreamStatus}</p>
    </div>
);
const RemoteVideo = ({ peer, onStream }) => {
    const ref = useRef();
    useEffect(() => {
        if (peer) {
            peer.on('stream', stream => {
                if(ref.current) ref.current.srcObject = stream;
                onStream();
            });
            peer.on('error', (err) => console.error('Peer connection error:', err));
        }
    }, [peer, onStream]);
    return <video playsInline autoPlay ref={ref} className="remote-video" />;
};
const LocalVideo = ({ stream }) => {
    const ref = useRef();
    useEffect(() => {
        if (stream) ref.current.srcObject = stream;
    }, [stream]);
    return <video playsInline autoPlay ref={ref} muted className="local-video" />;
};


const VideoCallPage = () => {
    const [peers, setPeers] = useState([]);
    const [localStream, setLocalStream] = useState(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isCameraOff, setIsCameraOff] = useState(false);
    
    const [debugInfo, setDebugInfo] = useState({
        socketStatus: 'Initializing...',
        localStreamStatus: 'Not acquired',
        peerStatus: 'No peer',
        remoteStreamStatus: 'No remote stream',
    });

    const socketRef = useRef();
    const peersRef = useRef([]);
    const { meetingId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const updateDebug = (key, value) => {
        setDebugInfo(prev => ({ ...prev, [key]: value }));
    };

    useEffect(() => {
        socketRef.current = io('http://localhost:5001');
        updateDebug('socketStatus', 'Connecting...');

        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then(stream => {
                setLocalStream(stream);
                updateDebug('localStreamStatus', 'Acquired');
                socketRef.current.emit('join-room', meetingId, user.name);
            })
            .catch(err => {
                updateDebug('localStreamStatus', `Error: ${err.message}`);
            });
        
        socketRef.current.on('connect', () => {
            updateDebug('socketStatus', `Connected (${socketRef.current.id})`);
        });

        // ** NEW, SIMPLIFIED LOGIC **
        socketRef.current.on('room-participants', participants => {
            if (!localStream) return;
            console.log('CLIENT: Received participants list', participants);

            const allOtherUsers = participants.filter(p => p.id !== socketRef.current.id);

            if (allOtherUsers.length > 0) {
                const otherUser = allOtherUsers[0]; // Assuming 1-on-1
                
                // If we don't have a peer for this user yet, create one (as initiator)
                if (!peersRef.current.find(p => p.peerID === otherUser.id)) {
                    console.log(`CLIENT: Creating initiator peer for ${otherUser.username} (${otherUser.id})`);

                    const peer = new Peer({
                        initiator: true,
                        trickle: false,
                        stream: localStream,
                        config: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] }
                    });
                    
                    peer.on('_iceStateChange', (state) => updateDebug('peerStatus', state));
                    
                    peer.on('signal', signal => {
                        socketRef.current.emit('offer', { targetSocketID: otherUser.id, callerID: socketRef.current.id, signal, username: user.name });
                    });
                    
                    const peerObj = { peerID: otherUser.id, peer, username: otherUser.username };
                    peersRef.current.push(peerObj);
                    setPeers(p => [...p, peerObj]);
                }
            } else {
                // If we are the only one, reset peers
                peersRef.current = [];
                setPeers([]);
                updateDebug('peerStatus', 'No peer');
            }
        });

        socketRef.current.on('offer-received', payload => {
            console.log('CLIENT: Offer received from', payload.callerID);
            if (!localStream) return;
            if (peersRef.current.find(p => p.peerID === payload.callerID)) return;

            const peer = new Peer({
                initiator: false,
                trickle: false,
                stream: localStream,
                config: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] }
            });

            peer.on('_iceStateChange', (state) => updateDebug('peerStatus', state));

            peer.on('signal', signal => {
                socketRef.current.emit('answer', { signal, targetSocketID: payload.callerID, username: user.name });
            });
            
            peer.signal(payload.signal);

            const peerObj = { peerID: payload.callerID, peer, username: payload.username };
            peersRef.current.push(peerObj);
            setPeers(p => [...p, peerObj]);
        });

        socketRef.current.on('answer-received', payload => {
            const item = peersRef.current.find(p => p.peerID === payload.callerID);
            if (item) item.peer.signal(payload.signal);
        });

        return () => {
            if (socketRef.current) socketRef.current.disconnect();
            peersRef.current.forEach(p => p.peer.destroy());
            if (localStream) localStream.getTracks().forEach(track => track.stop());
        };
    // eslint-disable-next-line
    }, [localStream]); // Run effect again once localStream is ready.

    // ... (toggleMute, toggleCamera, handleEndCall functions remain the same) ...
    const toggleMute = () => { if(localStream) { localStream.getAudioTracks()[0].enabled = !isMuted; setIsMuted(!isMuted); } };
    const toggleCamera = () => { if(localStream) { localStream.getVideoTracks()[0].enabled = !isCameraOff; setIsCameraOff(!isCameraOff); } };
    const handleEndCall = () => navigate('/dashboard');
    const remotePeer = peers[0];

    return (
        <div className="call-container">
            <DebugPanel debugInfo={debugInfo} />
            <div className="video-area">
                <div className="remote-video-wrapper">
                    {remotePeer ? 
                        <RemoteVideo 
                            peer={remotePeer.peer} 
                            onStream={() => updateDebug('remoteStreamStatus', 'Received and Attached')}
                        /> : 
                        <div className="waiting-placeholder"><h2>Waiting for other user...</h2></div>
                    }
                    {remotePeer && <div className="name-label">{remotePeer.username}</div>}
                </div>
                {localStream && (
                    <div className="local-video-wrapper">
                        <LocalVideo stream={localStream} />
                        <div className="name-label">{user?.name} (You)</div>
                    </div>
                )}
            </div>
            <div className="controls-bar">
                <button onClick={toggleMute} className={`control-btn ${isMuted ? 'active' : ''}`} title="Mute">{isMuted ? <MdMicOff size={28} /> : <MdMic size={28} />}</button>
                <button onClick={toggleCamera} className={`control-btn ${isCameraOff ? 'active' : ''}`} title="Camera Off">{isCameraOff ? <MdVideocamOff size={28} /> : <MdVideocam size={28} />}</button>
                <button onClick={handleEndCall} className="control-btn end-call-btn" title="End Call"><MdCallEnd size={28} /></button>
            </div>
        </div>
    );
};

export default VideoCallPage;