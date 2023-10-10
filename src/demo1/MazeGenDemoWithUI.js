import './MazeGenDemoWithUI.css';

import React, { useState } from 'react';

import { Maze } from '../mazegen/MazeGen';
import { arrayGen, getDefaultMazeConfig } from '../utils/Utils';

import MazeGenAnim from './MazeGenAnim';
import GeneratorInputPanel from './GeneratorInputPanel';
import PrefillInputPanel from './PrefillInputPanel';

const MazeGenDemoWithUI = () => {

    const defaultSeed = arrayGen(20, i => Math.floor(Math.random() * 10)).join('');

    const [mazeW, setMazeW] = useState(38);
    const [mazeH, setMazeH] = useState(18);
    const [seed, setSeed] = useState(defaultSeed);

    const [mainFiller, setMainFiller] = useState(getDefaultMazeConfig().mainFiller)
    const [prefillWall, setPrefillWall] = useState()
    const [prefillCircle, setPrefillCircle] = useState()

    const [holePortion, setHoldPortion] = useState(0)

    const [showAnswer, setShowAnswer] = useState(false)
    const [showBiconnected, setShowBiconnected] = useState(true)
    const [pathRoundCap, setPathRoundCap] = useState(false)
    const [paintDelayPower, setPaintDelayPower] = useState(9)

    const maze = new Maze({
        seed: seed,
        width: mazeW,
        height: mazeH,
        predefined: [
            prefillWall && prefillWall.use ? prefillWall : null,
            prefillCircle && prefillCircle.use ? prefillCircle : null
        ].filter(e => !!e),
        mainFiller: mainFiller,
        holePortion: Math.pow(holePortion / 100, 2)
    });

    return (
        <div>

            <MazeGenAnim
                newMaze={maze}
                showAnswer={showAnswer}
                showBiconnected={showBiconnected}
                paintDelay={Math.pow(3, paintDelayPower / 2 - 4)}
                pathRoundCap={pathRoundCap} />

            <br />

            <div className="input-section">
                <label>
                    Seed <input type="text" value={seed} style={{ width: "30%" }} onChange={
                        (e) => {
                            const newSeed = e.target.value.replace(/[^0-9]/g, "")
                            setSeed(newSeed.substring(newSeed.length - 20, newSeed.length))
                        }
                    } />
                </label>

                <label>
                    Width
                    <input
                        type="number"
                        style={{ width: "10%" }}
                        value={mazeW}
                        onChange={
                            (e) => setMazeW(Math.max(1, Math.min(120, parseInt(e.target.value))))
                        } />
                </label>

                <label>
                    Height
                    <input
                        type="number"
                        style={{ width: "10%" }}
                        value={mazeH}
                        onChange={
                            (e) => setMazeH(Math.max(1, Math.min(80, parseInt(e.target.value))))
                        } />
                </label>
                <label>
                    鑿洞機率
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={holePortion}
                        onChange={e => { setHoldPortion(e.target.value) }}
                    />
                    ({Math.round(Math.pow(holePortion / 100, 2) * 1000) / 1000})
                </label>
            </div>

            <div className="input-section">
                <PrefillInputPanel type="wall" setPrefill={(obj) => {
                    setPrefillWall(obj)
                }} />
                <PrefillInputPanel type="circle" setPrefill={(obj) => {
                    setPrefillCircle(obj)
                }} />
            </div>


            <div className="input-section">
                <label>
                    顯示答案
                    <input
                        type="checkbox"
                        checked={showAnswer}
                        onChange={e => { setShowAnswer(e.target.checked) }}
                    />
                </label>

                <label>
                    顯示迴圈
                    <input
                        type="checkbox"
                        checked={showBiconnected}
                        onChange={e => { setShowBiconnected(e.target.checked) }}
                    />
                </label>

                <label>
                    圓形巷尾
                    <input
                        type="checkbox"
                        checked={pathRoundCap}
                        onChange={e => { setPathRoundCap(e.target.checked) }}
                    />
                </label>

                <label>
                    繪製延遲
                    <input
                        type="range"
                        min="0"
                        max="16"
                        value={paintDelayPower}
                        onChange={e => { setPaintDelayPower(e.target.value) }}
                    />
                    ({Math.round(Math.pow(3, paintDelayPower / 2 - 4) * 1000) / 1000})
                </label>
            </div>

            <div className="input-section">
                <GeneratorInputPanel addGenerator={gen => setMainFiller(old => [...old, gen])} />

                {
                    mainFiller.map((fil, index) => {
                        return <div key={index} style={{ maxWidth: 600, borderColor: "#ffffff", borderWidth: '2px', borderStyle: 'solid', backgroundColor: "#e8e8e8" }} >
                            <label>》 生成方式: {fil.type} </label>
                            <label>起始點: {fil.startPos} </label>
                            <label>總步數: {fil.totalSteps} </label>
                            {fil.type == "DFS"
                                ? <label> 各方向機率: {(fil.probs || "").toString()} </label>
                                : <label> 鑽入程度: {1 / fil.power} </label>
                            }
                            <button type="button" onClick={() => {
                                setMainFiller(old => old.filter((e, i) => i != index))
                            }} >
                                刪除
                            </button>
                        </div>
                    })
                }
            </div>

        </div>
    );
};

export default MazeGenDemoWithUI;