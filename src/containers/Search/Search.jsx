import { useState, useEffect, useContext } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { UserContext } from '../../context/UserContext/UserState'

const Search = () => {
    const [query, setQuery] = useState('')
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(false)
    const [searched, setSearched] = useState(false)
    const { user: currentUser } = useContext(UserContext)
    const navigate = useNavigate()

    useEffect(() => {
        const searchUsers = async () => {
            if (query.length < 2) {
                setUsers([])
                setSearched(false)
                return
            }

            try {
                setLoading(true)
                const response = await axios.get(
                    `https://tfgreso-backend.onrender.com/api/users/search?q=${encodeURIComponent(query)}`
                )
                setUsers(response.data.users)
                setSearched(true)
            } catch (error) {
                console.error('Error al buscar usuarios:', error)
                setUsers([])
            } finally {
                setLoading(false)
            }
        }

        const debounceTimer = setTimeout(searchUsers, 300)
        return () => clearTimeout(debounceTimer)
    }, [query])

    const handleUserClick = (userId) => {
        navigate(`/user/${userId}`)
    }

    return (
        <section className="page-card">
            <h2>Buscar usuarios</h2>
            <p>Encuentra personas en la red social</p>

            <div className="form">
                <div className="form-group">
                    <label className="form-label" htmlFor="search">
                        Buscar por nombre o email
                    </label>
                    <input
                        id="search"
                        className="form-input"
                        type="text"
                        placeholder="Escribe al menos 2 caracteres..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                </div>
            </div>

            {loading && (
                <p className="empty-state" style={{ marginTop: '1.5rem' }}>
                    Buscando...
                </p>
            )}

            {!loading && searched && users.length === 0 && (
                <p className="empty-state" style={{ marginTop: '1.5rem' }}>
                    No se encontraron usuarios con "{query}"
                </p>
            )}

            {!loading && users.length > 0 && (
                <div className="users-list">
                    {users.map((user) => (
                        <div
                            key={user.id}
                            className="user-item"
                            onClick={() => handleUserClick(user.id)}
                        >
                            <div className="user-avatar">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="user-info">
                                <strong className="user-name">{user.name}</strong>
                                <span className="user-email">{user.email}</span>
                            </div>
                            {currentUser && currentUser.id === user.id && (
                                <span className="user-badge">Tú</span>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </section>
    )
}

export default Search
