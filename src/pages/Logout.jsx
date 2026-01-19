import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

const Logout = () => {
    const navigate = useNavigate()
    const { logout } = useAuthStore()

    useEffect(() => {
        const handleLogout = async () => {
            await logout()
            navigate('/login')
        }
        handleLogout()
    }, [logout, navigate])

    return null
}

export default Logout

