import React, { useState } from "react";
import axios from "axios"

const Register = () => {

    const initialState = {
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
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
        console.log("sending data..." + formData.name + " " + formData.email);
        await axios.post("http://localhost:8000/api/register", formData)
        clearState();
    };

    return <div><form onSubmit={handleSubmit}>
        <input
            type="text"
            placeholder="name"
            value={formData.name}
            onChange={handleInputChange}
            name="name"
        />
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
        <input
            type="password"
            placeholder="password_confirmation"
            value={formData.password_confirmation}
            onChange={handleInputChange}
            name="password_confirmation"
        />
        <input type="submit" value="send" />

    </form></div>;
};



export default Register