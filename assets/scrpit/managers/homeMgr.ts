import { _decorator, Component, Node } from 'cc';
import { deleteIndexYs, suijiYuansu } from '../utils/arrUtil';
import { bendiUtil } from '../utils/bendiUtil';
const { ccclass, property } = _decorator;
@ccclass('homeMgr')
export class homeMgr extends Component {
    private static unlockedHome: { [homeId: number]: number[] } = {};

    static init() {
        this.unlockedHome = bendiUtil.getObj('unJiesuoHome', { 0: [] });
    }

    /** 检查所有家园是否解锁完成 */
    static isQuanbuJiesuo(): boolean {
        const unlockedParts: number[] = this.unlockedHome[2];
        if (!unlockedParts) return false;
        return unlockedParts.length >= 9;
    }

    /** 检查部件是否已解锁；尚无该家园记录时沿用 null 返回值。 */
    static isUnJiesuo(id: number, idx: number): boolean {
        const unlockedParts: number[] = this.unlockedHome[id];
        if (!unlockedParts) return null;
        return unlockedParts.includes(idx);
    }

    /** 检查指定家园是否可以解锁。 */
    static canJiesuo(id: number): boolean {
        if (id <= 0) return true;
        const previousHomeId: number = id - 1;
        const unlockedParts: number[] = this.unlockedHome[previousHomeId];
        if (!unlockedParts) return false;
        return unlockedParts.length >= 9;
    }

    /** 检查指定家园的所有部件是否已解锁。 */
    static isAllJiesuo(id: number): boolean {
        const unlockedParts: number[] = this.unlockedHome[id];
        if (!unlockedParts) return false;
        return unlockedParts.length >= 9;
    }

    /** 解锁指定家园的一个部件。 */
    static jiesuo(id: number): void {
        if (!this.unlockedHome.hasOwnProperty(id)) {
            this.unlockedHome[id] = [];
        }
        const unlockedParts: number[] = this.unlockedHome[id];
        const lockedParts: number[] = deleteIndexYs([0, 1, 2, 3, 4, 5, 6, 7, 8], unlockedParts);
        if (lockedParts.length <= 0) {
            return;
        }
        const partIndex: number = suijiYuansu(lockedParts);
        unlockedParts.push(partIndex);
        unlockedParts.sort();
        bendiUtil.setObj('unJiesuoHome', this.unlockedHome);
    }
}
