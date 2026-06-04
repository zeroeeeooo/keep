//render.js
//渲染, 将输入的内容放到图片的对应位置
function render() {
    // 防御性处理：确保数值不是 NaN/undefined
    miles = (typeof miles === 'number' && !isNaN(miles)) ? miles : 0;
    speeds = (typeof speeds === 'number' && !isNaN(speeds)) ? speeds : 0;
    date_year = (typeof date_year === 'number' && !isNaN(date_year)) ? date_year : new Date().getFullYear();
    date_month = (typeof date_month === 'number' && !isNaN(date_month)) ? date_month : (new Date().getMonth() + 1);
    date_day = (typeof date_day === 'number' && !isNaN(date_day)) ? date_day : new Date().getDate();
    time_hour = (typeof time_hour === 'number' && !isNaN(time_hour)) ? time_hour : 0;
    time_min = (typeof time_min === 'number' && !isNaN(time_min)) ? time_min : 0;
    temperature = (typeof temperature === 'number' && !isNaN(temperature)) ? temperature : 0;
    humidity = (typeof humidity === 'number' && !isNaN(humidity)) ? humidity : 0;

    let miles_int = Math.floor(miles);
    let miles_dec = Math.round((miles - miles_int) * 100);
    let speeds_int = Math.floor(speeds);
    let speeds_dec = Math.round((speeds - speeds_int) * 100);
    let times = (speeds_dec / 60 + speeds_int) * miles;
    let timeInc = Math.trunc(times);
    let cost_hour = Math.floor(timeInc / 60);
    let cost_min = timeInc % 60;
    let cost_sec = Math.round((times - timeInc) * 60);
    let calorie = Math.round(69 * miles * 1.036);
    document.getElementById("mile").innerHTML = String(miles_int) + "." + String(addZero(miles_dec));
    document.getElementById("date").innerHTML = String(date_year) + "/" + addZero(date_month) + "/" + addZero(date_day);
    document.getElementById("time").innerHTML = addZero(time_hour) + ":" + addZero(time_min);
    document.getElementById("temperature").innerHTML = String(temperature) + "℃";
    document.getElementById("humidity").innerHTML = String(humidity) + "%";
    document.getElementById("username").innerHTML = username || "";
    document.getElementById("keep-title").innerHTML = "Keep&nbsp;•&nbsp;" + (keep_title || "");

    document.getElementById("speed").innerHTML = String(addZero(speeds_int)) + "'" + String(addZero(speeds_dec)) + '"';
    document.getElementById("cost-time").innerHTML = String(addZero(cost_hour)) + ":" + String(addZero(cost_min)) + ":" + String(addZero(cost_sec));
    document.getElementById("calorie").innerHTML = addZero(calorie);
}
