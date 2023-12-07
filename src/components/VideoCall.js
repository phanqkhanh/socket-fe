import Peer from 'peerjs';
import React, { useContext, useEffect, useRef, useState } from 'react'
import { AppContext } from '../contexts/context';
import { Avatar, Dialog } from '@mui/material';
import { ImPhoneHangUp } from "react-icons/im";
import { ImPhone } from "react-icons/im";
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash } from 'react-icons/fa6';
import { deepOrange } from '@mui/material/colors';


const peer = new Peer();
export default function VideoCall() {
    const { localVideoRef, remoteVideoRef, setCall, call, socketRef, handleShowAlert, chatActive, user } = useContext(AppContext);
    const [showDialog, setShowDialog] = useState(false)
    const [isCalling, setIsCalling] = useState(false)

    const openStream = (video = false, audio = false) => {
        const config = { audio: audio, video: video };
        return navigator.mediaDevices.getUserMedia(config)
    }
    const playStream = async (videoRef, stream) => {
        try {
            videoRef.current.srcObject = stream
            if (typeof videoRef.current.play === 'function') {
                videoRef.current?.play().then(() => {
                    // Playing successfully
                    // console.log('Video is playing');
                }).catch((error) => {
                    // Handle play error
                    console.error('Error playing video:', error);
                });
            } else {
                console.error('play() method is not supported on the video element.');
            }
        } catch (error) {
            console.log(error);
        }

    }
    const onCall = (video = false, audio = false) => {
        const data = {
            to: chatActive.to
        }
        socketRef.current?.emit('start-call', data, (err, response) => {
            if (err) {
                setCall((prevState) => ({ ...prevState, isCall: false }))
                handleShowAlert('error', err.toString());
                return
            }
            const id = response.peerId //id peer của người muốn gọi
            openStream(video, audio).then(async stream => {
                await playStream(localVideoRef, stream)
                const call = peer.call(id, stream)
                call.on('stream', remoteStream => playStream(remoteVideoRef, remoteStream))
            }).catch(err => console)
        })

    }
    const endCall = () => {
        setIsCalling(false)
        const localVideo = localVideoRef.current;
        if (localVideo) {
            localVideo.srcObject?.getTracks().forEach(track => track.stop());
        }
        localVideo.srcObject = null
        const remoteVideo = remoteVideoRef.current;
        if (remoteVideo) {
            remoteVideo.srcObject?.getTracks().forEach(track => track.stop());
        }
        remoteVideo.srcObject = null
        setCall((prevState) => ({ ...prevState, isCall: false, video: true, audio: true }));
        // Gọi hàm để thông báo cho đối tác rằng cuộc gọi đã kết thúc
        // Ví dụ: socketRef.current?.emit('end-call', { to: chatActive.to });
    };


    useEffect(() => {
        if (call.isCall) {
            onCall(call.video, call.audio)
            setIsCalling(true);
        }
    }, [call.isCall])

    useEffect(() => {
        peer.on("open", (id) => {
            // console.log(id)
            const dataEmit = {
                peerId: id,
                userId: user._id
            }
            socketRef.current.emit('peer-connect', dataEmit)
        });

        peer.on('call', call => {
            openStream(true).then(stream => {
                call.answer(stream)
                playStream(localVideoRef, stream)
                call.on('stream', remoteStream => playStream(remoteVideoRef, remoteStream))
                setIsCalling(true);
            }).catch(err => console)
        })

        peer.on('error', (error) => {
            console.error(error);
        });
    }, [])

    const onRemoteStream = (key) => {
        setCall((prevState) => ({ ...prevState, [key]: !prevState[key] }))
    }

    const toggleCamera = () => {
        const tracks = localVideoRef.current.srcObject.getVideoTracks();
        tracks.forEach(track => {
            track.enabled = !call.video;
        });
        onRemoteStream('video')
    };

    const toggleMicrophone = () => {
        const tracks = localVideoRef.current.srcObject.getAudioTracks();
        tracks.forEach(track => {
            track.enabled = !call.audio;
        });
        onRemoteStream('audio')
    };

    return (
        <>
            <div className='video'>
                {/* onClose={() => setShowDialog(false)} */}
                <Dialog open={showDialog}>
                    <div className='wrap-dialog-call'>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                                <Avatar alt="K" src="/static/images/avatar/1.jpg" sx={{ width: 70, height: 70 }} />
                            </div>
                            <h3 style={{ margin: '0', textAlign: 'center', marginTop: '15px' }}>Khánh</h3>
                            <div style={{ display: 'flex', marginTop: '20px' }}>
                                <div onClick={() => setShowDialog(false)} style={{ backgroundColor: '#ea0000', marginRight: '30px' }} className='icon-dialog-call'>
                                    <ImPhoneHangUp size={30} color='#fff' />
                                </div>
                                <div onClick={() => setShowDialog(false)} style={{ backgroundColor: '#07b807' }} className='icon-dialog-call'>
                                    <ImPhone className='accept-call-icon' size={30} color='#fff' />
                                </div>
                            </div>
                        </div>
                    </div>
                </Dialog>
                <div className='video-call-list' style={{ height: '300px' }}>
                    {/* {
                        call.video ? <video className='video-call-item' ref={localVideoRef} /> :
                            <Avatar sx={{ bgcolor: deepOrange[500], width: '300px', height: '225px' }} variant="square">
                                K
                            </Avatar>
                    } */}
                    <video className='video-call-item' ref={localVideoRef} autoPlay />
                    <video className='video-call-item' ref={remoteVideoRef} autoPlay />
                </div>
            </div>
            {
                isCalling &&
                <div style={{ display: 'flex', justifyContent: 'center', margin: '15px 0' }}>
                    <div
                        onClick={() => {
                            endCall()
                        }}
                        style={{ backgroundColor: '#ea0000', marginRight: '10px' }} className='icon-dialog-call'>
                        <ImPhoneHangUp size={30} color='#fff' />
                    </div>
                    <div onClick={toggleMicrophone} style={{ backgroundColor: '#443e3e', marginRight: '10px' }} className='icon-dialog-call'>
                        {call.audio ? <FaMicrophone color='#fff' size={30} /> : <FaMicrophoneSlash color='#fff' size={30} />}
                    </div>
                    <div onClick={toggleCamera} className='icon-dialog-call' style={{ backgroundColor: '#443e3e' }}>
                        {call.video ? <FaVideo color='#fff' size={30} />
                            :
                            <FaVideoSlash color='#fff' size={30} />}
                    </div>
                </div>
            }
        </>
    )
}
