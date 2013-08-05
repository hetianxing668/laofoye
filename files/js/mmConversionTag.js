// Instructions:
//
//	http://demo.eyeblaster.com/Tia/CustomProjects/ConversionTag/Instructions/ConversionTagInstructions.docx
//
//
//  The Site should place the following code as the 1st item in the <body> of their page:
// <script src="http://ds.serving-sys.com/BurstingRes/CustomScripts/mmConversionTag.js"></script>
//
//	
//
// Author: Tia Koehler
// 04.29.11
//


// Immediately write the iframe (if it doesn't exist already). Set its source later 


var mmIframesExist = document.getElementById("mmConversionTagIframe0");
var mmIframes = 10;
var mmCurIframe = 0;
if (!mmIframesExist) {
	for (var i = 0; i < mmIframes; ++i) {
		document.write('<ifr'+'ame id="mmConversionTagIframe' + i + '" name="mmConversionTagIframe' + i + '" src="" width=0 height=0 marginwidth=0 marginheight=0 hspace=0 vspace=0 frameborder=0 scrolling=no bordercolor="#000000" style=display:none;></ifra'+'me>');
	}
}
//-------------------------------------------------------------------------------------------
function mmRedirect(url, target) {	
	// Open Redirect URL in New or Same Window	
	if(typeof(target) == "undefined" || target == "_blank"){ window.open(url, "_blank"); }
	else {document.location.href = url; }
}
//-------------------------------------------------------------------------------------------
function mmExecutePublisherCode(clkEvt) {
	
	// Removes the call to mmConversionTag so that it is not executed more than 1 time

	var patt1 = /\bmmConversionTag?.*?return?\s?false?\;/i;
	var clickEventStr = typeof(clkEvt.replace) == "undefined" ? clkEvt.toString() : clkEvt;
	var clickEventStrRemaining = clickEventStr.replace(patt1, "");
	
	if (typeof(clkEvt.replace) == "undefined") {
	// Removes "function anonymous() { ... }" to extract the ... publisher code in the middle.  Necessary for setTimeout to execute it 
		var patt2 = /\bfunction\s?\w*\(\)?.*?\n/i;
		var clickEventStrRemaining = clickEventStrRemaining.replace(patt2, "");
		var patt3 = /^\{/i;
		clickEventStrRemaining = clickEventStrRemaining.replace(patt3, "");
		var patt4 = /\}$/i;
		clickEventStrRemaining = clickEventStrRemaining.replace(patt4, "");
	}

	// Execute Publisher Code
	setTimeout(clickEventStrRemaining, 1);	
}
//-------------------------------------------------------------------------------------------
function mmIframeLoadHandler(redirURL, targetWin, clickEvent, ifrm) {
	// Either perform redirect or execute publisher functions
	if((typeof(redirURL) != "undefined") && (redirURL != null)){ mmRedirect(redirURL, targetWin); }
	else if (clickEvent != "") { mmExecutePublisherCode(clickEvent); } 
	
	// Clear out source so that pressing the back button does not cause a conversion (from iframe being on page)
	ifrm.src = "";
	
	// Remove Event Handlers
	if (ifrm.detachEvent) {ifrm.detachEvent("onload", mmIframeLoadHandlerRef);}
	else if (ifrm.removeEventListener) {ifrm.removeEventListener("load", mmIframeLoadHandlerRef, false);}
	else {ifrm.onload = null;}
		
}	
//-------------------------------------------------------------------------------------------
function mmConversionTag(conversionID, obj, targetWindow, redirectURL, extraParams) {
	try {
		var onclickEvent = "";
		
		// Redirect URL doesn't exist, so search the object for the URL or the functions which perform the redirect
		if(typeof(redirectURL) == "undefined" && typeof(obj == "object") && typeof(obj.getAttribute) != "undefined") {	
			if (obj.getAttribute("onclick") != null) {
				onclickEvent = obj.getAttribute("onclick");
			}	
		}
		
		// Protocol (secure or insecure)
		var protocol = ('https:' == document.location.protocol) ? 'https://' : 'http://';
		
		// Cache Buster
		var ebRand = Math.round(Math.random() * 1000000);
		
		// extraParams like Session ID or Sales Varaibles weren't passed, so this is a counter tag
		if (typeof(extraParams) == "undefined") {extraParams = "";}
		
		// Iframe
		var iframe = document.getElementById("mmConversionTagIframe" + mmCurIframe);

		mmCurIframe = (mmCurIframe + 1) % mmIframes;
		// Iframe Onload Event Handlers
		if (iframe.attachEvent) {iframe.attachEvent("onload", mmIframeLoadHandlerRef = function() { mmIframeLoadHandler(redirectURL, targetWindow, onclickEvent, iframe); });}
		else if (iframe.addEventListener) {iframe.addEventListener("load", mmIframeLoadHandlerRef = function() { mmIframeLoadHandler(redirectURL, targetWindow, onclickEvent, iframe); }, false);}
		else {	iframe.onload = function() { mmIframeLoadHandler(redirectURL, targetWindow, onclickEvent, iframe); }}		
		
	
		// Iframe Source
		iframe.src =  protocol + "bs.serving-sys.com/BurstingPipe/ActivityServer.bs?cn=as&ifrm=1&ActivityID=" + conversionID +  extraParams + "&rnd=" + ebRand;
		}
	catch(e) {}
}
//-------------------------------------------------------------------------------------------