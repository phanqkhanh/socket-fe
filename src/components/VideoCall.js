import Peer from 'peerjs';
import React, { useContext, useEffect, useRef } from 'react'
import { AppContext } from '../contexts/context';

export default function VideoCall() {
    const { localVideoRef, remoteVideoRef } = useContext(AppContext);

    return (
        <div className='video'>
            <video ref={localVideoRef} />
        </div>
    )
}
