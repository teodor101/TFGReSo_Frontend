import React, { useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { UserContext } from '../../context/UserContext/UserState';

const API_URL = "https://tfgreso-backend.onrender.com/api";

const Home = () => {
  const { token, user } = useContext(UserContext);
  const [posts, setPosts] = useState([]);
  const [editingPostId, setEditingPostId] = useState(null);
  const [editingContent, setEditingContent] = useState("");
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  const getAllPosts = async () => {
    try {
      const res = token
        ? await axios.get(`${API_URL}/posts/feed`, {
            headers: { Authorization: "Bearer " + token }
          })
        : await axios.get(`${API_URL}/posts`);
      setPosts(res.data.posts);
    } catch (error) {
      console.error("Error al obtener los posts:", error);
      setFeedback({ type: "error", message: "No se pudieron cargar los posts." });
    }
  };

  const toggleLike = async (postId) => {
    if (!token) {
      setFeedback({ type: "error", message: "Inicia sesión para dar like." });
      return;
    }

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
    if (!editingPostId || !token) return;

    try {
      await axios.put(`https://tfgreso-backend.onrender.com/api/posts/${editingPostId}`, {
        content: editingContent
      }, {
        headers: {
          Authorization: "Bearer " + token
        }
      });
      setFeedback({ type: "success", message: "Post actualizado correctamente." });
      cancelEdit();
      getAllPosts();
    } catch (error) {
      console.error("Error al actualizar el post:", error);
      setFeedback({ type: "error", message: "No se pudo actualizar el post." });
    }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar este post? Esta acción no se puede deshacer.")) {
      return;
    }

    if (!token) return;

    try {
      await axios.delete(`https://tfgreso-backend.onrender.com/api/deletePosts/${postId}`, {
        headers: {
          Authorization: "Bearer " + token
        }
      });
      setFeedback({ type: "success", message: "Post eliminado correctamente." });
      getAllPosts();
    } catch (error) {
      console.error("Error al eliminar el post:", error);
      setFeedback({ type: "error", message: "No se pudo eliminar el post." });
    }
  };

  const isOwner = (post) => {
    if (!token || !user) return false;
    // Comparar tanto user_id como user.id por si acaso
    return post.user_id === user.id || (post.user && post.user.id === user.id);
  };

  useEffect(() => {
    getAllPosts();
  }, [token]);

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
        }
      </div>

      {feedback.message && (
        <div className={`alert ${feedback.type === "error" ? "alert-error" : "alert-success"}`}>
          {feedback.message}
        </div>
      )}

      <div className="posts-list" style={{ marginTop: "2rem" }}>
        <h2 style={{ marginBottom: "1rem" }}>Todas las publicaciones</h2>
        {posts.length === 0 ? (
          <p className="empty-state">No hay publicaciones todavía.</p>
        ) : (
          posts.map((post) => (
            <article key={post.id} className="post-item">
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
                    <div>
                      <span className="label">Por: {post.user?.name || 'Usuario desconocido'}</span>
                    </div>
                    <div className="post-actions">
                      <button
                        type="button"
                        className={`like-button ${post.liked ? "is-liked" : ""}`}
                        onClick={() => toggleLike(post.id)}
                        disabled={!token}
                        aria-pressed={!!post.liked}
                        aria-label={post.liked ? "Quitar like" : "Dar like"}
                        title={!token ? "Inicia sesión para dar like" : (post.liked ? "Quitar like" : "Dar like")}
                      >
                        <span className="like-icon">{post.liked ? "❤" : "♡"}</span>
                        <span className="like-count">{post.likes_count ?? 0}</span>
                      </button>

                      {isOwner(post) && (
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
                      )}
                    </div>
                  </div>
                </>
              )}
            </article>
          ))
        )}
      </div>
    </section>
  )
}

export default Home