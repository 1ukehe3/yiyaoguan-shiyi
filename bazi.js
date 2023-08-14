

const express = require('express');
const app = express();
const path = require('path');


	var extend = function (o, c) {
		if (o && c && typeof c == "object") {
			for (var p in c) {
				o[p] = c[p];
			}
		}
		return o;
	};

	var creatLenArr = function (year, month, len, start) {
		var arr = [];
		start = start || 0;
		if (len < 1) return arr;
		var k = start;
		for (var i = 0; i < len; i++) {
			arr.push({ year: year, month: month, day: k });
			k++;
		}
		return arr;
	};

	var errorCode = {
		100: '输入的年份超过了可查询范围，仅支持1891至2100年',
		101: '参数输入错误，请查阅文档'
	};

	var cache = null; //某年相同计算进行cache，以加速计算速度
	var cacheUtil = {
		current: '',
		setCurrent: function (year) {
			if (this.current != year) {
				this.current = year;
				this.clear();
			}
		},
		set: function (key, value) {
			if (!cache) cache = {};
			cache[key] = value;
			return cache[key];
		},
		get: function (key) {
			if (!cache) cache = {};
			return cache[key];
		},
		clear: function () {
			cache = null;
		}
	};

	var formateDayD4 = function (year,month, day) {
		month = month + 1;
		month = month < 10 ? '0' + month : month;
		day = day < 10 ? '0' + day : day;
		return new Date(year,month-2,day)
		
	};

	var minYear = 1890; //最小年限
	var maxYear = 2100; //最大年限
	var DATA = {
		heavenlyStems: ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'],
		earthlyBranches: ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'],
		zodiac: ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'],
		solarTerm: ['小寒', '大寒', '立春', '雨水', '惊蛰', '春分', '清明', '谷雨', '立夏', '小满', '芒种', '夏至', '小暑', '大暑', '立秋', '处暑', '白露', '秋分', '寒露', '霜降', '立冬', '小雪', '大雪', '冬至'],
		monthCn: ['正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二'],
		dateCn: ['初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十', '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十', '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十', '卅一']
	};

	//中国节日放假安排，外部设置，0无特殊安排，1工作，2放假
	var worktime = {};
	//默认设置2013-2014年放假安排
	worktime.y2013 = { "d0101": 2, "d0102": 2, "d0103": 2, "d0105": 1, "d0106": 1, "d0209": 2, "d0210": 2, "d0211": 2, "d0212": 2, "d0213": 2, "d0214": 2, "d0215": 2, "d0216": 1, "d0217": 1, "d0404": 2, "d0405": 2, "d0406": 2, "d0407": 1, "d0427": 1, "d0428": 1, "d0429": 2, "d0430": 2, "d0501": 2, "d0608": 1, "d0609": 1, "d0610": 2, "d0611": 2, "d0612": 2, "d0919": 2, "d0920": 2, "d0921": 2, "d0922": 1, "d0929": 1, "d1001": 2, "d1002": 2, "d1003": 2, "d1004": 2, "d1005": 2, "d1006": 2, "d1007": 2, "d1012": 1 };
	worktime.y2014 = { "d0101": 2, "d0126": 1, "d0131": 2, "d0201": 2, "d0202": 2, "d0203": 2, "d0204": 2, "d0205": 2, "d0206": 2, "d0208": 1, "d0405": 2, "d0407": 2, "d0501": 2, "d0502": 2, "d0503": 2, "d0504": 1, "d0602": 2, "d0908": 2, "d0928": 1, "d1001": 2, "d1002": 2, "d1003": 2, "d1004": 2, "d1005": 2, "d1006": 2, "d1007": 2, "d1011": 1 };

	//公历节日
	var solarFestival = {
		'd0101': '元旦节',
		'd0202': '世界湿地日',
		'd0210': '国际气象节',
		'd0214': '情人节',
		'd0301': '国际海豹日',
		'd0303': '全国爱耳日',
		'd0305': '学雷锋纪念日',
		'd0308': '妇女节',
		'd0312': '植树节 孙中山逝世纪念日',
		'd0314': '国际警察日',
		'd0315': '消费者权益日',
		'd0317': '中国国医节 国际航海日',
		'd0321': '世界森林日 消除种族歧视国际日 世界儿歌日',
		'd0322': '世界水日',
		'd0323': '世界气象日',
		'd0324': '世界防治结核病日',
		'd0325': '全国中小学生安全教育日',
		'd0330': '巴勒斯坦国土日',
		'd0401': '愚人节 全国爱国卫生运动月(四月) 税收宣传月(四月)',
		'd0407': '世界卫生日',
		'd0422': '世界地球日',
		'd0423': '世界图书和版权日',
		'd0424': '亚非新闻工作者日',
		'd0501': '劳动节',
		'd0504': '青年节',
		'd0505': '碘缺乏病防治日',
		'd0508': '世界红十字日',
		'd0512': '国际护士节',
		'd0515': '国际家庭日',
		'd0517': '世界电信日',
		'd0518': '国际博物馆日',
		'd0520': '全国学生营养日',
		'd0522': '国际生物多样性日',
		'd0523': '国际牛奶日',
		'd0531': '世界无烟日',
		'd0601': '国际儿童节',
		'd0605': '世界环境日',
		'd0606': '全国爱眼日',
		'd0617': '防治荒漠化和干旱日',
		'd0623': '国际奥林匹克日',
		'd0625': '全国土地日',
		'd0626': '国际禁毒日',
		'd0701': '香港回归纪念日 中共诞辰 世界建筑日',
		'd0702': '国际体育记者日',
		'd0707': '抗日战争纪念日',
		'd0711': '世界人口日',
		'd0730': '非洲妇女日',
		'd0801': '建军节',
		'd0808': '中国男子节(爸爸节)',
		'd0815': '抗日战争胜利纪念',
		'd0908': '国际扫盲日 国际新闻工作者日',
		'd0909': '毛泽东逝世纪念',
		'd0910': '中国教师节',
		'd0914': '世界清洁地球日',
		'd0916': '国际臭氧层保护日',
		'd0918': '九一八事变纪念日',
		'd0920': '国际爱牙日',
		'd0927': '世界旅游日',
		'd0928': '孔子诞辰',
		'd1001': '国庆节 世界音乐日 国际老人节',
		'd1002': '国际和平与民主自由斗争日',
		'd1004': '世界动物日',
		'd1006': '老人节',
		'd1008': '全国高血压日 世界视觉日',
		'd1009': '世界邮政日 万国邮联日',
		'd1010': '辛亥革命纪念日 世界精神卫生日',
		'd1013': '世界保健日 国际教师节',
		'd1014': '世界标准日',
		'd1015': '国际盲人节(白手杖节)',
		'd1016': '世界粮食日',
		'd1017': '世界消除贫困日',
		'd1022': '世界传统医药日',
		'd1024': '联合国日 世界发展信息日',
		'd1031': '世界勤俭日',
		'd1107': '十月社会主义革命纪念日',
		'd1108': '中国记者日',
		'd1109': '全国消防安全宣传教育日',
		'd1110': '世界青年节',
		'd1111': '国际科学与和平周(本日所属的一周)',
		'd1112': '孙中山诞辰纪念日',
		'd1114': '世界糖尿病日',
		'd1117': '国际大学生节 世界学生节',
		'd1121': '世界问候日 世界电视日',
		'd1129': '国际声援巴勒斯坦人民国际日',
		'd1201': '世界艾滋病日',
		'd1203': '世界残疾人日',
		'd1205': '国际经济和社会发展志愿人员日',
		'd1208': '国际儿童电视日',
		'd1209': '世界足球日',
		'd1210': '世界人权日',
		'd1212': '西安事变纪念日',
		'd1213': '南京大屠杀(1937年)纪念日！紧记血泪史！',
		'd1220': '澳门回归纪念',
		'd1221': '国际篮球日',
		'd1224': '平安夜',
		'd1225': '圣诞节',
		'd1226': '毛泽东诞辰纪念'
	};

	//农历节日
	var lunarFestival = {
		'd0101': '春节',
		'd0115': '元宵节',
		'd0202': '龙抬头节',
		'd0323': '妈祖生辰',
		'd0505': '端午节',
		'd0707': '七夕情人节',
		'd0715': '中元节',
		'd0815': '中秋节',
		'd0909': '重阳节',
		'd1015': '下元节',
		'd1208': '腊八节',
		'd1223': '小年',
		'd0100': '除夕'
	};

	/**
	 * 1890 - 2100 年的农历数据
	 * 数据格式：[0,2,9,21936]
	 * [闰月所在月，0为没有闰月; *正月初一对应公历月; *正月初一对应公历日; *农历每月的天数的数组（需转换为二进制,得到每月大小，0=小月(29日),1=大月(30日)）;]
	*/
	var lunarInfo = [[2, 1, 21, 22184], [0, 2, 9, 21936], [6, 1, 30, 9656], [0, 2, 17, 9584], [0, 2, 6, 21168], [5, 1, 26, 43344], [0, 2, 13, 59728], [0, 2, 2, 27296], [3, 1, 22, 44368], [0, 2, 10, 43856], [8, 1, 30, 19304], [0, 2, 19, 19168], [0, 2, 8, 42352], [5, 1, 29, 21096], [0, 2, 16, 53856], [0, 2, 4, 55632], [4, 1, 25, 27304], [0, 2, 13, 22176], [0, 2, 2, 39632], [2, 1, 22, 19176], [0, 2, 10, 19168], [6, 1, 30, 42200], [0, 2, 18, 42192], [0, 2, 6, 53840], [5, 1, 26, 54568], [0, 2, 14, 46400], [0, 2, 3, 54944], [2, 1, 23, 38608], [0, 2, 11, 38320], [7, 2, 1, 18872], [0, 2, 20, 18800], [0, 2, 8, 42160], [5, 1, 28, 45656], [0, 2, 16, 27216], [0, 2, 5, 27968], [4, 1, 24, 44456], [0, 2, 13, 11104], [0, 2, 2, 38256], [2, 1, 23, 18808], [0, 2, 10, 18800], [6, 1, 30, 25776], [0, 2, 17, 54432], [0, 2, 6, 59984], [5, 1, 26, 27976], [0, 2, 14, 23248], [0, 2, 4, 11104], [3, 1, 24, 37744], [0, 2, 11, 37600], [7, 1, 31, 51560], [0, 2, 19, 51536], [0, 2, 8, 54432], [6, 1, 27, 55888], [0, 2, 15, 46416], [0, 2, 5, 22176], [4, 1, 25, 43736], [0, 2, 13, 9680], [0, 2, 2, 37584], [2, 1, 22, 51544], [0, 2, 10, 43344], [7, 1, 29, 46248], [0, 2, 17, 27808], [0, 2, 6, 46416], [5, 1, 27, 21928], [0, 2, 14, 19872], [0, 2, 3, 42416], [3, 1, 24, 21176], [0, 2, 12, 21168], [8, 1, 31, 43344], [0, 2, 18, 59728], [0, 2, 8, 27296], [6, 1, 28, 44368], [0, 2, 15, 43856], [0, 2, 5, 19296], [4, 1, 25, 42352], [0, 2, 13, 42352], [0, 2, 2, 21088], [3, 1, 21, 59696], [0, 2, 9, 55632], [7, 1, 30, 23208], [0, 2, 17, 22176], [0, 2, 6, 38608], [5, 1, 27, 19176], [0, 2, 15, 19152], [0, 2, 3, 42192], [4, 1, 23, 53864], [0, 2, 11, 53840], [8, 1, 31, 54568], [0, 2, 18, 46400], [0, 2, 7, 46752], [6, 1, 28, 38608], [0, 2, 16, 38320], [0, 2, 5, 18864], [4, 1, 25, 42168], [0, 2, 13, 42160], [10, 2, 2, 45656], [0, 2, 20, 27216], [0, 2, 9, 27968], [6, 1, 29, 44448], [0, 2, 17, 43872], [0, 2, 6, 38256], [5, 1, 27, 18808], [0, 2, 15, 18800], [0, 2, 4, 25776], [3, 1, 23, 27216], [0, 2, 10, 59984], [8, 1, 31, 27432], [0, 2, 19, 23232], [0, 2, 7, 43872], [5, 1, 28, 37736], [0, 2, 16, 37600], [0, 2, 5, 51552], [4, 1, 24, 54440], [0, 2, 12, 54432], [0, 2, 1, 55888], [2, 1, 22, 23208], [0, 2, 9, 22176], [7, 1, 29, 43736], [0, 2, 18, 9680], [0, 2, 7, 37584], [5, 1, 26, 51544], [0, 2, 14, 43344], [0, 2, 3, 46240], [4, 1, 23, 46416], [0, 2, 10, 44368], [9, 1, 31, 21928], [0, 2, 19, 19360], [0, 2, 8, 42416], [6, 1, 28, 21176], [0, 2, 16, 21168], [0, 2, 5, 43312], [4, 1, 25, 29864], [0, 2, 12, 27296], [0, 2, 1, 44368], [2, 1, 22, 19880], [0, 2, 10, 19296], [6, 1, 29, 42352], [0, 2, 17, 42208], [0, 2, 6, 53856], [5, 1, 26, 59696], [0, 2, 13, 54576], [0, 2, 3, 23200], [3, 1, 23, 27472], [0, 2, 11, 38608], [11, 1, 31, 19176], [0, 2, 19, 19152], [0, 2, 8, 42192], [6, 1, 28, 53848], [0, 2, 15, 53840], [0, 2, 4, 54560], [5, 1, 24, 55968], [0, 2, 12, 46496], [0, 2, 1, 22224], [2, 1, 22, 19160], [0, 2, 10, 18864], [7, 1, 30, 42168], [0, 2, 17, 42160], [0, 2, 6, 43600], [5, 1, 26, 46376], [0, 2, 14, 27936], [0, 2, 2, 44448], [3, 1, 23, 21936], [0, 2, 11, 37744], [8, 2, 1, 18808], [0, 2, 19, 18800], [0, 2, 8, 25776], [6, 1, 28, 27216], [0, 2, 15, 59984], [0, 2, 4, 27424], [4, 1, 24, 43872], [0, 2, 12, 43744], [0, 2, 2, 37600], [3, 1, 21, 51568], [0, 2, 9, 51552], [7, 1, 29, 54440], [0, 2, 17, 54432], [0, 2, 5, 55888], [5, 1, 26, 23208], [0, 2, 14, 22176], [0, 2, 3, 42704], [4, 1, 23, 21224], [0, 2, 11, 21200], [8, 1, 31, 43352], [0, 2, 19, 43344], [0, 2, 7, 46240], [6, 1, 27, 46416], [0, 2, 15, 44368], [0, 2, 5, 21920], [4, 1, 24, 42448], [0, 2, 12, 42416], [0, 2, 2, 21168], [3, 1, 22, 43320], [0, 2, 9, 26928], [7, 1, 29, 29336], [0, 2, 17, 27296], [0, 2, 6, 44368], [5, 1, 26, 19880], [0, 2, 14, 19296], [0, 2, 3, 42352], [4, 1, 24, 21104], [0, 2, 10, 53856], [8, 1, 30, 59696], [0, 2, 18, 54560], [0, 2, 7, 55968], [6, 1, 27, 27472], [0, 2, 15, 22224], [0, 2, 5, 19168], [4, 1, 25, 42216], [0, 2, 12, 42192], [0, 2, 1, 53584], [2, 1, 21, 55592], [0, 2, 9, 54560]];

	/**
	 * 二十四节气数据，节气点时间（单位是分钟）
	 * 从0小寒起算
	 */
	var termInfo = [0, 21208, 42467, 63836, 85337, 107014, 128867, 150921, 173149, 195551, 218072, 240693, 263343, 285989, 308563, 331033, 353350, 375494, 397447, 419210, 440795, 462224, 483532, 504758];

	/**
	 * 判断农历年闰月数
	 * @param {Number} year 农历年
	 * return 闰月数 （月份从1开始）
	 */
	function getLunarLeapYear(year) {
		var yearData = lunarInfo[year - minYear];
		return yearData[0];
	};

	/**
	 * 获取农历年份一年的每月的天数及一年的总天数
	 * @param {Number} year 农历年
	 */
	function getLunarYearDays(year) {
		var yearData = lunarInfo[year - minYear];
		var leapMonth = yearData[0]; //闰月
		var monthData = yearData[3].toString(2);
		var monthDataArr = monthData.split('');

		//还原数据至16位,少于16位的在前面插入0（二进制存储时前面的0被忽略）
		for (var i = 0; i < 16 - monthDataArr.length; i++) {
			monthDataArr.unshift(0);
		}

		var len = leapMonth ? 13 : 12; //该年有几个月
		var yearDays = 0;
		var monthDays = [];
		for (var i = 0; i < len; i++) {
			if (monthDataArr[i] == 0) {
				yearDays += 29;
				monthDays.push(29);
			} else {
				yearDays += 30;
				monthDays.push(30);
			}
		}

		return {
			yearDays: yearDays,
			monthDays: monthDays
		};
	};

	/**
	 * 通过间隔天数查找农历日期
	 * @param {Number} year,between 农历年，间隔天数
	 */
	function getLunarDateByBetween(year, between) {
		var lunarYearDays = getLunarYearDays(year);
		var end = between > 0 ? between : lunarYearDays.yearDays - Math.abs(between);
		var monthDays = lunarYearDays.monthDays;
		var tempDays = 0;
		var month = 0;
		for (var i = 0; i < monthDays.length; i++) {
			tempDays += monthDays[i];
			if (tempDays > end) {
				month = i;
				tempDays = tempDays - monthDays[i];
				break;
			}
		}

		return [year, month, end - tempDays + 1];
	};

	/**
	 * 根据距离正月初一的天数计算农历日期
	 * @param {Number} year 公历年，月，日
	 */
	function getLunarByBetween(year, month, day) {
		var yearData = lunarInfo[year - minYear];
		var zenMonth = yearData[1];
		var zenDay = yearData[2];
		var between = getDaysBetweenSolar(year, zenMonth - 1, zenDay, year, month, day);
		if (between == 0) { //正月初一
			return [year, 0, 1];
		} else {
			var lunarYear = between > 0 ? year : year - 1;
			return getLunarDateByBetween(lunarYear, between);
		}
	};

	/**
	 * 两个公历日期之间的天数
	 */
	function getDaysBetweenSolar(year, month, day, year1, month1, day1) {
		var date = new Date(year, month, day).getTime();
		var date1 = new Date(year1, month1, day1).getTime();
		return (date1 - date) / 86400000;
	};

	/**
	 * 计算农历日期离正月初一有多少天
	 * @param {Number} year,month,day 农年，月(0-12，有闰月)，日
	 */
	function getDaysBetweenZheng(year, month, day) {
		var lunarYearDays = getLunarYearDays(year);
		var monthDays = lunarYearDays.monthDays;
		var days = 0;
		for (var i = 0; i < monthDays.length; i++) {
			if (i < month) {
				days += monthDays[i];
			} else {
				break;
			}
		};
		return days + day - 1;
	};

	/**
	 * 某年的第n个节气为几日
	 * 31556925974.7为地球公转周期，是毫秒
	 * 1890年的正小寒点：01-05 16:02:31，1890年为基准点
	 * @param {Number} y 公历年
	 * @param {Number} n 第几个节气，从0小寒起算
	 * 由于农历24节气交节时刻采用近似算法，可能存在少量误差(30分钟内)
	 */
	function getTerm(y, n) {
		var offDate = new Date((31556925974.7 * (y - 1890) + termInfo[n] * 60000) + Date.UTC(1890, 0, 5, 16, 2, 31));
		return (offDate.getUTCDate());
	};

	/**
	 * 获取公历年一年的二十四节气
	 * 返回key:日期，value:节气中文名
	 */
	function getYearTerm(year) {
		var res = {};
		var month = 0;
		for (var i = 0; i < 24; i++) {
			var day = getTerm(year, i);
			if (i % 2 == 0) month++;
			res[DATA.solarTerm[i]] = formateDayD4(year,month,day);
		}
		return res;
	};

	/**
	 * 获取生肖
	 * @param {Number} year 干支所在年（默认以立春前的公历年作为基数）
	 */
	function getYearZodiac(year) {
		var num = year - 1890 + 25; //参考干支纪年的计算，生肖对应地支
		return DATA.zodiac[num % 12];
	};

	/**
	 * 计算天干地支
	 * @param {Number} num 60进制中的位置(把60个天干地支，当成一个60进制的数)
	 */
	function cyclical(num) {
		return (DATA.heavenlyStems[num % 10] + DATA.earthlyBranches[num % 12]);
	}

	/**
	 * 获取干支纪年
	 * @param {Number} year 干支所在年
	 * @param {Number} offset 偏移量，默认为0，便于查询一个年跨两个干支纪年（以立春为分界线）
	 */
	function getLunarYearName(year, offset) {
		offset = offset || 0;
		//1890年1月小寒（小寒一般是1月5或6日）以前为己丑年，在60进制中排25
		return cyclical(year - 1890 + 25 + offset);
	};

	/**
	 * 获取干支纪月
	 * @param {Number} year,month 公历年，干支所在月
	 * @param {Number} offset 偏移量，默认为0，便于查询一个月跨两个干支纪月（有立春的2月）
	 */
	function getLunarMonthName(year, month, offset) {
		offset = offset || 0;
		//1890年1月小寒以前为丙子月，在60进制中排12
		return cyclical((year - 1890) * 12 + month + 12 + offset);
	};

	/**
	 * 获取干支纪日
	 * @param {Number} year,month,day 公历年，月，日
	 */
	function getLunarDayName(year, month, day) {
		//当日与1890/1/1 相差天数
		//1890/1/1与 1970/1/1 相差29219日, 1890/1/1 日柱为壬午日(60进制18)
		var dayCyclical = Date.UTC(year, month, day) / 86400000 + 29219 + 18;
		return cyclical(dayCyclical);
	};

	/**
	 * 获取公历月份的天数
	 * @param {Number} year 公历年
	 * @param {Number} month 公历月
	 */
	function getSolarMonthDays(year, month) {
		var monthDays = [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
		return monthDays[month];
	};

	/**
	 * 判断公历年是否是闰年
	 * @param {Number} year 公历年
	 */
	function isLeapYear(year) {
		return ((year % 4 == 0 && year % 100 != 0) || (year % 400 == 0));
	};

	/*
	 * 统一日期输入参数（输入月份从1开始，内部月份统一从0开始）
	 */
	function formateDate(year, month, day, _minYear) {
		var argsLen = arguments.length;
		var now = new Date();
		year = argsLen ? parseInt(year, 10) : now.getFullYear();
		month = argsLen ? parseInt(month - 1, 10) : now.getMonth();
		day = argsLen ? parseInt(day, 10) || now.getDate() : now.getDate();
		if (year < (_minYear ? _minYear : minYear + 1) || year > maxYear) return { error: 100, msg: errorCode[100] };
		return {
			year: year,
			month: month,
			day: day
		};
	};

	/**
	 * 将农历转换为公历
	 * @param {Number} year,month,day 农历年，月(1-13，有闰月)，日
	 */
	function lunarToSolar(_year, _month, _day) {
		var inputDate = formateDate(_year, _month, _day);
		if (inputDate.error) return inputDate;
		var year = inputDate.year;
		var month = inputDate.month;
		var day = inputDate.day;

		var between = getDaysBetweenZheng(year, month, day); //离正月初一的天数
		var yearData = lunarInfo[year - minYear];
		var zenMonth = yearData[1];
		var zenDay = yearData[2];

		var offDate = new Date(year, zenMonth - 1, zenDay).getTime() + between * 86400000;
		offDate = new Date(offDate);
		return {
			year: offDate.getFullYear(),
			month: offDate.getMonth() + 1,
			day: offDate.getDate()
		};
	};

	/**
	 * 将公历转换为农历
	 * @param {Number} year,month,day 公历年，月，日
	 */
	function solarToLunar(_year, _month, _day) {
		var inputDate = formateDate(_year, _month, _day, minYear);
		if (inputDate.error) return inputDate;
		var year = inputDate.year;
		var month = inputDate.month;
		var day = inputDate.day;

		cacheUtil.setCurrent(year);
		//立春日期
		var term2 = cacheUtil.get('term2') ? cacheUtil.get('term2') : cacheUtil.set('term2', getTerm(year, 2));
		//二十四节气
		var termList = cacheUtil.get('termList') ? cacheUtil.get('termList') : cacheUtil.set('termList', getYearTerm(year));

		var firstTerm = getTerm(year, month * 2); //某月第一个节气开始日期
		var GanZhiYear = (month > 1 || month == 1 && day >= term2) ? year + 1 : year; //干支所在年份
		var GanZhiMonth = day >= firstTerm ? month + 1 : month; //干支所在月份（以节气为界）

		var lunarDate = getLunarByBetween(year, month, day);
		var lunarLeapMonth = getLunarLeapYear(lunarDate[0]);
		var lunarMonthName = '';
		if (lunarLeapMonth > 0 && lunarLeapMonth == lunarDate[1]) {
			lunarMonthName = '闰' + DATA.monthCn[lunarDate[1] - 1] + '月';
		} else if (lunarLeapMonth > 0 && lunarDate[1] > lunarLeapMonth) {
			lunarMonthName = DATA.monthCn[lunarDate[1] - 1] + '月';
		} else {
			lunarMonthName = DATA.monthCn[lunarDate[1]] + '月';
		}

		//农历节日判断
		var lunarFtv = '';
		var lunarMonthDays = getLunarYearDays(lunarDate[0]).monthDays;
		//除夕
		if (lunarDate[1] == lunarMonthDays.length - 1 && lunarDate[2] == lunarMonthDays[lunarMonthDays.length - 1]) {
			lunarFtv = lunarFestival['d0100'];
		} else if (lunarLeapMonth > 0 && lunarDate[1] > lunarLeapMonth) {
			lunarFtv = lunarFestival[formateDayD4(lunarDate[1] - 1, lunarDate[2])];
		} else {
			lunarFtv = lunarFestival[formateDayD4(lunarDate[1], lunarDate[2])];
		}

		var res = {
			zodiac: getYearZodiac(GanZhiYear),
			GanZhiYear: getLunarYearName(GanZhiYear),
			GanZhiMonth: getLunarMonthName(year, GanZhiMonth),
			GanZhiDay: getLunarDayName(year, month, day),
			//放假安排：0无特殊安排，1工作，2放假
			worktime: worktime['y' + year] && worktime['y' + year][formateDayD4(year,month, day)] ? worktime['y' + year][formateDayD4(month, day)] : 0,
			term0:  termList["立春"],
			term1:  termList["立夏"],
			term2:  termList["立秋"],
			term3:  termList["立冬"],
			term4:  termList["惊蛰"],
			term5:  termList["清明"],
			term6:  termList["芒种"],
			term7:  termList["小暑"],
			term8:  termList["白露"],
			term9:  termList["寒露"],
			term10:  termList["大雪"],
			term11:  termList["小寒"],
			lunarYear: lunarDate[0],
			lunarMonth: lunarDate[1] + 1,
			lunarDay: lunarDate[2],
			lunarMonthName: lunarMonthName,
			lunarDayName: DATA.dateCn[lunarDate[2] - 1],
			lunarLeapMonth: lunarLeapMonth,

			solarFestival: solarFestival[formateDayD4(year,month, day)],
			lunarFestival: lunarFtv
		};

		return res;
	};

	/**
	 * 获取指定公历月份的农历数据
	 * return res{Object}
	 * @param {Number} year,month 公历年，月
	 * @param {Boolean} fill 是否用上下月数据补齐首尾空缺，首例数据从周日开始
	 */
	function calendar(_year, _month, fill) {
		var inputDate = formateDate(_year, _month);
		if (inputDate.error) return inputDate;
		var year = inputDate.year;
		var month = inputDate.month;

		var calendarData = solarCalendar(year, month + 1, fill);
		for (var i = 0; i < calendarData.monthData.length; i++) {
			var cData = calendarData.monthData[i];
			var lunarData = solarToLunar(cData.year, cData.month, cData.day);
			extend(calendarData.monthData[i], lunarData);
		}
		return calendarData;
	};

	/**
	 * 公历某月日历
	 * return res{Object}
	 * @param {Number} year,month 公历年，月
	 * @param {Boolean} fill 是否用上下月数据补齐首尾空缺，首例数据从周日开始 (7*6阵列)
	 */
	function solarCalendar(_year, _month, fill) {
		var inputDate = formateDate(_year, _month);
		if (inputDate.error) return inputDate;
		var year = inputDate.year;
		var month = inputDate.month;

		var firstDate = new Date(year, month, 1);
		var preMonthDays, preMonthData, nextMonthData;

		var res = {
			firstDay: firstDate.getDay(),
			monthDays: getSolarMonthDays(year, month),
			monthData: []
		};

		res.monthData = creatLenArr(year, month + 1, res.monthDays, 1);

		if (fill) {
			if (res.firstDay > 0) { //前补
				var preYear = month - 1 < 0 ? year - 1 : year;
				var preMonth = month - 1 < 0 ? 11 : month - 1;
				preMonthDays = getSolarMonthDays(preYear, preMonth);
				preMonthData = creatLenArr(preYear, preMonth + 1, res.firstDay, preMonthDays - res.firstDay + 1);
				res.monthData = preMonthData.concat(res.monthData);
			}

			if (7 * 6 - res.monthData.length != 0) { //后补
				var nextYear = month + 1 > 11 ? year + 1 : year;
				var nextMonth = month + 1 > 11 ? 0 : month + 1;
				var fillLen = 7 * 6 - res.monthData.length;
				nextMonthData = creatLenArr(nextYear, nextMonth + 1, fillLen, 1);
				res.monthData = res.monthData.concat(nextMonthData);
			}
		}

		return res;
	};
	



	function getTiangansDizhisSequence(tiangans, dizhis) {
		const tianganSequence = {
		  "甲": 1,
		  "乙": 2,
		  "丙": 3,
		  "丁": 4,
		  "戊": 5,
		  "己": 6,
		  "庚": 7,
		  "辛": 8,
		  "壬": 9,
		  "癸": 10
		};
	  
		const dizhiSequence = {
		  "子": 1,
		  "丑": 2,
		  "寅": 3,
		  "卯": 4,
		  "辰": 5,
		  "巳": 6,
		  "午": 7,
		  "未": 8,
		  "申": 9,
		  "酉": 10,
		  "戌": 11,
		  "亥": 12
		};
	  
		const tianganSequenceList = Array.from(tiangans).map(t => tianganSequence[t]);
  const dizhiSequenceList = Array.from(dizhis).map(d => dizhiSequence[d]);
	  
		return [tianganSequenceList, dizhiSequenceList];
	  }
	  
	  
	
	  
	function getCurrentTiangandizhi(hour,daytiangan,daydizhi) {
		const tianganSequenceList = getTiangansDizhisSequence(daytiangan, daydizhi)[0];	
	  const dizhiSequenceList=getTiangansDizhisSequence(daytiangan, daydizhi)[1];
		let currentHour = hour;
	
	  
		const dizhis = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
		const tiangans = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
	  
		let dizhiIndex;
	 if (currentHour >= 23 && currentHour < 25) {
		  dizhiIndex = 0; // 子时
		} else if (currentHour >= 1 && currentHour < 3) {
		  dizhiIndex = 1; // 丑时
		} else if (currentHour >= 3 && currentHour < 5) {
		  dizhiIndex = 2; // 寅时
		} else if (currentHour >= 5 && currentHour < 7) {
		  dizhiIndex = 3; // 卯时
		} else if(currentHour >= 7 && currentHour < 9){
		  dizhiIndex = 4
		}else if(currentHour >= 9 && currentHour < 11){
			dizhiIndex = 5
		  }else if(currentHour >= 11 && currentHour < 13){
			dizhiIndex = 6
		  }else if(currentHour >= 13 && currentHour < 15){
			dizhiIndex = 7
		  }else if(currentHour >= 15 && currentHour < 17){
			dizhiIndex = 8
		  }else if(currentHour >= 17 && currentHour < 19){
			dizhiIndex = 9
		  }else if(currentHour >= 19&& currentHour < 21){
			dizhiIndex = 10
		  }else if(currentHour >= 21 && currentHour < 23){
			dizhiIndex = 11
		  }
	  
		const tianganIndex =[(( tianganSequenceList)*2)+(dizhiIndex-1)]%10;
	  if(tianganIndex===0){

		const dizhi = dizhis[dizhiIndex];
		
		const tiangan =tiangans[9];

		return [tiangan, dizhi];

	  }else{
		const dizhi = dizhis[dizhiIndex];

		const tiangan =tiangans[tianganIndex-1];

		return [tiangan, dizhi];
	  }
	  }
	  	  
  


	  

	 
  
  function getWuxings(tiangans, dizhis) {
	const tianganWuxing = {
	  "甲": "木",
	  "乙": "木",
	  "丙": "火",
	  "丁": "火",
	  "戊": "土",
	  "己": "土",
	  "庚": "金",
	  "辛": "金",
	  "壬": "水",
	  "癸": "水"
	};
  
	const dizhiWuxing = {
	  "子": "水",
	  "丑": "土",
	  "寅": "木",
	  "卯": "木",
	  "辰": "土",
	  "巳": "火",
	  "午": "火",
	  "未": "土",
	  "申": "金",
	  "酉": "金",
	  "戌": "土",
	  "亥": "水"
	};
  
	const result = [];
	
	 
	  const wuxingTiangan = tianganWuxing[tiangans];
	  const wuxingDizhi = dizhiWuxing[dizhis];
	  result.push([ wuxingTiangan, wuxingDizhi]);
	
  
	return result;
  }

  function convertDizhiToTiangan(dizhi) {
	switch (dizhi) {
	  case '子':
		return '癸  ';
	  case '丑':
		return '癸辛己';
	  case '寅':
		return '甲丙戊';
	  case '卯':
		return '乙  ';
	  case '辰':
		return '乙戊癸';
	  case '巳':
		return '庚丙戊';
	  case '午':
		return '丁 己';
	  case '未':
		return '乙己丁';
	  case '申':
		return '庚壬戊';
	  case '酉':
		return '辛  ';
	  case '戌':
		return '辛丁戊';
	  case '亥':
		return '壬甲  ';
	  default:
		return '  ';
	}
  }
  function determineRelationship(dayTiangan, otherTiangan) {
	const dayWuxing = getWuxing(dayTiangan);
	const otherWuxing = getWuxing(otherTiangan);
  
	const dayGender = getGender(dayTiangan);
	const otherGender = getGender(otherTiangan);
  
	if (dayWuxing && otherWuxing) {
	  if (otherWuxing.includes(dayWuxing)) {
		return dayGender === otherGender ? '(比肩)' : '(劫财)';
	  } else if (isOvercoming(dayWuxing, otherWuxing)) {
		return dayGender === otherGender ? '(偏财)' : '(正财)';
	  } else if (isOvercoming(otherWuxing, dayWuxing)) {
		return dayGender === otherGender ? '(七杀)' : '(正官)';
	  } else if (isGenerating(dayWuxing, otherWuxing)) {
		return dayGender === otherGender ? '(食神)' : '(伤官)';
	  } else if (isGenerating(otherWuxing, dayWuxing)) {
		return dayGender === otherGender ? '(偏印)' : '(正印)';
	  }
	}
	
	return '';
  }
  
  function getGender(tiangan) {
	const yangTiangan = ['甲', '丙', '戊', '庚', '壬'];
	return yangTiangan.includes(tiangan) ? '阳' : '阴';
  }
  
  function getWuxing(tiangan) {
	const wuxingMap = {
	  '甲': '木',
	  '乙': '木',
	  '丙': '火',
	  '丁': '火',
	  '戊': '土',
	  '己': '土',
	  '庚': '金',
	  '辛': '金',
	  '壬': '水',
	  '癸': '水',
	};
	return wuxingMap[tiangan];
  }
  
  function isOvercoming(wuxing1, wuxing2) {
	const overcomingMap = {
	  '木': ['土'],
	  '土': ['水'],
	  '水': ['火'],
	  '火': ['金'],
	  '金': ['木'],
	};
	return overcomingMap[wuxing1]?.includes(wuxing2);
  }
  
  function isGenerating(wuxing1, wuxing2) {
	const generatingMap = {
	  '木': ['火'],
	  '火': ["土"],
	  '土': ['金'],
	  '金': ['水'],
	  '水': ['木'],
	};
	return generatingMap[wuxing1]?.includes(wuxing2);
  }
  
  function getSeasons(year,month,day) {

	const birthDate=new Date(year,month-1,day);
	const seasonbazi=solarToLunar(year,month,day);

	const springEquinox = seasonbazi.term0; // 立春日期
	const summerSolstice = seasonbazi.term1; // 立夏日期
	const autumnEquinox = seasonbazi.term2; // 立秋日期
	const winterSolstice = seasonbazi.term3; // 立冬日期
	const oneDayInMillis = 24 * 60 * 60 * 1000; // 一天的毫秒数
	const springEquinoxnewDateInMillis = springEquinox.getTime() - 18 * oneDayInMillis;
	const springEquinoxnewDate = new Date(springEquinoxnewDateInMillis);
	const summerSolsticeDateInMillis = summerSolstice.getTime() - 18 * oneDayInMillis;
	const summerSolsticenewDate = new Date(summerSolsticeDateInMillis);
	const autumnEquinoxnewDateInMillis = autumnEquinox.getTime() - 18 * oneDayInMillis;
	const autumnEquinoxnewDate = new Date(autumnEquinoxnewDateInMillis);
	const winterSolsticenewDateInMillis = winterSolstice.getTime() - 18 * oneDayInMillis;
	const winterSolsticenewDate = new Date(winterSolsticenewDateInMillis);


	if (birthDate >= springEquinox && birthDate < summerSolsticenewDate) {
	  return "春";

	} else if (birthDate >= summerSolstice && birthDate < autumnEquinoxnewDate ) {
	  return '夏';

	} else if (birthDate >= autumnEquinox && birthDate < winterSolsticenewDate ) {
	  return '秋';

	} else if (birthDate >= winterSolstice || birthDate < springEquinoxnewDate ) {
	  return "冬";

	} else {
	  return "季";

	}
  }
  

  
  function determinewuxingRelationship(wuxing, season) {
	const wuxingAttributes = {
	  '木': ["(旺)","(休)","(死)","(相)","(囚)"],
	  '火': ["(相)","(旺)","(囚)","(死)","(相)"],
	  '土': ["(死)","(相)","(休)","(囚)","(旺)"],
	  '金': ["(囚)","(死)","(旺)","(休)","(相)"],
	  '水': ["(休)","(囚)","(相)","(旺)","(死)"],
	   
	};
  
	const seasonAttributes = {
	 '春':0,
	 '夏':1,
	 '秋':2,
	 '冬':3,
	 '季':4,
	};
  
	const wuxingAttribute = wuxingAttributes[wuxing];
	const seasonIndex = seasonAttributes[season];

	
	if (wuxingAttribute !== undefined && seasonIndex !== undefined) {
		const attributeIndex = seasonIndex;
		return wuxingAttribute[attributeIndex];
	  }
	
	  return ' ';
  }
  

  function getEarthBranchesAndIndex(tiangan,dizhi) {
	const wuxingMapping = {
	  "木": ["亥", "寅", "卯", "卯", "寅", "辰", "未", "申", "酉"],
	  "火": ["寅", "巳", "午", "午", "巳", "未", "戌", "亥", "子"],
	  "土": ["寅", "巳", "午", "午", "巳", "未", "戌", "亥", "子"],
	  "金": ["巳", "申", "酉", "酉", "申", "戌", "丑", "寅", "卯"],
	  "水": ["申", "亥", "子", "子", "亥", "丑", "辰", "巳", "午"],

	  // 其他五行的对应关系也可以继续在这里添加
	};
	const tianganWuxing = getWuxing(tiangan);
  
	const Gender = getGender(tiangan);
	const earthBranches = wuxingMapping[tianganWuxing];
	
	if (!wuxingMapping.hasOwnProperty(tianganWuxing)) {
	  return " "; // 无效的五行参数，返回 null
	}
  if(Gender==="阳"){
	earthBranches.splice(2, 1);

// 移除第五个元素（由于前面已经移除了一个元素，所以此时索引为3）
earthBranches.splice(3, 1);
earthBranches.splice(-1, 1);
	
	const index = earthBranches.indexOf(dizhi);
	const EarthBranches=getDefinitionByIndex(index)
return EarthBranches;


  }else if(Gender==="阴"){
	earthBranches.splice(1, 1);

// 移除第五个元素（由于前面已经移除了一个元素，所以此时索引为3）
earthBranches.splice(2, 1);
earthBranches.splice(-2, 1);
	const index = earthBranches.indexOf(dizhi);
	const EarthBranches=getDefinitionByIndex(index)
	return EarthBranches;
  }
	
	
  
	

	
  

  }

  function getDaysToNextTerm(year, month, day) {
	const birthDate = new Date(year, month - 1, day);
	const seasonbazi = solarToLunar(year, month, day);
  
	// 获取节气日期
	const terms = [
	  seasonbazi.term0, // 立春日期
	  seasonbazi.term3, // 惊蛰日期
	  seasonbazi.term4, // 清明日期
	  seasonbazi.term1, // 立夏日期
	  seasonbazi.term5, // 芒种日期
	  seasonbazi.term6, // 小暑日期
	  seasonbazi.term2, // 立秋日期
	  seasonbazi.term7, // 白露日期
	  seasonbazi.term8, // 寒露日期
	  seasonbazi.term9, // 立冬日期
	  seasonbazi.term11, // 大雪日期
	  seasonbazi.term10 // 小寒日期
	];
  
	// 找到生日日期后面最近的节气日期
	const oneDayInMillis = 24 * 60 * 60 * 1000; // 一天的毫秒数
	let nextTerm;
	let daysToNextTerm = Number.MAX_VALUE; // 初始化为最大值，用于找到最小的差值
	for (const termDate of terms) {
	  if (termDate.getTime() > birthDate.getTime()) {
		const diffInMillis = termDate.getTime() - birthDate.getTime();
		if (diffInMillis < daysToNextTerm) {
		  daysToNextTerm = diffInMillis;
		  nextTerm = termDate;
		}
	  }
	}
  
	daysToNextTerm = Math.ceil(daysToNextTerm / oneDayInMillis);
	return daysToNextTerm+1;
  }
  
  function getDaysToPreviousTerm(year, month, day) {
  const birthDate = new Date(year, month - 1, day);
  const seasonbazi = solarToLunar(year, month, day);

  // 获取节气日期
  const terms = [
    seasonbazi.term0, // 立春日期
    seasonbazi.term3, // 惊蛰日期
    seasonbazi.term4, // 清明日期
    seasonbazi.term1, // 立夏日期
    seasonbazi.term5, // 芒种日期
    seasonbazi.term6, // 小暑日期
    seasonbazi.term2, // 立秋日期
    seasonbazi.term7, // 白露日期
    seasonbazi.term8, // 寒露日期
    seasonbazi.term9, // 立冬日期
    seasonbazi.term11, // 大雪日期
    seasonbazi.term10 // 小寒日期
  ];

  // 找到生日日期之前最近的节气日期
  const oneDayInMillis = 24 * 60 * 60 * 1000; // 一天的毫秒数
  let previousTerm;
  let daysToPreviousTerm = Number.MAX_VALUE; // 初始化为最大值，用于找到最小的差值
  for (const termDate of terms) {
    if (termDate.getTime() < birthDate.getTime()) {
      const diffInMillis = birthDate.getTime() - termDate.getTime();
      if (diffInMillis < daysToPreviousTerm) {
        daysToPreviousTerm = diffInMillis;
        previousTerm = termDate;
      }
    }
  }

  daysToPreviousTerm = Math.ceil(daysToPreviousTerm / oneDayInMillis);
  return daysToPreviousTerm+1;
}


  
  function getDefinitionByIndex(index) {
	const definitions = ["(生)", "(禄)", "(旺)", "(余气)", "(墓)", "(绝)"];
  
	if (index >= 0 && index < definitions.length) {
	  return definitions[index];
	} else {
	  return ' '; // 无效的序数，返回 null
	}
  }
  
  const generatePDF = require('./views/generatePdf');
  

  
  // 其他中间件和路由
  
  app.get('/generate-pdf', async (req, res) => {
	try {
	  const pdfFilePath = await generatePDF();
	  res.download(pdfFilePath);
	} catch (error) {
	  console.error('生成PDF出错：', error);
	  res.status(500).send('生成PDF出错');
	}
  });
  

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'bazi.html'));
});
app.set('view engine', 'ejs');

app.get('/result', (req, res) => {

	// 获取传入的年月日时参数
	const { year, month, day , hour,gender } = req.query;
const daysToPreviousTerm=getDaysToPreviousTerm(year,month,day);
const daysToNextTerm=getDaysToNextTerm(year,month,day);
	const bazi = solarToLunar(year, month, day);
	const yeartiangan=bazi.GanZhiYear[0];
	const yeardizhi=bazi.GanZhiYear[1];
	const monthtiangan=bazi.GanZhiMonth[0];
	const monthdizhi =bazi.GanZhiMonth[1];
	const daytiangan=bazi.GanZhiDay[0];
	const daydizhi=bazi.GanZhiDay[1];
	
	
	const season = getSeasons(year,month,day)
  const yearwuxings=getWuxings(yeartiangan,yeardizhi)
  const yeartianganwuxing=yearwuxings[0][0];
  const yeardizhiwuxing=yearwuxings[0][1];
  const monthwuxings=getWuxings(monthtiangan,monthdizhi);
  const monthtianganwuxing=monthwuxings[0][0];
  const monthdizhiwuxing=monthwuxings[0][1];
  const daywuxings=getWuxings(daytiangan,daydizhi);
  const daytianganwuxing=daywuxings[0][0];
const daydizhiwuxing=daywuxings[0][1];
const hourtiangandizhi = getCurrentTiangandizhi(hour,daytiangan,daydizhi);
const hourtiangan=hourtiangandizhi[0];
const hourdizhi=hourtiangandizhi[1];
const hourwuxings=getWuxings(hourtiangan,hourdizhi);

  const hourtianganwuxing=hourwuxings[0][0];
const hourdizhiwuxing=hourwuxings[0][1];

const yeardizhicangdun=convertDizhiToTiangan(yeardizhi);
const monthdizhicangdun=convertDizhiToTiangan(monthdizhi);
const daydizhicangdun =convertDizhiToTiangan(daydizhi);
const hourdizhicangdun=convertDizhiToTiangan(hourdizhi)
   const yeardizhiRelation0= determineRelationship(daytiangan,yeardizhicangdun[0])
   const yeardizhiRelation1=determineRelationship(daytiangan,yeardizhicangdun[1])
   const yeardizhiRelation2=determineRelationship(daytiangan,yeardizhicangdun[2],)
   const monthdizhiRelation0= determineRelationship(daytiangan,monthdizhicangdun[0])
   const monthdizhiRelation1=determineRelationship(daytiangan,monthdizhicangdun[1])
   const monthdizhiRelation2=determineRelationship(daytiangan,monthdizhicangdun[2])
   const daydizhiRelation0= determineRelationship(daytiangan,daydizhicangdun[0])
   const daydizhiRelation1=determineRelationship(daytiangan,daydizhicangdun[1])
   const daydizhiRelation2=determineRelationship(daytiangan,daydizhicangdun[2])
   const hourdizhiRelation0= determineRelationship(daytiangan,hourdizhicangdun[0])
   const hourdizhiRelation1=determineRelationship(daytiangan,hourdizhicangdun[1])
   const hourdizhiRelation2=determineRelationship(daytiangan,hourdizhicangdun[2])
   const yearRelation=determineRelationship(daytiangan,yeartiangan)
   const monthRelation=determineRelationship(daytiangan,monthtiangan);
   const hourRelation=determineRelationship(daytiangan,hourtiangan);
   const yeardizhicangdunwuxing0=getWuxing(yeardizhicangdun[0]);
   const yeardizhicangdunwuxing1=getWuxing(yeardizhicangdun[1]);
   const yeardizhicangdunwuxing2=getWuxing(yeardizhicangdun[2]);
   const monthdizhicangdunwuxing0=getWuxing(monthdizhicangdun[0]);
   const monthdizhicangdunwuxing1=getWuxing(monthdizhicangdun[1]);
   const monthdizhicangdunwuxing2=getWuxing(monthdizhicangdun[2]);
   const daydizhicangdunwuxing0=getWuxing(daydizhicangdun[0]);
   const daydizhicangdunwuxing1=getWuxing(daydizhicangdun[1]);
   const daydizhicangdunwuxing2=getWuxing(daydizhicangdun[2]);
   const hourdizhicangdunwuxing0=getWuxing(hourdizhicangdun[0]);
   const hourdizhicangdunwuxing1=getWuxing(hourdizhicangdun[1]);
   const hourdizhicangdunwuxing2=getWuxing(hourdizhicangdun[2]);
 
 
   const yearwuxingsishiyongshi0=determinewuxingRelationship(yeartianganwuxing,season);
   const yearwuxingsishiyongshi1=determinewuxingRelationship(yeardizhiwuxing,season);
   const monthwuxingsishiyongshi0=determinewuxingRelationship(monthtianganwuxing,season);
   const monthwuxingsishiyongshi1=determinewuxingRelationship(monthdizhiwuxing,season);
   const daywuxingsishiyongshi0=determinewuxingRelationship(daytianganwuxing,season);
   const daywuxingsishiyongshi1=determinewuxingRelationship(daydizhiwuxing,season);
   const hourwuxingsishiyongshi0=determinewuxingRelationship(hourtianganwuxing,season);
   const hourwuxingsishiyongshi1=determinewuxingRelationship(hourdizhiwuxing,season);
   const yeardizhiwuxingsishiyongshi0=determinewuxingRelationship(yeardizhicangdunwuxing0,season);
   const yeardizhiwuxingsishiyongshi1=determinewuxingRelationship(yeardizhicangdunwuxing1,season);
   const yeardizhiwuxingsishiyongshi2=determinewuxingRelationship(yeardizhicangdunwuxing2,season);
   const monthdizhiwuxingsishiyongshi0=determinewuxingRelationship(monthdizhicangdunwuxing0,season);
   const monthdizhiwuxingsishiyongshi1=determinewuxingRelationship(monthdizhicangdunwuxing1,season);
   const monthdizhiwuxingsishiyongshi2=determinewuxingRelationship(monthdizhicangdunwuxing2,season);
   const daydizhiwuxingsishiyongshi0=determinewuxingRelationship(daydizhicangdunwuxing0,season);
   const daydizhiwuxingsishiyongshi1=determinewuxingRelationship(daydizhicangdunwuxing1,season);
   const daydizhiwuxingsishiyongshi2=determinewuxingRelationship(daydizhicangdunwuxing2,season);
   const hourdizhiwuxingsishiyongshi0=determinewuxingRelationship(hourdizhicangdunwuxing0,season);
   const hourdizhiwuxingsishiyongshi1=determinewuxingRelationship(hourdizhicangdunwuxing1,season);
   const hourdizhiwuxingsishiyongshi2=determinewuxingRelationship(hourdizhicangdunwuxing2,season);

   const yearEarthBranches0=getEarthBranchesAndIndex(yeardizhicangdun[0],yeardizhi);
   const yearEarthBranches1=getEarthBranchesAndIndex(yeardizhicangdun[1],yeardizhi);
   const yearEarthBranches2=getEarthBranchesAndIndex(yeardizhicangdun[2],yeardizhi);
   const monthEarthBranches0=getEarthBranchesAndIndex(monthdizhicangdun[0],monthdizhi);
   const monthEarthBranches1=getEarthBranchesAndIndex(monthdizhicangdun[1],monthdizhi)
   const monthEarthBranches2=getEarthBranchesAndIndex(monthdizhicangdun[2],monthdizhi)
   const dayEarthBranches0=getEarthBranchesAndIndex(daydizhicangdun[0],daydizhi);
   const dayEarthBranches1=getEarthBranchesAndIndex(daydizhicangdun[1],daydizhi)
   const dayEarthBranches2=getEarthBranchesAndIndex(daydizhicangdun[2],daydizhi)
   const hourEarthBranches0=getEarthBranchesAndIndex(hourdizhicangdun[0],hourdizhi);
   const hourEarthBranches1=getEarthBranchesAndIndex(hourdizhicangdun[1],hourdizhi)
   const hourEarthBranches2=getEarthBranchesAndIndex(hourdizhicangdun[2],hourdizhi)


  res.render('index.ejs', 

  {gender,
	// 调用函数生成 PDF
   
	daysToNextTerm,
	daysToPreviousTerm,
	bazi,
	hourtiangandizhi,
	yearwuxings,
	monthwuxings,
	daywuxings,
	hourwuxings,
	yeardizhicangdun,
	monthdizhicangdun,
	daydizhicangdun,
	hourdizhicangdun,
	yeardizhiRelation0,
	yeardizhiRelation1,
	yeardizhiRelation2,
	monthdizhiRelation0,
	monthdizhiRelation1,
	monthdizhiRelation2,
	daydizhiRelation0,
	daydizhiRelation1,
	daydizhiRelation2,
	hourdizhiRelation0,
	hourdizhiRelation1,
	hourdizhiRelation2,
	yearRelation,
	monthRelation,
	hourRelation,
	yeardizhicangdunwuxing0,
	yeardizhicangdunwuxing1,
	yeardizhicangdunwuxing2,
	monthdizhicangdunwuxing0,
	monthdizhicangdunwuxing1,
	monthdizhicangdunwuxing2,
	daydizhicangdunwuxing0,
	daydizhicangdunwuxing1,
	daydizhicangdunwuxing2,
	hourdizhicangdunwuxing0,
	hourdizhicangdunwuxing1,
	hourdizhicangdunwuxing2,
	season,
	yearwuxingsishiyongshi0,
	yearwuxingsishiyongshi1,
	monthwuxingsishiyongshi0,
	monthwuxingsishiyongshi1,
	daywuxingsishiyongshi0,
	daywuxingsishiyongshi1,
	hourwuxingsishiyongshi0,
	hourwuxingsishiyongshi1,
	yeardizhiwuxingsishiyongshi0,
	yeardizhiwuxingsishiyongshi1,
	yeardizhiwuxingsishiyongshi2,
	monthdizhiwuxingsishiyongshi0,
	monthdizhiwuxingsishiyongshi1,
	monthdizhiwuxingsishiyongshi2,
	daydizhiwuxingsishiyongshi0,
	daydizhiwuxingsishiyongshi1,
	daydizhiwuxingsishiyongshi2,
	hourdizhiwuxingsishiyongshi0,
	hourdizhiwuxingsishiyongshi1,
	hourdizhiwuxingsishiyongshi2,
	yearEarthBranches0,
	yearEarthBranches1,
	yearEarthBranches2,
	monthEarthBranches0,
	monthEarthBranches1,
	monthEarthBranches2,
	dayEarthBranches0,
	dayEarthBranches1,
	dayEarthBranches2,
	hourEarthBranches0,
	hourEarthBranches1,
	hourEarthBranches2,
	
});
  })

// 设置视图引擎为 EJS

// 路由处理程序

  
app.listen(3001, () => {
    console.log('Server is running on port 3001');
  });


