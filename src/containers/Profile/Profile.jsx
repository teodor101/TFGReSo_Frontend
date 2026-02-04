import { useEffect, useContext, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { UserContext } from '../../context/UserContext/UserState'

const Profile = () => {
    const { user, token, getProfile, deleteAccount } = useContext(UserContext);
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
    const [posts, setPosts] = useState([]);
    const [followersCount, setFollowersCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);
    const [loadingPosts, setLoadingPosts] = useState(true);

    useEffect(() => {
        if (token) {
            getProfile().catch((error) => {
                if (error.response?.status !== 401) {
                    console.error("Error al obtener el perfil:", error);
                }
            });
            fetchUserData();
        } else {
            navigate("/");
        }
    }, [])

    const fetchUserData = async () => {
        try {
            setLoadingPosts(true);
            // Obtener los posts del usuario
            const postsResponse = await axios.get(
                "https://tfgreso-backend.onrender.com/api/getPosts",
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setPosts(postsResponse.data.user || []);

            // Obtener datos adicionales del perfil (seguidores, siguiendo)
            if (user?.id) {
                const profileResponse = await axios.get(
                    `https://tfgreso-backend.onrender.com/api/users/${user.id}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setFollowersCount(profileResponse.data.user.followers_count || 0);
                setFollowingCount(profileResponse.data.user.following_count || 0);
            }
        } catch (error) {
            console.error("Error al cargar datos:", error);
        } finally {
            setLoadingPosts(false);
        }
    };

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || "",
                email: user.email || "",
            });
            // Cargar datos adicionales cuando user esté disponible
            if (token && user.id) {
                fetchUserData();
            }
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
            setTimeout(() => {
                navigate("/");
            }, 100);
        } catch (error) {
            console.error("Error al eliminar la cuenta:", error);
            setFeedback({ type: "error", message: "No se pudo eliminar la cuenta. Inténtalo de nuevo." });
            setIsSubmitting(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    if (!user) {
        return (
            <section className="page-card">
                <p className="empty-state">Cargando tu perfil...</p>
            </section>
        )
    }

    return (
        <section className="page-card">
            {feedback.message && (
                <div className={`alert ${feedback.type === "error" ? "alert-error" : "alert-success"}`}>
                    {feedback.message}
                </div>
            )}

            {isEditing ? (
                <form className="form" onSubmit={handleSubmit}>
                    <h2>Editar perfil</h2>
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
                    <div className="user-profile-header">
                        <div className="user-avatar-large">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="user-profile-info">
                            <h2>{user.name}</h2>
                            <p className="user-email-profile">{user.email}</p>
                        </div>
                    </div>

                    <div className="user-stats">
                        <div className="stat-item">
                            <span className="stat-number">{posts.length}</span>
                            <span className="stat-label">Posts</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-number">{followersCount}</span>
                            <span className="stat-label">Seguidores</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-number">{followingCount}</span>
                            <span className="stat-label">Siguiendo</span>
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

                    <div className="user-posts-section">
                        <h3>Mis publicaciones</h3>
                        {loadingPosts ? (
                            <p className="empty-state">Cargando publicaciones...</p>
                        ) : posts.length === 0 ? (
                            <p className="empty-state">Aún no has publicado nada</p>
                        ) : (
                            <div className="posts-list">
                                {posts.map((post) => (
                                    <article key={post.id} className="post-item">
                                        <p>{post.content}</p>
                                        {post.image && (
                                            <div className="post-image-wrap">
                                                <img
                                                    className="post-image"
                                                    src={post.image}
                                                    alt="Imagen del post"
                                                />
                                            </div>
                                        )}
                                        <div className="post-meta">
                                            <span className="label">
                                                {formatDate(post.created_at)}
                                            </span>
                                            <div className="post-actions">
                                                <span className="comment-count">
                                                    <span className="comment-count-icon">💬</span>
                                                    <span className="comment-count-number">
                                                        {post.comments_count || 0}
                                                    </span>
                                                </span>
                                                <span className="like-button">
                                                    <span className="like-icon">❤️</span>
                                                    <span className="like-count">
                                                        {post.likes_count || 0}
                                                    </span>
                                                </span>
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}
        </section>
    )
}

export default Profile