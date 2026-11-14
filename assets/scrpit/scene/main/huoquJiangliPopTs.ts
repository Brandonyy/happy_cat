import {
    _decorator,
    Component,
    director,
    Label,
    Node,
    Sprite,
    SpriteFrame,
    tween,
    Tween,
    v3
} from 'cc';
import { gameData } from '../../configs/gameData';
import { musicMgr } from '../../managers/musicMgr';
import { daojuConfig } from '../../configs/daojuConfig';
import { resMgr } from '../../managers/resMgr';
import { wupinType } from '../../configs/wupinType';
import { wupinMgr } from '../../managers/wupinMgr';
import { eventType } from '../../configs/pathName';
import { adMgr } from '../../adWxDy/adMgr';
const { ccclass, property } = _decorator;

@ccclass('huoquJiangliPopTs')
export class huoquJiangliPopTs extends Component {
    // 奖品显示
    @property(Sprite)
    jlImg: Sprite = null;
    // 奖励数量
    @property(Label)
    num: Label = null;
    // 双倍获取按钮
    @property(Node)
    shuangbeiBtn: Node = null;
    @property(Node)
    yibeiBtn: Node = null;
    // 奖品奖励数据
    jlArr = [];
    // 动画
    private tw: Tween<Node>;
    // 当前奖励
    dangqianJl = null;
    // 当前按钮是否可以点击
    private isDianji: boolean = true;
    // 回调函数
    private callback: Function = null;
    // 是否金币动画
    private isMaobiDh: boolean = true;

    open(callback: Function = null, isMaobiDh?: boolean) {
        this.callback = callback;
        this.isMaobiDh = isMaobiDh;
    }

    protected onEnable(): void {
        this.init();
    }

    init() {
        // 重置回调，避免对象池复用时残留上一次的回调
        this.callback = null;
        this.jlArr = gameData.jingpinArr;
        this.dangqianJl = this.jlArr.shift();
        this.shezhiJl(this.dangqianJl);
    }

    /**
     * 设置当前奖励，并更新UI显示。
     * @param jiang - 要设置的奖励对象。
     */
    public shezhiJl(jiang) {
        // 播放音效
        musicMgr.ins.playSound('获得奖励');
        this.dangqianJl = jiang;
        const { itemId, cnt } = jiang;
        const { icon, type } = daojuConfig[itemId];
        this.num.string = `x${cnt}`;
        const sprite: SpriteFrame = resMgr.ins.getImg(icon);
        this.jlImg.spriteFrame = sprite;
        if (type === wupinType.cangpin) {
            musicMgr.ins.playSound('a通关成功');
        }
        if (this.tw) {
            this.tw.stop();
        }
        this.tw = tween(this.jlImg.node);
        this.tw.set({ scale: v3() });
        // 在0.5秒内将图标节点的缩放设置为(1, 1, 1)，并使用backOut缓动效果
        this.tw.to(0.5, { scale: v3(1, 1, 1) }, { easing: 'backOut' });
        // 启动缓动动画
        this.tw.start();
    }

    /**
     * 双倍获取按钮
     */
    onShuangbei() {
        adMgr.showVideo(() => {
            // 观看广告
            this.shuang();
        });
    }

    async shuang() {
        const len: number = this.jlArr.length;
        this.setClaimButtonsVisible(len > 0);
        if (len <= 0) {
            await this.getJlItem(1);
            this.isDianji = true;
            // 全部奖励领取完毕，触发回调（扭蛋等无回调场景下跳过）
            if (this.callback) {
                this.callback();
            }
            // 关闭当前界面
            this.node.destroy();
        } else {
            await this.getJlItem(1);
            this.showNextReward();
        }
    }

    /**
     * 领取奖励按钮
     */
    async onYibei() {
        if (!this.isDianji) return;
        this.isDianji = false;
        const len: number = this.jlArr.length;
        this.setClaimButtonsVisible(len > 0);
        if (len <= 0) {
            await this.getJlItem();
            this.isDianji = true;
            if (this.callback) {
                this.callback();
            }
            // 关闭当前界面
            this.node.destroy();
        } else {
            await this.getJlItem();
            this.showNextReward();
            this.isDianji = true;
        }
    }

    /**
     * 获取当前奖励项。
     * @param time - 可选的奖励倍数，默认为0。
     * @returns 一个Promise，在获取奖励完成后解析。
     */
    getJlItem(time: number = 0) {
        return new Promise<void>((resolve, reject) => {
            const { itemId, cnt } = this.dangqianJl;
            const itemType: wupinType = wupinMgr.getType(itemId);
            if (time > 0) {
                this.num.string = `x${(time + 1) * cnt}`;
            }
            wupinMgr.updateWupin(itemId, (time + 1) * cnt);
            switch (itemType) {
                case wupinType.jinbi:
                    director.emit(eventType.jinBiNum, this.isMaobiDh);
                    if (!this.isMaobiDh) {
                        resolve();
                    } else {
                        this.scheduleOnce(() => {
                            resolve();
                        }, 2);
                    }
                    break;
                case wupinType.daoju:
                    resolve();
                    break;
                case wupinType.cangpin:
                    resolve();
                    break;
                default:
                    break;
            }
        });
    }

    private setClaimButtonsVisible(visible: boolean) {
        this.yibeiBtn.active = visible;
        this.shuangbeiBtn.active = visible;
    }

    private showNextReward() {
        this.dangqianJl = this.jlArr.shift();
        this.shezhiJl(this.dangqianJl);
    }
}
