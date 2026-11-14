import { _decorator, Component, Node } from 'cc';
import { bendiUtil } from '../utils/bendiUtil';
const { ccclass, property } = _decorator;
const log = 'huanfuMgr';
@ccclass('huanfuMgr')
export class huanfuMgr extends Component {
    private static yiJiesuoArr: number[] = [0];
    static shiyongIng: number = 0;

    /** 初始化管理器 */
    static init() {
        this.yiJiesuoArr = bendiUtil.getObj('yiJiesuoArr', [0]);
        this.shiyongIng = bendiUtil.getItem('shiyongIng', 0);
    }

    /** 使用指定ID的装饰物品。 */
    static usePifu(id: number) {
        if (this.shiyongIng === id) {
            console.log(log, `id为${id}的装饰已被使用，无需重复使用`);
            return;
        }
        this.shiyongIng = id;
        bendiUtil.setItem('shiyongIng', id);
    }

    /** 解锁指定ID的装修物品。 */
    static jiesuoHf(id: number) {
        if (this.shifouJiesuo(id)) {
            console.log(log, `id为${id}的装饰已被解锁，无需重复解锁`);
            return;
        }
        this.yiJiesuoArr.push(id);
        bendiUtil.setObj('yiJiesuoArr', this.yiJiesuoArr);
        console.log(log, `解锁id为${id}的装饰`);
    }

    /** 检查指定ID的装饰物品是否正在使用中。 */
    public static isShiyong(id: number): boolean {
        return this.shiyongIng === id;
    }

    /** 检查指定ID的装饰物品是否已解锁。 */
    public static shifouJiesuo(id: number): boolean {
        return this.yiJiesuoArr.includes(id);
    }
}
