import { _decorator, Component, Node, resources, Sprite, SpriteFrame } from 'cc';
import { resMgr } from '../../managers/resMgr';
import { huanfuMgr } from '../../managers/huanfuMgr';
const { ccclass, property } = _decorator;

@ccclass('usePifuTs')
export class usePifuTs extends Component {
    @property(Sprite)
    gameBg: Sprite = null
    @property(Sprite)
    bottomBg: Sprite = null
    @property(Sprite)
    chacaoBg: Sprite[] = []
    async start() {
        this.loadResSprite(this.gameBg, `huanfu/bg${huanfuMgr.shiyongIng}/spriteFrame`)
        this.loadResSprite(this.bottomBg, `huanfu/dk${huanfuMgr.shiyongIng}/spriteFrame`)
        for (let i = 0; i < this.chacaoBg.length; i++) {
            this.loadResSprite(this.chacaoBg[i], `huanfu/slot${huanfuMgr.shiyongIng}/spriteFrame`)
        }
    }

    /**
 * 加载本地资源
 * @param sprite 
 * @param path 
 */
    loadResSprite(sprite: Sprite, path: string) {
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


