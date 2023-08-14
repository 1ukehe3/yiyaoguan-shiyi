function changeLanguage(lang) {
    // 获取所有需要切换语言的元素
    const elements = document.querySelectorAll('.lang-switch');
  
    // 遍历每个元素，根据选择的语言设置文本内容
    elements.forEach((element) => {
      const enText = element.getAttribute('data-en');
      const cnText = element.getAttribute('data-cn');
  
      if (lang === 'en') {
        element.textContent = enText;
      } else if (lang === 'cn') {
        element.textContent = cnText;
      }
    });
  }
  