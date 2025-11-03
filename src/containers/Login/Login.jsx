import React, { useState, useContext } from 'react'
import { UserContext } from '../../context/UserContext/UserState';
import { useNavigate } from 'react-router-dom';


const Login = () => {

    const { login } = useContext(UserContext);
    const navigate = useNavigate();
    const initialState = {
    
        email: "",
        password: "",
        
    }

    const [formData, setFormData] = useState(initialState);

    const handleInputChange = (e) => {
        console.log(e.target.value)
        console.log(e.target.name)
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const clearState = () => {
        setFormData({ ...initialState });
    };

    const handleSubmit = async(event) => {
        event.preventDefault();
        login(formData)
        navigate("/profile");
        clearState();
    };

  return <div><form onSubmit={handleSubmit}>
        <input
            type="email"
            placeholder="email"
            value={formData.email}
            onChange={handleInputChange}
            name="email"
        />
        <input
            type="password"
            placeholder="password"
            value={formData.password}
            onChange={handleInputChange}
            name="password"
        />
        <input type="submit" value="send" />

    </form></div>

}

export default Login