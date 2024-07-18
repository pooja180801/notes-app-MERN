import React, { useState } from 'react'
import Navbar from '../components/Navbar'
import { Link ,useNavigate} from 'react-router-dom'
import PasswordInput from '../components/PasswordInput.js'
import { validateEmail, validatePassword } from '../utils/helper.js'
import axiosInstance from '../utils/axiosInstance.js'

const Register = () => {

  const navigate=useNavigate();

  const [name,setName]=useState("")
  const [email,setEmail]=useState("")
  const [password,setPassword]=useState("")
  const [error,setError]=useState(null)

  const handleRegister=async(e)=>{
    e.preventDefault();

    if(!name){
      setError("Please enter your name")
      return;
    }

    if(!validateEmail(email)){
      setError("Please enter an valid email address.")
      return;
    }

    if(!password){
      setError("Please enter the password")
      return;
    }

    if(!validatePassword(password)){
      setError("Password should have atleast 8 characters")
      return;
    }

    setError("")

    //rregister api call
    try {
      const response=await axiosInstance.post('/register',{
        username:name,
        email:email,
        password:password,
      })

      if(response.data && response.data.error){
        setError(response.data.message)
        return
      }

      if(response.data && response.data.accessToken){
        localStorage.setItem("token",response.data.accessToken)
        navigate('/')
      }

    } catch (error) {
      if(error.response && error.response.data && error.response.data.message){
        setError(error.response.data.message)
      }else{
        setError("An unexpected error occured.Please try again")
      }
    }
  }


  return (
    <>
    <Navbar/>
        <div className='flex items-center justify-center mt-12'>
          <div className='w-96 border rounded bg-white px-7 py-10'>
              <form onSubmit={handleRegister}>
                  <h4 className='text-2xl mb-7'>Register</h4>
                  <input 
                  type="text" 
                  placeholder='Fullname' 
                  className='input-box' 
                  value={name} 
                  onChange={(e)=>setName(e.target.value)}
                  />

                  <input 
                  type="text" 
                  placeholder='Email' 
                  className='input-box' 
                  value={email} 
                  onChange={(e)=>setEmail(e.target.value)}
                  />

                <PasswordInput 
                value={password} 
                onChange={(e)=>setPassword(e.target.value)}/>

                {error && <p className='text-red-500 text-xs pb-1'>{error}</p> }

                <button type="submit" className='btn-primary'>Register</button>

                <p className='text-sm text-center mt-4'>
                    Already have an Account? {""}
                    <Link to='/login' className="font-medium text-primary underline">Login here</Link>
                </p>


              </form>
            </div>
          </div>
  </>
  )
}

export default Register
