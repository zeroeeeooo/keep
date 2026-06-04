//select_manner.js
//选择预设图片
function default_bgImgSelect_onChange() {
    if (display_guijiSelect_id) {
        document.getElementById(display_guijiSelect_id).style.display = "none";
    }
    display_guijiSelect_id = document.getElementById("default_bgImgSelect").value;
    document.getElementById(display_guijiSelect_id).style.display = "inline"
    default_bgSRC = eval(document.getElementById(display_guijiSelect_id).value);
    setbgImg(default_bgSRC[0]);
}
function guijiSelect_onChange() {
    default_bgSRC = eval(document.getElementById(display_guijiSelect_id).value);
    setbgImg(default_bgSRC[0]);
}
//选择天气
function weather_Select_onChange() {
    document.getElementById("weather").src = document.getElementById("weather_Select").value;
    render(); // 手动选择天气后也更新渲染
}

//更新天气数据
async function updateWeatherFromAPI() {
    // 先更新amap_key变量为当前输入框的值
    amap_key = document.getElementById("inpt_amap_key").value;
    
    // 检查是否有API key
    if (!amap_key || amap_key.trim() === '') {
        showMessage('请先输入高德地图API Key');
        return;
    }
    
    try {
        console.log('正在获取天气数据...');
        const weatherData = await loadAMapWeather(amap_key);
        
        // 更新温度
        temperature = parseInt(weatherData.temperature);
        document.getElementById("inpt_temperature").value = temperature;
        document.getElementById("temperature").innerHTML = String(temperature) + "℃";
        
        // 更新湿度
        humidity = parseInt(weatherData.humidity);
        document.getElementById("inpt_humidity").value = humidity;
        document.getElementById("humidity").innerHTML = String(humidity) + "%";
        
        // 更新天气图标（双向绑定）
        document.getElementById("weather").src = weatherData.weatherImage;
        document.getElementById("weather_Select").value = weatherData.weatherImage;
        
        console.log("天气数据更新成功:", weatherData.weather, temperature + "℃", humidity + "%");
        showMessage('天气数据更新成功！\n天气：' + weatherData.weather + '\n温度：' + temperature + '℃\n湿度：' + humidity + '%');
        
        // 更新完后调用render刷新显示
        render();
    } catch (err) {
        console.error("获取天气数据失败:", err);
        showMessage('天气数据获取失败：' + err.message + '\n请检查API Key是否正确');
    }
}

