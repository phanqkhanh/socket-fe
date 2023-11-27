import { Button, TextField } from '@mui/material'
import React, { useContext, useEffect, useState } from 'react'
import { axiosInstance } from '../configs/configUrl'
import { AppContext } from '../contexts/context';
import { Navigate, redirect, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import LinearProgress from '@mui/material/LinearProgress';
import { socket } from './Home';

function Login() {
    const { handleShowAlert, setUser, user } = useContext(AppContext);
    const navigate = useNavigate()
    const [value, setValue] = useState({ email: '', password: '' })
    const [showLoading, setShowLoading] = useState(false)
    const onChange = (e) => {
        const name = e.target.name
        const value = e.target.value
        setValue((preState) => ({ ...preState, [name]: value }))
    }
    const handleLogin = () => {
        setShowLoading(true)
        const data = {
            email: value.email,
            password: value.password
        }
        axiosInstance.post('/user/sign-in', data)
            .then((response) => {
                console.log(response)
                if (response.data.statusCode == 200) {
                    const accessToken = response.data.data.accessToken
                    const idToken = response.data.data.idToken
                    const refreshToken = response.data.data.refreshToken
                    const user = response.data.data.user
                    setUser(user)
                    localStorage.setItem('accessToken', accessToken)
                    localStorage.setItem('idToken', idToken)
                    localStorage.setItem('refreshToken', refreshToken)
                    localStorage.setItem('user', JSON.stringify(user))
                    navigate('/')
                }
            }).catch((error) => {
                const msg = error.response?.data?.message || error.message || 'Lỗi'
                handleShowAlert('error', msg)
            }).finally(() => {
                setShowLoading(false)
            })
    }

    return (
        <div className='login'>
            {user ? <Navigate to="/" /> :
                <div className='form'>
                    <h2 style={{ textAlign: 'center' }}>Hihi!</h2>
                    <div>
                        <TextField
                            label="Email"
                            type="email"
                            name='email'
                            value={value.email}
                            onChange={onChange}
                            fullWidth

                        />
                    </div>
                    <div style={{ marginTop: '15px' }}>
                        <TextField
                            label="Password"
                            type="password"
                            name='password'
                            value={value.password}
                            onChange={onChange}
                            fullWidth
                        />
                    </div>
                    <div style={{ marginTop: '15px' }}>
                        <Button variant="contained" fullWidth onClick={handleLogin}>Login</Button>
                        {showLoading && <LinearProgress />
                        }
                    </div>
                </div>}
        </div>
    )
}

export default Login
