import { useEffect, useContext } from 'react'
import { UserContext } from '../../context/UserContext/UserState'

const Profile = () => {
    const {user, getProfile} = useContext(UserContext);
    
    useEffect(() => {
      getProfile();
    }, [])
    if(!user){

        return (
            <section className="page-card">
                <p className="empty-state">Cargando tu perfil...</p>
            </section>
        )

    }
    return (
        <section className="page-card">
            <h2>Tu perfil</h2>
            <p>Estos son los datos asociados a tu cuenta.</p>
            <div className="profile-info">
                <div>
                    <span className="label">Nombre</span>
                    <strong>{user.name}</strong>
                </div>
                <div>
                    <span className="label">Email</span>
                    <strong>{user.email}</strong>
                </div>
            </div>
        </section>
    )
}

export default Profile