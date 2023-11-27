import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import Context, { AppContext } from './contexts/context';
import Home from './pages/Home';
import Login from './pages/Login';
import { Alert } from '@mui/material';
import { useContext } from 'react';

function App() {
  const { showAlert } = useContext(AppContext);
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route index path="/" element={<Home />} />
          <Route path="login" element={<Login />} />
        </Routes>
      </BrowserRouter>
      <Alert variant="filled" style={{ right: showAlert.isShow ? '20px' : '-300px' }} severity={showAlert.status || 'error'} className='alert'>{showAlert.message}</Alert>
    </>
  );
}

export default App;
