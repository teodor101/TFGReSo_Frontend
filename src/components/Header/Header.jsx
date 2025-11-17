import React, { useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { UserContext } from '../../context/UserContext/UserState';


const Header = () => {
  const { token, logout } = useContext(UserContext);
  const navigate = useNavigate();
  
  const logOut = async() => {
        logout();
        navigate("/login");
    };
  return (
    <div>
        <Link to="/">Home</Link>
        {token ? 
        <>
        <Link to="/profile">Profile</Link>
        <Link to="/misposts">Mis Posts</Link>
        <button onClick={logOut}>LogOut</button>
        </>
        :
        <>
        <Link to="/login">Login</Link>
        <Link to="/register">Register</Link>
        </>}
        
    </div>
  )
}

export default Header