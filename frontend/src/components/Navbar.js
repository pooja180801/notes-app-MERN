import React, { useState } from 'react'
import ProfileInfo from './ProfileInfo'
import { useNavigate } from 'react-router-dom';
import SearchBar from './SearchBar';

const Navbar = ({userInfo,searchNotes,handleClearSearch}) => {

  const [searchQuery,setSearchQuery]=useState("")
  const navigate=useNavigate();

  const onLogout=()=>{
    localStorage.clear()
    navigate("/login");
  };

  const handleSearch=()=>{
    if(searchQuery){
      searchNotes(searchQuery)
    }
  }

  const onClearSearch=()=>{
    handleClearSearch()
    setSearchQuery("")
  }


  return (
    <div className='bg-whitesmoke flex items-center justify-between px-6 py-2 drop-shadow'>
        <h2 className='text-xl font-medium text-black'>Notes</h2>

        <SearchBar value={searchQuery}
        onChange={({target})=>{
          setSearchQuery(target.value)
        }}
        handleSearch={handleSearch}
        onClearSearch={onClearSearch}
        />
        <ProfileInfo userInfo={userInfo} onLogout={onLogout}/>
      
    </div>
  )
}

export default Navbar
