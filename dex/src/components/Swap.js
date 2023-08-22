import React, { useState, useEffect } from 'react';
import { Input, Popover, Radio, Modal, message } from "antd";
import {
  ArrowDownOutlined,
  DownOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import tokenList from "../tokenList.json";
import axios from "axios";
import { useSendTransaction, useWaitForTransaction } from "wagmi";
const oneInchApi = axios.create(
  {
    headers: {
      Authorization: "Bearer 0Bv2Z2uILjQmFo6y4S6Z06iQ58uZvIMZ"
    }
  }
)
function Swap(props) {
  const { address, isConnected } = props;
  const [slippage, setSlippage] = useState(2.5);
  const [tokenOneAmount, setTokenOneAmount] = useState(null);
  const [tokenTwoAmount, setTokenTwoAmount] = useState(null);
  const [tokenOne, setTokenOne] = useState(tokenList[0]);
  const [tokenTwo, setTokenTwo] = useState(tokenList[1]);
  const [isOpen, setIsOpen] = useState(false);
  const [changeToken, setChangeToken] = useState(1);
  const [prices, setPrices] = useState(null);
  const [txDetails, seTxDetails] = useState({
    to:null,
    data: null,
    value: null,
  });

  const {data, sendTransaction} = useSendTransaction({
    request: {
      from: address,
      to: String(txDetails.to),
      data: String(txDetails.data),
      value: String(txDetails.value),

    }
  })


  function handleSlippageChange(e) {
    setSlippage(e.target.value);
  }

  function changeAmount(e) {
    setTokenOneAmount(e.target.value);
    if(e.target.value && prices){
      setTokenTwoAmount((e.target.value * prices.ratio).toFixed(2))
    }else{
      setTokenTwoAmount(null);
    }
  }

  function switchTokens(){
    setPrices(null);
    setTokenOneAmount(null);
    setTokenTwoAmount(null);
    const one = tokenOne;
    const two = tokenTwo;
    setTokenOne(two);
    setTokenTwo(one);
    fetchPrices(two.address, one.address);
  }

  function openModal(asset){
    setChangeToken(asset);
    setIsOpen(true);
  }
  function modifyToken(i){
    setPrices(null);
    setTokenOneAmount(null);
    setTokenTwoAmount(null);
    if (changeToken === 1){
      setTokenOne(tokenList[i]);
      fetchPrices(tokenList[i].address, tokenTwo.address);

    } else {
      setTokenTwo(tokenList[i]);
      fetchPrices(tokenOne.address, tokenList[i].address);

    }
    setIsOpen(false);
  }

  async function fetchPrices(one, two){

    const res = await axios.get(`http://localhost:3001/tokenPrice`, {
      params: {addressOne: one, addressTwo: two}
    })

    
    setPrices(res.data)
  }

  async function fetchDexSwap(){
    const allowance = await oneInchApi.get(
      `/swap/v5.2/1/approve/transaction?tokenAddress=${tokenOne.address}&walletAddress=${address}`,
    )
    
    if(allowance.data.allowance === "0"){

      const approve = await oneInchApi.get( 
        `/swap/v5.2/1/approve/allowance?tokenAddress=${tokenOne.address}`
        )
    
      seTxDetails(approve.data);
      console.log("nao aprovado")
      return
    
    }
    console.log("faca a troca")
  }



  useEffect(() =>{

    fetchPrices(tokenList[0].address, tokenList[1].address)

  }, [])

  useEffect(()=>{

    if(txDetails.to && isConnected){
      sendTransaction();
    }

  }, [txDetails.to, isConnected, sendTransaction])

  const settings = (
    <>
      <div>Taxa de Tolenrancia</div>
      <div>
        <Radio.Group value={slippage} onChange={handleSlippageChange}>
          <Radio.Button value={0.5}>0.5%</Radio.Button>
          <Radio.Button value={2.5}>2.5%</Radio.Button>
          <Radio.Button value={5}>5.0%</Radio.Button>
        </Radio.Group>
      </div>
    </>
  );

  return (
    <>
    <Modal
      open={isOpen}
      footer={null}
      onCancel={() => setIsOpen(false)}
      title="Select a token"
    >
    <div className="modalContent">
  {tokenList?.map((e, i) => (
    <div
      className="tokenChoice"
      key={i} 
      onClick={() => modifyToken(i)}
    >
      <img src={e.img} alt={e.ticker} className="tokenLogo" />
      <div className="tokenChoiceNames">
        <div className="tokenName">{e.name}</div>
        <div className="tokenTicker">{e.ticker}</div>
      </div>
    </div>
  ))}
</div>

    </Modal>

    <div className="tradeBox">
      <div className="tradeBoxHeader">
        <h4>Compra/Venda</h4>
        <Popover
          content={settings}
          title="Settings"
          trigger="click"
          placement="bottomRight"
        >
          <SettingOutlined className="cog" />
        </Popover>
      </div>
      <div className="inputs">
      <div className="youPay">Voce Paga</div>
        <Input
          placeholder="0"
          value={tokenOneAmount}
          onChange={changeAmount}
          disabled={!prices}
        />

          <div className="youReceive">Voce Recebe</div>


        <Input  placeholder="0" value={tokenTwoAmount}  disabled={true}  />
        <div className="switchButton" onClick={switchTokens}>
          <ArrowDownOutlined className="switchArrow" />
        </div>
        

        <div className="assetOne" onClick={() => openModal(1)}>
          <img src={tokenOne.img} alt="assetOneLogo" className="assetLogo" />
          {tokenOne.ticker}
          <DownOutlined />
        </div>
        <div className="assetTwo" onClick={() => openModal(2)}>
          <img src={tokenTwo.img} alt="assetOneLogo" className="assetLogo" />
         {tokenTwo.ticker}
          <DownOutlined />
        </div>
      </div>
      <div className="swapButton" disabled={!tokenOneAmount || !isConnected} onClick={fetchDexSwap}>Troca</div>
    </div>
    </>
  );
}

export default Swap;