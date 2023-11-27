import { Avatar, List, ListItem, ListItemAvatar, ListItemButton, ListItemText } from '@mui/material';
import React, { useContext, useEffect, useState } from 'react'
import { axiosInstance } from '../configs/configUrl';
import { AppContext } from '../contexts/context';
import { io } from 'socket.io-client';

function ListUserOnline() {
    const { handleShowAlert, socketRef, user, socket, listUserOnline, setListUserOnline, setUserActive } = useContext(AppContext);
    useEffect(() => {
        const authSocket = {
            _id: user._id,
            firstName: user.firstName,
            avatarUrl: user.avatarUrl,
        }
        socketRef.current = io("http://localhost:8080", {
            auth: { user: authSocket },
        });

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

    return (
        <div style={{ position: 'absolute', left: '50px' }}>
            <h3>Có {listUserOnline.length} người dùng đang online</h3>
            <List dense sx={{ width: '100%', maxWidth: 360 }}>
                {listUserOnline.map((value) => {
                    return (
                        <ListItem
                            key={value}
                            onClick={() => setUserActive(value)}
                        >
                            <ListItemButton>
                                <ListItemAvatar>
                                    <Avatar
                                        alt={`Avatar n°${value + 1}`}
                                        src={value.avatarUrl}
                                    />
                                </ListItemAvatar>
                                <ListItemText className='title-user-item' primary={value.firstName} />
                            </ListItemButton>
                        </ListItem>
                    );
                })}
            </List>
        </div>
    )
}

export default ListUserOnline
