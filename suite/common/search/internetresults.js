
function doClick(node)
{
	var theID = node.getAttribute("id");
	if (!theID)	return(false);

	try
	{
		var rdf = Components.classes["component://netscape/rdf/rdf-service"].getService();
		if (rdf)   rdf = rdf.QueryInterface(Components.interfaces.nsIRDFService);
		if (rdf)
		{
			var internetSearchStore = rdf.GetDataSource("rdf:internetsearch");
			if (internetSearchStore)
			{
				var src = rdf.GetResource(theID, true);
//				var urlProperty = rdf.GetResource("http://home.netscape.com/NC-rdf#URL", true);
				var bannerProperty = rdf.GetResource("http://home.netscape.com/NC-rdf#Banner", true);
				var htmlProperty = rdf.GetResource("http://home.netscape.com/NC-rdf#HTML", true);
/*
				var url = internetSearchStore.GetTarget(src, urlProperty, true);
				if (url)	url = url.QueryInterface(Components.interfaces.nsIRDFLiteral);
				if (url)	url = url.Value;
*/
				var banner = internetSearchStore.GetTarget(src, bannerProperty, true);
				if (banner)	banner = banner.QueryInterface(Components.interfaces.nsIRDFLiteral);
				if (banner)	banner = banner.Value;

				var target = internetSearchStore.GetTarget(src, htmlProperty, true);
				if (target)	target = target.QueryInterface(Components.interfaces.nsIRDFLiteral);
				if (target)	target = target.Value;
				if (target)
				{
					var text = "<HTML><HEAD><BASE TARGET='_NEW'></HEAD><BODY><FONT POINT-SIZE='9'>";

					if (banner)
					{
						// add a </A> and a <BR> just in case
						text += banner + "</A><BR>";
					}
					text += target;
					text += "</FONT></BODY></HTML>"
					
					var doc = window.frames[0].document;
					doc.open("text/html", "replace");
					doc.writeln(text);
					doc.close();
				}
			}
		}
	}
	catch(ex)
	{
	}
	return(true);
}
