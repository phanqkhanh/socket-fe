import React, { useContext, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { AppContext } from '../contexts/context';
import Peer from 'peerjs';
import { API_URL } from '../configs/constant';
import { io } from 'socket.io-client';

const peer = new Peer()
function Room() {
    const { roomId } = useParams()
    const { socketRef, user } = useContext(AppContext);

    useEffect(() => {
        const authSocket = {
            _id: user._id,
            firstName: user.firstName,
            avatarUrl: user.avatarUrl,
        }
        socketRef.current = io(API_URL, {
            auth: { user: authSocket },
        });
        ///
        const myVideo = document.createElement('video')
        const videoGrid = document.getElementById('video-grid')
        // myVideo.muted = true
        const listPeerConnect = {}
        navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        }).then(stream => {
            addVideoStream(myVideo, stream)

            peer.on('call', call => {
                call.answer(stream)
                const video = document.createElement('video')
                call.on('stream', userVideoStream => {
                    addVideoStream(video, userVideoStream)
                })
            })

            socketRef.current.on('new-user-join-room-meet', peerId => {
                connectToNewUser(peerId, stream)
            })
        })
        peer.on('open', id => {
            console.log('roomId', roomId)
            socketRef.current.emit('join-room-meet', { roomId: roomId, peerId: id })
        })
        socketRef.current.on('user-leave-room-meet', peerId => {
            if (listPeerConnect[peerId]) listPeerConnect[peerId].close()
        })
        function connectToNewUser(peerId, stream) {
            const call = peer.call(peerId, stream)
            const video = document.createElement('video')
            call.on('stream', userVideoStream => {
                addVideoStream(video, userVideoStream)
            })
            call.on('close', () => {
                video.remove()
            })
            listPeerConnect[peerId] = call
        }

        function addVideoStream(video, stream) {
            video.srcObject = stream
            video.addEventListener('loadedmetadata', () => {
                video.play()
            })
            videoGrid.append(video)
        }

        return () => {
            socketRef.current.disconnect();
        }
    }, [])


    return (
        <div>
            <div id="video-grid"></div>
        </div>
    )
}

export default Room
