const {Server} = require("socket.io")
const io = new Server(8000,{
    cors:true,
});

const emailToSocketIdMap = new Map();
const SocketIdtoemailMap = new Map();
io.on('connection',(socket)=>{
    console.log("Socket connected")
    socket.on('room:join',data=>{
        const {email, code} = data;
        emailToSocketIdMap.set(email, socket.id);
        SocketIdtoemailMap.set(socket.id, email);
        io.to(code).emit('user:joined',{email, id:socket.id})
        socket.join(code);
        io.to(socket.id).emit("room:join",data)
    });
     
    socket.on("user:call", ({to, offer})=>{
        io.to(to).emit("incomming:call",{from:socket.id,offer});
    });

    socket.on("call:accepted",({to,ans})=>{
        io.to(to).emit("call:accepted",{from:socket.id, ans});
    });

    socket.on("peer:nego:needed",({to,offer})=>{
        console.log("peer:nego:needed",offer);
        io.to(to).emit("peer:nego:needed",{from:socket.id,offer});
    });
    socket.on("peer:nego:done",({to,ans})=>{
        console.log("peer:nego:done",ans);
        io.to(to).emit("peer:nego:final",{from:socket.id,ans});
    });
});