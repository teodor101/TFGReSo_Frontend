import { useEffect, useContext } from 'react'
import { UserContext } from '../../context/UserContext/UserState'

const Profile = () => {
    const {user, getProfile} = useContext(UserContext);
    
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