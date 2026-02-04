import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import Register from './containers/Register/Register'
import Login from './containers/Login/Login'
import Home from './containers/Home/Home'
import Header from './components/Header/Header'
import Profile from './containers/Profile/Profile'
import { UserProvider } from './context/UserContext/UserState'
import { ThemeProvider } from './context/ThemeContext/ThemeState'
import MisPosts from './containers/MisPosts/MisPosts'
import Search from './containers/Search/Search'
import UserProfile from './containers/UserProfile/UserProfile'

function App() {
  return (
    <>
      <ThemeProvider>
        <BrowserRouter>
          <UserProvider>
            <div className="app-shell">
              <Header />
              <main className="app-main">
                <div className="content-wrapper">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/misposts" element={<MisPosts />} />
                    <Route path="/search" element={<Search />} />
                    <Route path="/user/:id" element={<UserProfile />} />
                  </Routes>
                </div>
              </main>
            </div>
          </UserProvider>
        </BrowserRouter>
      </ThemeProvider>
    </>
  )
}

export default App
