import {
    _decorator,
    Color,
    Component,
    Label,
    LabelOutline,
    Node,
    tween,
    UIOpacity,
    UITransform,
    v3,
    Vec3
} from 'cc';
import { poolMgr } from '../managers/poolMgr';
const { ccclass, property } = _decorator;

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
        const texiao = poolMgr.ins.getPoolNode(name);
        // 设置父节点
        texiao.parent = parent;
        // 设置世界坐标
        if (worldPos) {
            texiao.setWorldPosition(worldPos);
        }
    }

    /**
     * 飘字（降级方案：纯代码动态生成带描边的 Label，上浮 + 回弹 + 淡出后自毁，
     * 不依赖任何预制体 / 新美术资源）。
     * @param text     文案，如 "+6" / "Nice!"
     * @param parent   挂载父节点（一般传 gameScene.node）
     * @param worldPos 起始世界坐标
     * @param opts     可选：fontSize 字号、color 文字色、rise 上浮距离、hold 停留时长
     */
    static piaoZi(
        text: string,
        parent: Node,
        worldPos: Vec3,
        opts?: { fontSize?: number; color?: Color; rise?: number; hold?: number }
    ) {
        const fontSize: number = opts?.fontSize ?? 50;
        const color: Color = opts?.color ?? new Color(255, 221, 64, 255); // 金黄
        const rise: number = opts?.rise ?? 80;
        const hold: number = opts?.hold ?? 0.2;

        const node = new Node('piaoZi');
        // 跟随父节点图层，保证被 UI 相机渲染
        node.layer = parent.layer;
        const label = node.addComponent(Label); // Label 自带 UITransform
        label.string = text;
        label.fontSize = fontSize;
        label.lineHeight = fontSize;
        label.color = color;
        const outline = node.addComponent(LabelOutline);
        outline.color = new Color(80, 40, 0, 255);
        outline.width = 3;

        node.parent = parent;
        node.setWorldPosition(worldPos);
        node.setScale(0.4, 0.4, 1);

        const ui = node.addComponent(UIOpacity);
        // 入场回弹
        tween(node)
            .to(0.14, { scale: v3(1.15, 1.15, 1) }, { easing: 'backOut' })
            .to(0.1, { scale: v3(1, 1, 1) })
            .start();
        // 上浮
        tween(node)
            .by(hold + 0.4, { position: v3(0, rise, 0) }, { easing: 'sineOut' })
            .start();
        // 停留后淡出并自毁
        tween(ui)
            .delay(hold + 0.1)
            .to(0.3, { opacity: 0 })
            .call(() => {
                if (node.isValid) node.destroy();
            })
            .start();
    }

    /**
     * 延迟指定的时间
     * @param time 延迟的时间，单位为秒，默认为0
     * @returns 返回一个 Promise 对象，当延迟时间到达时 resolve
     */
    async yanchi(time: number = 0): Promise<void> {
        // 返回一个 Promise，它将在 'time' 秒后 resolve
        return new Promise<void>((resolve, reject) => {
            this.scheduleOnce(() => {
                resolve();
            }, time);
        });
    }
}
/**
 * 获取当前时间
 */
export function newTime() {
    return new Date().getTime();
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
    let time = new Date(endYear, endMonth, endDay);
    return time.getTime();
}
