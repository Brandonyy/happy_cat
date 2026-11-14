/** 毫秒转为时:分:秒；小时为 00 时省略小时，仍保留原来的两位截取规则。 */
export function timeHMS(milliseconds: number): string {
    const seconds = milliseconds / 1000;
    const hoursText = (Array(2).join('0') + Math.floor(seconds / 3600)).slice(-2);
    const minutesText = (Array(2).join('0') + Math.floor((seconds % 3600) / 60)).slice(-2);
    const secondsText = (Array(2).join('0') + (Math.floor(seconds) % 60)).slice(-2);
    if (hoursText == '00') return minutesText + ':' + secondsText;
    return hoursText + ':' + minutesText + ':' + secondsText;
}
