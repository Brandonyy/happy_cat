export class adConfig {
    // 是否开启广告（上线前已置 true；但只有填好下面对应的广告位 ID 才会真正拉广告）
    static isShowAd = true
    // ⚠️ 上线前必须把以下 5 个广告位 ID 填成各平台后台创建的真实 adUnitId，
    //    留空时对应广告会自动跳过（不会报错也不会展示），方便先上其它内容。
    //  微信banner广告id
    static wxBannerId = ''
    //  微信插屏广告id
    static wxChaPingId = ''
    //  微信激励广告id
    static wxVideoId = ''
    // 抖音插屏广告id
    static dyChaPingId = ''
    // 抖音激励广告id
    static dyVideoId = ''

    // ===== 插屏频控（合规 + 保留存）=====
    // 两次插屏最小间隔（毫秒）。微信/抖音均要求 ≥30s，过频会违规且掉留存。
    static chaPingCdMs = 30000
    // 新手保护：普通模式前 N 关不弹插屏，保次日留存。
    static chaPingFreeLevels = 5
}
