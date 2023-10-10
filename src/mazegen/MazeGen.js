
import { DfsIterator, BfsIterator } from './TreeGen'
import { arrayGen, cabDist, edgeA, edgeB, pointEq, pointEqA, pointEqB, shuffle } from '../utils/Utils'
import { RandomGenerator } from '../utils/RandomGenerator';

class Maze {

    // rand gen
    seed = null;
    randGen = null;

    // dimension {width, height}
    width = null;
    height = null;

    // predefind: [{type, options}, ]
    // type := 'block', 'zigzag', 'wall', 'spiral'
    predefined = null

    // mainFiller: [{type, startPos}, ]
    // type := 'DFS', 'BFS'
    // startPos := 'start', 'rand', 'end'
    mainFiller = null

    // endFillerOptions
    endFillerOptions = null

    // maze essential
    edgeList = [];
    adjacency = null;
    answer = null;
    bicomponents = null;

    // hole
    holePortion = 0

    constructor(args) {

        this.seed = args.seed
        this.randGen = new RandomGenerator(args.seed)

        this.width = args.width
        this.height = args.height

        this.predefined = args.predefined
        this.mainFiller = args.mainFiller

        this.holePortion = args.holePortion || 0

        this.generateMaze()
    }

    generateMaze() {

        // Pre

        let mazeBoardPrefill = arrayGen(this.width, i => arrayGen(this.height, j => 0))
        let mazeBoardMain = arrayGen(this.width, i => arrayGen(this.height, j => 0))

        this.putPredefined(mazeBoardMain, mazeBoardPrefill, this.edgeList)

        // Prefill

        this.loopIJ((i, j) => {
            const e = mazeBoardPrefill[i][j];
            mazeBoardPrefill[i][j] = e === 0
                ? -1
                : i * this.height + j
        })

        let edgeListPrefill = this.fill(mazeBoardPrefill, true, []);

        // Main fillers

        let mainGens = this.mainFiller.map(fil => this.selectTreeGen(fil, mazeBoardMain))

        while (
            !mainGens
                .map(e => e.finished)
                .reduce((a, b) => a && b, true)
        ) {
            mainGens.forEach(e => e.iterate())
        }

        // Postfill

        let mazeBoardPost =
            arrayGen(this.width, i =>
                arrayGen(this.height, j => i * this.height + j)
            )

        this.edgeList = this.fill(
            mazeBoardPost,
            false,
            edgeListPrefill.concat(this.edgeList)
        )

        // Postprocessing

        this.genAdjacency()
        this.genBiconnectedComponents()

        this.answer = this.findPath({
            x: this.width - 1,
            y: this.height - 1
        })

    }

    putPredefined(mazeBoard, prefillBoard, edgeList) {

        this.predefined.forEach(p => {

            let boards = p.fill ? [mazeBoard, prefillBoard] : [mazeBoard]
            boards.forEach(board => {

                if (p.type === 'block') {
                    // fill
                    // position = 'center', 'rand'
                    //   if 'rand' => num

                } else if (p.type === 'zigzag') {
                    // fill
                    // num, direction (ltrb), randOpen

                } else if (p.type === 'wall') {
                    p.dist = p.dist || 10
                    p.width = p.width || 1
                    this.loopIJ((i, j) => {
                        if (Math.floor(i + p.dist / 2) % p.dist < p.width) board[i][j] = -1
                        if (j > this.height * 0.9 || j < this.height * 0.1) board[i][j] = 0
                    })
                } else if (p.type === 'circle') {
                    p.dist = p.dist || 10
                    p.width = p.width || 1
                    this.loopIJ((i, j) => {
                        const dist = Math.hypot(i - this.width / 2, j - this.height / 2)
                        if (dist % p.dist < p.width) board[i][j] = -1
                    })
                } else if (p.type === 'spiral') {
                    // fill
                    // level, direction (ltrb)

                } else if (p.type === 'grid') { // nouse
                    p.dist1 = p.dist1 || 10
                    p.dist2 = p.dist2 || 10
                    p.width = p.width || 1
                    this.loopIJ((i, j) => {
                        if (Math.floor(i + p.dist1 / 2) % p.dist1 < p.width) board[i][j] = -1
                        if (Math.floor(j + p.dist2 / 2) % p.dist2 < p.width) board[i][j] = -1
                    })
                }
            })
        })
    }

    selectTreeGen(fil, mazeBoardMain) {

        const startPosDict = {
            start: { x: 0, y: 0 },
            rand: { x: this.randGen.nextInt(this.width), y: this.randGen.nextInt(this.height) },
            end: { x: this.width - 1, y: this.height - 1 }
        }

        if (fil.type === 'DFS') {

            return new DfsIterator({
                probs: fil.probs,

                startPos: startPosDict[fil.startPos],
                maxStep: fil.maxStep,
                width: this.width,
                height: this.height,
                mazeBoard: mazeBoardMain,
                randGen: this.randGen,
                edgeList: this.edgeList
            })

        } else if (fil.type === 'BFS') {

            return new BfsIterator({
                power: fil.power,

                startPos: startPosDict[fil.startPos],
                maxStep: fil.maxStep,
                width: this.width,
                height: this.height,
                mazeBoard: mazeBoardMain,
                randGen: this.randGen,
                edgeList: this.edgeList
            })
        }
    }

    // connect all points in ...
    fill(board, fullConnect, preConcat) {

        let edgeListPre = (preConcat || [])
        let edgeListAll = [
            ...arrayGen(this.width, i =>
                arrayGen(this.height - 1, j => ({ ax: i, ay: j, bx: i, by: j + 1 }))
            ),
            ...arrayGen(this.width - 1, i =>
                arrayGen(this.height, j => ({ ax: i, ay: j, bx: i + 1, by: j }))
            )
        ].flat()

        if (!fullConnect) shuffle(edgeListAll, this.randGen);

        return edgeListPre
            .concat(edgeListAll)
            .filter((edge, index) => {

                const aVal = board[edge.ax][edge.ay]
                const bVal = board[edge.bx][edge.by]

                if (Math.min(aVal, bVal) < 0) return false;
                if (fullConnect) return true;

                if (aVal === bVal) {
                    // cycle gen
                    return index < edgeListPre.length || this.randGen.nextFloat() < this.holePortion;
                } else {
                    board.forEach(column => {
                        for (let i = 0; i < column.length; i++)
                            if (column[i] === aVal) column[i] = bVal
                    })
                    return true
                }
            })
    }

    genAdjacency() {
        this.adjacency = arrayGen(this.width, i =>
            arrayGen(this.height, j => [])
        )
        this.edgeList.forEach(edge => {
            this.adjacency[edge.ax][edge.ay].push(edgeB(edge))
            this.adjacency[edge.bx][edge.by].push(edgeA(edge))
        })
    }

    // util

    loopIJ(ijFunc) {
        for (let i = 0; i < this.width; i++) {
            for (let j = 0; j < this.height; j++) {
                ijFunc(i, j)
            }
        }
    }

    // Maze operations 

    findPath(goal) {

        // DFS + greedy-first

        let walked = arrayGen(this.width, i => arrayGen(this.height, j => false))
        let stack = [{ x: 0, y: 0 }]
        while (stack.length) {
            let last = stack[stack.length - 1]
            let nearWalkables = this.adjacency[last.x][last.y]
                .filter(nbhd => !walked[nbhd.x][nbhd.y])

            if (nearWalkables.length === 0) { stack.pop(); continue }

            let newStep = nearWalkables.reduce((old, cur) => {
                // 考量各只 cabDist 一次反而浪費 allocate 時間
                const curVal = cabDist(cur.x, cur.y, goal.x, goal.y)
                const oldVal = cabDist(old.x, old.y, goal.x, goal.y)
                return curVal < oldVal ? cur : old
            })
            if (pointEq(goal, newStep)) return stack;

            stack.push(newStep)
            walked[newStep.x][newStep.y] = true
        }
        return null
    }

    genNearSteps(pos, maxPreviewStep) {

        // BFS but no unshifting 

        let curIndex = 0
        let nearTree = [{
            point: pos,
            parentIndex: null,
            level: 0
        }]

        while (curIndex < nearTree.length && nearTree[curIndex].level < maxPreviewStep) {
            let old = nearTree[curIndex]
            this.adjacency[old.point.x][old.point.y]
                .filter(nbhd => {
                    const walked = nearTree.reduce(
                        (old, cur) => old || pointEq(cur.point, nbhd),
                        false
                    )
                    return !walked
                })
                .forEach(next => {
                    nearTree.push({
                        point: next,
                        parentIndex: curIndex,
                        level: old.level + 1
                    })
                })
            curIndex++
        }

        return nearTree
    }

    genBiconnectedComponents() {

        // prepare dfn

        let dfn = arrayGen(this.width, i => arrayGen(this.height, j => -1))
        let stack = [{ x: 0, y: 0 }]
        let currentDfn = 0
        dfn[0][0] = currentDfn++

        while (stack.length) {
            const last = stack[stack.length - 1]
            const nearWalkables = this.adjacency[last.x][last.y]
                .filter(nbhd => dfn[nbhd.x][nbhd.y] < 0)

            if (!nearWalkables.length) { stack.pop(); continue }

            const newPt = nearWalkables[0]
            dfn[newPt.x][newPt.y] = currentDfn++
            stack.push(newPt)
        }

        // prepare lowPt := lowest neighbor of all child, all neighbors, excluding self and parent
        // 這裡 articulation 沒算到 bicomponent 的底部，但剛好對了...

        let lowPt = arrayGen(this.width, i => arrayGen(this.height, j => -1))
        let articulation = arrayGen(this.width, i => arrayGen(this.height, j => false))
        stack = [{ x: 0, y: 0 }]
        lowPt[0][0] = 0

        while (stack.length) {

            let last = stack[stack.length - 1]
            let nearWalkables = this.adjacency[last.x][last.y]
                .filter(nbhd => lowPt[nbhd.x][nbhd.y] < 0)

            if (nearWalkables.length !== 0) {

                let newStep = nearWalkables[0]
                stack.push(newStep)
                lowPt[newStep.x][newStep.y] = Math.min(
                    ...this.adjacency[newStep.x][newStep.y]
                        .map(e => dfn[e.x][e.y])
                        .filter(e => e !== dfn[last.x][last.y])
                )

            } else {

                articulation[last.x][last.y] = lowPt[last.x][last.y] >= dfn[last.x][last.y]
                stack.pop()

                if (!stack.length) break;

                const parent = stack[stack.length - 1]
                lowPt[parent.x][parent.y] = Math.min(
                    lowPt[parent.x][parent.y],
                    lowPt[last.x][last.y]
                )
            }
        }

        // extract components

        let walked = arrayGen(this.width, i => arrayGen(this.height, j => false))
        let componentStack = [[]]
        this.bicomponents = []
        stack = [{ x: 0, y: 0 }]

        while (stack.length) {
            const last = stack[stack.length - 1]
            const nearWalkables = this.adjacency[last.x][last.y]
                .filter(nbhd => !walked[nbhd.x][nbhd.y])

            if (nearWalkables.length) {

                const newPt = nearWalkables[0]
                walked[newPt.x][newPt.y] = true
                stack.push(newPt)

                if (articulation[newPt.x][newPt.y])
                    componentStack.push([])

                componentStack[componentStack.length - 1].push(newPt)

            } else {

                if (articulation[last.x][last.y]) {
                    let newComp = componentStack.pop()
                    if (newComp.length > 1)
                        this.bicomponents.push(newComp)
                }
                stack.pop();
            }
        }

    }

}

export { Maze }