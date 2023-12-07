import { Button, Checkbox, Dialog, FormControlLabel, TextField } from '@mui/material'
import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../contexts/context';
import { getFullNameUser } from '../utils';
import { axiosInstance } from '../configs/configUrl';

function CreateGroup() {
    const { socketRef, user, listUserOnline, handleShowAlert, setListChat } = useContext(AppContext);

    const [showDialog, setShowDialog] = useState(false)
    const [value, setValue] = useState('')
    const [listSelected, setListSelected] = useState([])

    const handleChange = (e) => {
        const { value, checked } = e.target
        if (checked) {
            const newList = [...listSelected]
            newList.push(value)
            setListSelected(newList)
        } else {
            const newList = listSelected.filter((item) => item !== value)
            setListSelected(newList)
        }
    }

    const handleSubmit = () => {
        axiosInstance.post('/chat/create-group', {
            name: value,
            users: listSelected
        }).then((response) => {
            console.log(response.data)
            if (response.data.data) {
                setListChat((prevState) => ([response.data.data, ...prevState]))
                handleShowAlert('success', 'Tạo thành công')
                setShowDialog(false)
            }
        }).catch((error) => {
            const msg = error.response?.data?.message || error.message || 'Lỗi'
            handleShowAlert('error', msg)
        })
    }

    return (
        <>
            <Button onClick={() => setShowDialog(true)} sx={{ marginLeft: '40px' }} variant="text">Tạo nhóm</Button>
            <Dialog open={showDialog} onClose={() => setShowDialog(false)}>
                <div style={{ padding: '0 30px 10px 30px' }} className=''>
                    <h3>Tạo nhóm</h3>
                    <TextField
                        label="Tên nhóm"
                        type="text"
                        name='group'
                        value={value}
                        onChange={(event) => setValue(event.target.value)}
                        fullWidth
                        required={true}

                    />
                    <p style={{ margin: 0, marginTop: '15px' }}>Chọn thành viên</p>
                    {listUserOnline.map((user) =>
                        <div>
                            <FormControlLabel
                                label={getFullNameUser(user)}
                                control={<Checkbox onChange={handleChange} value={user._id} />}
                            // labelPlacement="start"
                            />
                        </div>
                    )}
                </div>
                <div style={{ textAlign: 'right', paddingBottom: '25px', paddingRight: '30px' }}>
                    <Button onClick={handleSubmit} variant="contained" disabled={!(listSelected.length > 1)}>Tạo</Button>
                </div>
            </Dialog>
        </>
    )
}

export default CreateGroup
