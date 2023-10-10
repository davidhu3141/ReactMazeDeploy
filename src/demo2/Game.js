import React, { useEffect, useRef, useState } from 'react';
import { arrayGen, dist, getCanvasToolKit, getDefaultMazeConfig, pointEq, useClientWidth } from '../utils/Utils';
import { Maze } from '../mazegen/MazeGen';


const Game = () => {

    const pathRoundCap = false
    const pathWallColor = '#000000'
    const pathGroundColor = '#ffffff'

    const stepRoundHint = true
    const stepHintColor = '#0000ff66'

    const playerColor = '#0000ff'

    const [showAnswer, setShowAnswer] = useState(false)
    const answerColor = '#00000032'
    const answerWidthFactor = 0.8

    const [maxPreviewStep, setMaxPreviewStep] = useState(2);
    const aisleWallPortion = 3.6;
    const mazeW = 19
    const mazeH = 9

    const boundingRef = useRef(null)
    const canvasRef = useRef(null)
    const mazeRef = useRef(null)
    mazeRef.current = mazeRef.current || new Maze(getDefaultMazeConfig(mazeW, mazeH))
    const maze = mazeRef.current;
    const [target, setTarget] = useState({ x: mazeW - 1, y: mazeH - 1 })

    const [pos, setPos] = useState({ x: 0, y: 0 })
    const canvasWidth = useClientWidth(boundingRef);

    let { aisleW, canvasHeight, mpos, mposInv } = getCanvasToolKit({
        mazeWidth: maze.width,
        mazeHeight: maze.height,
        aisleWallPortion,
        canvasWidth
    })

    const nearTree = maze.genNearSteps(pos, maxPreviewStep)

    useEffect(() => {

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        ctx.fillStyle = pathWallColor
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.lineCap = pathRoundCap ? 'round' : 'square'
        ctx.strokeStyle = pathGroundColor
        ctx.lineWidth = aisleW;

        maze.edgeList
            .concat([
                { ax: 0, ay: -1, bx: 0, by: 0 },
                { ax: maze.width - 1, ay: maze.height - 1, bx: maze.width - 1, by: maze.height }
            ])
            .forEach(edge => {
                ctx.beginPath();
                ctx.moveTo(mpos(edge.ax), mpos(edge.ay));
                ctx.lineTo(mpos(edge.bx), mpos(edge.by));
                ctx.stroke();
            })

        ctx.lineCap = stepRoundHint ? 'round' : 'square';
        ctx.strokeStyle = stepHintColor;
        ctx.lineWidth = aisleW / 3;
        nearTree.forEach(node => {
            ctx.beginPath();
            ctx.moveTo(mpos(node.point.x), mpos(node.point.y))
            ctx.lineTo(mpos(node.point.x), mpos(node.point.y + 0.001))
            ctx.stroke();
        })

        ctx.strokeStyle = playerColor
        ctx.lineCap = 'round'
        ctx.lineWidth = aisleW - 0.5
        ctx.beginPath();
        ctx.moveTo(mpos(pos.x), mpos(pos.y));
        ctx.lineTo(mpos(pos.x + 0.001), mpos(pos.y + 0.001));
        ctx.stroke();

        // answer
        if (showAnswer) {
            ctx.lineCap = pathRoundCap ? 'round' : 'square'
            ctx.strokeStyle = answerColor
            ctx.lineWidth = aisleW * answerWidthFactor
            ctx.beginPath();
            let lastNode = null
            maze.answer.forEach((node, index) => {
                if (index !== 0) {
                    ctx.moveTo(mpos(node.x), mpos(node.y))
                    ctx.lineTo(mpos(lastNode.x), mpos(lastNode.y))
                }
                lastNode = node
            })
            ctx.stroke();
        }

    }, [pos, canvasWidth, maxPreviewStep, showAnswer]);

    const [isDragging, setIsDragging] = useState(false);

    const handlePointerMove = (event) => {
        if (!isDragging) return

        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const newPoint = {
            x: Math.round(mposInv(event.clientX - rect.left)),
            y: Math.round(mposInv(event.clientY - rect.top)),
        };

        const nearest = nearTree.reduce((old, cur) => {
            return dist(cur.point, newPoint) < dist(old.point, newPoint) ? cur : old;
        });
        setPos(nearest.point);

        if (pointEq(nearest.point, target)) {
            mazeRef.current = new Maze(getDefaultMazeConfig(mazeW, mazeH))
            setTarget(target.x == 0 ? { x: mazeW - 1, y: mazeH - 1 } : { x: 0, y: 0 })
        }
    };

    const handlePointerDown = () => {
        setIsDragging(true);
    };

    const handlePointerUp = (event) => {
        setIsDragging(false);
        handlePointerMove(event);
    };

    return (
        <div ref={boundingRef}>
            <canvas
                ref={canvasRef}
                onPointerMove={handlePointerMove}
                onPointerDown={handlePointerDown}
                onPointerUp={handlePointerUp}
            />

            <br /><br />

            ※可以點擊預覽小點，也可以拖曳角色<br />
            ※走到底會更新迷宮，可以走回去

            <br /><br />

            <label>
                預覽步數
                <input
                    type="number"
                    style={{ width: '60px' }}
                    value={maxPreviewStep}
                    onChange={e => {
                        setMaxPreviewStep(Math.max(0, Math.floor(e.target.value)))
                    }}
                />
            </label>

            <label>
                顯示答案
                <input
                    type="checkbox"
                    checked={showAnswer}
                    onChange={e => { setShowAnswer(e.target.checked) }}
                />
            </label>

        </div>
    );
};

export default Game;