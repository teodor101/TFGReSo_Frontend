import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import Register from './containers/Register/Register'
import Login from './containers/Login/Login'
import Home from './containers/Home/Home'
import Header from './components/Header/Header'
import Profile from './containers/Profile/Profile'
import { UserProvider } from './context/UserContext/UserState'

function App() {
  return (
    <>
      <BrowserRouter>
        <UserProvider>
          <Header />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </UserProvider>
      </BrowserRouter>
    </>
  )
}

export default App
