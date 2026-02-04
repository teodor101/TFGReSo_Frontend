import { useState, useEffect, useContext } from 'react'
import axios from 'axios'
import { useParams, useNavigate } from 'react-router-dom'
import { UserContext } from '../../context/UserContext/UserState'

const UserProfile = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const { user: currentUser, token } = useContext(UserContext)
    const [profileUser, setProfileUser] = useState(null)
    const [posts, setPosts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [isFollowing, setIsFollowing] = useState(false)
    const [followersCount, setFollowersCount] = useState(0)
    const [followLoading, setFollowLoading] = useState(false)

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                setLoading(true)
                setError(null)

                const config = token ? {
                    headers: { Authorization: `Bearer ${token}` }
                } : {}

                const response = await axios.get(
                    `https://tfgreso-backend.onrender.com/api/users/${id}`,
                    config
                )
                setProfileUser(response.data.user)
                setPosts(response.data.posts)
                setIsFollowing(response.data.user.is_following || false)
                setFollowersCount(response.data.user.followers_count || 0)
            } catch (err) {
                console.error('Error al cargar perfil:', err)
                setError('No se pudo cargar el perfil del usuario')
            } finally {
                setLoading(false)
            }
        }

        // Si el usuario está viendo su propio perfil, redirigir a /profile
        if (currentUser && currentUser.id === parseInt(id)) {
            navigate('/profile')
            return
        }

        fetchUserProfile()
    }, [id, currentUser, navigate, token])

    const handleToggleFollow = async () => {
        if (!token) {
            navigate('/login')
            return
        }

        try {
            setFollowLoading(true)
            const response = await axios.post(
                `https://tfgreso-backend.onrender.com/api/users/${id}/follow`,
                {},
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            )
            setIsFollowing(response.data.is_following)
            setFollowersCount(response.data.followers_count)
        } catch (err) {
            console.error('Error al seguir/dejar de seguir:', err)
        } finally {
            setFollowLoading(false)
        }
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        })
    }

    if (loading) {
        return (
            <section className="page-card">
                <p className="empty-state">Cargando perfil...</p>
            </section>
        )
    }

    if (error) {
        return (
            <section className="page-card">
                <div className="alert alert-error">{error}</div>
                <button className="btn btn-secondary" onClick={() => navigate('/search')}>
                    Volver a buscar
                </button>
            </section>
        )
    }

    if (!profileUser) {
        return (
            <section className="page-card">
                <p className="empty-state">Usuario no encontrado</p>
            </section>
        )
    }

    return (
        <section className="page-card">
            <div className="user-profile-header">
                <div className="user-avatar-large" style={{
                    backgroundImage: profileUser.image_url ? `url(${profileUser.image_url})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    overflow: 'hidden'
                }}>
                    {!profileUser.image_url && profileUser.name.charAt(0).toUpperCase()}
                </div>
                <div className="user-profile-info">
                    <h2>{profileUser.name}</h2>
                    <p className="user-email-profile">{profileUser.email}</p>
                    {token && (
                        <button
                            className={`btn ${isFollowing ? 'btn-secondary' : 'btn-primary'} follow-btn`}
                            onClick={handleToggleFollow}
                            disabled={followLoading}
                        >
                            {followLoading
                                ? 'Cargando...'
                                : isFollowing
                                    ? 'Dejar de seguir'
                                    : 'Seguir'}
                        </button>
                    )}
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
                    <span className="stat-number">{profileUser.following_count || 0}</span>
                    <span className="stat-label">Siguiendo</span>
                </div>
            </div>

            <div className="user-posts-section">
                <h3>Publicaciones</h3>
                {posts.length === 0 ? (
                    <p className="empty-state">Este usuario aún no ha publicado nada</p>
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
        </section>
    )
}

export default UserProfile
