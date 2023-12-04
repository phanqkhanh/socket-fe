import React, { useContext, useEffect, useRef, useState } from 'react'
import { AppContext } from '../contexts/context';
import { IoCall } from 'react-icons/io5';
import { MdOutlineMissedVideoCall, MdSend } from 'react-icons/md';
import { Avatar, ListItemText } from '@mui/material';
import { axiosInstance } from '../configs/configUrl';
import { FaVideo } from "react-icons/fa6";
import Typing from './Typing';
import '../css/chat.css';

function Chat() {
    const { localVideoRef, remoteVideoRef, user, socketRef, chatActive, handleShowAlert,
        setChatActive, setListChat, listChat, listChatRef, setCall, call
    } = useContext(AppContext);
    const [value, setValue] = useState('')
    const [messages, setMessages] = useState([])
    const [showTyping, setShowTyping] = useState(false)
    const [isFetchingOldMessage, setIsFetchingOldMessage] = useState(false)
    const typingTimeoutRef = useRef(null);
    const chatContainerRef = useRef(null)
    const nextMessageRef = useRef(null)

    const scrollMessage = (message) => {
        // Lấy chiều cao của container tin nhắn
        const chatContainerHeight = chatContainerRef.current?.scrollHeight;

        // Đặt vị trí cuộn sao cho bottom của container là bottom của nội dung
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerHeight;
        }
    }
    const handleSubmit = (e) => {
        e.preventDefault();
        setIsFetchingOldMessage(false)
        if (chatActive.to) {
            const dataSend = {
                content: value,
                to: chatActive.to,
                chatId: chatActive._id
            }
            const newListMessage = [...messages]

            socketRef.current.emit('send-message', dataSend, (error, responseSuccess) => {
                // Xử lý phản hồi từ server ở đây
                if (error) {
                    handleShowAlert('error', error.toString());
                    const length = messages.length
                    newListMessage.push({ ...messages[length - 1], isError: true })
                    setMessages(newListMessage)
                } else {
                    // Xử lý thành công
                    //cập nhật lại latestMessage của list chat
                    const { message, chat } = responseSuccess
                    const newListChat = listChat.filter(item => item._id !== chat._id)
                    newListChat.unshift({ ...chat, latestMessage: message })
                    setListChat(newListChat)
                    const length = messages.length
                    newListMessage.push(message)
                    setMessages(newListMessage)
                }
            })
            setMessages((prevState) => [...prevState, { _id: Date.now(), content: value, sender: user._id, isSending: true }])
            setValue('')
        }
    }
    const handleOnChange = (e) => {
        const data = {
            to: chatActive.to
        }
        if (!typingTimeoutRef.current) {
            socketRef.current?.emit('typing', data)
        }
        clearTimeout(typingTimeoutRef.current);
        setValue(e.target.value)

        // Đặt hẹn giờ để gửi sự kiện 'stop-typing' sau 2 giây
        typingTimeoutRef.current = setTimeout(() => {
            socketRef.current?.emit('stop-typing', data);
            typingTimeoutRef.current = null;
        }, 2000);
    }
    const isMyMessage = (id) => {
        return id == user._id
    }

    useEffect(() => {
        nextMessageRef.current = messages[0]
    }, [messages])

    useEffect(() => {
        if (!isFetchingOldMessage) {
            scrollMessage()
        }
    }, [messages, isFetchingOldMessage]);

    const chatActiveRef = useRef(null)
    useEffect(() => {
        socketRef.current?.on("receive-message", (data) => {
            const { chat, message } = data
            if (chat._id === chatActiveRef.current?._id) {
                setMessages((prevState) => [...prevState, message])
                axiosInstance.post('/chat/seen', {
                    chatId: chat._id
                }).then((response) => {
                    // console.log(response.data)
                }).catch((error) => {
                    const msg = error.response?.data?.message || error.message || 'Lỗi'
                    handleShowAlert('error', msg)
                })

                //cập nhật lại latestMessage của list chat
                const latestMessage = { ...message, readBy: [...message.readBy, user._id] }
                const newListChat = listChatRef.current.filter(item => item._id !== chat._id)
                newListChat.unshift({ ...chat, latestMessage: latestMessage })
                setListChat(newListChat)
            } else {
                //cập nhật lại latestMessage của list chat
                const newListChat = listChatRef.current.filter(item => item._id !== chat._id)
                newListChat.unshift({ ...chat, latestMessage: message })
                setListChat(newListChat)
            }
        })
        socketRef.current?.on('typing', () => {
            setShowTyping(true)
        })
        socketRef.current?.on('stop-typing', () => {
            setShowTyping(false)
        })
    }, [])

    //truyền vào chatId, có thể thêm next id
    const fetchMessages = async (params) => {
        const limit = 20
        return axiosInstance.get('/chat/message', {
            params: { ...params, limit: limit }
        })
    }
    useEffect(() => {
        chatActiveRef.current = chatActive
        //call api get chat messages
        if (chatActive?._id) {
            //get messages
            fetchMessages({ chatId: chatActive._id }).then(response => {
                if (response.data.data) {
                    const data = response.data.data?.reverse()
                    setMessages(data)
                }
            }).catch(err => {
                const msg = err.response?.data?.message || err.message || 'Lỗi'
                handleShowAlert('error', msg)
            })
        }
    }, [chatActive])

    useEffect(() => {
        const handleScroll = () => {
            // Kiểm tra xem có đang scroll lên không
            if (chatContainerRef.current?.scrollTop === 0) {
                // Gọi API để lấy tin nhắn trước đó ở đây
                const nextId = nextMessageRef.current?._id
                setIsFetchingOldMessage(true)
                fetchMessages({ chatId: chatActive._id, next: nextId }).then((response) => {
                    if (response.data.data) {
                        const data = response.data.data?.reverse()
                        setMessages((prevState) => ([...data, ...prevState]))
                    }
                }).catch(err => {
                    const msg = err.response?.data?.message || err.message || 'Lỗi'
                    handleShowAlert('error', msg)
                })
            }
        };
        // Đăng ký sự kiện scroll
        chatContainerRef.current?.addEventListener('scroll', handleScroll);

        return () => {
            // Hủy đăng ký sự kiện khi component unmount
            chatContainerRef.current?.removeEventListener('scroll', handleScroll);
        };
    }, [chatContainerRef.current]);

    return (
        <div>
            {chatActive &&
                <div style={{ backgroundColor: '#fcfcfc' }}>
                    <div className='chat-header'>
                        <div className='chat-info'>
                            <Avatar
                                alt={`avatar`}
                                src={chatActive?.avatarUrl}
                            />
                            <p className='title-user-item' style={{ marginLeft: '10px', color: '#fff' }}>{chatActive?.name}</p>
                        </div>
                        <div className='icon-chat-header'>
                            <IoCall size={30} color='#fff' style={{ marginRight: '10px' }} onClick={() => setCall((prevState) => ({ ...prevState, isCall: true, video: false }))} />
                            <FaVideo color='#fff' size={30} onClick={() => setCall((prevState) => ({ ...prevState, video: true, isCall: true }))} />
                        </div>
                    </div>
                    <div ref={chatContainerRef} className='chat' style={{ overflowY: 'scroll', overflowX: 'hidden' }}>
                        {messages.map((message, index) =>
                            <div key={message?._id} className='wrap-message' style={{ justifyContent: isMyMessage(message.sender) ? 'flex-end' : 'flex-start' }}>
                                <div style={{ justifyContent: isMyMessage(message.sender) ? 'flex-end' : 'flex-start', backgroundColor: isMyMessage(message.sender) ? 'rgb(0, 132, 255)' : '#303030' }} className='message' key={index}>{message.content}</div>
                            </div>
                        )}
                        {
                            isMyMessage(messages[messages.length - 1]?.sender) ?
                                messages[messages.length - 1]?.isSending ?
                                    <p className='sending'>Đang gửi...</p> :
                                    <p className='sending'>Đã gửi</p>
                                : null
                        }
                        {showTyping && <Typing />}
                    </div>
                    <div style={{ width: '100%', display: 'flex', justifyContent: 'center', paddingBottom: '10px' }}>
                        <form onSubmit={handleSubmit} style={{}}>
                            <input type='text' value={value} onChange={handleOnChange} />
                            <button type='submit'><MdSend size={30} /></button>
                        </form>
                    </div>
                </div>}
        </div>
    )
}

export default Chat
