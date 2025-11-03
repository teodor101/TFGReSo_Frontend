import { createContext, useReducer } from "react";
import axios from "axios";
import UserReducer from "./UserReducer";

const token = localStorage.getItem("token") || "";
const user = JSON.parse(localStorage.getItem("user")) || null;

const initialState = {
  token: token,
  user: user,
};

const API_URL = "http://localhost:8000/api";

export const UserContext = createContext(initialState);

export const UserProvider = ({ children }) => {
  const [state, dispatch] = useReducer(UserReducer, initialState);

  const login = async (user) => {
    const res = await axios.post(API_URL + "/login", user);
    const action = {
      type: "LOGIN",
      payload: res.data,
    };
    dispatch(action);
    if (res.data) {
      localStorage.setItem("token",res.data.token);
      localStorage.setItem("user",JSON.stringify(res.data.user));
    }
  }

  const logout = async () => {
    const token = localStorage.getItem("token");
    const res = await axios.delete(API_URL + "/logout", {
      headers:{
        Authorization:"Bearer "+token
      }
    });
    const action = {
      type: "LOGOUT",
      payload: res.data,
    };
    dispatch(action);
    if (res.data) {
      localStorage.clear();
    }
  }


  return (
    <UserContext.Provider
      value={{
        token: state.token,
        user: state.user,
        login,
        logout
      }}
    >
      {children}
    </UserContext.Provider>
  );
};