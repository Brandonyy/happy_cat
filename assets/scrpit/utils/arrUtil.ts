import { _decorator, Component, math, Node } from 'cc';
const { ccclass, property } = _decorator;
//源码网站 开vpn全局模式打开 https://web3incubators.com/
//客服联系方式 https://web3incubators.com/kefu.html



/**
     * 根据权重数组随机选择一个索引。
     * @param weight_arr - 权重数组，每个元素表示对应索引的权重。
     * @returns 随机选择的索引，如果权重数组无效则返回-1。
     */

export function suijiQuanzhong(qzArr: number[]) {
    // 检查权重数组是否为空
    if (!qzArr) return -1
    // 检查权重数组是否为空数组
    if (qzArr.length <= 0) return -1
    // 创建一个数组来存储累计权重
    const arr: number[] = [0]
    // 初始化总权重为0
    let zongQuanzhong: number = 0
    // 遍历权重数组，计算累计权重
    for (let i = 0; i < qzArr.length; i++) {
        const weight: number = qzArr[i];
        zongQuanzhong += weight
        arr.push(arr[i] + weight)
    }
    // 在总权重范围内生成一个随机数
    const w: number = math.randomRange(0, zongQuanzhong)
    // 遍历累计权重数组，找到随机数所在的区间，返回对应的索引
    for (let i = 0; i < arr.length; i++) {
        if (w >= arr[i] && w <= arr[i + 1]) return i
    }
    // 如果没有找到对应的索引，则返回-1
    return -1
}

/**
  * 从数组中移除多个指定索引的元素
  * @param arr - 要处理的数组
  * @param indices - 要移除的索引数组
  * @returns 移除指定索引元素后的数组
  */
export function deleteIndexYs(arr: any[], indices: number[]) {
    // 如果索引数组不存在，则直接返回原数组
    if (!indices) return arr
    // 如果索引数组长度为 0，则直接返回原数组
    if (indices.length <= 0) return arr
    // 创建一个新数组，用于存储移除指定索引元素后的结果
    const result: any[] = [];
    // 创建一个 Set 集合，用于存储已经移除的索引，以提高查找效率
    const removedIndices: Set<number> = new Set(indices);
    // 遍历原数组
    for (let i = 0; i < arr.length; i++) {
        // 如果当前索引不在已移除索引集合中，则将当前元素添加到结果数组中
        if (!removedIndices.has(i)) {
            result.push(arr[i]);
        }
    }
    // 如果当前索引不在已移除索引集合中，则将当前元素添加到结果数组中
    return result;
}

/**
    * 从数组中移除连续出现次数达到指定次数的相同元素
    * @param arr - 要处理的数组
    * @param minCnt - 连续出现的最小次数
    * @param callback - 比较函数，用于判断元素是否相同
    * @returns 一个对象，包含移除的索引数组和处理后的数组
    */
export function deleteXiangtong(arr: any[], minCnt: number, callback?: Function) {
    // 如果没有提供比较函数，则使用默认的比较函数
    if (!callback) {
        callback = (a, b) => {
            return a === b
        }
    }
    // 用于存储需要移除的索引数组
    const deleteIndexArr: number[][] = []
    // 用于存储需要移除的索引数组
    const delIndexArr: number[] = []
    // 用于记录当前连续相同元素的个数
    let xiangtongNum: number = 1
    // 遍历数组
    for (let i = 1; i < arr.length; i++) {
        // 判断当前元素与前一个元素是否相同
        const isSame: boolean = callback(arr[i], arr[i - 1])
        if (isSame) {
            // 如果相同，连续相同元素的个数加一
            xiangtongNum++
            // 如果连续相同元素的个数达到指定次数
            if (xiangtongNum >= minCnt) {
                // 创建一个新的数组，用于存储需要移除的索引
                const indexArr: number[] = []
                // 将需要移除的索引添加到数组中
                deleteIndexArr.push(indexArr)
                // 遍历指定次数，将需要移除的索引添加到数组中
                for (let j = 0; j < minCnt; j++) {
                    const idx: number = i + j - xiangtongNum + 1
                    indexArr.push(idx)
                    delIndexArr.push(idx)
                }
            }
        } else {
            // 遍历指定次数，将需要移除的索引添加到数组中
            xiangtongNum = 1
        }
    }
    // 使用 removeMultiIdx 方法移除数组中指定的索引元素
    arr = deleteIndexYs(arr, delIndexArr)
    return { deleteIndexArr, arr }
}
/**
 * 随机打乱数组的顺序
 */
export function daluanArr(arr) {
    // 如果数组不存在或长度小于等于 1，则直接返回
    if (!arr || arr.length <= 1) return;
    // 如果数组不存在或长度小于等于 1，则直接返回
    for (let i = arr.length - 1; i > 0; i--) {
        // 生成一个随机索引 j，其值为当前索引 i 之前的任意整数
        const j = Math.floor(Math.random() * (i + 1));
        // 交换数组中索引为 i 和 j 的元素
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
}

/**
* 从数组中随机选择一个元素
*/
export function suijiYuansu(arr) {
    // 如果数组长度为 0，则返回 null
    if (arr.length <= 0) return null
    // 如果数组不存在，则返回 null
    if (!arr) return null
    // 生成一个随机索引
    let index: number = Math.floor(Math.random() * arr.length)
    // 返回数组中随机索引位置的元素
    return arr[index]
}

/**
  * 从数组中移除多个指定索引的元素
  * @param arr - 要处理的数组
  * @param indices - 要移除的索引数组
  * @returns 移除指定索引元素后的数组
  */
export function deleteMultIndex(arr: any[], indices: number[]) {
    // 如果索引数组不存在，则直接返回原数组
    if (!indices) return arr
    // 如果索引数组长度为 0，则直接返回原数组
    if (indices.length <= 0) return arr
    // 创建一个新数组，用于存储移除指定索引元素后的结果
    const result: any[] = [];
    // 创建一个 Set 集合，用于存储已经移除的索引，以提高查找效率
    const removedIndices: Set<number> = new Set(indices);
    // 遍历原数组
    for (let i = 0; i < arr.length; i++) {
        // 如果当前索引不在已移除索引集合中，则将当前元素添加到结果数组中
        if (!removedIndices.has(i)) {
            result.push(arr[i]);
        }
    }
    // 如果当前索引不在已移除索引集合中，则将当前元素添加到结果数组中
    return result;
}

