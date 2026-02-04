import { useContext, useEffect, useState } from 'react'
import axios from 'axios'
import { UserContext } from '../../context/UserContext/UserState';

const API_URL = "https://tfgreso-backend.onrender.com/api";

// Función para formatear fecha relativa
const formatRelativeDate = (dateString) => {
    if (!dateString) return '';

    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return 'Ahora mismo';
    if (diffMins < 60) return diffMins === 1 ? 'Hace 1 minuto' : `Hace ${diffMins} minutos`;
    if (diffHours < 24) return diffHours === 1 ? 'Hace 1 hora' : `Hace ${diffHours} horas`;
    if (diffDays === 1) return 'Ayer';

    const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
        'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    const currentYear = now.getFullYear();

    return year === currentYear ? `El ${day} de ${month}` : `El ${day} de ${month} de ${year}`;
};

const MisPosts = () => {

    const { token, user } = useContext(UserContext);
    const [posts, setPosts] = useState([]);
    const [expandedPosts, setExpandedPosts] = useState(() => new Set());
    const [commentsByPost, setCommentsByPost] = useState({});
    const [commentInputs, setCommentInputs] = useState({});
    const [formData, setFormData] = useState({
        content: ""
    });
    const [imageFile, setImageFile] = useState(null);
    const [editingPostId, setEditingPostId] = useState(null);
    const [editingContent, setEditingContent] = useState("");
    const [feedback, setFeedback] = useState({ type: "", message: "" });
    const [isDragging, setIsDragging] = useState(false);
    const [contentError, setContentError] = useState("");


    const getUserPost = async () => {
        const res = await axios.get(`${API_URL}/getPosts`, {
            headers: {
                Authorization: "Bearer " + token
            },
        });
        // Ordenar por likes (más likes primero)
        const sortedPosts = (res.data.user || []).sort((a, b) =>
            (b.likes_count || 0) - (a.likes_count || 0)
        );
        setPosts(sortedPosts);
    }

    const toggleLike = async (postId) => {
        if (!token) return;

        const prevPosts = posts;
        setPosts((current) =>
            current.map((p) => {
                if (p.id !== postId) return p;
                const wasLiked = !!p.liked;
                const nextLiked = !wasLiked;
                const currentCount = Number.isFinite(p.likes_count) ? p.likes_count : 0;
                const nextCount = Math.max(0, currentCount + (nextLiked ? 1 : -1));
                return { ...p, liked: nextLiked, likes_count: nextCount };
            })
        );

        try {
            const res = await axios.post(`${API_URL}/posts/${postId}/like`, null, {
                headers: { Authorization: "Bearer " + token }
            });

            setPosts((current) =>
                current.map((p) =>
                    p.id === postId
                        ? { ...p, liked: res.data.liked, likes_count: res.data.likes_count }
                        : p
                )
            );
        } catch (error) {
            console.error("Error al dar/quitar like:", error);
            setPosts(prevPosts);
            setFeedback({ type: "error", message: "No se pudo actualizar el like." });
        }
    };

    const loadComments = async (postId) => {
        try {
            setCommentsByPost((prev) => ({
                ...prev,
                [postId]: { ...(prev[postId] || {}), loading: true, error: "" }
            }));

            const res = await axios.get(`${API_URL}/posts/${postId}/comments`, {
                headers: token ? { Authorization: "Bearer " + token } : undefined
            });

            setCommentsByPost((prev) => ({
                ...prev,
                [postId]: { items: res.data.comments || [], loading: false, error: "" }
            }));
        } catch (error) {
            console.error("Error al obtener comentarios:", error);
            setCommentsByPost((prev) => ({
                ...prev,
                [postId]: { items: prev[postId]?.items || [], loading: false, error: "No se pudieron cargar los comentarios." }
            }));
        }
    };

    const toggleComments = async (postId) => {
        setExpandedPosts((prev) => {
            const next = new Set(prev);
            if (next.has(postId)) next.delete(postId);
            else next.add(postId);
            return next;
        });

        if (!commentsByPost[postId]?.items) {
            await loadComments(postId);
        }
    };

    const submitComment = async (postId) => {
        if (!token) {
            setFeedback({ type: "error", message: "Inicia sesión para comentar." });
            return;
        }

        const text = (commentInputs[postId] || "").trim();
        if (!text) return;

        try {
            const res = await axios.post(`${API_URL}/posts/${postId}/comments`, { comment: text }, {
                headers: { Authorization: "Bearer " + token }
            });

            setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
            setPosts((current) =>
                current.map((p) =>
                    p.id === postId
                        ? { ...p, comments_count: (Number.isFinite(p.comments_count) ? p.comments_count : 0) + 1 }
                        : p
                )
            );
            setCommentsByPost((prev) => {
                const currentItems = prev[postId]?.items || [];
                return {
                    ...prev,
                    [postId]: { items: [...currentItems, res.data.comment], loading: false, error: "" }
                };
            });
        } catch (error) {
            console.error("Error al crear comentario:", error);
            setFeedback({ type: "error", message: "No se pudo crear el comentario." });
        }
    };

    const deleteComment = async (postId, commentId) => {
        if (!token) return;
        if (!window.confirm("¿Eliminar este comentario?")) return;

        const prevItems = commentsByPost[postId]?.items || [];

        setCommentsByPost((state) => ({
            ...state,
            [postId]: {
                ...state[postId],
                items: (state[postId]?.items || []).filter((c) => c.id !== commentId)
            }
        }));

        setPosts((current) =>
            current.map((p) =>
                p.id === postId
                    ? { ...p, comments_count: Math.max(0, (Number.isFinite(p.comments_count) ? p.comments_count : 0) - 1) }
                    : p
            )
        );

        try {
            await axios.delete(`${API_URL}/comments/${commentId}`, {
                headers: { Authorization: "Bearer " + token }
            });
        } catch (error) {
            console.error("Error al eliminar comentario:", error);
            setCommentsByPost((state) => ({
                ...state,
                [postId]: { ...state[postId], items: prevItems }
            }));
            setPosts((current) =>
                current.map((p) =>
                    p.id === postId
                        ? { ...p, comments_count: (Number.isFinite(p.comments_count) ? p.comments_count : 0) + 1 }
                        : p
                )
            );
            setFeedback({ type: "error", message: "No se pudo eliminar el comentario." });
        }
    };

    const toggleCommentLike = async (postId, commentId) => {
        if (!token) return;

        const prev = commentsByPost[postId]?.items || [];

        setCommentsByPost((state) => {
            const items = state[postId]?.items || [];
            return {
                ...state,
                [postId]: {
                    ...state[postId],
                    items: items.map((c) => {
                        if (c.id !== commentId) return c;
                        const wasLiked = !!c.liked;
                        const nextLiked = !wasLiked;
                        const currentCount = Number.isFinite(c.likes_count) ? c.likes_count : 0;
                        const nextCount = Math.max(0, currentCount + (nextLiked ? 1 : -1));
                        return { ...c, liked: nextLiked, likes_count: nextCount };
                    })
                }
            };
        });

        try {
            const res = await axios.post(`${API_URL}/comments/${commentId}/like`, null, {
                headers: { Authorization: "Bearer " + token }
            });

            setCommentsByPost((state) => {
                const items = state[postId]?.items || [];
                return {
                    ...state,
                    [postId]: {
                        ...state[postId],
                        items: items.map((c) =>
                            c.id === commentId
                                ? { ...c, liked: res.data.liked, likes_count: res.data.likes_count }
                                : c
                        )
                    }
                };
            });
        } catch (error) {
            console.error("Error al dar/quitar like en comentario:", error);
            setCommentsByPost((state) => ({
                ...state,
                [postId]: { ...state[postId], items: prev }
            }));
            setFeedback({ type: "error", message: "No se pudo actualizar el like del comentario." });
        }
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validación del contenido
        if (!formData.content.trim()) {
            setContentError("Debes escribir algo en tu post antes de publicar.");
            return;
        }
        setContentError("");

        try {
            const data = new FormData();
            data.append("content", formData.content);
            if (imageFile) {
                data.append("image", imageFile);
            }
            await axios.post(`${API_URL}/createpost`, data, {
                headers: {
                    Authorization: "Bearer " + token
                }
            });
            setFormData({ content: "" });
            setImageFile(null);
            setFeedback({ type: "success", message: "Post creado correctamente." });
            getUserPost();
        } catch (error) {
            console.error("Error al crear el post:", error);
            setFeedback({ type: "error", message: error.response?.data?.message || "No se pudo crear el post." });
        }
    }

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            const file = files[0];
            const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
            if (validTypes.includes(file.type)) {
                setImageFile(file);
            } else {
                setFeedback({ type: "error", message: "Formato de imagen no válido. Usa: JPEG, PNG, JPG, GIF o WEBP." });
            }
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0] || null;
        setImageFile(file);
    };

    const removeImage = () => {
        setImageFile(null);
    };

    const startEdit = (post) => {
        setEditingPostId(post.id);
        setEditingContent(post.content);
        setFeedback({ type: "", message: "" });
    };

    const cancelEdit = () => {
        setEditingPostId(null);
        setEditingContent("");
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (!editingPostId) return;

        try {
            await axios.put(`${API_URL}/posts/${editingPostId}`, {
                content: editingContent
            }, {
                headers: {
                    Authorization: "Bearer " + token
                }
            });
            setFeedback({ type: "success", message: "Post actualizado correctamente." });
            cancelEdit();
            getUserPost();
        } catch (error) {
            console.error("Error al actualizar el post:", error);
            setFeedback({ type: "error", message: "No se pudo actualizar el post." });
        }
    };

    const handleDelete = async (postId) => {
        if (!window.confirm("¿Estás seguro de que quieres eliminar este post? Esta acción no se puede deshacer.")) {
            return;
        }

        try {
            await axios.delete(`${API_URL}/deletePosts/${postId}`, {
                headers: {
                    Authorization: "Bearer " + token
                }
            });
            setFeedback({ type: "success", message: "Post eliminado correctamente." });
            getUserPost();
        } catch (error) {
            console.error("Error al eliminar el post:", error);
            setFeedback({ type: "error", message: "No se pudo eliminar el post." });
        }
    };

    useEffect(() => {
        if (token) {
            getUserPost();
        }
    }, [token]);

    return (
        <section className="page-card">
            <h2>Mis publicaciones</h2>
            <p>Comparte lo que estás pensando y revisa tus posts más recientes.</p>

            {feedback.message && (
                <div className={`alert ${feedback.type === "error" ? "alert-error" : "alert-success"}`}>
                    {feedback.message}
                </div>
            )}

            <form className="form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label className="form-label" htmlFor="content">Nuevo post</label>
                    <textarea
                        id="content"
                        className={`form-input form-textarea ${contentError ? 'input-error' : ''}`}
                        placeholder="Escribe tu post..."
                        value={formData.content}
                        onChange={(e) => {
                            handleInputChange(e);
                            if (contentError) setContentError("");
                        }}
                        name="content"
                        rows="4"
                    />
                    {contentError && (
                        <span className="field-error">{contentError}</span>
                    )}
                </div>
                <div className="form-group">
                    <label className="form-label">Imagen (opcional)</label>
                    <div
                        className={`image-dropzone ${isDragging ? 'is-dragging' : ''} ${imageFile ? 'has-file' : ''}`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        {imageFile ? (
                            <div className="dropzone-preview">
                                <img
                                    src={URL.createObjectURL(imageFile)}
                                    alt="Vista previa"
                                    className="preview-image"
                                />
                                <div className="preview-info">
                                    <span className="preview-name">{imageFile.name}</span>
                                    <button
                                        type="button"
                                        className="btn-remove-image"
                                        onClick={removeImage}
                                        aria-label="Eliminar imagen"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="dropzone-content">
                                <span className="dropzone-icon">📷</span>
                                <span className="dropzone-text">
                                    Arrastra una imagen aquí o{' '}
                                    <label htmlFor="post-image" className="dropzone-link">
                                        selecciona un archivo
                                    </label>
                                </span>
                                <span className="dropzone-hint">JPEG, PNG, GIF o WEBP (máx. 5MB)</span>
                            </div>
                        )}
                        <input
                            id="post-image"
                            type="file"
                            accept="image/jpeg,image/png,image/jpg,image/gif,image/webp"
                            onChange={handleFileSelect}
                            className="dropzone-input"
                        />
                    </div>
                </div>
                <button className="btn btn-primary" type="submit">Publicar</button>
            </form>

            <div className="posts-list">
                {posts.length === 0 ? (
                    <p className="empty-state">Todavía no has publicado nada.</p>
                ) : (
                    posts.map((post, index) => (
                        <article key={post.id ?? index} className="post-item">
                            {editingPostId === post.id ? (
                                <form className="form" onSubmit={handleUpdate}>
                                    <div className="form-group">
                                        <label className="form-label" htmlFor={`edit-${post.id}`}>Editar contenido</label>
                                        <textarea
                                            id={`edit-${post.id}`}
                                            className="form-input form-textarea"
                                            value={editingContent}
                                            onChange={(e) => setEditingContent(e.target.value)}
                                            rows="3"
                                        />
                                    </div>
                                    <div className="cta-group">
                                        <button className="btn btn-primary" type="submit">Guardar cambios</button>
                                        <button type="button" className="btn btn-secondary" onClick={cancelEdit}>Cancelar</button>
                                    </div>
                                </form>
                            ) : (
                                <>
                                    <div className="post-header-user">
                                        <div
                                            className="post-user-avatar"
                                            style={{
                                                backgroundImage: user?.image_url ? `url(${user.image_url})` : undefined,
                                            }}
                                        >
                                            {!user?.image_url && (user?.name?.charAt(0).toUpperCase() || '?')}
                                        </div>
                                        <div className="post-user-info">
                                            <span className="post-user-name">{user?.name || 'Usuario'}</span>
                                            {post.created_at && (
                                                <span className="post-user-date">{formatRelativeDate(post.created_at)}</span>
                                            )}
                                        </div>
                                    </div>

                                    <p>{post.content}</p>
                                    {(post.image_url || post.image_path) && (
                                        <div className="post-image-wrap">
                                            <img
                                                src={post.image_url || `${API_URL.replace(/\/api\/?$/, '')}/storage/${post.image_path}`}
                                                alt=""
                                                className="post-image"
                                            />
                                        </div>
                                    )}
                                    <div className="post-meta" style={{ marginTop: '0.25rem' }}>
                                        <div className="post-actions">
                                            <button
                                                type="button"
                                                className={`like-button ${post.liked ? "is-liked" : ""}`}
                                                onClick={() => toggleLike(post.id)}
                                                disabled={!token}
                                                aria-pressed={!!post.liked}
                                                aria-label={post.liked ? "Quitar like" : "Dar like"}
                                                title={post.liked ? "Quitar like" : "Dar like"}
                                            >
                                                <span className="like-icon">{post.liked ? "❤" : "♡"}</span>
                                                <span className="like-count">{post.likes_count ?? 0}</span>
                                            </button>

                                            <span className="comment-count" title="Comentarios">
                                                <span className="comment-count-icon">💬</span>
                                                <span className="comment-count-number">{post.comments_count ?? 0}</span>
                                            </span>

                                            <div className="cta-group" style={{ marginTop: 0 }}>
                                                <button
                                                    type="button"
                                                    className="btn btn-secondary"
                                                    onClick={() => startEdit(post)}
                                                >
                                                    Editar
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-danger"
                                                    onClick={() => handleDelete(post.id)}
                                                >
                                                    Eliminar
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="cta-group" style={{ marginTop: "0.75rem" }}>
                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            onClick={() => toggleComments(post.id)}
                                        >
                                            {expandedPosts.has(post.id) ? "Ocultar comentarios" : "Ver comentarios"}
                                        </button>
                                    </div>

                                    {expandedPosts.has(post.id) && (
                                        <div className="comments">
                                            <div className="comment-form">
                                                <label className="form-label" htmlFor={`comment-${post.id}`}>Añadir comentario</label>
                                                <textarea
                                                    id={`comment-${post.id}`}
                                                    className="form-input form-textarea"
                                                    placeholder={token ? "Escribe un comentario..." : "Inicia sesión para comentar"}
                                                    value={commentInputs[post.id] || ""}
                                                    onChange={(e) => setCommentInputs((prev) => ({ ...prev, [post.id]: e.target.value }))}
                                                    disabled={!token}
                                                    rows="3"
                                                />
                                                <div className="comment-actions">
                                                    <button
                                                        type="button"
                                                        className="btn btn-primary"
                                                        onClick={() => submitComment(post.id)}
                                                        disabled={!token}
                                                    >
                                                        Comentar
                                                    </button>
                                                </div>
                                            </div>

                                            {commentsByPost[post.id]?.loading ? (
                                                <p className="empty-state">Cargando comentarios...</p>
                                            ) : commentsByPost[post.id]?.error ? (
                                                <p className="empty-state">{commentsByPost[post.id]?.error}</p>
                                            ) : (
                                                <div className="comment-list">
                                                    {(commentsByPost[post.id]?.items || []).length === 0 ? (
                                                        <p className="empty-state">Todavía no hay comentarios.</p>
                                                    ) : (
                                                        (commentsByPost[post.id]?.items || []).map((c) => (
                                                            <div key={c.id} className="comment-item">
                                                                <div>{c.comment}</div>
                                                                <div className="comment-meta">
                                                                    <span className="comment-author">
                                                                        {c.user?.name ? `Por: ${c.user.name}` : "Usuario"}
                                                                    </span>
                                                                    <div className="post-actions">
                                                                        <button
                                                                            type="button"
                                                                            className={`like-button ${c.liked ? "is-liked" : ""}`}
                                                                            onClick={() => toggleCommentLike(post.id, c.id)}
                                                                            disabled={!token}
                                                                            aria-pressed={!!c.liked}
                                                                            aria-label={c.liked ? "Quitar like del comentario" : "Dar like al comentario"}
                                                                            title={!token ? "Inicia sesión para dar like" : (c.liked ? "Quitar like" : "Dar like")}
                                                                        >
                                                                            <span className="like-icon">{c.liked ? "❤" : "♡"}</span>
                                                                            <span className="like-count">{c.likes_count ?? 0}</span>
                                                                        </button>

                                                                        {token && user && (c.user_id === user.id || c.user?.id === user.id) && (
                                                                            <button
                                                                                type="button"
                                                                                className="btn btn-danger"
                                                                                onClick={() => deleteComment(post.id, c.id)}
                                                                                style={{ padding: "0.55rem 0.85rem" }}
                                                                            >
                                                                                Eliminar
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </>
                            )}
                        </article>
                    ))
                )}
            </div>
        </section>
    )
}

export default MisPosts