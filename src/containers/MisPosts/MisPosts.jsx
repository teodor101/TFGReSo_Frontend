import { useContext, useEffect, useState } from 'react'
import axios from 'axios'
import { UserContext } from '../../context/UserContext/UserState';

const API_URL = "https://tfgreso-backend.onrender.com/api";

const MisPosts = () => {

    const { token } = useContext(UserContext);
    const [posts, setPosts] = useState([]);
    const [expandedPosts, setExpandedPosts] = useState(() => new Set());
    const [commentsByPost, setCommentsByPost] = useState({});
    const [commentInputs, setCommentInputs] = useState({});
    const [formData, setFormData] = useState({
        content: ""
    });
    const [editingPostId, setEditingPostId] = useState(null);
    const [editingContent, setEditingContent] = useState("");
    const [feedback, setFeedback] = useState({ type: "", message: "" });


    const getUserPost = async ()=> {
        const res = await axios.get(`${API_URL}/getPosts`, {
              headers: {
                  Authorization: "Bearer " + token
              },
          });
          setPosts(res.data.user);
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
        try {
            await axios.post(`${API_URL}/createpost`, {
                content: formData.content
            }, {
                headers: {
                    Authorization: "Bearer " + token
                }
            });
            // Limpiar el formulario y refrescar los posts
            setFormData({ content: "" });
            setFeedback({ type: "success", message: "Post creado correctamente." });
            getUserPost();
        } catch (error) {
            console.error("Error al crear el post:", error);
            setFeedback({ type: "error", message: "No se pudo crear el post." });
        }
    }

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
                    className="form-input form-textarea"
                    placeholder="Escribe tu post..."
                    value={formData.content}
                    onChange={handleInputChange}
                    name="content"
                    rows="4"
                />
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
                                <p>{post.content}</p>
                                <div className="post-meta">
                                    <span className="label">#{index + 1}</span>
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
                                                <button
                                                    type="button"
                                                    className="btn btn-secondary"
                                                    onClick={() => loadComments(post.id)}
                                                >
                                                    Recargar
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