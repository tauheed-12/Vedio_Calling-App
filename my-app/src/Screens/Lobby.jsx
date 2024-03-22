import React from 'react'
import { useState, useCallback, useEffect } from 'react'
import { useSocket } from '../Context/SocketProvider'
import { useNavigate } from 'react-router-dom'
const Lobby = () => {
  const[email,Setemail] = useState("");
  const[code,Setcode] = useState("");
  const socket = useSocket();
  const navigate = useNavigate();
  const handleform = useCallback((e)=>{
        e.preventDefault()
        socket.emit('room:join',{email,code})
  },
  [email, code, socket]
);
  const handlejoinroom = useCallback((data)=>{
    const{email, code} = data;
    navigate(`/room/${code}`);
  },[])
useEffect(()=>{
    socket.on('room:join', handlejoinroom);
    return()=>{
        socket.off('room:join', handlejoinroom);
    }
}, [socket, handlejoinroom]);
  return (
    <div>
        <form onSubmit={(e)=>handleform(e)}>
            <label htmlFor='email'>Email Id</label>
            <input type='email' id='email' name='email'
              onChange={(e)=>Setemail(e.target.value)}
            ></input>
            <br/>
            <label htmlFor='code'>Room code</label>
            <input name='code' id='code'
               onChange={(e)=>Setcode(e.target.value)}
            ></input>
            <br/>
            <button type='submit' >Join</button>
        </form>
    </div>
  )
}

export default Lobby
