import { _decorator, Component, Node } from 'cc';
import { deleteIndexYs, suijiYuansu } from '../utils/arrUtil';
import { bendiUtil } from '../utils/bendiUtil';
const { ccclass, property } = _decorator;

@ccclass('homeMgr')
export class homeMgr extends Component {
    // 家园的解锁部件数组
    private static unlockedHome: Object = {}
    static init() {
        // 初始化unlockedHome对象
        this.unlockedHome = bendiUtil.getObj('unJiesuoHome', { 0: [] })
    }
    /**
     * 检查所有家园是否解锁完成
     */
    static isQuanbuJiesuo(): boolean {
        // 检查最后一个家园是否解锁完成
        const unlockedArr: number[] = this.unlockedHome[2]
        // 如果解锁部件数组不存在，则返回false
        if (!unlockedArr) return false
        // 检查解锁部件数组的长度是否大于等于9
        return unlockedArr.length >= 9
    }
    /**
* 检查指定家园的指定部件是否已解锁。
* 该方法会获取指定家园的解锁部件数组，然后检查该数组中是否包含指定的部件索引。
* @param id - 要检查的家园ID。
* @param idx - 要检查的部件索引。
* @returns 如果部件已解锁，则返回true；否则返回false。
*/
    static isUnJiesuo(id: number, idx: number): boolean {
        // 获取指定家园的解锁部件数组
        const unlockedArr: number[] = this.unlockedHome[id]
        // 如果解锁部件数组不存在，则返回null
        if (!unlockedArr) return null
        // 检查解锁部件数组中是否包含指定的部件索引
        return unlockedArr.includes(idx)
    }
    /**
   * 检查指定家园是否可以解锁。
   * 该方法会检查指定家园的前一个家园是否所有部件都已解锁。
   * 如果指定家园的ID小于等于0，则直接返回true。
   * @param id - 要检查的家园ID。
   * @returns 如果家园可以解锁，则返回true；否则返回false。
   */
    static canJiesuo(id: number): boolean {
        // 如果家园ID小于等于0，则直接返回true
        if (id <= 0) return true
        // 获取前一个家园的ID
        const preId: number = id - 1
        // 获取前一个家园的解锁部件数组
        const unlockedArr: number[] = this.unlockedHome[preId]
        // 如果解锁部件数组不存在，则返回false
        if (!unlockedArr) return false
        // 检查解锁部件数组的长度是否大于等于9
        return unlockedArr.length >= 9
    }
    /**
* 检查指定家园的所有部件是否已解锁。
* 该方法会获取指定家园的解锁部件数组，然后检查该数组的长度是否大于等于9。
* @param id - 要检查的家园ID。
* @returns 如果所有部件都已解锁，则返回true；否则返回false。
*/
    static isAllJiesuo(id: number): boolean {
        // 获取指定家园的解锁部件数组
        const unlockedArr: number[] = this.unlockedHome[id]
        // 如果解锁部件数组不存在，则返回false
        if (!unlockedArr) return false
        // 检查解锁部件数组的长度是否大于等于9
        return unlockedArr.length >= 9
    }
    /**
* 解锁指定家园的一个部件。
* 该方法会检查指定家园是否已存在解锁部件的数组，如果不存在则创建一个新的数组。
* 然后，它会从剩余的部件中随机选择一个进行解锁，并将其添加到解锁部件的数组中。
* 最后，它会将更新后的解锁部件数组保存到本地存储中，并记录解锁事件。
* @param id - 要解锁部件的家园ID。
*/
    static jiesuo(id: number): void {
        // 检查指定家园是否已存在解锁部件的数组，如果不存在则创建一个新的数组
        if (!this.unlockedHome.hasOwnProperty(id)) {
            this.unlockedHome[id] = []
        }
        // 获取指定家园的解锁部件数组
        const unlockedArr: number[] = this.unlockedHome[id]
        // 从剩余的部件中移除已解锁的部件，得到剩余的部件数组
        const restArr: number[] = deleteIndexYs([0, 1, 2, 3, 4, 5, 6, 7, 8], unlockedArr)
        // 如果剩余的部件数组为空，则直接返回
        if (restArr.length <= 0) {
            return
        }
        // 从剩余的部件数组中随机选择一个部件进行解锁
        const idx: number = suijiYuansu(restArr)
        // 将解锁的部件添加到解锁部件的数组中
        unlockedArr.push(idx)
        // 对解锁部件的数组进行排序
        unlockedArr.sort()
        // 将更新后的解锁部件数组保存到本地存储中
        bendiUtil.setObj('unJiesuoHome', this.unlockedHome)
    }
}


