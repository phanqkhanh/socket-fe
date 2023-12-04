import React, { createContext, useRef, useState } from 'react'

export const AppContext = createContext()

export default function Context({ children }) {
    const socketRef = useRef(null);
    const localVideoRef = useRef()
    const remoteVideoRef = useRef()
    const [showAlert, setShowAlert] = useState({ isShow: false, status: 'error', message: '' })
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null)
    const [listUserOnline, setListUserOnline] = useState([])
    const [userOnlineSelect, setUserOnlineSelect] = useState(null)
    const [chatActive, setChatActive] = useState(null)
    const [listChat, setListChat] = useState([])
    const listChatRef = useRef(null)
    const [call, setCall] = useState({ isCall: false, video: true, audio: true })


    const handleShowAlert = (status = 'error' | 'success', message = '') => {
        setShowAlert({ isShow: true, status: status, message: message })
        setTimeout(() => {
            setShowAlert({ isShow: false, status: 'error', message: '' })
        }, 2000)
    }
    return (
        <AppContext.Provider
            value={{
                localVideoRef,
                remoteVideoRef,
                showAlert,
                handleShowAlert,
                user,
                setUser,
                socketRef,
                setListUserOnline,
                listUserOnline,
                setChatActive,
                chatActive,
                userOnlineSelect,
                setUserOnlineSelect,
                setListChat,
                listChat,
                listChatRef,
                call,
                setCall
            }}
        >
            {children}
        </AppContext.Provider>
    )
}
