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

    const openStream = (openVideo = false) => {
        const config = { audio: true, video: openVideo };
        return navigator.mediaDevices.getUserMedia(config)
    }
    const playStream = (videoRef, stream) => {
        try {
            videoRef.current.srcObject = stream
            videoRef.current?.play()
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
            openStream(video).then(stream => {
                playStream(localVideoRef, stream)
                const call = peer.call(id, stream)
                call.on('stream', remoteStream => playStream(remoteVideoRef, remoteStream))
            }).catch(err => console)
        })

    }
    const endCall = () => {
        const localVideo = localVideoRef.current;
        if (localVideo) {
            localVideo.srcObject = null;
        }

        // Tắt video trên remote video (nếu có)
        const remoteVideo = remoteVideoRef.current;
        if (remoteVideo) {
            remoteVideo.srcObject = null;
        }
    }

    useEffect(() => {
        if (call.isCall) {
            onCall(call.video)
            // openStream(true)
        } else {
            endCall()
        }
    }, [call.isCall])

    useEffect(() => {
        if (call.isCall) {
            onCall(call.video, call.audio)
        }
    }, [call.video, call.audio])

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
            console.log('received call')
            openStream(true).then(stream => {
                console.log('received stream', stream)
                call.answer(stream)
                // playStream(localVideoRef, stream)
                call.on('stream', remoteStream => playStream(remoteVideoRef, remoteStream))

            }).catch(err => console)
        })

        peer.on('error', (error) => {
            console.error(error);
        });
    }, [])

    const onRemoteStream = (key) => {
        setCall((prevState) => ({ ...prevState, [key]: !prevState[key] }))
    }

    // console.log(localVideoRef)

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
                    <video className='video-call-item' ref={localVideoRef} />
                    <video className='video-call-item' ref={remoteVideoRef} />
                </div>
            </div>
            {
                call.isCall &&
                <div style={{ display: 'flex', justifyContent: 'center', margin: '15px 0' }}>
                    <div
                        onClick={() => {
                            setShowDialog(false)
                            onRemoteStream('isCall')
                        }}
                        style={{ backgroundColor: '#ea0000', marginRight: '10px' }} className='icon-dialog-call'>
                        <ImPhoneHangUp size={30} color='#fff' />
                    </div>
                    <div onClick={() => onRemoteStream('audio')} style={{ backgroundColor: '#443e3e', marginRight: '10px' }} className='icon-dialog-call'>
                        {call.audio ? <FaMicrophone color='#fff' size={30} /> : <FaMicrophoneSlash color='#fff' size={30} />}
                    </div>
                    <div onClick={() => onRemoteStream('video')} className='icon-dialog-call' style={{ backgroundColor: '#443e3e' }}>
                        {call.video ? <FaVideo color='#fff' size={30} onClick={() => setCall((prevState) => ({ ...prevState, video: true, isCall: true }))} />
                            :
                            <FaVideoSlash color='#fff' size={30} />}
                    </div>
                </div>
            }
        </>
    )
}
