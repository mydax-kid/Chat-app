'use client'
import { Button } from "@mui/material";
import { useSignInWithGoogle } from 'react-firebase-hooks/auth'
import {auth} from '../utils/firebase'

const Login = () => {
    const [signInWithGoogle] = useSignInWithGoogle(auth)

    return ( 
        <div className="app">
            <div className="login">
                <div className="login__background"/>
                <div className="login__container">
                    <img src="/logo.png" alt="logo" />
                    <div className="login__text">
                        <h1>Sign in to sami chat</h1>
                    </div>
                    <Button onClick={() => signInWithGoogle()}>
                        Sign in with Google
                    </Button>
                </div>
            </div>
        </div>
     );
}
 
export default Login;