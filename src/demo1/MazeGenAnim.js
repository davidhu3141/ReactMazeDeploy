import React, { useEffect, useState, useRef } from 'react';
import { getCanvasToolKit, useClientWidth } from '../utils/Utils';


function getRandomColor() {
    const red = Math.floor(Math.random() * 256);
    const green = Math.floor(Math.random() * 256);
    const blue = Math.floor(Math.random() * 256);
    return `rgb(${red},${green},${blue},0.3)`;
}

function MazeGenAnim({ newMaze, paintDelay, showAnswer, showBiconnected, pathRoundCap }) {

    const boundingRef = useRef(null)
    const canvasRef = useRef(null);
    const paintTasksRef = useRef([]);

    const canvasWidth = useClientWidth(boundingRef);
    const aisleWallPortion = 3.6

    const maze = newMaze;

    useEffect(() => {

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        let { aisleW, wallW, canvasHeight, mpos } = getCanvasToolKit({
            mazeWidth: maze.width,
            mazeHeight: maze.height,
            aisleWallPortion,
            canvasWidth
        })

        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        ctx.fillStyle = '#000000'
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = '#ffffff';
        ctx.lineCap = pathRoundCap ? 'round' : 'square';
        ctx.lineWidth = aisleW;

        let edgePainter = (edge) => {
            // return runnable
            return () => {
                ctx.beginPath();
                ctx.moveTo(mpos(edge.ax), mpos(edge.ay));
                ctx.lineTo(mpos(edge.bx), mpos(edge.by));
                ctx.stroke();
            }
        }

        paintTasksRef.current = maze.edgeList
            .concat([
                { ax: 0, ay: -1, bx: 0, by: 0 },
                { ax: maze.width - 1, ay: maze.height - 1, bx: maze.width - 1, by: maze.height }
            ])
            .map((e, i) => setTimeout(edgePainter(e), i * paintDelay,))

        if (showAnswer)
            paintTasksRef.current.push(
                setTimeout(() => {
                    ctx.strokeStyle = '#00000055';
                    ctx.lineWidth = aisleW / 3;
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
                }, paintTasksRef.current.length * paintDelay)
            )

        if (showBiconnected)

            paintTasksRef.current.push(
                setTimeout(() => {
                    ctx.lineWidth = aisleW + wallW;
                    ctx.lineCap = 'square'
                    maze.bicomponents.forEach(com => {
                        ctx.strokeStyle = getRandomColor()
                        ctx.beginPath();
                        com.forEach(node => {
                            ctx.moveTo(mpos(node.x), mpos(node.y))
                            ctx.lineTo(mpos(node.x), mpos(node.y) + 0.1)
                        })
                        ctx.stroke();
                    })

                }, paintTasksRef.current.length * paintDelay)
            )

        return () => {
            paintTasksRef.current.forEach(taskId => {
                clearTimeout(taskId);
            });
            paintTasksRef.current = [];
        }

    }, [newMaze, canvasWidth]);

    return (
        <div ref={boundingRef}>
            <canvas ref={canvasRef} />
        </div>
    );
}

MazeGenAnim.defaultProps = {
    paintDelay: 0.5,
    pathRoundCap: false,
    showBiconnected: true,
    showAnswer: false,
}

export default MazeGenAnim;
