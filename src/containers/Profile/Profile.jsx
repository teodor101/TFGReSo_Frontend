import { useEffect, useContext, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { UserContext } from '../../context/UserContext/UserState'

const Profile = () => {
    const {user, token, getProfile, deleteAccount} = useContext(UserContext);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: "",
        email: ""
    });
    const [isEditing, setIsEditing] = useState(false);
    const [feedback, setFeedback] = useState({
        type: "",
        message: ""
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    useEffect(() => {
      if (token) {
        getProfile().catch((error) => {
          // Si hay error 401, el contexto ya maneja el logout
          if (error.response?.status !== 401) {
            console.error("Error al obtener el perfil:", error);
          }
        });
      } else {
        // Si no hay token, redirigir al home
        navigate("/");
      }
    }, [])

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || "",
                email: user.email || "",
            });
        }
    }, [user]);

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!token) return;

        try {
            setIsSubmitting(true);
            setFeedback({ type: "", message: "" });
            await axios.put("https://tfgreso-backend.onrender.com/api/profile", formData, {
                headers: {
                    Authorization: "Bearer " + token
                }
            });
            setFeedback({ type: "success", message: "Perfil actualizado correctamente." });
            setIsEditing(false);
            getProfile();
        } catch (error) {
            console.error("Error al actualizar el perfil:", error);
            setFeedback({ type: "error", message: "No se pudo actualizar el perfil." });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteAccount = async () => {
        const confirmMessage = "¿Estás seguro de que quieres eliminar tu cuenta? Esta acción es irreversible y se eliminarán todos tus posts. Escribe 'ELIMINAR' para confirmar.";
        const userInput = window.prompt(confirmMessage);
        
        if (userInput !== 'ELIMINAR') {
            return;
        }

        if (!window.confirm("Última confirmación: ¿Realmente quieres eliminar tu cuenta? Esta acción no se puede deshacer.")) {
            return;
        }

        try {
            setIsSubmitting(true);
            await deleteAccount();
            // Esperar un momento para que el estado se actualice antes de navegar
            setTimeout(() => {
                navigate("/");
            }, 100);
        } catch (error) {
            console.error("Error al eliminar la cuenta:", error);
            setFeedback({ type: "error", message: "No se pudo eliminar la cuenta. Inténtalo de nuevo." });
            setIsSubmitting(false);
        }
    };

    if(!user){

        return (
            <section className="page-card">
                <p className="empty-state">Cargando tu perfil...</p>
            </section>
        )

    }
    return (
        <section className="page-card">
            <h2>Tu perfil</h2>
            <p>Actualiza tu información personal cuando lo necesites.</p>
            {feedback.message && (
                <div className={`alert ${feedback.type === "error" ? "alert-error" : "alert-success"}`}>
                    {feedback.message}
                </div>
            )}
            {isEditing ? (
                <form className="form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="name">Nombre completo</label>
                        <input
                            id="name"
                            className="form-input"
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label" htmlFor="email">Correo electrónico</label>
                        <input
                            id="email"
                            className="form-input"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="cta-group">
                        <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Guardando..." : "Guardar cambios"}
                        </button>
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => {
                                setIsEditing(false);
                                setFeedback({ type: "", message: "" });
                                setFormData({
                                    name: user.name,
                                    email: user.email,
                                });
                            }}
                            disabled={isSubmitting}
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            ) : (
                <>
                    <div className="profile-info">
                        <div>
                            <span className="label">Nombre</span>
                            <strong>{user.name}</strong>
                        </div>
                        <div>
                            <span className="label">Email</span>
                            <strong>{user.email}</strong>
                        </div>
                    </div>
                    <div className="cta-group">
                        <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
                            Editar perfil
                        </button>
                        <button 
                            className="btn btn-danger" 
                            onClick={handleDeleteAccount}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Eliminando..." : "Eliminar cuenta"}
                        </button>
                    </div>
                </>
            )}
        </section>
    )
}

export default Profile