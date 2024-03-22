import React, { useContext } from 'react';
import { createContext } from 'react';
import {io} from "socket.io-client";
import { useMemo } from 'react';
const SocketContext = createContext(null);
export const useSocket = ()=>{
    const socket = useContext(SocketContext);
    return socket;
}
const SocketProvider = (props) => {
  const socket = useMemo(()=>io("localhost:8000"),[]);
  return (
    <SocketContext.Provider value={socket}>
       {props.children}
    </SocketContext.Provider>
  )
}

export default SocketProvider
