import React from "react";
import { Button } from "antd";
import { useNavigate } from 'react-router-dom';
import { UserAddOutlined, PlusOutlined } from "@ant-design/icons";
import logo from "../logo.png";

function Home() {  
  const navigate = useNavigate();

  return (
    <div className="content">
      <img src={logo} className="App-logo" alt="logo" /><br/>
      <Button
        type="primary"
        shape="round"
        icon={<PlusOutlined />}
        size='large'
        onClick={() => navigate('/createwallet')}
      >Create Wallet</Button>
      <br />
      <br />
      <Button
        type="default"
        shape="round"
        icon={<UserAddOutlined />}
        size='large'
        onClick={() => navigate('/importwallet')}
      >Import Wallet</Button>
    </div>
  );
}

export default Home;