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
    <header className="main-header">
      <div className="header-content">
        <span className="brand">ReSo</span>
        <nav className="nav-links">
          <Link to="/">Inicio</Link>
          {token ? (
            <>
              <Link to="/profile">Perfil</Link>
              <Link to="/misposts">Mis Posts</Link>
              <button className="btn btn-secondary" onClick={logOut}>
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Iniciar sesión</Link>
              <Link to="/register">Crear cuenta</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}

export default Header