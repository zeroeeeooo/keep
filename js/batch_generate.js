// batch_generate.js
// 批量生成截图功能

let batchRunning = false;
let batchCancelled = false;

// 本地轨迹缓存
let _cachedTrackData = null;

// 加载本地 drawingActions.json
async function preloadTrackData() {
    try {
        const resp = await fetch('drawingActions.json');
        if (resp.ok) {
            _cachedTrackData = await resp.json();
            console.log('[batch] 本地轨迹数据已加载，共', _cachedTrackData.length, '个动作');
        }
    } catch (e) {
        console.warn('[batch] 加载本地轨迹数据失败，将使用默认轨迹:', e);
    }
}

// 对轨迹坐标施加随机偏移，产生多样化轨迹
// 起点(down)和终点(up)施加较大偏移，中间点(move)保持小抖动确保路径平滑
function perturbTrackData(data) {
    if (!data || data.length === 0) return data;
    const lastIdx = data.length - 1;

    // 为起点和终点生成共同的方向偏移量（保持轨迹整体方向一致）
    const angle = Math.random() * Math.PI * 2;            // 随机方向角
    const startDist = 20 + Math.random() * 30;             // 起点偏移距离 20~50px
    const endDist = 20 + Math.random() * 30;               // 终点偏移距离 20~50px
    const startDx = Math.cos(angle) * startDist;
    const startDy = Math.sin(angle) * startDist * 0.6;     // y方向缩窄，模拟真实跑步路径
    const endDx = Math.cos(angle) * endDist;
    const endDy = Math.sin(angle) * endDist * 0.6;

    return data.map((item, i) => {
        if (i === 0 && item.action === 'down') {
            // 起点：大幅偏移
            return {
                action: item.action,
                x: item.x + startDx,
                y: item.y + startDy
            };
        }
        if (i === lastIdx) {
            // 终点：大幅偏移（即使是 move 也会被修正为 up 逻辑，这里统一按最后一个点处理）
            return {
                action: item.action,
                x: item.x + endDx,
                y: item.y + endDy
            };
        }
        // 中间点：小幅度抖动
        return {
            action: item.action,
            x: item.x + (Math.random() - 0.5) * 1.5,
            y: item.y + (Math.random() - 0.5) * 1.0
        };
    });
}

// 显示消息
function showBatchMessage(msg) {
    let box = document.getElementById("batchMessage");
    if (box) {
        box.textContent = msg;
    }
}

// 下载单个 canvas 为 PNG
function downloadSingleCanvas(canvas, fileName) {
    let dataurl = canvas.toDataURL('image/png');
    let donwLink = document.createElement('a');
    donwLink.download = fileName + ".png";
    donwLink.href = dataurl;
    donwLink.style = 'display: none';
    document.body.appendChild(donwLink);
    donwLink.click();
    document.body.removeChild(donwLink);
}

// 设置单个日期的年月日时分
function setDateTime(year, month, day, hour, minute) {
    date_year = year;
    date_month = month;
    date_day = day;
    time_hour = hour;
    time_min = minute;
    document.getElementById("inpt_year").value = year;
    document.getElementById("inpt_month").value = month;
    document.getElementById("inpt_day").value = day;
    document.getElementById("inpt_hour").value = hour;
    document.getElementById("inpt_min").value = minute;
}

// 设置天气
function setWeather(weatherType) {
    // weatherType: "晴" | "多云" | "阴天"
    let weatherMap = {
        "晴": "images/weather1.png",
        "多云": "images/weather2.png",
        "阴天": "images/weather3.png"
    };
    let imgSrc = weatherMap[weatherType] || "images/weather1.png";
    document.getElementById("weather").src = imgSrc;
    document.getElementById("weather_Select").value = imgSrc;
}

// 延时函数
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// 批量生成主函数
async function startBatchGenerate() {
    if (batchRunning) {
        alert("批量生成正在进行中，请等待完成或点击取消。");
        return;
    }

    // 读取批量参数
    let count = parseInt(document.getElementById("batch_count").value) || 5;
    if (count < 1) count = 1;
    if (count > 100) {
        alert("单次最多生成100张图片。");
        count = 100;
        document.getElementById("batch_count").value = 100;
    }

    let dateStart = document.getElementById("batch_date_start").value;
    let dateEnd = document.getElementById("batch_date_end").value;
    let timeStart = document.getElementById("batch_time_start").value;
    let timeEnd = document.getElementById("batch_time_end").value;
    let weatherMode = document.getElementById("batch_weather_mode").value; // "fixed" or "random"

    if (!dateStart || !dateEnd) {
        alert("请填写起始日期和结束日期。");
        return;
    }
    if (!timeStart || !timeEnd) {
        alert("请填写起始时间和结束时间。");
        return;
    }

    let startDate = new Date(dateStart);
    let endDate = new Date(dateEnd);
    if (endDate < startDate) {
        alert("结束日期不能早于起始日期。");
        return;
    }

    // 解析时间范围
    let [tsH, tsM] = timeStart.split(":").map(Number);
    let [teH, teM] = timeEnd.split(":").map(Number);
    if (isNaN(tsH) || isNaN(tsM) || isNaN(teH) || isNaN(teM)) {
        alert("时间格式不正确，请使用 HH:MM 格式。");
        return;
    }
    let startMinutes = tsH * 60 + tsM;
    let endMinutes = teH * 60 + teM;
    if (endMinutes < startMinutes) {
        alert("结束时间不能早于起始时间。");
        return;
    }

    // 天气选项
    let weatherOptions = ["晴", "多云", "阴天"];
    let fixedWeather = "晴";
    if (weatherMode === "fixed") {
        fixedWeather = document.getElementById("batch_weather_fixed").value;
    }

    // 计算日期差，用于均匀分布
    let dateDiffMs = endDate.getTime() - startDate.getTime();
    let dateDiffDays = Math.floor(dateDiffMs / (1000 * 60 * 60 * 24)) + 1;

    batchRunning = true;
    batchCancelled = false;
    document.getElementById("batch_start_btn").disabled = true;
    document.getElementById("batch_cancel_btn").style.display = "inline-block";

    // 暂停自动绘画路径，避免干扰
    let prevAutoChange = auto_change;
    auto_change = false;

    // 随机轨迹模式：拦截 fetch 请求，用本地数据替代远程 API
    let trackMode = document.getElementById("batch_track_mode").value;
    let origFetch = null;
    if (trackMode === "random" && _cachedTrackData) {
        origFetch = window.fetch;
        window.fetch = async function (url, ...args) {
            if ((typeof url === 'string') && url.includes('tool.joytion.cn/generate-track')) {
                const varied = perturbTrackData(_cachedTrackData);
                return {
                    ok: true,
                    status: 200,
                    json: () => Promise.resolve(varied),
                    text: () => Promise.resolve(JSON.stringify(varied)),
                };
            }
            return origFetch.call(window, url, ...args);
        };
    }

    try {
        for (let i = 0; i < count; i++) {
            if (batchCancelled) {
                showBatchMessage("批量生成已取消，已完成 " + i + " / " + count + " 张。");
                break;
            }

            showBatchMessage("正在生成: " + (i + 1) + " / " + count + " ...");

            // 计算当前日期和时间（在范围内均匀分布或随机分布）
            let progress = count > 1 ? i / (count - 1) : 0.5;
            let dayOffset = Math.floor(progress * (dateDiffDays - 1));
            let currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + dayOffset);

            let minuteOffset = Math.floor(Math.random() * (endMinutes - startMinutes + 1));
            let totalMinutes = startMinutes + minuteOffset;
            let hour = Math.floor(totalMinutes / 60);
            let minute = totalMinutes % 60;

            let y = currentDate.getFullYear();
            let m = currentDate.getMonth() + 1;
            let d = currentDate.getDate();

            // 设置日期时间
            setDateTime(y, m, d, hour, minute);

            // 设置天气
            if (weatherMode === "fixed") {
                setWeather(fixedWeather);
            } else {
                let randomWeather = weatherOptions[Math.floor(Math.random() * weatherOptions.length)];
                setWeather(randomWeather);
            }

            // 重新随机公里和配速
            miles = Math.floor((km_min + Math.random() * (km_max - km_min)) * 100) / 100;
            speeds = Math.floor((speed_min + Math.random() * (speed_max - speed_min)) * 100) / 100;
            document.getElementById("inpt_miles").value = miles;
            document.getElementById("inpt_speeds").value = speeds;

            // 随机温度
            let tempMin = parseInt(document.getElementById("batch_temp_min").value) || -5;
            let tempMax = parseInt(document.getElementById("batch_temp_max").value) || 30;
            if (tempMin > tempMax) { let tmp = tempMin; tempMin = tempMax; tempMax = tmp; }
            temperature = Math.floor(tempMin + Math.random() * (tempMax - tempMin + 1));
            document.getElementById("inpt_temperature").value = temperature;

            // 随机湿度
            let humiMin = parseInt(document.getElementById("batch_humi_min").value) || 20;
            let humiMax = parseInt(document.getElementById("batch_humi_max").value) || 90;
            if (humiMin > humiMax) { let tmp = humiMin; humiMin = humiMax; humiMax = tmp; }
            humidity = Math.floor(humiMin + Math.random() * (humiMax - humiMin + 1));
            document.getElementById("inpt_humidity").value = humidity;

            // 如果需要随机轨迹，重新生成（使用本地缓存数据，无网络请求）
            if (trackMode === "random" && _cachedTrackData) {
                try {
                    await delay(200);
                    // drawMine 内部调用 Json2Draw，后者调用 fetch，已被拦截为本地数据
                    await drawMine('https://tool.joytion.cn/generate-track');
                    await delay(200);
                } catch (err) {
                    console.error("随机轨迹生成失败:", err);
                    // 失败时确保弹窗被关闭，不影响其余图片
                    let overlay = document.getElementById("drawpic_overlay");
                    if (overlay) overlay.style.display = "none";
                }
            }

            // 触发渲染
            render();

            // 等待渲染完成（给浏览器一点时间刷新 DOM）
            await delay(300);

            // 生成 Canvas 并下载
            try {
                let canvas = await generateCanvas();
                let fileName = "keep" + m + "月" + d + "日" + "跑步打卡";
                downloadSingleCanvas(canvas, fileName);
            } catch (err) {
                console.error("第 " + (i + 1) + " 张图片生成失败:", err);
            }

            // 每张图之间暂停一小段时间，避免浏览器卡死
            await delay(200);
        }

        if (!batchCancelled) {
            showBatchMessage("批量生成完成！共生成 " + count + " 张图片。");
        }
    } finally {
        // 恢复原始 fetch
        if (origFetch) {
            window.fetch = origFetch;
        }
        batchRunning = false;
        auto_change = prevAutoChange;
        document.getElementById("batch_start_btn").disabled = false;
        document.getElementById("batch_cancel_btn").style.display = "none";
    }
}

// 取消批量生成
function cancelBatchGenerate() {
    if (batchRunning) {
        batchCancelled = true;
        showBatchMessage("正在取消...");
    }
}

// 初始化批量生成面板默认值
function initBatchPanel() {
    let now = new Date();
    let todayStr = now.getFullYear() + "-" +
        String(now.getMonth() + 1).padStart(2, '0') + "-" +
        String(now.getDate()).padStart(2, '0');
    let sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 6);
    let startStr = sevenDaysAgo.getFullYear() + "-" +
        String(sevenDaysAgo.getMonth() + 1).padStart(2, '0') + "-" +
        String(sevenDaysAgo.getDate()).padStart(2, '0');

    if (!document.getElementById("batch_date_start").value) {
        document.getElementById("batch_date_start").value = startStr;
    }
    if (!document.getElementById("batch_date_end").value) {
        document.getElementById("batch_date_end").value = todayStr;
    }
    if (!document.getElementById("batch_time_start").value) {
        document.getElementById("batch_time_start").value = "07:00";
    }
    if (!document.getElementById("batch_time_end").value) {
        document.getElementById("batch_time_end").value = "09:00";
    }
    if (!document.getElementById("batch_count").value) {
        document.getElementById("batch_count").value = 7;
    }

    // 预加载本地轨迹缓存
    preloadTrackData();
}

// 天气模式切换：固定天气 / 随机天气
function batchWeatherModeChange() {
    let mode = document.getElementById("batch_weather_mode").value;
    let fixedWrap = document.getElementById("batch_weather_fixed_wrap");
    if (mode === "fixed") {
        fixedWrap.style.display = "inline";
    } else {
        fixedWrap.style.display = "none";
    }
}