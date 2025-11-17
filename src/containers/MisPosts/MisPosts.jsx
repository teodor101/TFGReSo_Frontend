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
    <div>
        <h2>MisPosts</h2>
        
        <form onSubmit={handleSubmit}>
            <textarea
                placeholder="Escribe tu post..."
                value={formData.content}
                onChange={handleInputChange}
                name="content"
                rows="4"
                style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
            />
            <button type="submit" style={{ padding: "8px 16px" }}>Crear Post</button>
        </form>

        <div style={{ marginTop: "20px" }}>
            {posts.map((post, index) => {
                return <div key={index} style={{ marginBottom: "10px", padding: "10px", border: "1px solid #ccc" }}>
                    <p>{post.content}</p>
                </div>
            })}
        </div>
    </div>
  )
}

export default MisPosts