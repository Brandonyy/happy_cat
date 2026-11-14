import { _decorator, Component, Node } from 'cc';
import { wupinMgr } from './wupinMgr';
import { bendiUtil } from '../utils/bendiUtil';
import { wupinType } from '../configs/wupinType';
const { ccclass, property } = _decorator;
const log = 'tujiMgr';
@ccclass('tujiMgr')
export class tujiMgr extends Component {
    private static yijingJiesuoArr: number[] = [];

    /** 初始化图鉴管理器。 */
    static init(): void {
        this.yijingJiesuoArr = bendiUtil.getObj('yijingJiesuoArr', []);
    }

    /** 获取已获取图鉴的数量。 */
    static getNum(): number {
        let collectionCount: number = 0;
        const items = wupinMgr.WupinDic;
        for (const key in wupinMgr.WupinDic) {
            if (Object.prototype.hasOwnProperty.call(items, key)) {
                const itemId: number = Number(key);
                const itemType = wupinMgr.getType(itemId);
                if (itemType === wupinType.cangpin) collectionCount++;
            }
        }
        return collectionCount;
    }

    /** 检查是否有可解锁的图鉴。 */
    public static hasCanjiesuo(): boolean {
        return this.getNum() > this.yijingJiesuoArr.length;
    }

    /** 添加一个图鉴到物品管理器中。 */
    static addTuji(id: number): void {
        if (this.jianchaTuji(id)) {
            console.log(log, `已有id为${id}的图鉴`);
            return;
        }
        wupinMgr.setWupin(id, 1);
    }

    /** 解锁指定ID的图鉴。 */
    public static jiesuoTuji(id: number): void {
        if (this.shifouJiesuo(id)) {
            console.log(log, `已解锁id为${id}的图鉴`);
            return;
        }
        this.yijingJiesuoArr.push(id);
        this.yijingJiesuoArr.sort();
        bendiUtil.setObj('yijingJiesuoArr', this.yijingJiesuoArr);
    }

    /** 检查指定ID的图鉴是否已解锁。 */
    static shifouJiesuo(id: number): boolean {
        return this.yijingJiesuoArr.includes(id);
    }

    /** 检查指定ID的图鉴是否可以解锁。 */
    static nengJiesuo(id: number): boolean {
        return this.jianchaTuji(id) && !this.yijingJiesuoArr.includes(id);
    }

    /** 检查指定ID的图鉴是否存在。 */
    static jianchaTuji(id: number): boolean {
        return !!wupinMgr.WupinDic[id];
    }
}
