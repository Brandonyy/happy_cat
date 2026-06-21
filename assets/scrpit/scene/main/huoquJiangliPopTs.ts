import { _decorator, Component, director, Label, Node, Sprite, SpriteFrame, tween, Tween, v3 } from 'cc';
import { gameData } from '../../configs/gameData';
import { musicMgr } from '../../managers/musicMgr';
import { daojuConfig } from '../../configs/daojuConfig';
import { resMgr } from '../../managers/resMgr';
import { wupinType } from '../../configs/wupinType';
import { wupinMgr } from '../../managers/wupinMgr';
import { eventType } from '../../configs/pathName';
import { adMgr } from '../../adWxDy/adMgr';
const { ccclass, property } = _decorator;
//源码网站 开vpn全局模式打开 https://web3incubators.com/
//客服联系方式 https://web3incubators.com/kefu.html


@ccclass('huoquJiangliPopTs')
export class huoquJiangliPopTs extends Component {
    // 奖品显示
    @property(Sprite)
    jlImg: Sprite = null
    // 奖励数量
    @property(Label)
    num: Label = null
    // 双倍获取按钮
    @property(Node)
    shuangbeiBtn: Node = null
    // 获取奖励按钮
    @property(Node)
    yibeiBtn: Node = null
    // 奖品奖励数据
    jlArr = []
    // 动画
    private tw: Tween<Node>
    // 当前奖励
    dangqianJl = null
    // 当前按钮是否可以点击
    private isDianji: boolean = true
    // 回调函数
    private callback: Function = null
    // 是否金币动画
    private isMaobiDh: boolean = true
    open(callback: Function = null, isMaobiDh?: boolean,) {
        this.callback = callback
        this.isMaobiDh = isMaobiDh
    }
    protected onEnable(): void {
        this.init()
    }
    init() {
        // 获取当前阶段的奖励数据
        this.jlArr = gameData.jingpinArr
        // 设置当前奖励为奖励数组中的第一个元素，并从数组中移除该元素
        this.dangqianJl = this.jlArr.shift()
        // 设置当前奖励显示
        this.shezhiJl(this.dangqianJl)
    }
    /**
  * 设置当前奖励，并更新UI显示。
  * @param jiang - 要设置的奖励对象。
  */
    public shezhiJl(jiang) {
        // 播放音效
        musicMgr.ins.playSound('获得奖励')
        // 将传入的奖励对象赋值给当前奖励属性
        this.dangqianJl = jiang
        // 从奖励对象中解构出奖励ID和数量
        const { itemId, cnt } = jiang
        // 根据itemId从jiangpinConfig中获取对应的配置信息
        const { icon, type } = daojuConfig[itemId]
        // 更新奖励数量的显示
        this.num.string = `x${cnt}`
        // 从资源管理器中获取对应的精灵帧
        const sprite: SpriteFrame = resMgr.ins.getImg(icon)
        // 将精灵帧设置为图标节点的显示内容
        this.jlImg.spriteFrame = sprite
        // 如果奖励类型是收藏品，则播放相应的音效
        if (type === wupinType.cangpin) {
            musicMgr.ins.playSound('a通关成功')
        }
        // 如果存在之前的缓动动画，则停止它
        if (this.tw) {
            this.tw.stop()
        }
        // 创建一个新的缓动动画对象，用于图标节点的缩放效果
        this.tw = tween(this.jlImg.node)
        // 设置图标节点的初始缩放为零
        this.tw.set({ scale: v3() })
        // 在0.5秒内将图标节点的缩放设置为(1, 1, 1)，并使用backOut缓动效果
        this.tw.to(0.5, { scale: v3(1, 1, 1) }, { easing: 'backOut' })
        // 启动缓动动画
        this.tw.start()
    }

    /**
     * 双倍获取按钮
     */
    onShuangbei() {
        adMgr.showVideo(() => {
            // 观看广告
            this.shuang()
            this.callback()
        })
    }
    async shuang() {
        // 获取奖励数组的长度
        const len: number = this.jlArr.length
        if (len > 0) {
            this.yibeiBtn.active = true
            this.shuangbeiBtn.active = true
        } else {
            this.yibeiBtn.active = false
            this.shuangbeiBtn.active = false
        }
        // 如果奖励数组为空
        if (len <= 0) {
            // 获取当前奖励并等待操作完成
            await this.getJlItem(1)
            this.isDianji = true
            // 关闭当前界面
            this.node.destroy()
        } else {
            // 获取当前奖励并等待操作完成
            await this.getJlItem(1)
            // 设置下一个奖励为当前奖励，并从奖励数组中移除
            this.dangqianJl = this.jlArr.shift()
            // 设置当前奖励显示
            this.shezhiJl(this.dangqianJl)
        }
    }
    /**
   * 领取奖励按钮
   */
    async onYibei() {
        if (!this.isDianji) return
        this.isDianji = false
        // 获取奖励数组的长度
        const len: number = this.jlArr.length
        if (len > 0) {
            this.yibeiBtn.active = true
            this.shuangbeiBtn.active = true
        } else {
            this.yibeiBtn.active = false
            this.shuangbeiBtn.active = false
        }
        // 如果奖励数组为空
        if (len <= 0) {
            // 获取当前奖励并等待操作完成
            await this.getJlItem()
            this.isDianji = true
            if (this.callback) {
                this.callback()
            }
            // 关闭当前界面
            this.node.destroy()
        } else {
            // 获取当前奖励并等待操作完成
            await this.getJlItem()
            // 设置下一个奖励为当前奖励，并从奖励数组中移除
            this.dangqianJl = this.jlArr.shift()
            // 设置当前奖励显示
            this.shezhiJl(this.dangqianJl)
            this.isDianji = true
        }
    }
    /**
       * 获取当前奖励项。
       * @param time - 可选的奖励倍数，默认为0。
       * @returns 一个Promise，在获取奖励完成后解析。
       */
    getJlItem(time: number = 0) {
        return new Promise<void>((resolve, reject) => {
            // 从当前奖励中解构出itemId和cnt
            const { itemId, cnt } = this.dangqianJl
            // 根据itemId获取物品类型
            const itemType: wupinType = wupinMgr.getType(itemId)
            // 如果time大于0，更新奖励数量的显示并增加物品数量
            if (time > 0) {
                this.num.string = `x${(time + 1) * cnt}`
            }
            wupinMgr.updateWupin(itemId, (time + 1) * cnt)
            // 根据物品类型处理奖励获取
            switch (itemType) {
                // 如果是金币，更新金币数量并在2秒后解析Promise
                case wupinType.jinbi:
                    director.emit(eventType.jinBiNum, this.isMaobiDh)
                    if (!this.isMaobiDh) {
                        resolve()
                    } else {
                        this.scheduleOnce(() => {
                            resolve()
                        }, 2)
                    }
                    break;
                // 如果是技能，直接解析Promise
                case wupinType.daoju:
                    resolve()
                    break
                // 如果是收藏品，直接解析Promise
                case wupinType.cangpin:
                    resolve()
                    break
                // 如果是其他类型，不做处理
                default:
                    break;
            }
        })
    }
}


