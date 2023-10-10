import React, { useEffect, useRef, useState } from 'react';
import { dist, getCanvasToolKit, getDefaultMazeConfig, pointEq, useClientWidth } from '../utils/Utils';
import { Maze } from '../mazegen/MazeGen';


const GameAnim = () => {

    const pathRoundCap = false
    const pathWallColor = '#000000'
    const pathGroundColor = '#ffffff'

    const stepRoundHint = true
    const stepHintColor = '#0000ff66'

    const playerColor = '#0000ff'

    const answerColor = '#00000035'
    const answerWidthFactor = 0.8

    const maxPreviewStep = 15;
    const aisleWallPortion = 3.6;
    const mazeW = 38
    const mazeH = 18

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

    const stepsPerSecond = 8
    let stepProgressRef = useRef(0)
    let routeRef = useRef(null)
    routeRef.current = routeRef.current || []
    let isAnimating = () => routeRef.current.length > 0

    useEffect(() => {
        paintAndSetPos()
    }, [pos, canvasWidth]);


    let paintAndSetPos = () => {
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

        // paint answer
        paintAnswer(ctx)

        // paint player
        if (isAnimating()) {

            // increase progress
            while (stepProgressRef.current >= 1) {
                // 需要跳過一些步數，讓 stepProgressRef 回到 0~1 之間
                stepProgressRef.current -= 1
                routeRef.current.pop()
                // 結束動畫
                if (routeRef.current.length == 1) {
                    let newPos = routeRef.current.pop()
                    setPos(newPos)
                    if (pointEq(newPos, target)) {
                        mazeRef.current = new Maze(getDefaultMazeConfig(mazeW, mazeH))
                        setTarget(target.x == 0 ? { x: mazeW - 1, y: mazeH - 1 } : { x: 0, y: 0 })
                    }

                    return
                }
            }
            const slowdownModifier = Math.pow((routeRef.current.length - 0.4) / 10, 0.5)
            stepProgressRef.current += stepsPerSecond / 30 * slowdownModifier
            paintPlayerAnim(ctx)
            requestAnimationFrame(paintAndSetPos)

        } else {

            // paint step
            ctx.lineCap = stepRoundHint ? 'round' : 'square';
            ctx.strokeStyle = stepHintColor;
            ctx.lineWidth = aisleW / 3;
            nearTree.forEach(node => {
                ctx.beginPath();
                ctx.moveTo(mpos(node.point.x), mpos(node.point.y))
                ctx.lineTo(mpos(node.point.x + 0.001), mpos(node.point.y + 0.001))
                ctx.stroke();
            })

            paintPlayer(ctx)
        }
    }

    let paintAnswer = (ctx) => {
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

    let paintPlayer = (ctx) => {
        ctx.strokeStyle = playerColor
        ctx.lineCap = 'round'
        ctx.lineWidth = aisleW * answerWidthFactor// - 0.5
        ctx.beginPath();
        ctx.moveTo(mpos(pos.x), mpos(pos.y));
        ctx.lineTo(mpos(pos.x + 0.001), mpos(pos.y + 0.001));
        ctx.stroke();
    }

    let paintPlayerAnim = (ctx) => {
        let last = routeRef.current[routeRef.current.length - 1]
        let last2 = routeRef.current[routeRef.current.length - 2]
        let t = stepProgressRef.current
        let newX = last2.x * t + last.x * (1 - t)
        let newY = last2.y * t + last.y * (1 - t)
        ctx.strokeStyle = playerColor
        ctx.lineCap = 'round'
        ctx.lineWidth = aisleW * answerWidthFactor//- 0.5
        ctx.beginPath();
        ctx.moveTo(mpos(newX), mpos(newY));
        ctx.lineTo(mpos(newX + 0.001), mpos(newY + 0.001));
        ctx.stroke();
    }

    const handlePointerUp = (event) => {

        if (isAnimating()) return

        const rect = canvasRef.current.getBoundingClientRect();
        const newPoint = {
            x: Math.round(mposInv(event.clientX - rect.left)),
            y: Math.round(mposInv(event.clientY - rect.top)),
        };

        let nearest = nearTree.reduce((old, cur) => {
            return dist(cur.point, newPoint) < dist(old.point, newPoint) ? cur : old;
        });

        if (pointEq(pos, nearest.point)) return

        routeRef.current = [nearest]
        while (nearest.parentIndex != null) {
            nearest = nearTree[nearest.parentIndex]
            routeRef.current.push(nearest)
        }
        routeRef.current = routeRef.current.map(e => e.point)

        paintAndSetPos()
    };

    return (
        <div ref={boundingRef}>

            <canvas ref={canvasRef} onPointerUp={handlePointerUp} />

            <br />

            ※點擊預覽小點以移動<br></br>
            ※走到底會更新迷宮，可以走回去

            <br />

            {/* show answer 要改成移動期間不可按 */}

        </div>
    );
};

export default GameAnim;