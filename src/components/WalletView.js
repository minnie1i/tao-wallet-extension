import React, { useState } from "react";
import { Input, Button, Space } from "antd";
import { LockOutlined, UnlockOutlined, EyeTwoTone, EyeInvisibleOutlined } from "@ant-design/icons";
import { validatePlaintext, deserializeKeypairFromKeyfileData } from "../utils/helper";

function WalletView({
    wallet, setWallet
}) {
    const [inputPassword, setInputPassword] = useState("");

    function lockWallet() {
        setWallet({
            ...wallet,
            isLocked: true
        });
    }
    async function unlockWallet() {
        const res = await validatePlaintext(inputPassword, wallet.ciphertext, wallet.iv);
        if (res) {
            setWallet({
                ...wallet,
                isLocked: false
            });
            setInputPassword("");
        } else {
            alert("Incorrect password");
        }
    }

    const getKeypair = async () => {
        deserializeKeypairFromKeyfileData(wallet.keyfile, inputPassword);
    }

    return (
        <div className="content">
            {wallet.isLocked ? (
                <div className="page-button">
                    <h4><LockOutlined /> Locked</h4>
                    <Space direction="horizontal">
                        <Input.Password
                            value={inputPassword}
                            onChange={(e) => setInputPassword(e.target.value)}
                            placeholder="Input password"
                            iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                        />
                        <Button
                            type="default"
                            className="page-button"
                            onClick={() => unlockWallet()}
                        >
                            Unlock
                        </Button>
                    </Space>
                </div>
            ) : (
                <div>
                    <h4><UnlockOutlined /> Unlocked</h4>
                    <br />
                    <Button
                        type="default"
                        className="page-button"
                        onClick={lockWallet}
                    >
                        Lock
                    </Button>
                    <br />
                    <br />
                    <Button
                        type="default"
                        className="page-button"
                        onClick={() => console.log(wallet)}
                    >
                        Get Wallet
                    </Button>
                    <Button
                        type="default"
                        className="page-button"
                        onClick={() => getKeypair()}
                    >
                        Deserialize Keyfile
                    </Button>
                </div>
            )}
        </div>
    );
}

export default WalletView;