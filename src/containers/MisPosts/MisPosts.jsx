import { useContext, useEffect, useState } from 'react'
import axios from 'axios'
import { UserContext } from '../../context/UserContext/UserState';


const MisPosts = () => {

    const { token } = useContext(UserContext);
    const [posts, setPosts] = useState([]);


    const getUserPost = async ()=> {
        const res = await axios.get("http://localhost:8000/api/getPosts", {
              headers: {
                  Authorization: "Bearer " + token
              },
          });
          setPosts(res.data.user);
          console.log(res.data.user);
    }

    useEffect(() => {
          getUserPost();
        }, []);

  return (
    <div>MisPosts
        {posts.map(post => {
            return <div>
                <p>{post.content}</p>
                </div>
        })}
    </div>
  )
}

export default MisPosts