import { useContext, useEffect, useState } from 'react'
import axios from 'axios'
import { UserContext } from '../../context/UserContext/UserState';


const MisPosts = () => {

    const { token } = useContext(UserContext);
    const [posts, setPosts] = useState([]);
    const [formData, setFormData] = useState({
        content: ""
    });


    const getUserPost = async ()=> {
        const res = await axios.get("http://localhost:8000/api/getPosts", {
              headers: {
                  Authorization: "Bearer " + token
              },
          });
          setPosts(res.data.user);
          console.log(res.data.user);
    }

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post("http://localhost:8000/api/createpost", {
                content: formData.content
            }, {
                headers: {
                    Authorization: "Bearer " + token
                }
            });
            // Limpiar el formulario y refrescar los posts
            setFormData({ content: "" });
            getUserPost();
        } catch (error) {
            console.error("Error al crear el post:", error);
        }
    }

    useEffect(() => {
          getUserPost();
        }, []);

  return (
    <section className="page-card">
        <h2>Mis publicaciones</h2>
        <p>Comparte lo que estás pensando y revisa tus posts más recientes.</p>
        
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
                    <article key={index} className="post-item">
                        <p>{post.content}</p>
                        <span className="label">#{index + 1}</span>
                    </article>
                ))
            )}
        </div>
    </section>
  )
}

export default MisPosts