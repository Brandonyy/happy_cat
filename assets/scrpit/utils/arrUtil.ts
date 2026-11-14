import { math } from 'cc';

/** 按累计权重选择索引；区间边界沿用原来的双闭区间规则。 */
export function suijiQuanzhong(weights: number[]) {
    if (!weights || weights.length <= 0) return -1;
    const cumulativeWeights: number[] = [0];
    let totalWeight = 0;
    for (let i = 0; i < weights.length; i++) {
        const weight = weights[i];
        totalWeight += weight;
        cumulativeWeights.push(cumulativeWeights[i] + weight);
    }
    const randomWeight = math.randomRange(0, totalWeight);
    for (let i = 0; i < cumulativeWeights.length; i++) {
        if (randomWeight >= cumulativeWeights[i] && randomWeight <= cumulativeWeights[i + 1]) {
            return i;
        }
    }
    return -1;
}

/** 按原数组的索引移除元素；没有待移除索引时返回原数组。 */
export function deleteIndexYs(arr: any[], indices: number[]) {
    if (!indices || indices.length <= 0) return arr;
    const result: any[] = [];
    const removedIndices = new Set(indices);
    for (let i = 0; i < arr.length; i++) {
        if (!removedIndices.has(i)) result.push(arr[i]);
    }
    return result;
}

/**
 * 找出连续相同元素的消除索引，并返回移除后的数组。
 * 连续长度超过 minCnt 时，仍按原规则记录重叠分组，不额外切分。
 */
export function deleteXiangtong(arr: any[], minCnt: number, callback?: Function) {
    if (!callback) callback = (a, b) => a === b;
    const deleteIndexArr: number[][] = [];
    const removedIndices: number[] = [];
    let consecutiveCount = 1;
    for (let i = 1; i < arr.length; i++) {
        const isSame: boolean = callback(arr[i], arr[i - 1]);
        if (isSame) {
            consecutiveCount++;
            if (consecutiveCount >= minCnt) {
                const groupIndices: number[] = [];
                deleteIndexArr.push(groupIndices);
                for (let j = 0; j < minCnt; j++) {
                    const index = i + j - consecutiveCount + 1;
                    groupIndices.push(index);
                    removedIndices.push(index);
                }
            }
        } else {
            consecutiveCount = 1;
        }
    }
    arr = deleteIndexYs(arr, removedIndices);
    return { deleteIndexArr, arr };
}

/** 原地洗牌，不返回新数组。 */
export function daluanArr(arr) {
    if (!arr || arr.length <= 1) return;
    for (let i = arr.length - 1; i > 0; i--) {
        const randomIndex = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[randomIndex]] = [arr[randomIndex], arr[i]];
    }
}

/** 随机取一个元素；调用方须传入数组，空数组返回 null。 */
export function suijiYuansu(arr) {
    if (arr.length <= 0) return null;
    if (!arr) return null;
    const index = Math.floor(Math.random() * arr.length);
    return arr[index];
}

/** 保留现有调用入口，共用相同的索引移除规则。 */
export function deleteMultIndex(arr: any[], indices: number[]) {
    return deleteIndexYs(arr, indices);
}
