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
    const [errors, setErrors] = useState([]);

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
        // Limpiar errores cuando el usuario empiece a escribir
        if (errors.length > 0) {
            setErrors([]);
        }
    }

    const clearState = () => {
        setFormData({ ...initialState });
        setErrors([]);
    };

    const handleSubmit = async(event) => {
        event.preventDefault();
        setErrors([]);
        
        try {
            const result = await login(formData);
            if (result && result.token) {
                navigate("/profile");
                clearState();
            }
        } catch (error) {
            const serverErrors = [];
            
            if (error.response?.status === 401) {
                // Credenciales incorrectas
                if (error.response?.data?.message) {
                    serverErrors.push(error.response.data.message);
                } else if (Array.isArray(error.response?.data)) {
                    serverErrors.push(...error.response.data);
                } else {
                    serverErrors.push("Credenciales incorrectas");
                }
            } else if (error.response?.status === 422) {
                // Errores de validación
                if (error.response?.data?.errors) {
                    Object.values(error.response.data.errors).forEach((messages) => {
                        serverErrors.push(...messages);
                    });
                } else if (error.response?.data?.message) {
                    serverErrors.push(error.response.data.message);
                } else if (Array.isArray(error.response?.data)) {
                    serverErrors.push(...error.response.data);
                }
            } else if (error.response?.data) {
                // Manejar diferentes formatos de respuesta de error
                if (error.response.data.message) {
                    serverErrors.push(error.response.data.message);
                } else if (Array.isArray(error.response.data)) {
                    serverErrors.push(...error.response.data);
                } else if (typeof error.response.data === 'string') {
                    serverErrors.push(error.response.data);
                }
            } else if (error.message) {
                serverErrors.push(error.message);
            } else {
                serverErrors.push("Ha ocurrido un error inesperado. Inténtalo de nuevo.");
            }
            
            setErrors(serverErrors);
        }
    };

  return <section className="form-card">
        <h2>Iniciar sesión</h2>
        <p>Accede a tu cuenta para gestionar tu perfil y tus publicaciones.</p>
        {errors.length > 0 && (
            <div className="alert alert-error">
                <p>Por favor revisa los siguientes errores:</p>
                <ul className="error-list">
                    {errors.map((error, index) => (
                        <li key={index}>{error}</li>
                    ))}
                </ul>
            </div>
        )}
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