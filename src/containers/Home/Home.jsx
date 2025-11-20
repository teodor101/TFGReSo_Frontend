import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import { UserContext } from '../../context/UserContext/UserState';

const Home = () => {
  const { token } = useContext(UserContext);

  return (
    <section className="page-card">
      <h1>Bienvenido a ReSo</h1>
      <p>
        Comparte tus ideas, conecta con otras personas y gestiona tus posts en un
        entorno sencillo y seguro. Empieza creando una cuenta o continúa donde lo dejaste.
      </p>
      <div className="cta-group">
        {token ? 
        <Link to="/misposts" className="btn btn-primary">Crear un post</Link>
        :
        <Link to="/register" className="btn btn-secondary">Crear cuenta</Link>
        }</div>
    </section>
  )
}

export default Home