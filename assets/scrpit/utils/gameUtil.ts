import { _decorator, Component, Node, Vec3 } from 'cc';
import { poolMgr } from '../managers/poolMgr';
const { ccclass, property } = _decorator;
//源码网站 开vpn全局模式打开 https://web3incubators.com/
//客服联系方式 https://web3incubators.com/kefu.html


@ccclass('gameUtil')
export class gameUtil extends Component {
    // 单例
    static _ins: gameUtil;
    static get ins() {
        if (this._ins) {
            return this._ins;
        }
        this._ins = new gameUtil();
        return this._ins;
    }

    /**
     * 创建特效节点(特效播放完毕会自动销毁节点)
     */
    static mergeTexiao(name: string, parent: Node, worldPos?: Vec3) {
        // 实例化特效预制体
        const texiao = poolMgr.ins.getPoolNode(name)
        // 设置父节点
        texiao.parent = parent
        // 设置世界坐标
        if (worldPos) {
            texiao.setWorldPosition(worldPos)
        }
    }

    /**
     * 延迟指定的时间
     * @param time 延迟的时间，单位为秒，默认为0
     * @returns 返回一个 Promise 对象，当延迟时间到达时 resolve
     */
    async yanchi(time: number = 0): Promise<void> {
        // 返回一个 Promise，它将在 'time' 秒后 resolve
        return new Promise<void>((resolve, reject) => {
            this.scheduleOnce(() => { resolve() }, time)
        })
    }
}
/**
* 获取当前时间
*/
export function newTime() {
    return new Date().getTime()
}
/**
* 计算第二天的日期
*/
export function getDTime() {
    //   获取当前日期的年份
    let endYear = new Date().getFullYear();
    //   获取当前日期的月份
    let endMonth = new Date().getMonth();
    //   获取当前日期的天数并加 1,获取明天的日期
    let endDay = new Date().getDate() + 1;
    //   创建明天的日期对象
    let time = new Date(endYear, endMonth, endDay)
    return time.getTime();
}


