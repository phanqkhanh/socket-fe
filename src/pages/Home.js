import { Button } from '@mui/material';
import React, { useContext, useEffect } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import Chat from '../components/Chat';
import ListUserOnline from '../components/ListUserOnline';
import { AppContext } from '../contexts/context';
import ListChat from '../components/ListChat';
import VideoCall from '../components/VideoCall';

function Home() {
    const navigate = useNavigate()

    const { user, setUser, } = useContext(AppContext);

    const handleLogout = () => {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('idToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
        setUser(null)
        navigate('/login')
    }
    return (
        <>
            {!user ? <Navigate to="/login" /> :
                <>
                    <div style={{ textAlign: 'center' }}>
                        <h2 style={{}}>Hi {user.firstName}!</h2>
                    </div>
                    <div style={{ position: 'fixed', right: '15px', top: '15px' }}>
                        <Button onClick={handleLogout} variant="text">Logout</Button>
                    </div>

                    <ListUserOnline />
                    <ListChat />
                    <div className="App" style={{ height: '500px', marginTop: '50px', display: 'flex', justifyContent: 'center' }} >
                        <Chat />
                    </div>
                    <VideoCall />

                </>
            }
        </>
    );
}

export default Home;
