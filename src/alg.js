
const h = 10 / 150; // distance between points /
const lambda = 1

function forward_difference(xi, xi1, h) {
    return (xi1 - xi) / h
}

function backward_difference(xim1, xi, h) {
    return (xi - xim1) / h
}

function central_difference(xim1, xi1, h) {
    return (xi1 - xim1) / (2 * h)
}

const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

export function matrix_sum(a, b) {
    let res = JSON.parse(JSON.stringify(a))
    for (let i = 0; i < a.length; i++) {
        for (let j = 0; j < a[0].length; j++) {
            res[i][j] += b[i][j]
        }
    }
    return res
}

function compute_grad(i, j, matrix) {
    const dimx = matrix.length
    const dimy = matrix[0].length

    let diffx
    let diffy
    if (i === 0) {
        diffx = forward_difference(matrix[i][j], matrix[i + 1][j], h)
    } else if (i === dimx) {
        diffx = backward_difference(matrix[i - 1][j], matrix[i][j], h)
    } else {
        diffx = central_difference(matrix[i - 1][j], matrix[i + 1][j], h)
    }

    if (j === 0) {
        diffy = forward_difference(matrix[i][j], matrix[i][j + 1], h)
    } else if (j === dimy) {
        diffy = backward_difference(matrix[i][j - 1], matrix[i][j], h)
    } else {
        diffy = central_difference(matrix[i][j - 1], matrix[i][j + 1], h)
    }

    return {
        diffx,
        diffy
    }
}

function try_lower(i, j, delta, value, c) {
    const dimx = delta.length
    const dimy = delta[0].length

    if (i === clamp(i, 0, dimx) && j === clamp(j, 0, dimy))
        delta -= value * c
}

function lowering(i, j, delta, value) {
    const circle = [
        [ 0, 0, 1],
        [ 1, 0, 1],
        [ 0, 1, 1],
        [ -1, 0, 1],
        [ 0, -1, 1],
        [ 2, 0, 0.9],
        [ 0, 2, 0.9],
        [ -2, 0, 0.9],
        [ 0, -2, 0.9],
        [ 3, 0, 0.7],
        [ 0, 3, 0.7],
        [ -3, 0, 0.7],
        [ 0, -3, 0.7],
        [ 1, 1, 0.9],
        [ 1, -1, 0.9],
        [ -1, 1, 0.9],
        [ -1, -1, 0.9],
        [ 1, 2, 0.8],
        [ 1, -2, 0.8],
        [ -1, 2, 0.8],
        [ -1, -2, 0.8],
        [ -1, -2, 0.8],
        [ -1, 2, 0.8],
        [ 1, -2, 0.8],
        [ 1, 2, 0.8],
        [ 2, 2, 0.7],
        [ 2, -2, 0.7],
        [ -2, 2, 0.7],
        [ -2, -2, 0.7],
        [ 2, 3, 0.6],
        [ 2, -3, 0.6],
        [ -2, 3, 0.6],
        [ -2, -3, 0.6],
        [ -2, -3, 0.6],
        [ -2, 3, 0.6],
        [ 2, -3, 0.6],
        [ 2, 3, 0.6],
    ]
    circle.forEach((c)=> try_lower(i + c[0], j + c[1], delta, value, c[2]))
}

export function iter(i, j, matrix, upper, delta, cnt) {
    const dimx = matrix.length
    const dimy = matrix[0].length

    // 1 -- point affects lower plane
    // delta[i][j] -= upper[i][j]
    lowering(i, j, delta, upper[i][j])

    // 2 -- ascent
    const {
        diffx,
        diffy
    } = compute_grad(i, j, matrix) // must be delta
    console.log(`${diffx} ${diffy}`)

    const i_new = clamp(Math.round(i + lambda * diffx), 0, dimx)
    const j_new = clamp(Math.round(j + lambda * diffy), 0, dimy)
    console.log(`move ${i_new - i} ${j_new - j}`)

    if (cnt !== 0)
        iter(i_new, j_new, matrix, upper, delta, cnt - 1)
}
