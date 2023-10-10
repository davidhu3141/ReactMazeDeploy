
import { shuffle } from "../utils/Utils";

class TreeGen {

    finished = false;

    maxStep;
    randGen; mazeBoard; edgeList;
    width; height;

    constructor(args) {
        this.maxStep = args.maxStep || Infinity

        this.randGen = args.randGen
        this.mazeBoard = args.mazeBoard
        this.mazeBoard[args.startPos.x][args.startPos.y] = -1
        this.edgeList = args.edgeList

        this.width = args.width
        this.height = args.height
    }

    iterate() { throw new Error("not implemented") }

}

class DfsIterator extends TreeGen {

    stack; probs;

    constructor(args) {
        super(args)
        this.stack = [args.startPos]
        this.probs = args.probs || [1, 1, 1, 1]
    }

    iterate() {

        if (this.stack.length == 0) return this.finished = true;
        if (this.maxStep-- <= 0) return this.finished = true;

        let curX = this.stack[this.stack.length - 1].x
        let curY = this.stack[this.stack.length - 1].y

        let nextList = [
            { x: curX - 1, y: curY, prob: this.probs[0] },
            { x: curX + 1, y: curY, prob: this.probs[1] },
            { y: curY - 1, x: curX, prob: this.probs[2] },
            { y: curY + 1, x: curX, prob: this.probs[3] }
        ]

        nextList.forEach(e => {
            if (e.x < 0 || e.x >= this.width) return e.prob = 0;
            if (e.y < 0 || e.y >= this.height) return e.prob = 0;
            if (this.mazeBoard[e.x][e.y] < 0) return e.prob = 0;
        })

        let probSum = nextList.map(e => e.prob).reduce((a, b) => a + b)
        if (probSum > 0) {

            let dice = this.randGen.nextFloat() * probSum
            let next

            for (; dice >= 0; dice -= next.prob) next = nextList.pop();

            this.edgeList.push({ ax: curX, ay: curY, bx: next.x, by: next.y })
            this.stack.push({ x: next.x, y: next.y })
            this.mazeBoard[next.x][next.y] = -1

        } else this.stack.pop()

    }

}

class BfsIterator extends TreeGen {

    queue; power;

    constructor(args) {
        super(args)
        this.queue = [args.startPos]
        this.power = args.power || 1
    }

    iterate() {

        if (this.queue.length == 0) return this.finished = true;
        if (this.maxStep-- <= 0) return this.finished = true;

        let q = this.queue.splice(
            this.randGen.nextIntWithPow(this.queue.length, this.power), 1
        )[0]

        let nextList = [
            { x: q.x - 1, y: q.y },
            { x: q.x + 1, y: q.y },
            { y: q.y - 1, x: q.x },
            { y: q.y + 1, x: q.x }
        ]

        nextList = nextList
            .map(e => {
                if (e.x < 0 || e.x >= this.width) return null;
                if (e.y < 0 || e.y >= this.height) return null;
                if (this.mazeBoard[e.x][e.y] < 0) return null;
                return e
            })
            .filter(e => e != null)

        shuffle(nextList, this.randGen)

        nextList.forEach(e => {
            this.mazeBoard[e.x][e.y] = -1
            this.edgeList.push({ ax: q.x, ay: q.y, bx: e.x, by: e.y })
            this.queue.push({ x: e.x, y: e.y })
        })

    }

}

export { DfsIterator, BfsIterator }