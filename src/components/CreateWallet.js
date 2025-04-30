import React, { useEffect } from "react";
import { Typography, Button, Card, Input, Alert, Steps } from "antd";
import { EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Buffer } from "buffer";
import { cryptoWaitReady, mnemonicGenerate } from "@polkadot/util-crypto";
import { generateKeyPair, encrypt, serializedKeypairToKeyfileData } from "../utils/helper";
import { saveToLocalStorage } from "../utils/storage";

function CreateWallet({ setWallet, setPhrase }) {
    const Navigate = useNavigate();

    const [keyPair, setKeyPair] = useState({
        ss58Address: null,
        publicKey: null,
        ss58Format: null,
        mnemonic: null,
        pair: null
    });
    const [inputPassword, setInputPassword] = useState("");

    useEffect(() => {
        cryptoWaitReady().then(() => {
            const mnemonic = mnemonicGenerate(12)
            const res = generateKeyPair(mnemonic)
            setKeyPair(res);
        });
    }, []);

    const steps = [
        {
            title: 'Create Seed',
            content: <>
                <h4>Address</h4>
                {keyPair.ss58Address}
                <h4>Seed Phrase</h4>
                <Card className="phrase-card">
                    {keyPair.mnemonic && <pre style={{ whiteSpace: 'pre-wrap' }}>{keyPair.mnemonic}</pre>}
                </Card><br />
                <Alert showIcon type="warning" message="Write down your seed phrase and store it in a safe place." />
            </>,
        },
        {
            title: 'Create Account',
            content: <>
                <Typography.Title level={5}>Enter Password</Typography.Title>
                <Input.Password
                    value={inputPassword}
                    placeholder="Input password"
                    onChange={updatePasswordInput} iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                />
            </>,
        }
    ];

    const [current, setCurrent] = useState(0);
    const next = () => {
        setCurrent(current + 1);
    };
    const prev = () => {
        setCurrent(current - 1);
    };
    const items = steps.map(item => ({ key: item.title, title: item.title }));

    function updatePasswordInput(e) {
        setInputPassword(e.target.value);
        // validatePassword(inputPassword)
    }

    async function saveKeyfile(input) {
        await saveToLocalStorage("keyfile", input);
    }

    async function saveIV(input) {
        await saveToLocalStorage("iv", input);
    }

    async function saveCiphertext(input) {
        await saveToLocalStorage("ciphertext", Buffer.from(input).toJSON().data);
    }

    async function derivePassKey(password) {
        const res = await encrypt(password);
        const keyfile = serializedKeypairToKeyfileData(keyPair.pair);
        saveKeyfile(keyfile);
        saveIV(res.iv);
        saveCiphertext(res.ciphertext);

        setWallet({
            name: "Bittensor Wallet",
            ciphertext: res.ciphertext,
            iv: res.iv,
            keyfile: keyfile,
            // ciphertext: Buffer.from(res.ciphertext).toString('base64'),
            // iv: Buffer.from(res.iv).toString('base64')
        });
        Navigate("/mywallet");
    }

    return (
        <div className="content">
            <Steps style={{ marginTop: 24 }} current={current} items={items} />
            {steps[current].content}
            <div style={{ marginTop: 24 }}>
                {current < steps.length - 1 && (
                    <Button type="primary" onClick={() => next()}>
                        Next
                    </Button>
                )}
                {current === steps.length - 1 && (
                    <Button type="primary" onClick={() => derivePassKey(inputPassword)}>
                        Done
                    </Button>
                )}
                {current > 0 && (
                    <Button style={{ margin: '0 8px' }} onClick={() => prev()}>
                        Previous
                    </Button>
                )}
            </div>
        </div>
    );
}

export default CreateWallet;