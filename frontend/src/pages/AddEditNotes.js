import React, { useState } from 'react'
import TagInput from '../components/TagInput'
import { MdClose } from 'react-icons/md';
import axiosInstance from '../utils/axiosInstance';

const AddEditNotes = ({noteData,type,onClose,getAllNotes,showToastMessage}) => {

    const [title,setTitle]=useState(noteData?.title || "");
    const [content,setContent]=useState(noteData?.content || "");
    const [tags,setTags]=useState(noteData?.tags || []);

    const [error,setError]=useState(null)


    const addNewNote=async()=>{
      try {
        const response=await axiosInstance.post('/add',{
          title,
          content,
          tags
        })

        if(response.data && response.data.note){
          showToastMessage("Note added successfully!!")
          getAllNotes()
          onClose()
        }

      } catch (error) {
        if(error.response && error.response.data && error.response.data.message){
          setError(error.response.data.message)
        }
      }
    }


    const EditNote=async()=>{
      const noteId=noteData._id;
      try {
        const response=await axiosInstance.put('/edit/'+noteId,{
          title,
          content,
          tags
        })

        if(response.data && response.data.note){
          showToastMessage("Note updated successfully!!")
          getAllNotes()
          onClose()
        }

      } catch (error) {
        if(error.response && error.response.data && error.response.data.message){
          setError(error.response.data.message)
        }
      }
    }

    const handleAddNote=()=>{
        if(!title){
            setError("Please enter the title")
            return;
        }

        if(!content){
            setError("Please enter the content")
            return;
        }

        setError("");

        if(type==="edit"){
            EditNote();
        }else{
            addNewNote()
        }
    }

  return (
    <div className='relative'>

        <button
        className='w-10 h-10 rounded-full flexx items-center justify-center absolute -top-3 -right-3 hover:bg-slate-50'
        onClick={onClose}>
        <MdClose className='text-xl text-slate-400'/>
        </button>

      <div className="flex flex-col gap-2">
        <label className='input-label'>Title</label>
        <input 
        type="text" 
        className='text-xl text-slate-950 outline-none'
        placeholder='Enter your title here'
        value={title}
        onChange={({target})=>setTitle(target.value)}
        />
      </div>

      <div className='flex flex-col hap-2 mt-4'>
        <label className='input-label'>Content</label>
        <textarea 
        type='text'
        className='text-sm text-slate-950 outline-none bg-slate-100 p-2 rounded'
        placeholder='Content'
        rows={10}
        value={content}
        onChange={({target})=>setContent(target.value)}
        />
      </div>

        <div className="mt-3">
            <label className='input-label'>Tags</label>
            <TagInput tags={tags} setTags={setTags}/>
        </div>

        {error && <p className='text-red-500 text-xs pb-1 mt-2'>{error}</p> }

        <button className='btn-primary font-medium mt-5 p-3' onClick={handleAddNote}>{type==="edit"? "Edit Note":"Add Note"}</button>

    </div>
  )
}

export default AddEditNotes
