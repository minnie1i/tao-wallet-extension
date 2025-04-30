import './App.css';
import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import CreateWallet from './components/CreateWallet';
import ImportWallet from './components/ImportWallet';
import WalletView from './components/WalletView';
import { Button, ConfigProvider, theme } from 'antd';
import { cryptoWaitReady } from "@polkadot/util-crypto";
import { createRoot } from 'react-dom/client';

const root = createRoot(document.getElementById('root'));

cryptoWaitReady().then(() => {
  root.render(<App />);
}, []);

function App() {

  const [wallet, setWallet] = useState({
    name: null,
    ciphertext: null,
    iv: null,
    isLocked: false,
    keyfile: null
  });

  return (
    <ConfigProvider
      theme={{
        // 1. Use dark algorithm
        algorithm: theme.defaultAlgorithm,

        // 2. Combine dark algorithm and compact algorithm
        // algorithm: [theme.darkAlgorithm, theme.compactAlgorithm],
      }}
    >
      <div className="App">
        <BrowserRouter>
          {wallet.iv ? (
            <Routes>
              <Route
                path="/mywallet"
                element={
                  <WalletView
                    wallet={wallet}
                    setWallet={setWallet}
                  />}
              />
            </Routes>
          ) : (
            <Routes>
              <Route path="/"
                element={
                  <Home />
                }
              />
              <Route path="/createwallet"
                element={
                  <CreateWallet
                    setWallet={setWallet}
                  />
                }
              />
              <Route path="/importwallet"
                element={
                  <ImportWallet
                    setWallet={setWallet}
                  />
                }
              />
            </Routes>
          )}
        </BrowserRouter>
      </div>
    </ConfigProvider>
  );

}

export default App;
