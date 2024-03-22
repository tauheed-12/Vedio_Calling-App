import logo from './logo.svg';
import './App.css';
import {Routes, Route} from "react-router-dom"
import Lobby from './Screens/Lobby';
import Room from './Screens/Room';
function App() {
  return (
    <div className="App">
      <Routes>
        <Route path='/' element=<Lobby/>></Route>
        <Route path='/room/:roomid' element=<Room/>></Route>
      </Routes>
    </div>
  );
}

export default App;
