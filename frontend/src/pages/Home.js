import React, { useState } from 'react'
import Navbar from '../components/Navbar.js'
import NoteCard from '../components/NoteCard.js'
import {MdAdd} from 'react-icons/md'
import AddEditNotes from './AddEditNotes.js'
import Modal  from 'react-modal'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import axiosInstance from '../utils/axiosInstance.js'
import ToastMessage from '../components/ToastMessage.js'
import EmptyPage from '../components/EmptyPage.js'
import addNoteImg from '../assets/addNoteImg.jpg'
import noData from '../assets/noData.jpeg'


const Home = () => {

  const [openAddEditModal,setOpenAddEditModal]=useState({
    isShown:false,
    type:"add",
    data:null
  })

  const [showToastMsg,setShowToastMsg]=useState({
    isShown:false,
    message:"",
    type:"add",
  })

  const [allNotes,setAllNotes]=useState([]);
  const [userInfo,setUserInfo]=useState(null);
  const [isSearch,setIsSearch]=useState(false);

  const navigate=useNavigate();

  //get user info
  const getUserInfo=async()=>{
    try {
      const response=await axiosInstance.get('/get-user')

      if(response.data && response.data.user){
        setUserInfo(response.data.user)
      }
    } catch (error) {
      if(error.response.status===401){
        localStorage.clear();
        navigate('/login')
    }
  }
}

const showToastMessage=(message,type)=>{
  setShowToastMsg({
    isShown:true,
    message,
    type
  })
}

const handleCloseToast=()=>{
  setShowToastMsg({
    isShown:false,
    message:""
  })
}

const handleEdit=(noteDetails)=>{
  setOpenAddEditModal({
    isShown:true,
    data:noteDetails,
    type:'edit'
  })
}

//get all notes
const getAllNotes =async()=>{
  try {
    const response=await axiosInstance.get('/viewAll');

    if(response.data && response.data.notes){
      setAllNotes(response.data.notes)
    }
  } catch (error) {
    console.log("An unexpected error occured.please try again")
  }
}

//delete note
const deleteNote=async(data)=>{

  const noteId=data._id;

  try {
    const response=await axiosInstance.delete('/delete/'+noteId)

    if(response.data && !response.data.error){
      showToastMessage("Note deleted successfully!!",'delete')
      getAllNotes()
    }

  } catch (error) {
    if(error.response && error.response.data && error.response.data.message){
      console.log("An unexpected error occured.please try again")
    }
  }
}

//search
const searchNotes=async(query)=>{
  try {
    const response=await axiosInstance.get("/search",{
      params:{query}
    })

    if(response.data && response.data.notes){
      setIsSearch(true)
      setAllNotes(response.data.notes)
    }
  } catch (error) {
    console.log(error)
  }
}

const handleClearSearch=()=>{
  setIsSearch(false);
  getAllNotes();
}

const handleIsPinned=async(noteData)=>{
  const noteId=noteData._id;
  try {
    const response=await axiosInstance.put('/update-note-pinned/'+noteId,{
      "isPinned":!noteData.isPinned
    })

    if(response.data && response.data.note){
      showToastMessage("Note updated successfully!!")
      getAllNotes()
    }

  } catch (error) {
    console.log(error)
    }
  }


  useEffect(()=>{
    getAllNotes()
    getUserInfo()
    return ()=>{}
  },[])


  return (
    <>
    <Navbar userInfo={userInfo} searchNotes={searchNotes} handleClearSearch={handleClearSearch}/>

    <div className="container mx-auto">
     {allNotes.length>0 ? (<div className='grid grid-cols-3 gap-4 mt-8'>
      {allNotes.map((item,index)=>(
      <NoteCard 
      key={item._id}
      title= {item.title}
      date={item.createdOn}
      content={item.content}
      tags={item.tags}
      isPinned={item.isPinned}
      onEdit={()=>handleEdit(item)}
      onDelete={()=>deleteNote(item)}
      onPinNote={()=>handleIsPinned(item)}
      />
      ))}
    </div>) : (<EmptyPage img={isSearch ? noData : addNoteImg} message={isSearch ? `Oops!!! no notes found matching your search!!`:`Start creating your first note!! Click the "Add" button to jot down your thoughts,ideas and reminders.Let's get started!!`}/>)}
    </div>

    <button className='w-12 h-12 flex items-center justify-center rounded-2xl bg-primary hover:bg-blue-600 absolute right-10 bottom-10' 
    onClick={()=>{
      setOpenAddEditModal({isShown:true,type:"add",data:null})
    }}>
      <MdAdd className='text-[32px] text-white'/>
    </button>

    <Modal
    isOpen={openAddEditModal.isShown}
    onRequestClose={()=>{}}
    style={{
      overlay:{
        backgroundColor:"rgba(0,0,0,0.2)",
      },
    }}
      contentLabel=""
      className="w-[40%] max-h-80% bg-white rounded-md mx-auto mt-8 p-5 overflow-scroll"
    >
    <AddEditNotes 
    type={openAddEditModal.type}
    noteData={openAddEditModal.data}
    onClose={()=>{
      setOpenAddEditModal({isShown:false,type:"add",data:null})
    }}
    getAllNotes={getAllNotes}
    showToastMessage={showToastMessage}
    />
    
    </Modal>

    <ToastMessage
    isShown={showToastMsg.isShown}
    message={showToastMsg.message}
    type={showToastMsg.type}
    onClose={handleCloseToast}
    />
    </>
  )
}

export default Home
