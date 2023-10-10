import React, { useEffect, useRef, useState } from 'react';
import { useClientWidth } from '../utils/Utils';

const arrayGen2D = (n, m, ijFunc) =>
    Array(n).fill(0).map((_, i) =>
        Array(m).fill(0).map((_, j) =>
            ijFunc(i, j)
        )
    )

const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y)

const MinimalGame = () => {

    const boundingRef = useRef(null)
    const canvasRef = useRef(null)
    const mazeRef = useRef(null)
    mazeRef.current = mazeRef.current || new SmallMaze()
    const maze = mazeRef.current;

    const [pos, setPos] = useState({ x: 0, y: 0 })
    const [target, setTarget] = useState({ x: maze.width - 1, y: maze.height - 1 })
    const [isDragging, setIsDragging] = useState(false);

    const canvasWidth = useClientWidth(boundingRef);
    const gridSize = canvasWidth / maze.width
    const aisleWidth = gridSize * 0.7
    const playerSize = aisleWidth * 0.8

    // abstract position to canvas position (and converting back)
    const mpos = x => (x + 0.5) * gridSize
    const mposInv = u => u / gridSize - 0.5

    useEffect(() => {

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        canvas.width = canvasWidth;
        canvas.height = gridSize * maze.height;

        ctx.fillStyle = "#000000"
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.lineCap = 'square'
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = aisleWidth

        // paint maze
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

        // paint player
        ctx.lineCap = 'round'
        ctx.strokeStyle = '#0000ff'
        ctx.lineWidth = playerSize
        ctx.beginPath();
        ctx.moveTo(mpos(pos.x), mpos(pos.y));
        ctx.lineTo(mpos(pos.x), mpos(pos.y + 0.001));
        ctx.stroke();

    }, [pos, canvasWidth]);

    const handlePointerMove = (event) => {
        if (!isDragging) return

        const rect = canvasRef.current.getBoundingClientRect();
        const mouse = {
            x: Math.round(mposInv(event.clientX - rect.left)),
            y: Math.round(mposInv(event.clientY - rect.top)),
        };

        const nearest = maze.adjacency[pos.x][pos.y]
            .reduce((old, cur) => {
                return dist(cur, mouse) < dist(old, mouse) ? cur : old;
            }, pos);

        setPos(nearest);

        if (nearest.x === target.x && nearest.y === target.y) {
            mazeRef.current = new SmallMaze()
            setTarget(
                target.x == 0
                    ? { x: maze.width - 1, y: maze.height - 1 }
                    : { x: 0, y: 0 }
            )
        }
    };

    return (
        <div ref={boundingRef}>
            <canvas
                ref={canvasRef}
                onPointerMove={handlePointerMove}
                onPointerDown={() => { setIsDragging(true); }}
                onPointerUp={(e) => { setIsDragging(false); handlePointerMove(e); }}
            /><br /><br />

            ※拖曳角色以遊玩。走到底會更新迷宮，可以走回去
        </div>
    );
};

export default MinimalGame;

class SmallMaze {

    width = 18;
    height = 8;

    edgeList = [];
    adjacency = null;

    constructor() {

        // graph traversal: depth-fisrt search

        let stack = [{ x: this.width - 1, y: this.height - 1 }]
        let walked = arrayGen2D(this.width, this.height, () => false);

        while (stack.length) {

            let curX = stack[stack.length - 1].x
            let curY = stack[stack.length - 1].y

            walked[curX][curY] = true

            let nextList = [
                { x: curX - 1, y: curY }, { x: curX, y: curY - 1 },
                { x: curX + 1, y: curY }, { x: curX, y: curY + 1 }
            ]
                .filter(e => {
                    if (e.x < 0 || e.x >= this.width) return false;
                    if (e.y < 0 || e.y >= this.height) return false;
                    return !walked[e.x][e.y];
                })

            if (nextList.length) {

                let next = nextList[Math.floor(Math.random() * nextList.length)]

                this.edgeList.push({ ax: curX, ay: curY, bx: next.x, by: next.y })
                stack.push({ x: next.x, y: next.y })

            } else stack.pop()

        }

        // compute adjacency

        this.adjacency = arrayGen2D(this.width, this.height, () => [])
        this.edgeList.forEach(edge => {
            this.adjacency[edge.ax][edge.ay].push({ x: edge.bx, y: edge.by })
            this.adjacency[edge.bx][edge.by].push({ x: edge.ax, y: edge.ay })
        })

    }

}