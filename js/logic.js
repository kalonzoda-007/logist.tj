
const tajikistanMap = {
    "Согд": ["Худжанд", "Истаравшан", "Пенджикент", "Ашт", "Келал", "Замидуван", "Исфара"],
    "Душанбе": ["Душанбе", "Варохша", "Рудаки"],
    "Хатлон": ["Бохтар", "Курган-Тюбе", "Исм. Московский", "Шахрибоз", "Сарифазо", "Ходжейли"],
    "Бадахшан": ["Хорог", "Ишкашим", "Шемини", "Ванч", "Мургхаб"]
};

function updateDistricts(regionName) {
    const districtSelect = document.getElementById('district-select');
    if (!districtSelect) return;
    const districts = tajikistanMap[regionName] || [];
    districtSelect.innerHTML = '<option value="">Выберите район</option>' + 
        districts.map(d => `<option value="${d}">${d}</option>`).join('');
}

function calculateOrderWeight(sku, bags, products) {
    const product = products.find(p => p.sku === sku);
    const weight = product ? product.packKg : 50;
    return bags * weight;
}
