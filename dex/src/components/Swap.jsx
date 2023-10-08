import React, { useState, useEffect } from "react";
import { Input, Popover, Radio, Modal, message } from "antd";
import {
  ArrowDownOutlined,
  DownOutlined,
  SettingOutlined,
} from "@ant-design/icons";

import tokenList from "../tokenList.json";
import uniswapFactoryABI from "../UniFactory.json";
import uniPair from "../UniPair.json";
import uniRouter from "../UniRouter.json";
import { ethers } from "ethers";

function Swap() {
  const [slippage, setSlippage] = useState(2.5);
  const [tokenOneAmount, setTokenOneAmount] = useState(null);
  const [tokenTwoAmount, setTokenTwoAmount] = useState(null);
  const [tokenOne, setTokenOne] = useState(tokenList[4]);
  const [tokenTwo, setTokenTwo] = useState(tokenList[1]);
  const [isOpen, setIsOpen] = useState(false);
  const [changeToken, setChangeToken] = useState(1);
  const [prices, setPrices] = useState(null);
  const [oneN, setOneN] = useState();

  async function fetchPairAndCalculateAmount(
    tokenOneAddress,
    tokenTwoAddress,
    tokenOneAmount
  ) {
    const INFURA_ID = import.meta.env.VITE_INFURA_ID;
    const provider = new ethers.providers.JsonRpcProvider(
      `https://mainnet.infura.io/v3/${INFURA_ID}`
    );
    const uniswapFactoryAddress = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";
    const uniswapRouterAddress = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";

    const uniswapFactory = new ethers.Contract(
      uniswapFactoryAddress,
      uniswapFactoryABI,
      provider
    );

    try {
      // UNCOMMENT THIS IF YOU WANT TO SEE THE PAIR FETCHED
      // const pairAddress = await uniswapFactory.getPair(
      //   tokenOneAddress,
      //   tokenTwoAddress
      // );
      // console.log(`Pair Address : ${pairAddress}`);

      const uniswapRouter = new ethers.Contract(
        uniswapRouterAddress,
        uniRouter,
        provider
      );

      const amountIn = ethers.utils.parseUnits(
        `${tokenOneAmount}`,
        `${tokenOne.decimals}`
      );
      const path = [tokenOneAddress, tokenTwoAddress];
      const amount = await uniswapRouter.getAmountsOut(amountIn, path);

      const one_eth = ethers.utils.parseUnits("1", `${tokenOne.decimals}`);
      const set_eth = await uniswapRouter.getAmountsOut(one_eth, path);

      setTokenTwoAmount(
        parseFloat(
          ethers.utils.formatUnits(amount[1], `${tokenTwo.decimals}`)
        ).toFixed(2)
      );
      setOneN(
        parseFloat(
          ethers.utils.formatUnits(set_eth[1], `${tokenTwo.decimals}`)
        ).toFixed(6)
      );
    } catch (error) {
      console.error("Error fetching pair and calculating amount:", error);
    }
  }

  function changeAmount(e) {
    setTokenOneAmount(e.target.value);
    if (e.target.value) {
      fetchPairAndCalculateAmount(
        tokenOne.address,
        tokenTwo.address,
        e.target.value
      );
    } else {
      setTokenTwoAmount(null);
    }
  }

  function handleSlippageChange(e) {
    setSlippage(e.target.value);
  }

  function switchTokens() {
    setPrices(null);
    setTokenOneAmount(null);
    setTokenTwoAmount(null);
    const one = tokenOne;
    const two = tokenTwo;
    setTokenOne(two);
    setTokenTwo(one);
  }

  function openModal(asset) {
    setChangeToken(asset);
    setIsOpen(true);
  }

  function modifyToken(i) {
    setPrices(null);
    setTokenOneAmount(null);
    setTokenTwoAmount(null);
    if (changeToken === 1) {
      setTokenOne(tokenList[i]);
    } else {
      setTokenTwo(tokenList[i]);
    }
    setIsOpen(false);
  }

  const settings = (
    <>
      <div>Slippage Tolerance</div>
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
          {tokenList?.map((e, i) => {
            return (
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
            );
          })}
        </div>
      </Modal>

      <div className="tradeBox">
        <div className="tradeBoxHeader">
          <h4>Swap</h4>
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
          <Input
            type="number"
            placeholder="0"
            value={tokenOneAmount}
            onChange={changeAmount}
          />
          <Input
            type="number"
            placeholder="0"
            value={tokenTwoAmount}
            disabled={true}
          />
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
        {tokenOneAmount !== null &&
          tokenOneAmount !== "0" &&
          tokenOneAmount.trim() !== "" && (
            <div className="calculate">
              {tokenTwoAmount !== null
                ? `1 ${tokenOne.ticker} = ${oneN} ${tokenTwo.ticker}`
                : "Calculating price..."}
            </div>
          )}
        <div className="swapButton" disabled={!tokenOneAmount}>
          Swap
        </div>
      </div>
    </>
  );
}

export default Swap;
