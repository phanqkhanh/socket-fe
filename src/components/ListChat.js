import { Avatar, List, ListItem, ListItemAvatar, ListItemButton, ListItemText } from '@mui/material';
import React, { useContext, useEffect, useState } from 'react'
import { axiosInstance } from '../configs/configUrl';
import { AppContext } from '../contexts/context';
import { getFullNameUser, isObjectEmpty } from '../utils';
import moment from 'moment/moment';

moment.locale('vi')

function ListChat() {
    const { handleShowAlert, setChatActive, user, socketRef, setListChat, listChat, listChatRef, chatActive } = useContext(AppContext);

    useEffect(() => {
        axiosInstance.get('/chat')
            .then((response) => {
                if (response.data.statusCode == 200) {
                    setListChat(response.data.data)
                }
            }).catch((error) => {
                const msg = error.response?.data?.message || error.message || 'Lỗi'
                handleShowAlert('error', msg)
            })

        // socketRef.current.on("new-chat", (data) => {
        //     setListChat((prevState) => ([data, ...prevState]))
        // })
    }, [])

    const getInfoUserReceive = (users, key) => {
        const userReceive = users.find(item => item._id !== user._id)
        return userReceive ? userReceive[key] : ''
    }
    useEffect(() => {
        listChatRef.current = listChat
    }, [listChat])

    const isSeenChat = (data = null) => {
        if (data == null || isObjectEmpty(data)) {
            return true
        }
        if (data.sender === user._id) {
            return true
        }
        const checkExits = data?.readBy?.find(item => item === user._id)
        return !!checkExits
    }

    const onClickChatItem = (value, index) => {
        let data = {}
        if (value.isGroup) {
            data = {
                _id: value._id,
                avatarUrl: value?.avatarUrl,
                name: value.name,
            }
        } else {
            const userReceive = value.users.find(item => item._id !== user._id)
            data = {
                _id: value._id,
                avatarUrl: userReceive?.avatarUrl,
                name: getFullNameUser(userReceive),
                to: userReceive._id
            }
        }

        setChatActive(data)
        if (value.latestMessage?.readBy.includes(user._id) || value.latestMessage.sender === user._id) return
        const latestMessage = { ...value.latestMessage }
        latestMessage?.readBy?.push(user._id)
        const newListChat = [...listChat]
        newListChat[index] = { ...value, latestMessage: latestMessage }
        setListChat(newListChat)

        axiosInstance.post('/chat/seen', {
            chatId: value._id
        }).then((response) => {
            // console.log(response.data)
        }).catch((error) => {
            const msg = error.response?.data?.message || error.message || 'Lỗi'
            handleShowAlert('error', msg)
        })
    }

    const getNameChatGroup = (chat) => {
        if (chat.name) {
            return chat.name
        }
        let result = ''
        const length = chat?.users.length
        for (let index = 0; index < chat?.users.length; index++) {
            const user = chat.users[index];
            result += user.firstName + (length === (index + 1) ? '' : ', ')
        }
        return result
    }

    // console.log(listChat)
    return (
        <div style={{ position: 'absolute', left: '50px' }}>
            <h3 style={{ margin: '0' }}>{listChat.length === 0 ? 'Bạn chưa có cuộc trò chuyện nào' : 'Danh sách cuộc trò chuyện'}</h3>
            <List dense sx={{ width: '100%', maxWidth: 360 }}>
                {listChat.map((value, index) => {
                    return (
                        <ListItem
                            key={value._id}
                            className='item-chat'
                            sx={{ backgroundColor: chatActive?._id === value._id ? '#0000000a' : '' }}
                            onClick={() =>
                                onClickChatItem(value, index)
                            }
                        >
                            {!isSeenChat(value.latestMessage) && <div className='icon-seen-chat'></div>}
                            <ListItemButton>
                                <ListItemAvatar style={{ position: 'relative' }} className=''>
                                    <Avatar
                                        alt={`Avatar n°${value + 1}`}
                                        src={getInfoUserReceive(value.users, 'avatarUrl')}
                                    />
                                    {/* <div className='icon-online'></div> */}
                                </ListItemAvatar>
                                <div style={{ maxWidth: '140px' }}>
                                    <ListItemText className='title-user-item' primary={value?.isGroup ? getNameChatGroup(value) : getInfoUserReceive(value.users, 'firstName')} />
                                    <p style={{ fontWeight: isSeenChat(value.latestMessage) ? 'normal' : 'bold' }} className='latest-message'>{value.latestMessage?.content}</p>
                                </div>
                            </ListItemButton>
                        </ListItem>
                    );
                })}
            </List>
        </div>
    )
}

export default ListChat
