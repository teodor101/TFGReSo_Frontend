import React, { useState, useEffect } from 'react'
import axios from 'axios'

const Profile = () => {
    const token = localStorage.getItem("token");
    const [user, setUser] = useState(null);

    const getProfile = async () => {
        const res = await axios.get("http://localhost:8000/api/profile", {
            headers: {
                Authorization: "Bearer " + token
            }
        })
        setUser(res.data.user);
    };
    useEffect(() => {
      getProfile();
    }, [])
    if(!user){

        return "Cargando..."

    }
    return (
        <div>Profile
            <p>{user.name}</p>
            <p>{user.email}</p>
        </div>
    )
}

export default Profile