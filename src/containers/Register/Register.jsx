import React, { useState } from "react";
import axios from "axios"

const Register = () => {

    const initialState = {
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
    }
    const [formData, setFormData] = useState(initialState);
    const [errors, setErrors] = useState([]);
    const [infoMessage, setInfoMessage] = useState("");

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const clearState = () => {
        setFormData({ ...initialState });
    };

    const validateForm = () => {
        const newErrors = [];

        if (!formData.name.trim()) {
            newErrors.push("El nombre es obligatorio.");
        }

        if (!formData.email.trim()) {
            newErrors.push("El email es obligatorio.");
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.push("El email no tiene un formato válido.");
        }

        if (!formData.password.trim()) {
            newErrors.push("La contraseña es obligatoria.");
        } else if (formData.password.length < 6) {
            newErrors.push("La contraseña debe tener al menos 6 caracteres.");
        }

        if (!formData.password_confirmation.trim()) {
            newErrors.push("La confirmación de contraseña es obligatoria.");
        }

        if (
            formData.password &&
            formData.password_confirmation &&
            formData.password !== formData.password_confirmation
        ) {
            newErrors.push("Las contraseñas no coinciden.");
        }

        return newErrors;
    };

    const handleSubmit = async(event) => {
        event.preventDefault();
        setInfoMessage("");
        const validationErrors = validateForm();

        if (validationErrors.length) {
            setErrors(validationErrors);
            return;
        }

        try {
            await axios.post("https://tfgreso-backend.onrender.com/api/register", formData);
            clearState();
            setErrors([]);
            setInfoMessage("Registro completado correctamente. Ya puedes iniciar sesión.");
        } catch (error) {
            const serverErrors = [];
            console.log(error.response);
            if (error.response?.data?.errors) {
                Object.values(error.response.data.errors).forEach((messages) => {
                    serverErrors.push(...messages);
                });
            } else if (error.response?.data?.message) {
                serverErrors.push(error.response.data.message);
            
            } else if (error.response?.data == 'The email has already been taken.'){
                serverErrors.push("El email ya está en uso");
            }else if (error.message) {
                serverErrors.push(error.message);
            }  else {
                serverErrors.push("Ha ocurrido un error inesperado. Inténtalo de nuevo.");
            }

            setErrors(serverErrors);
        }
    };

    return <section className="form-card">
        <h2>Crea tu cuenta</h2>
        <p>Únete a la comunidad y empieza a publicar tus ideas.</p>
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
        {infoMessage && (
            <div className="alert alert-success">
                {infoMessage}
            </div>
        )}
        <form className="form" onSubmit={handleSubmit}>
            <div className="form-group">
                <label className="form-label" htmlFor="name">Nombre completo</label>
                <input
                    id="name"
                    className="form-input"
                    type="text"
                    placeholder="Tu nombre"
                    value={formData.name}
                    onChange={handleInputChange}
                    name="name"
                />
            </div>
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
                    placeholder="Mínimo 6 caracteres"
                    value={formData.password}
                    onChange={handleInputChange}
                    name="password"
                />
            </div>
            <div className="form-group">
                <label className="form-label" htmlFor="password_confirmation">Confirma la contraseña</label>
                <input
                    id="password_confirmation"
                    className="form-input"
                    type="password"
                    placeholder="Repite la contraseña"
                    value={formData.password_confirmation}
                    onChange={handleInputChange}
                    name="password_confirmation"
                />
            </div>
            <button className="btn btn-primary" type="submit">Crear cuenta</button>

        </form>
    </section>;
};



export default Register