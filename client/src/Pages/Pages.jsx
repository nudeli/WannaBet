import Home from "./Home";
import CreateBet from "./CreateBet";
import JoinBet from "./JoinBet";
import { Route, Routes } from "react-router-dom";

function Pages({state}) { 

    return (
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/CreateBet" element={<CreateBet state={state} />} />
          <Route path="/JoinBet" element={<JoinBet state={state} />} />
        </Routes>
    );
}

export default Pages;