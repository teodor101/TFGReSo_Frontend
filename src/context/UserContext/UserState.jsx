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

  const getProfile = async () => {
    const currentToken = state.token || localStorage.getItem("token");
    
    if (!currentToken) {
      // Si no hay token, limpiar el estado
      const action = {
        type: "LOGOUT",
        payload: null,
      };
      dispatch(action);
      return;
    }

    try {
      const res = await axios.get(API_URL + "/profile", {
        headers: {
          Authorization: "Bearer " + currentToken
        },
      });
      const action = {
        type: "PROFILE",
        payload: res.data
      };
      dispatch(action);
      if (res.data) {
        localStorage.setItem("user", JSON.stringify(res.data.user));
      }
    } catch (error) {
      // Si el error es 401 (no autorizado), limpiar el estado y desloguear
      if (error.response?.status === 401) {
        localStorage.clear();
        const action = {
          type: "LOGOUT",
          payload: null,
        };
        dispatch(action);
      }
      throw error;
    }
  }

  const deleteAccount = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.delete(API_URL + "/profile", {
        headers: {
          Authorization: "Bearer " + token
        }
      });
      
      // Limpiar localStorage primero
      localStorage.clear();
      
      // Despachar acción LOGOUT para actualizar el estado
      const action = {
        type: "LOGOUT",
        payload: res.data,
      };
      dispatch(action);
      
      return res.data;
    } catch (error) {
      // Aunque haya error, limpiar el estado local si la cuenta fue eliminada
      localStorage.clear();
      const action = {
        type: "LOGOUT",
        payload: null,
      };
      dispatch(action);
      throw error;
    }
  }

  return (
    <UserContext.Provider
      value={{
        token: state.token,
        user: state.user,
        login,
        logout,
        getProfile,
        deleteAccount
      }}
    >
      {children}
    </UserContext.Provider>
  );
};