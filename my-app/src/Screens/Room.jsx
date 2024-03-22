import React from 'react';
import { useEffect, useCallback, useState } from 'react';
import { useSocket } from '../Context/SocketProvider';
import ReactPlayer from "react-player";
import Peer from '../Peer/Peer';
const Room = () => {
  const socket = useSocket();
  const[remoteSocketId, SetremoteSocketId] = useState(null)
  const[MyStream, SetMyStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState();
  const handleUserJoin = useCallback(({email, id})=>{
    console.log(`email ${email} joined the room`);
    SetremoteSocketId(id)
  },[])
  const HandleUserCall = useCallback(async()=>{
     const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video:true,
     });
     const offer = await Peer.getOffer();
     socket.emit("user:call",{to:remoteSocketId, offer});
     SetMyStream(stream);
  },[remoteSocketId, socket]);

  const handleIncomingCall = useCallback(
    async({from, offer})=>{
      SetremoteSocketId(from);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio:true,
        video:true,
      });
      SetMyStream(stream);
      console.log(`Incoming Call`, from, offer);
      const ans = await Peer.getAnswer(offer);
      socket.emit("call:accepted",{to:from,ans});
   },
   [socket]
  );

  const sendStreams = useCallback(()=>{
    for(const track of MyStream.getTracks()){
      Peer.peer.addTrack(track, MyStream);
    }
  },[MyStream]);
  
  const handleCallAccepted = useCallback(({from, ans})=>{
        Peer.setLocalDescription(ans);
        console.log("Call Accepted!");
        sendStreams();
  },[sendStreams])

  const handleNegoNeeded = useCallback(async ()=>{
    const offer = await Peer.getOffer();
    socket.emit("peer:nego:needed",{offer, to:remoteSocketId}); 
  },[remoteSocketId, socket]);

  useEffect(()=>{
    Peer.peer.addEventListener("negotiationneeded",handleNegoNeeded);
    return ()=>{
      Peer.peer.removeEventListener("negotiationneeded",handleNegoNeeded);
    }
  },[handleNegoNeeded]);

  const handleNegoNeedIncoming = useCallback(
    async ({from, offer})=>{
      const ans = await Peer.getAnswer(offer);
      socket.emit("peer:nego:done",{to:from,ans});
    },
    [socket]
  );

  const handleNegoNeedFinal = useCallback(
    async({ans})=>{
      await Peer.setLocalDescription(ans);
    },
    []
  );

  useEffect(()=>{
    Peer.peer.addEventListener("track", async(ev)=>{
      const remotStream = ev.streams;
      console.log("GOT TRACKS!!");
      setRemoteStream(remotStream[0]);
    });
  },[]);
  useEffect(()=>{
    socket.on('user:joined', handleUserJoin);
    socket.on("incomming:call",handleIncomingCall);
    socket.on("call:accepted",handleCallAccepted);
    socket.on("peer:nego:needed",handleNegoNeedIncoming);
    socket.on("peer:nego:final",handleNegoNeedFinal);
    return ()=>{
        socket.off('user:joined', handleUserJoin);
        socket.off('incoming:call',handleIncomingCall);
        socket.off('call:accepted',handleCallAccepted);
        socket.off('peer:nego:needed',handleNegoNeedIncoming);
        socket.off('peer:nego:final',handleNegoNeedFinal);
    };
  },[socket,
    handleUserJoin,
    handleIncomingCall,
    handleCallAccepted,
    handleNegoNeedIncoming,
    handleNegoNeedFinal])
  return (
    <div>
      <h1>Room</h1>
      <h4>{remoteSocketId ? "Connected": "No one in room"}</h4>
      {MyStream && <button onClick={sendStreams}>Send Stream</button>}
      {
        remoteSocketId && <button onClick={HandleUserCall}>Call</button>
      }
      <>
      <h1>You</h1>
      {
        MyStream && <ReactPlayer playing muted height='200px' width='300px' url={MyStream}/>
      }
      </>
      <>
      <h1>Friend</h1>
      {
        remoteStream &&  <ReactPlayer
            playing
            muted
            height="100px"
            width="200px"
            url={remoteStream}
          />
      }
      </>
    </div>
  )
}

export default Room;
