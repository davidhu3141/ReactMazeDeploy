import { useState, useEffect } from 'react';

//
// Array operations
//

function arrayGen(n, iFunc) {
    return Array(n).fill(0).map((e, i) => iFunc(i))
}

function shuffle(list, randGen) {
    for (let i = list.length - 1; i > 0; i--) {
        const j = randGen.nextInt(i + 1);
        [list[i], list[j]] = [list[j], list[i]];
    }
}


//
// Geometry
//    edge := {ax, ay, bx, by}
//    point := {x, y}
//

let edgeA = (e) => ({ x: e.ax, y: e.ay })
let edgeB = (e) => ({ x: e.bx, y: e.by })
let pointEq = (a, b) => a.x === b.x && a.y === b.y
let pointEqA = (p, edge) => p.x === edge.ax && p.y === edge.ay
let pointEqB = (p, edge) => p.x === edge.bx && p.y === edge.by
let cabDist = (x1, y1, x2, y2) => Math.abs(x1 - x2) + Math.abs(y1 - y2)
let dist = (p, q) => Math.hypot(p.x - q.x, p.y - q.y)


//
// Others
//

const useClientWidth = (parentRef) => {

    const [parentWidth, setParentWidth] = useState(0);

    useEffect(() => {
        const handleResize = () => {
            if (parentRef.current) {
                setParentWidth(parentRef.current.clientWidth - 40);
            }
        };

        handleResize();

        window.addEventListener('resize', handleResize);

        return () => { window.removeEventListener('resize', handleResize) };
    }, [parentRef]);

    return parentWidth;
};

const getDefaultMazeConfig = (mazeW, mazeH) => {
    return {
        seed: arrayGen(20, i => Math.floor(Math.random() * 10)).join(''),
        width: mazeW,
        height: mazeH,
        predefined: [],
        mainFiller: [
            { type: 'DFS', startPos: 'end' },
            { type: 'DFS', startPos: 'rand', probs: [2, 1, 3, 1] },
            { type: 'DFS', startPos: 'rand', probs: [2, 1, 3, 1] },
            { type: 'DFS', startPos: 'rand', probs: [2, 1, 3, 1] },
            { type: 'DFS', startPos: 'rand', probs: [2, 1, 3, 1] },
            { type: 'DFS', startPos: 'rand', probs: [2, 1, 3, 1] },
            { type: 'DFS', startPos: 'rand', probs: [2, 1, 3, 1] },
            // { type: 'BFS', startPos: 'rand', power: 0.01 },
        ]
    }
}

const getCanvasToolKit = ({ mazeWidth, mazeHeight, aisleWallPortion, canvasWidth }) => {

    // aisleWallPortion := aisleW / wallW
    // aisleW * mazeW + wallW * (mazeW + 1) = canvasWidth
    // ==> solve for aisleW 

    const aisleW = canvasWidth / (mazeWidth + (mazeWidth + 1) / aisleWallPortion)
    const wallW = aisleW / aisleWallPortion

    const canvasHeight = canvasWidth / (aisleW * mazeWidth + wallW * (mazeWidth + 1)) * (aisleW * mazeHeight + wallW * (mazeHeight + 1))

    const mpos = x => x * (aisleW + wallW) + wallW + aisleW / 2
    const mposInv = pix => (pix - (wallW + aisleW / 2)) / (aisleW + wallW)

    return {
        aisleW,
        wallW,
        canvasHeight,
        mpos,
        mposInv,
    }
}



export {
    arrayGen,
    shuffle,
    edgeA,
    edgeB,
    pointEq,
    pointEqA,
    pointEqB,
    cabDist,
    dist,
    useClientWidth,
    getDefaultMazeConfig,
    getCanvasToolKit,
}