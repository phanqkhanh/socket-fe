import { Avatar, List, ListItem, ListItemAvatar, ListItemButton, ListItemText } from '@mui/material';
import React, { useContext, useEffect, useState } from 'react'
import { axiosInstance } from '../configs/configUrl';
import { AppContext } from '../contexts/context';
import { io } from 'socket.io-client';
import { getFullNameUser } from '../utils';
import { API_URL } from '../configs/constant';

function ListUserOnline() {
    const { handleShowAlert, socketRef, user, listUserOnline, setListUserOnline, userOnlineSelect, setUserOnlineSelect, setChatActive } = useContext(AppContext);
    useEffect(() => {
        const authSocket = {
            _id: user._id,
            firstName: user.firstName,
            avatarUrl: user.avatarUrl,
        }
        socketRef.current = io(API_URL, {
            auth: { user: authSocket },
        });
        // socketRef.current.on("connect", () => {
        //     console.log(socketRef.current);
        // });

        socketRef.current.on("new-user-online", (data) => {
            setListUserOnline((prevState) => ([...prevState, data]))
        })
        socketRef.current.on("new-user-offline", (userId) => {
            const newListUserOnline = listUserOnline.filter(user => user._id != userId)
            setListUserOnline(newListUserOnline)
        })

        axiosInstance.get('/user/list-online')
            .then((response) => {
                if (response.data.statusCode == 200) {
                    setListUserOnline(response.data.data)
                }
            }).catch((error) => {
                const msg = error.response?.data?.message || error.message || 'Lỗi'
                handleShowAlert('error', msg)
            })
        return () => {
            socketRef.current.disconnect();
        }
    }, [])

    useEffect(() => {
        if (userOnlineSelect) {
            const userId = userOnlineSelect._id
            axiosInstance.get(`/chat/${userId}`)
                .then((response) => {
                    console.log(response.data)
                    if (response.data.data) {
                        const chat = response.data.data
                        const userReceive = chat.users.find(item => item._id !== user._id)
                        const data = {
                            _id: chat._id,
                            avatarUrl: userReceive.avatarUrl,
                            name: getFullNameUser(userReceive),
                            to: userReceive._id
                        }
                        setChatActive(data)
                    } else {
                        const data = {
                            _id: null,
                            avatarUrl: userOnlineSelect.avatarUrl,
                            name: getFullNameUser(userOnlineSelect),
                            to: userOnlineSelect._id
                        }
                        setChatActive(data)
                    }
                }).catch((err) => {
                    const msg = err.response?.data?.message || err.message || 'Lỗi'
                    handleShowAlert('error', msg)
                })
        }
    }, [userOnlineSelect])

    return (
        <div style={{ position: 'absolute', right: '50px' }}>
            <h3 style={{ margin: '0' }}>Danh sách người dùng đang online</h3>
            <List dense sx={{ width: '100%', maxWidth: 360 }}>
                {listUserOnline.map((value) => {
                    return (
                        <ListItem
                            key={value._id}
                            onClick={() => {
                                // const data = {
                                //     chatId: null,
                                //     avatarUrl: value.avatarUrl,
                                //     name: value.name,
                                //     userSelect: value,
                                //     to: value._id,
                                // }
                                // setChatActive(data)
                                setUserOnlineSelect(value)
                            }}
                        >
                            <ListItemButton>
                                <ListItemAvatar>
                                    <Avatar
                                        alt={`Avatar n°${value + 1}`}
                                        src={value.avatarUrl}
                                    />
                                </ListItemAvatar>
                                <ListItemText className='title-user-item' primary={getFullNameUser(value)} />
                            </ListItemButton>
                        </ListItem>
                    );
                })}
            </List>
        </div>
    )
}

export default ListUserOnline
