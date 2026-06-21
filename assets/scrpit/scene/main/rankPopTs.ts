import { _decorator, assetManager, Component, ImageAsset, instantiate, Label, Node, Prefab, resources, ScrollView, Sprite, SpriteFrame, Texture2D } from 'cc';
const { ccclass, property } = _decorator;
// 排名测试数据
const rankData = [
    {
        playerInfo: {
            avatarUrl: '',
            nickName: '张三'
        },
        score: 100,
        playerId: 1
    },
    {
        playerInfo: {
            avatarUrl: '',
            nickName: '张三'
        },
        score: 100,
        playerId: 2
    },
    {
        playerInfo: {
            avatarUrl: '',
            nickName: '张三'
        },
        score: 100,
        playerId: 3
    },
    {
        playerInfo: {
            avatarUrl: '',
            nickName: '张三'
        },
        score: 100,
        playerId: 4
    },
    {
        playerInfo: {
            avatarUrl: '',
            nickName: '张三'
        },
        score: 100,
        playerId: 5
    },
    {
        playerInfo: {
            avatarUrl: '',
            nickName: '张三'
        },
        score: 100,
        playerId: 6
    },
    {
        playerInfo: {
            avatarUrl: '',
            nickName: '张三'
        },
        score: 100,
        playerId: 7
    },
    {
        playerInfo: {
            avatarUrl: '',
            nickName: '张三'
        },
        score: 100,
        playerId: 8
    },
    {
        playerInfo: {
            avatarUrl: '',
            nickName: '张三'
        },
        score: 100,
        playerId: 9
    },
    {
        playerInfo: {
            avatarUrl: '',
            nickName: '张三'
        },
        score: 100,
        playerId: 10
    },
]
@ccclass('rankPopTs')
export class rankPopTs extends Component {
    // 滚动视图组件
    @property(ScrollView)
    gundongView: ScrollView;
    // 弹窗
    @property(Node)
    tcPop: Node
    // 排行榜项的预制体
    @property(Prefab)
    rankItem: Prefab
    // 排行榜内容的容器节点
    @property(Node)
    rankMain: Node = null;
    // 加载显示
    @property(Node)
    loading: Node = null;
    // 个人id
    private playId = null
    // 个人名次
    private index = null
    start() {
        this.init()
    }

    async init() {
        // 遍历获取的数据，更新排行榜行数据
        for (let i = 0; i < rankData.length; i++) {
            this.updateRankList(rankData[i], i)
        }
        this.updateUseScore()
    }
    /**
  * 更新游戏排行榜行数据
  */
    updateRankList(data: any, index: number) {
        // 实例化排行榜项预制体
        const node = instantiate(this.rankItem);
        // 将生成的排行榜项节点添加到 content 节点下
        this.rankMain.addChild(node)
        // 排名数字背景
        let paihangSpr = node.getChildByName('paiming').getComponent(Sprite)
        // 排名数字
        let lab = node.getChildByPath('paiming/paimingLab').getComponent(Label)
        // 头像
        let headSpr = node.getChildByPath("userInfo/headImg/mask/avator").getComponent(Sprite)
        // 玩家姓名
        let name = node.getChildByPath("userInfo/name").getComponent(Label)
        // 分数
        let score = node.getChildByPath("score").getComponent(Label)
        // 排行前三
        switch (index) {
            // 根据排行榜项的索引设置排名图标
            case 0:
                this.loadResourceSprite(paihangSpr, 'rank/1/spriteFrame')
                lab.string = String(index + 1)
                break;
            case 1:
                this.loadResourceSprite(paihangSpr, 'rank/2/spriteFrame')
                lab.string = String(index + 1)
                break;
            case 2:
                this.loadResourceSprite(paihangSpr, 'rank/3/spriteFrame')
                lab.string = String(index + 1)
                break;
            default:
                this.loadResourceSprite(paihangSpr, 'rank/4/spriteFrame')
                lab.string = String(index + 1)
                break;
        }
        // 通过请求远端服务器获取头像
        if (data.playerInfo.avatarUrl) {
            assetManager.loadRemote<ImageAsset>(data.playerInfo.avatarUrl, { ext: '.png' }, (err, imageAsset) => {
                if (err) {
                    console.log('加载远程图片失败1', err, 'URL:', data.playerInfo.avatarUrl);
                    return;
                }
                const spriteFrame = new SpriteFrame();
                const texture = new Texture2D();
                texture.image = imageAsset;
                spriteFrame.texture = texture;
                //节点spriteFrame替换成获取到的图片
                headSpr.spriteFrame = spriteFrame
            });
        }
        // 如果当前排行榜项是当前玩家的信息，则设置玩家信息
        if (data && data.playerId == this.playId) {
            // 设置玩家昵称标签的文本。
            name.string = data.playerInfo.nickName || "我";
            // 自己的那栏背景更换
            this.loadResourceSprite(node.getChildByName('bg').getComponent(Sprite), 'rank/paihangListBg_1@2x/spriteFrame')
            //设置分数标签的文本
            score.string = (data && data.score) ? `${data.score}关` : `${0}关`;
            // 如果在100名内，获取本人名次
            this.index = index
        } else {
            // 如果当前排行榜项不是当前玩家的信息，则设置其他玩家信息。
            name.string = (data && data.playerInfo?.nickName) ? data?.playerInfo?.nickName : "";
            score.string = (data && data.score) ? `${data.score}关` : `${0}关`
        }
    }
    /**
    * 更新个人排名
    */
    updateUseScore(data?, index?) {
        // 获取个人分数节点
        let node = this.node.getChildByPath('popUI/playerItem')
        // 排名数字背景
        let paihangSpr = node.getChildByName('paiming').getComponent(Sprite)
        // 排名数字
        let lab = node.getChildByPath('paiming/paimingLab').getComponent(Label)
        // 头像
        let headSpr = node.getChildByPath("userInfo/headImg/mask/avator").getComponent(Sprite)
        // 玩家姓名
        let name = node.getChildByPath("userInfo/name").getComponent(Label)
        // 分数
        let score = node.getChildByPath("score").getComponent(Label)
        if (index !== null) {
            switch (index) {
                // 根据排行榜项的索引设置排名图标
                case 0:
                    this.loadResourceSprite(paihangSpr, 'rank/1/spriteFrame')
                    lab.string = String(index + 1)
                    break;
                case 1:
                    this.loadResourceSprite(paihangSpr, 'rank/2/spriteFrame')
                    lab.string = String(index + 1)
                    break;
                case 2:
                    this.loadResourceSprite(paihangSpr, 'rank/3/spriteFrame')
                    lab.string = String(index + 1)
                    break;
                default:
                    this.loadResourceSprite(paihangSpr, 'rank/4/spriteFrame')
                    lab.string = String(index + 1)
                    break;
            }
        } else {
            this.loadResourceSprite(paihangSpr, 'rank/4/spriteFrame')
            lab.string = '100+'
        }
        // 通过请求远端服务器获取图像
        if (data) {
            assetManager.loadRemote<ImageAsset>(data.playerInfo.avatarUrl, { ext: '.png' }, (err, imageAsset) => {
                if (err) {
                    console.log('加载远程图片失败2');
                    return;
                }
                const spriteFrame = new SpriteFrame();
                const texture = new Texture2D();
                texture.image = imageAsset;
                spriteFrame.texture = texture;
                //节点spriteFrame替换成获取到的图片
                headSpr.spriteFrame = spriteFrame
            });
            // 设置玩家昵称标签的文本。
            name.string = data.playerInfo.nickName;
            //设置分数标签的文本
            score.string = `${data.score}关`
        } else {
            // 设置玩家昵称标签的文本。
            name.string = "神秘用户";
            //设置分数标签的文本
            score.string = `${0}关`
        }
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
    /**
     * 关闭弹窗
     */
    onGuanbi() {
        this.node.destroy()
    }
}


