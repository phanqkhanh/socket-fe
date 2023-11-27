import Peer from 'peerjs';
import React, { useContext, useEffect, useRef, useState } from 'react'
import { AppContext } from '../contexts/context';
import { IoCall } from 'react-icons/io5';
import { MdOutlineMissedVideoCall, MdSend } from 'react-icons/md';
import { Avatar, ListItemText } from '@mui/material';

const peer = new Peer();

function Chat() {
    const { localVideoRef, remoteVideoRef, user, socketRef, userActive } = useContext(AppContext);

    const [value, setValue] = useState('')
    const [messages, setMessages] = useState([])
    const messagesEndRef = useRef(null)

    const handleSubmit = (e) => {
        e.preventDefault();
        const dataSend = {
            content: value,
            to: userActive._id
        }
        socketRef.current.emit('send-message', dataSend, (error, successMessage) => {
            // Xử lý phản hồi từ server ở đây
            if (error) {
                console.error(error);
            } else {
                // Xử lý thành công
                // console.log(successMessage);
            }
        })
        setMessages((prevState) => [...prevState, { content: value, userId: user._id }])
        setValue('')
    }
    const isMyMessage = (id) => {
        return id == user._id
    }

    const openStream = (openVideo = false) => {
        const config = { audio: false, video: openVideo };
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
    const onCall = (isVideoCall = false) => {
        const id = '' //id peer của người muốn gọi
        openStream(isVideoCall).then(stream => {
            playStream(localVideoRef, stream)
            const call = peer.call(id, stream)
            call.on('stream', remoteStream => playStream(remoteVideoRef, remoteStream))
        }).catch(err => console)

    }
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView()
    }, [messages])

    useEffect(() => {
        socketRef.current.on("receive-message", (data) => {
            // console.log(data);
            setMessages((prevState) => [...prevState, { content: data.content, userId: data.from }])
        })
        socketRef.current.on("send-message-success", (data) => {
            // console.log(data);
        })
    }, [])

    useEffect(() => {
        setMessages([])
        //call api get chat messages
    }, [userActive])

    useEffect(() => {
        peer.on("open", (id) => {
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

            }).catch(err => console)
        })
    }, [])

    return (
        <div style={{ width: '300px' }}>
            {userActive &&
                <div style={{ height: '80%' }}>
                    <div className='chat' style={{ height: '100%', display: 'inline-block', overflowY: 'scroll', overflowX: 'hidden', padding: '10px' }}>
                        <div className='chat-header'>
                            <div className='chat-info'>
                                <Avatar
                                    alt={`avatar`}
                                    src={userActive?.avatarUrl}
                                />
                                <p className='title-user-item' >{userActive?.firstName}</p>
                            </div>
                            <div className='icon'>
                                <IoCall size={25} onClick={() => onCall(false)} />
                                <MdOutlineMissedVideoCall size={25} onClick={() => onCall(true)} />
                            </div>
                        </div>
                        {messages.map((message, index) =>
                            <>
                                <div className='wrap-message' style={{ justifyContent: isMyMessage(message.userId) ? 'flex-end' : 'flex-start' }}>
                                    <div style={{ justifyContent: isMyMessage(message.userId) ? 'flex-end' : 'flex-start', backgroundColor: isMyMessage(message.userId) ? 'rgb(0, 132, 255)' : '#303030' }} className='message' key={index}>{message.content}</div>
                                </div>
                            </>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                    <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                        <form onSubmit={handleSubmit} style={{}}>
                            <input type='text' value={value} onChange={(e) => setValue(e.target.value)} />
                            <button type='submit'><MdSend size={30} /></button>
                        </form>
                    </div>
                    {/* <VideoCall /> */}
                </div>}
        </div>
    )
}

export default Chat
