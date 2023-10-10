import React, { useState } from 'react';

const PrefillInputPanel = ({ type, setPrefill }) => {

    const [inputObject, setInputObject] = useState({
        type: type,
        use: false,
        dist: 10,
        fill: true,
        width: 4,
    });

    const handleInputChange = (event) => {
        const { name, value, type, checked } = event.target;
        const newValue = type === 'checkbox' ? checked : value;

        // react 基本認知: state 是物件的話要當成 value object
        setInputObject((prevState) => ({
            ...prevState,
            [name]: newValue,
        }));
    };

    setPrefill(inputObject)

    return (
        <div>
            <label>
                Use {type}:
                <input
                    type="checkbox"
                    name="use"
                    checked={inputObject.use}
                    onChange={handleInputChange}
                />
            </label>
            <label>
                Dist:
                <input
                    type="number"
                    name="dist"
                    disabled={!inputObject.use}
                    style={{ width: '60px' }}
                    value={inputObject.dist}
                    onChange={handleInputChange}
                />
            </label>
            <label>
                Fill All:
                <input
                    type="checkbox"
                    name="fill"
                    disabled={!inputObject.use}
                    checked={inputObject.fill}
                    onChange={handleInputChange}
                />
            </label>
            <label>
                Width:
                <input
                    type="number"
                    name="width"
                    disabled={!inputObject.use}
                    style={{ width: '60px' }}
                    value={inputObject.width}
                    onChange={handleInputChange}
                />
            </label>
        </div>
    );
};

export default PrefillInputPanel;