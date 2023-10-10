import React, { useState } from 'react';

const GeneratorInputPanel = ({ addGenerator }) => {

    const [inputObject, setInputObject] = useState({
        type: 'DFS',
        startPos: 'rand',
        probs: [1, 1, 1, 1],
        rollBackDist: 1,
        totalSteps: -1,
        power: 1
    });

    const handleInputChange = (event) => {
        let { name, value } = event.target;
        if (name == "power") {
            value = value == "0" ? 1 : value
            value = Math.abs(value)
        }
        setInputObject((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleProbsChange = (index, value) => {
        setInputObject((prevState) => {
            const newProbs = [...prevState.probs];
            newProbs[index] = value;
            return {
                ...prevState,
                probs: newProbs,
            };
        });
    };

    const handleSubmit = () => {
        addGenerator(inputObject)
    }

    return (

        <div>
            <label>
                生成方式:
                <select
                    name="type"
                    value={inputObject.type}
                    onChange={handleInputChange}
                >
                    <option value="DFS">DFS</option>
                    <option value="BFS">BFS</option>
                </select>
            </label>
            <label>
                起始點:
                <select
                    name="startPos"
                    value={inputObject.startPos}
                    onChange={handleInputChange}
                >
                    <option value="end">End</option>
                    <option value="start">Start</option>
                    <option value="rand">Random</option>
                </select>
            </label>
            <label>
                總步數:
                <input
                    type="number"
                    name="totalSteps"
                    style={{ width: '60px' }}
                    value={inputObject.totalSteps}
                    onChange={handleInputChange}
                />
            </label>

            {
                inputObject.type == "DFS"
                    ? <span>
                        <label>
                            各方向機率(左右上下):
                            {inputObject.probs.map((prob, index) => (
                                <input
                                    key={index}
                                    type="number"
                                    style={{ width: '40px' }}
                                    value={prob}
                                    onChange={(event) =>
                                        handleProbsChange(index, parseInt(event.target.value))
                                    }
                                />
                            ))}
                        </label>
                        <label>
                            回溯距離:
                            <input
                                type="number"
                                name="rollBackDist"
                                style={{ width: '40px' }}
                                value={inputObject.rollBackDist}
                                onChange={handleInputChange}
                            />
                        </label>
                    </span>
                    : <span>
                        均勻度:
                        <input
                            type="number"
                            name="power"
                            style={{ width: '70px' }}
                            value={inputObject.power}
                            onChange={handleInputChange}
                        />
                    </span>
            }

            <button type="button" onClick={handleSubmit}>添加生成器</button>
        </div>

    );
};

export default GeneratorInputPanel;