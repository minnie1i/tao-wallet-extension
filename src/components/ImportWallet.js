import React from "react";
import { Steps, Button, Input, Alert, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";
import { generateKeyPair, encrypt, serializedKeypairToKeyfileData } from "../utils/helper";
import { saveToLocalStorage } from "../utils/storage";

const { TextArea } = Input;

function ImportWallet({ setWallet, setPhrase }) {
    const Navigate = useNavigate();
    const [inputPassword, setInputPassword] = useState("");
    const [inputPhrase, setInputPhrase] = useState("");
    const [nonValid, setNonValid] = useState(false);
    const [keyPair, setKeyPair] = useState({
        ss58Address: null,
        publicKey: null,
        ss58Format: null,
        mnemonic: null,
        pair: null
    });

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

    const steps = [
        {
            title: 'Import Seed Phrase',
            content: <>
                <h4>Address</h4>
                {keyPair.ss58Address}
                <h4>Seed Phrase</h4>
                <TextArea
                    rows={4}
                    value={inputPhrase}
                    placeholder="Enter your phrase here"
                    className="phrase-input"
                    onChange={updatePhrase}
                />
                {nonValid && inputPhrase !== "" && <Alert style={{ marginTop: 24 }} showIcon type="error" message="Invalid phrase." />}
            </>,
        },
        {
            title: 'Setup Account',
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

    function updatePhrase(e) {
        setInputPhrase(e.target.value);
        if (e.target.value.split(" ").length !== 12 || e.target.value.slice(-1) === " ") {
            setNonValid(true);
            const res = generateKeyPair({ mnemonic: e.target.value })
            setKeyPair(res);
        }
        else
            setNonValid(false);
    }

    function importWallet() {
        // const res = generateKeyPair({mnemonic: inputPhrase})
        // setKeyPair(res);
    }

    return (
        <div className="content">
            <Steps style={{ marginTop: 24 }} current={current} items={items} />
            {steps[current].content}
            <div style={{ marginTop: 24 }}>
                {current < steps.length - 1 && (
                    <Button type="primary" onClick={() => {
                        importWallet();
                        next();
                    }}
                        disabled={nonValid}>
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

export default ImportWallet;