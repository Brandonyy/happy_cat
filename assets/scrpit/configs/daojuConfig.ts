import { daojuType } from "./daojuType"
import { wupinType } from "./wupinType"

/**
 * 奖励配置
 */
export const guoguanJiangliConfig = [
    {
        id: 0,
        passLevel: 10,
        coinCnt: 300,
        skillCnt: 1,
    },
    {
        id: 1,
        passLevel: 20,
        coinCnt: 600,
        skillCnt: 1,
    },
    {
        id: 2,
        passLevel: 30,
        coinCnt: 1000,
        skillCnt: 2,
    },
    {
        id: 3,
        passLevel: 40,
        coinCnt: 1500,
        skillCnt: 2,
    },
    {
        id: 4,
        passLevel: 50,
        coinCnt: 1800,
        skillCnt: 2,
    },
    {
        id: 5,
        passLevel: 60,
        coinCnt: 1800,
        skillCnt: 2,
    },
    {
        id: 6,
        passLevel: 70,
        coinCnt: 2000,
        skillCnt: 3,
    },
]
/**
 * 奖品道具配置
 */
export const daojuConfig = [
    {
        id: 0,
        name: '猫猫币',
        type: wupinType.jinbi,
        icon: 'icon_zzb'
    },
    {
        id: 1,
        name: '凑齐道具',
        type: wupinType.daoju,
        daojuType: daojuType.couqi,
        icon: 'icon_pd'
    },

    {
        id: 2,
        name: '移出道具',
        type: wupinType.daoju,
        daojuType: daojuType.yichu,
        icon: 'icon_yc'
    },
    {
        id: 3,
        name: '冻结道具',
        type: wupinType.daoju,
        daojuType: daojuType.dongjie,
        icon: 'icon_bd'
    },
    {
        id: 4,
        name: '呆呆猫',
        type: wupinType.cangpin,
        icon: 'img1_1'
    },
    {
        id: 5,
        name: '肥肥猫',
        type: wupinType.cangpin,
        icon: 'img2_1'
    },
    {
        id: 6,
        name: '瞌睡猫',
        type: wupinType.cangpin,
        icon: 'img3_1'
    },
    {
        id: 7,
        name: '媚眼猫',
        type: wupinType.cangpin,
        icon: 'img4_1'
    },
    {
        id: 8,
        name: '奶茶猫',
        type: wupinType.cangpin,
        icon: 'img5_1'
    },
    {
        id: 9,
        name: '趴趴猫',
        type: wupinType.cangpin,
        icon: 'img6_1'
    },
    {
        id: 10,
        name: '软萌猫',
        type: wupinType.cangpin,
        icon: 'img7_1'
    },
    {
        id: 11,
        name: '圣诞猫',
        type: wupinType.cangpin,
        icon: 'img8_1'
    },
    {
        id: 12,
        name: '薯条猫',
        type: wupinType.cangpin,
        icon: 'img9_1'
    },
    {
        id: 13,
        name: '碎觉猫',
        type: wupinType.cangpin,
        icon: 'img10_1'
    },
    {
        id: 14,
        name: '委屈猫',
        type: wupinType.cangpin,
        icon: 'img11_1'
    },
    {
        id: 15,
        name: '游戏猫',
        type: wupinType.cangpin,
        icon: 'img12_1'
    }
]