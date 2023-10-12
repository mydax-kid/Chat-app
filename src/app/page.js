'use client'
import Login from '../components/Login'
import useAuthUser from '@/hooks/useAuthUser'
import Sidebar from '@/components/Sidebar'
import Chat from '@/components/Chat'

export default function Home() {
  //logged in user
  const user = useAuthUser()

  if (!user) return <Login/>

  return (
    <div className='app'>
      <div className='app__body'>
        <Sidebar user={user} />
        <Chat user={user} />
      </div>
    </div>
  )
}
