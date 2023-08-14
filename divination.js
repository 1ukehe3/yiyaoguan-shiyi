const trigrams = [
  { name: '乾', yao: '111' },
  { name: '坤', yao: '000' },
  { name: '震', yao: '010' },
  { name: '巽', yao: '010' },
  { name: '坎', yao: '010' },
  { name: '离', yao: '010' },
  { name: '艮', yao: '010' },
  { name: '兑', yao: '010' }
];

const hexagrams = [
  { name: '乾', yao: '111111' },
  { name: '坤', yao: '000000' },
  { name: '屯', yao: '010001' },
  { name: '蒙', yao: '100010' },
  { name: '需', yao: '010111' },
  { name: '讼', yao: '111100' },
  { name: '师', yao: '000010' },
  { name: '比', yao: '010000' },
  { name: '小畜', yao: '110111' },
  { name: '履', yao: '111011' },
  { name: '泰', yao: '000111' },
  { name: '否', yao: '111000' },
  { name: '同人', yao: '111101' },
  { name: '大有', yao: '101111' },
  { name: '谦', yao: '000100' },
  { name: '豫', yao: '001000' },
  { name: '随', yao: '011001' },
  { name: '蛊', yao: '100110' },
  { name: '临', yao: '000011' },
  { name: '观', yao: '110000' },
  { name: '噬嗑', yao: '101001' },
  { name: '贲', yao: '100101' },
  { name: '剥', yao: '100000' },
  { name: '复', yao: '000001' },
  { name: '无妄', yao: '111001' },
  { name: '大畜', yao: '100111' },
  { name: '颐', yao: '100001' },
  { name: '大过', yao: '011110' },
  { name: '坎', yao: '010010' },
  { name: '离', yao: '101101' },
  { name: '咸', yao: '011100' },
  { name: '恒', yao: '001110' },
  { name: '遁', yao: '111100' },
  { name: '大壮', yao: '001111' },
  { name: '晋', yao: '101000' },
  { name: '明夷', yao: '000101' },
  { name: '家人', yao: '110101' },
  { name: '睽', yao: '101001' },
  { name: '蹇', yao: '010100' },
  { name: '解', yao: '001010' },
  { name: '损', yao: '100011' },
  { name: '益', yao: '110001' },
  { name: '夬', yao: '011111' },
  { name: '姤', yao: '111110' },
  { name: '萃', yao: '011000' },
  { name: '升', yao: '000110' },
  { name: '困', yao: '011010' },
  { name: '井', yao: '010110' },
  { name: '革', yao: '011101' },
  { name: '鼎', yao: '101110' },
  { name: '震', yao: '001001' },
  { name: '艮', yao: '100100' },
  { name: '渐', yao: '110100' },
  { name: '归妹', yao: '001011' },
  { name: '丰', yao: '001101' },
  { name: '旅', yao: '101100' },
  { name: '巽', yao: '110110' },
  { name: '兑', yao: '011011' },
  { name: '涣', yao: '110010' },
  { name: '节', yao: '010011' },
  { name: '中孚', yao: '110011' },
  { name: '小过', yao: '001100' },
  { name: '既济', yao: '010101' },
  { name: '未济', yao: '101010' }
];

function getRandomYao() {
  return Math.random() < 0.5 ? '0' : '1';
}

function generateHexagram() {
  let hexagram = '';
  for (let i = 0; i < 6; i++) {
    const yao = getRandomYao();
    hexagram += yao;
  }
  return hexagram;
}

function getTrigramName(trigramYao) {
  for (const trigram of trigrams) {
    if (trigram.yao === trigramYao) {
      return trigram.name;
    }
  }
  return '未知卦象';
}

function getHexagramName(hexagramYao) {
  for (const hexagram of hexagrams) {
    if (hexagram.yao === hexagramYao) {
      return hexagram.name;
    }
  }
  return '未知卦象';
}

function generateReading() {
  let reading = '';
  let hexagram = '';
  for (let i = 0; i < 6; i++) {
    const yao = getRandomYao();
    reading += yao;
    hexagram += yao === '0' ? '-- ' : '—— ';
  }
  return [reading,hexagram]
 
}


  function getStringFromDigits(digits) {
    const geng = ["庚戌", "庚申", "庚午", "庚辰", "庚寅", "庚子"];
    const bing = ["丙寅", "丙子", "丙戌", "丙申", "丙午", "丙辰"];
    const qian=  ["壬戌", "壬申", "壬午", "甲辰", "甲寅", "甲子"];
    const kan=   ["戊子", "戊戌", "戊申", "戊午", "戊辰", "戊寅"];
    const kun=   ["癸酉", "癸亥", "癸丑", "乙卯", "乙巳", "乙未"];
    const dui=   ["丁未", "丁酉", "丁亥", "丁丑", "丁卯", "丁巳"];
    const li=    ["己巳", "己未", "己酉", "己亥", "己丑", "己卯"]
    const xun=   ["辛卯", "辛巳", "辛未", "辛酉", "辛亥", "辛丑"]
    const firstDigits = digits.slice(0, 3);
    const secondDigits = digits.slice(3);
  
    let firstString = "";
    let secondString = "";
  
    if (firstDigits === "001") {
      firstString = geng.slice(0, 3).join(", ");
    } else if (firstDigits === "100") {
      firstString = bing.slice(0, 3).join(", ");
    }else if (firstDigits === "111") {
      firstString = qian.slice(0, 3).join(", ");
    }else if (firstDigits === "010") {
      firstString = kan.slice(0, 3).join(", ");
    }else if (firstDigits === "000") {
      firstString = kun.slice(0, 3).join(", ");
    }else if (firstDigits === "011") {
      firstString = dui.slice(0, 3).join(", ");
    }else if (firstDigits === "101") {
      firstString = li.slice(0, 3).join(", ");
    }else if (firstDigits === "110") {
      firstString = xun.slice(0, 3).join(", ");
    }
  
    if (secondDigits === "001") {
      secondString = geng.slice(3).join(", ");
    } else if (secondDigits === "100") {
      secondString = bing.slice(3).join(", ");
    }else if (secondDigits === "111") {
      secondString = qian.slice(3).join(", ");
    }else if (secondDigits === "010") {
      secondString = kan.slice(3).join(", ");
    }else if (secondDigits === "000") {
      secondString = kun.slice(3).join(", ");
    }else if (secondDigits === "011") {
      secondString = dui.slice(3).join(", ");
    }else if (secondDigits === "101") {
      secondString = li.slice(3).join(", ");
    }else if (secondDigits === "110") {
      secondString = xun.slice(3).join(", ");
    }
  
    const resultString = `${firstString}, ${secondString}`;
    return resultString;
  }
  const readings=generateReading()
const reading=readings[0]
const hexagram=readings[1]
const trigramName = getTrigramName(reading.substr(0, 3));
const hexagramName = getHexagramName(reading);
console.log('六爻:', reading);
console.log('卦象:', hexagram);
console.log('组成的卦象名称:', hexagramName);
  
  const result = getStringFromDigits(reading);
  console.log(result);
  






