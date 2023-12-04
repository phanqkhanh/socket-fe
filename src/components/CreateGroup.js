import { Button, Dialog, TextField } from '@mui/material'
import React, { useState } from 'react'

function CreateGroup() {
    const [showDialog, setShowDialog] = useState(false)
    const [value, setValue] = useState('')

    // const hanld

    return (
        <>
            <Button onClick={() => setShowDialog(true)} sx={{ marginLeft: '40px' }} variant="text">Tạo nhóm</Button>
            <Dialog open={showDialog} onClose={() => setShowDialog(false)}>
                <div style={{ padding: '0 30px 30px 30px' }} className=''>
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
                </div>
            </Dialog>
        </>
    )
}

export default CreateGroup
