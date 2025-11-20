import React, { useState, useContext } from 'react'
import { UserContext } from '../../context/UserContext/UserState';
import { Link, useNavigate } from 'react-router-dom';


const Login = () => {

    const { login } = useContext(UserContext);
    const navigate = useNavigate();
    const initialState = {
    
        email: "",
        password: "",
        
    }

    const [formData, setFormData] = useState(initialState);

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const clearState = () => {
        setFormData({ ...initialState });
    };

    const handleSubmit = async(event) => {
        event.preventDefault();
        login(formData)
        navigate("/profile");
        clearState();
    };

  return <section className="form-card">
        <h2>Iniciar sesión</h2>
        <p>Accede a tu cuenta para gestionar tu perfil y tus publicaciones.</p>
        <form className="form" onSubmit={handleSubmit}>
        <div className="form-group">
            <label className="form-label" htmlFor="email">Correo electrónico</label>
            <input
                id="email"
                className="form-input"
                type="email"
                placeholder="tu@email.com"
                value={formData.email}
                onChange={handleInputChange}
                name="email"
            />
        </div>
        <div className="form-group">
            <label className="form-label" htmlFor="password">Contraseña</label>
            <input
                id="password"
                className="form-input"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleInputChange}
                name="password"
            />
        </div>
        <button className="btn btn-primary" type="submit">Entrar</button>
        </form>
        <p className="helper-text">
            ¿Aún no tienes cuenta? <Link to="/register">Crea una gratuita</Link>
        </p>

    </section>

}

export default Login