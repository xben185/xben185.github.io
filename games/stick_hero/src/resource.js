var res = {
	StartBackground_png0 : "res/background0.jpg",
	StartBackground_png1 : "res/background1.jpg",
	Btnn_png : "res/start_normal.png",
	Btns_png : "res/start_select.png",
	StickBlack_png : "res/stick_black.png",
	Restart_png : "res/shuaxin.png",
	Home_png : "res/zhuye.png",
	ScoreBg:"res/scoreBg.png",
	overScoreBg:"res/overSoreBg.png",
	ShareBtn:"res/notify.png",
	guideText:"res/guide_text.png",
	moreBtn:"res/moreBtn.png",
	
	//
	KickPlist : "res/kick.plist",
	KickPng : "res/kick.png",
	
	ShakePlist : "res/shake.plist",
	ShakePng : "res/shake.png",
	
	WalkPlist : "res/walk.plist",
	WalkPng : "res/walk.png",
	
	YaoPlist : "res/yao.plist",
	YaoPng : "res/yao.png"
};

var g_resources = [];
for (var i in res) {
    g_resources.push(res[i]);
}