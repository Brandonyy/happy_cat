import { _decorator, Component, director, Node, tween, v3 } from 'cc';
import { gameData } from '../../configs/gameData';
import { musicMgr } from '../../managers/musicMgr';
import { gameConfig } from '../../configs/gameConfig';
import { maobiMgr } from '../../managers/maobiMgr';
import { eventType } from '../../configs/pathName';
import { gameUtil } from '../../utils/gameUtil';
import { adMgr } from '../../adWxDy/adMgr';
import { numAnimaTs } from '../../other/numAnimaTs';
const { ccclass, property } = _decorator;

@ccclass('shengliPopTs')
export class shengliPopTs extends Component {
    // 指针
    @property(Node)
    zhen: Node = null;
    // 本关入账总金币（基础 + 连击，均已乘倍率）
    private maobiNum = 0;
    // 基础金币数量（未乘倍数）
    private baseMaobiNum = 0;
    // 本关连击奖励金币（未乘倍数）
    private comboJinbi = 0;
    // 已乘倍率的基础金币（用于加倍领取时翻倍展示）
    private baseTotal = 0;
    // 已乘倍率的连击奖励金币（用于加倍领取时翻倍展示）
    private comboTotal = 0;
    // 连击奖励数字动画（预制体内 popUI/comboNum 的 numAnimaTs，与基础金币一致的滚动表现）
    private comboNumAnim: numAnimaTs = null;
    // 指针动画
    private dh = null;
    // 是否已经领取
    private isLingqu: boolean = false;
    // 当前按钮是否可以点击
    private isDianji: boolean = true;
    // “点击领取”按钮
    private lingquBtn: Node = null;
    // “加倍领取”按钮（复用原多倍领取样式）
    private jiabeiBtn: Node = null;
    // 关闭按钮
    private closeBtn: Node = null;
    // 本关金币数字动画
    private benguanNum: numAnimaTs = null;

    protected start(): void {
        // 暂停游戏
        gameData.zanting = true;
        //停止背景音乐
        musicMgr.ins.stopMusic();
        // 播放胜利音效
        musicMgr.ins.playSound('a通关成功');
        // 获取子节点引用
        const popUI = this.node.getChildByName('popUI');
        this.lingquBtn = popUI.getChildByName('putong');
        this.jiabeiBtn = popUI.getChildByName('shuangbei');
        this.closeBtn = popUI.getChildByName('closeBtn');
        this.benguanNum = popUI.getChildByName('benguanNum')?.getComponent(numAnimaTs);
        // 创建一个无限循环的指针动画，指针在指定位置之间来回移动
        this.dh = tween(this.zhen)
            .sequence(
                tween(this.zhen).to(0.8, { position: v3(180, -170) }),
                tween(this.zhen).to(0.8, { position: v3(-180, -170) })
            )
            .repeatForever()
            .start();
        // 计算本关获得的默认金币数量
        this.baseMaobiNum =
            gameConfig.levelAddMaobiNum + (gameData.putongLevel - 1) * gameConfig.levelAddMaobiNum;
        // 本关连击累计的奖励金币（关内只累计，未入账）
        this.comboJinbi = gameData.benguanComboJinbi || 0;
        this.maobiNum = this.baseMaobiNum;
        // 基础金币行加「过关奖励 +」前缀（用 qianzhui 保证滚动动画时前缀不丢）
        if (this.benguanNum) this.benguanNum.qianzhui = '过关奖励 +';
        // 初始化本关金币展示（基础金币）
        this.benguanNum?.init(this.baseMaobiNum);
        // 连击奖励行（预制体内 comboNum）：有连击奖励才显示，否则隐藏避免空行
        this.initComboLabel(popUI);
        // 初始按钮状态：只展示“点击领取”
        this.lingquBtn.active = true;
        this.jiabeiBtn.active = false;
        if (this.closeBtn) this.closeBtn.active = false;
        // 显示广告
        adMgr.showChaPing();
    }

    /**
     * 初始化预制体内的「连击奖励」行（popUI/comboNum）。
     * 无连击奖励（=0）时隐藏节点，避免出现空行；样式/位置可在预制体里直接调。
     */
    private initComboLabel(popUI: Node) {
        const comboNode = popUI.getChildByName('comboNum');
        if (!comboNode) return;
        if (this.comboJinbi <= 0) {
            comboNode.active = false;
            return;
        }
        comboNode.active = true;
        this.comboNumAnim = comboNode.getComponent(numAnimaTs);
        if (this.comboNumAnim) {
            // 与基础金币行一致：用 qianzhui 保证滚动动画时「连击奖励 +」前缀不丢
            this.comboNumAnim.qianzhui = '连击奖励 +';
            this.comboNumAnim.init(this.comboJinbi);
        }
    }

    /**
     * 根据指针所在的 x 位置获取对应倍数
     * 区间沿用原始指针落点设定：2x / 3x / 4x / 3x
     */
    private getBeishuByX(x: number): number {
        if (x < -8) return 2;
        if (x < 85) return 3;
        if (x < 145) return 4;
        return 3;
    }

    /**
     * 点击领取：指针停止，金币 = 基础 × 指针所在倍数
     */
    async onLingqu() {
        if (!this.isDianji || this.isLingqu) return;
        this.isDianji = false;
        this.isLingqu = true;
        // 停止指针动画
        this.dh.stop();
        // 取指针所在倍数
        const bei = this.getBeishuByX(this.zhen.position.x);
        // 基础金币与连击奖励均乘倍率，分别记录用于分行展示
        this.baseTotal = this.baseMaobiNum * bei;
        this.comboTotal = this.comboJinbi * bei;
        this.maobiNum = this.baseTotal + this.comboTotal;
        // 指针落点确定后立即开始展示，不再空等：
        // 阶段1：两行各自展示「金币 × 倍率」表达式，停留 1 秒
        if (this.benguanNum) {
            this.benguanNum.label.string = `过关奖励 ${this.baseMaobiNum} × ${bei}`;
        }
        if (this.comboNumAnim) {
            this.comboNumAnim.label.string = `连击奖励 ${this.comboJinbi} × ${bei}`;
        }
        await gameUtil.ins.yanchi(1);
        // 阶段2：基础金币与连击奖励同步滚动到各自乘后结果，停留 1 秒
        this.benguanNum?.numAnima(this.baseTotal, 0.4);
        this.comboNumAnim?.numAnima(this.comboTotal, 0.4);
        await gameUtil.ins.yanchi(1);
        // 阶段3：金币入账（基础 + 连击）+ 顶部飞币动画
        maobiMgr.updateMaobi(this.maobiNum);
        director.emit(eventType.jinBiNum);
        // 按钮切换：隐藏“点击领取”，显示“加倍领取”与关闭按钮
        this.lingquBtn.active = false;
        this.jiabeiBtn.active = true;
        if (this.closeBtn) this.closeBtn.active = true;
        this.isDianji = true;
    }

    /**
     * 点击加倍领取：观看激励视频，成功后金币翻倍
     */
    onJiabei() {
        if (!this.isDianji) return;
        // 观看广告
        adMgr.showVideo(() => {
            this.jiabei();
        });
    }

    async jiabei() {
        this.isDianji = false;
        // 再补入一份金币（使总额变为两倍）+ 飞币动画
        maobiMgr.updateMaobi(this.maobiNum);
        director.emit(eventType.jinBiNum);
        // 基础与连击奖励同步翻倍并刷新两行展示
        this.baseTotal = this.baseTotal * 2;
        this.comboTotal = this.comboTotal * 2;
        this.maobiNum = this.baseTotal + this.comboTotal;
        this.benguanNum?.numAnima(this.baseTotal);
        this.comboNumAnim?.numAnima(this.comboTotal);
        // 加倍按钮消失
        this.jiabeiBtn.active = false;
        // 等待飞币动画后自动进入下一关
        await gameUtil.ins.yanchi(2);
        director.emit(eventType.nextLevel);
    }

    /**
     * 点击关闭：关闭弹窗并进入下一关
     */
    async onClose() {
        if (!this.isDianji) return;
        this.isDianji = false;
        // 等待飞币动画
        await gameUtil.ins.yanchi(0.5);
        // 重置关卡（loadScene 会销毁本弹窗）
        director.emit(eventType.nextLevel);
    }
}
