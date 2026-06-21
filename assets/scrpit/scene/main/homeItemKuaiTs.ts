import { _decorator, Component, director, Node, resources, Sprite, SpriteFrame } from 'cc';
import { eventType } from '../../configs/pathName';
import { homeMgr } from '../../managers/homeMgr';
import { poolMgr } from '../../managers/poolMgr';
const { ccclass, property } = _decorator;

@ccclass('homeItemKuaiTs')
export class homeItemKuaiTs extends Component {
    private sp: Sprite = null
    id: number = 0
    // 指定部分是否解锁
    private isUnJiesuo: boolean = false
    protected onLoad(): void {
        // 获取Sprite组件的引用
        this.sp = this.node.getComponent(Sprite)
        // 并在事件触发时调用onUnlockHomePeice方法
        director.on(eventType.jiesuoHome, this.onUnJiesuoJiayuanKuai, this)
        this.updateState()
    }
    protected onDestroy(): void {
        // 取消事件监听
        director.off(eventType.jiesuoHome, this.onUnJiesuoJiayuanKuai, this)
    }

    /**
      * 当家园部件解锁事件触发时调用。
      * 该方法会检查当前家园部件是否已解锁，
      * 如果之前未解锁且现在已解锁，则创建一个闪烁特效。
      */
    onUnJiesuoJiayuanKuai(): void {
        // 记录当前家园部件是否已解锁
        const wasUnlocked: boolean = this.isUnJiesuo
        // 更新组件状态
        this.updateState()
        // 检查之前是否未解锁且现在已解锁
        if (!wasUnlocked && this.isUnJiesuo) {
            // 获取闪烁特效预制体
            poolMgr.ins.getPoolNode('shanxing', this.node)
        }
    }
    /**
      * 更新组件状态。
      */
    async updateState() {
        // 获取当前节点的兄弟索引
        const idx: number = this.node.getSiblingIndex()
        // 检查当前家园部件是否已解锁
        const isUnJiesuo: boolean = homeMgr.isUnJiesuo(this.id, idx)
        // 更新isUnlocked属性
        this.isUnJiesuo = isUnJiesuo
        // 根据解锁状态获取对应的SpriteFrame名称
        const spfName: string = isUnJiesuo ? `${idx}` : `${idx}_1`
        // // 从资源管理器中获取对应的SpriteFrame
        // const spf: SpriteFrame = await resMgr.ins.getResourcesSp(`UI/jiayuanImg/${this.id}/${spfName}/spriteFrame`)
        // // // 将获取到的SpriteFrame设置为Sprite组件的spriteFrame属性
        // this.sp.spriteFrame = spf
        this.loadResourceSprite(this.sp, `jiayuanImg/${this.id}/${spfName}/spriteFrame`)
    }

    /**
* 加载本地资源
* @param sprite 
* @param path 
*/
    loadResourceSprite(sprite: Sprite, path: string) {
        // 加载指定路径的资源
        resources.load(path, SpriteFrame, (err, spriteframe) => {
            if (err) {
                console.log(err)
                return
            }
            // 如果加载成功，将资源设置到精灵组件上
            sprite.spriteFrame = spriteframe
        })
    }
}


