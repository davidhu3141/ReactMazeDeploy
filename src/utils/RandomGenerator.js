
class RandomGenerator {

    seed = null;

    constructor(numStr20) {
        this.seed = numStr20.padStart(20, "12345678123456781234");
    }

    // return 0.001 ~ 0.999
    nextFloat() {
        return 0.001 * (this.nextIteration() + this.nextIteration() * 10 + this.nextIteration() * 100)
    }

    // return 0 ~ n-1
    nextInt(n) {
        return Math.floor(this.nextFloat() * n);
    }

    // return 0 ~ n-1
    nextIntWithPow(n, power) {
        return Math.floor(Math.pow(this.nextFloat(), power) * n);
    }

    //return 0 ~ 99
    nextIteration() {
        const next = [11, 13, 14, 16, 17, 19]
            .map(e => parseInt(this.seed[e]))
            .reduce((a, b) => a + b)
        this.seed = ((next + 7) % 10) + this.seed.substring(0, 19)
        return parseInt(this.seed[19])
    }
}

export { RandomGenerator }
