/* -*- Mode: Java; tab-width: 4; indent-tabs-mode: nil; c-basic-offset: 4 -*-
 *
 * The contents of this file are subject to the Netscape Public
 * License Version 1.1 (the "License"); you may not use this file
 * except in compliance with the License. You may obtain a copy of
 * the License at http://www.mozilla.org/NPL/
 *
 * Software distributed under the License is distributed on an "AS
 * IS" basis, WITHOUT WARRANTY OF ANY KIND, either express or
 * implied. See the License for the specific language governing
 * rights and limitations under the License.
 *
 * The Original Code is mozilla.org code.
 *
 * The Initial Developer of the Original Code is Netscape
 * Communications Corporation.  Portions created by Netscape are
 * Copyright (C) 1998 Netscape Communications Corporation. All
 * Rights Reserved.
 *
 * Contributor(s): 
 * disttsc@bart.nl
 * jarrod.k.gray@rose-hulman.edu
 */

var ctrlKeydown = false;
var gSrcCanRename;

function debugDump(msg)
{
  // uncomment for noise
  // dump(msg+"\n");
}

function GetDragService()
{
	var dragService = Components.classes["@mozilla.org/widget/dragservice;1"].getService();
	if (dragService) 
		dragService = dragService.QueryInterface(Components.interfaces.nsIDragService);

	return dragService;
}

function GetRDFService()
{
	var rdf = Components.classes["@mozilla.org/rdf/rdf-service;1"].getService();
	if (rdf)   
		rdf = rdf.QueryInterface(Components.interfaces.nsIRDFService);

	return rdf;
}

function DragOverTree(event)
{
       if (event.target.localName != "treecell" &&
          event.target.localName != "treeitem") {        
          event.preventBubble();
          return false;
       }

	var msgFlavor = false;
	var folderFlavor = false;

	var dragSession = null;

	var dragService = GetDragService();
	if ( !dragService )	return(false);

	dragSession = dragService.getCurrentSession();
	if ( !dragSession )	return(false);

	if ( dragSession.isDataFlavorSupported("text/nsmessage") )	msgFlavor = true;
	if ( dragSession.isDataFlavorSupported("text/nsfolder") )	folderFlavor = true;

	var treeItem = event.target.parentNode.parentNode;
	if (!treeItem)	return(false);

  	var trans = Components.classes["@mozilla.org/widget/transferable;1"].createInstance(Components.interfaces.nsITransferable);
	if ( !trans ) return(false);


	if (msgFlavor)
	{
	    var isServer = treeItem.getAttribute("IsServer");
	    if (isServer == "true")
	    {
		    debugDump("***isServer == true\n");
		    return(false);
	    }
	    var canFileMessages = treeItem.getAttribute("CanFileMessages");
	    if (canFileMessages != "true")
	    {
		    debugDump("***canFileMessages == false\n");
		    return(false);
	    }
	    var noSelect = treeItem.getAttribute("NoSelect");
	    if (noSelect == "true")
	    {
	        debugDump("***NoSelect == true\n");
	        return(false);
     
            }
	
         }

       if (folderFlavor)
       {
         debugDump("***isFolderFlavor == true \n");
        
  	  if (event.ctrlKey)              //ctrlkey does not apply to folder drag
             return(false);

         var canCreateSubfolders = treeItem.getAttribute('CanCreateSubfolders');
         if ( canCreateSubfolders == "false")  // if cannot create subfolders then a folder cannot be dropped here     
         {
            debugDump("***canCreateSubfolders == false \n");
            return(false);
	  }
         var serverType = treeItem.getAttribute('ServerType');
         if ( serverType != "none" && gSrcCanRename == "false")
         {                               //folders that cannot be renamed can be dropped only on local folders.
	     return(false);
	  }

         var targetID = treeItem.getAttribute("id");
         var targetNode = RDF.GetResource(targetID, true);
         if (!targetNode)	return(false);
  	     var targetfolder = targetNode.QueryInterface(Components.interfaces.nsIMsgFolder);
	     var targetServer = targetfolder.server;

         trans.addDataFlavor("text/nsfolder");
   
         for ( var i = 0; i < dragSession.numDropItems; ++i )
         {
	     dragSession.getData ( trans, i );
	     var dataObj = new Object();
	     var bestFlavor = new Object();
	     var len = new Object();
	     trans.getAnyTransferData ( bestFlavor, dataObj, len );
	     if ( dataObj )	dataObj = dataObj.value.QueryInterface(Components.interfaces.nsISupportsWString);
	     if ( !dataObj )	continue;

	     // pull the URL out of the data object
	     var sourceID = dataObj.data.substring(0, len.value);
	     if (!sourceID)	continue;

	     var sourceNode = RDF.GetResource(sourceID, true);
	     var folder = sourceNode.QueryInterface(Components.interfaces.nsIFolder);
	     var sourceResource = folder.QueryInterface(Components.interfaces.nsIRDFResource);
  	     var sourcefolder = sourceResource.QueryInterface(Components.interfaces.nsIMsgFolder);
	     var sourceServer = sourcefolder.server;

	     if (sourceNode == targetNode)	
		    return (false);

	     if (sourceServer != targetServer && targetServer.type == "imap") //don't allow drop on different imap servers.
	           return (false);
			    
	     if (targetfolder.URI == sourcefolder.parent.URI)   //don't allow immediate child to be dropped to it's parent
	       {
		    debugDump(targetfolder.URI + "\n");
		    debugDump(sourcefolder.parent.URI + "\n");     
		    return (false);
		}
			
		var isAncestor = sourcefolder.isAncestorOf(targetfolder);
		if (isAncestor)  // don't allow parent to be dropped on its ancestors
		     return (false);
	
	    }
         }

	//XXX other flavors here...

	// touch the attribute on the treeItem to trigger the repaint with the drop feedback
	// (recall that it is two levels above the target, which is a treeCell).
	if ( msgFlavor || folderFlavor )
	{
	    //XXX this is really slow and likes to refresh N times per second.
	    event.target.parentNode.parentNode.setAttribute ( "dd-triggerrepaint", 0 );
	    dragSession.canDrop = true;
	    event.preventBubble();  // do not propagate message
           return true;
	}
    return false;
}

function BeginDragTree(event, tree, flavor)
{
	if ( event.target == tree )
		return(true); // continue propagating the event
    
       var treeItem = event.target.parentNode.parentNode;
	if (!treeItem)	return(false);

       if (flavor == "text/nsfolder")
	{

	   gSrcCanRename = treeItem.getAttribute('CanRename');  //used in DragOverTree

	   var serverType = treeItem.getAttribute('ServerType') // do not allow the drag when news is the source
          if ( serverType == "nntp") 
	   {
	      debugDump("***serverType == nntp \n");
	      return(false);
	   }
        }
        
	var childWithDatabase = tree;
	if ( ! childWithDatabase )
		return(false);

	var database = childWithDatabase.database;
	var rdf = GetRDFService();
	if ((!rdf) || (!database))	{ debugDump("CAN'T GET DATABASE\n"); return(false); }
	
	var dragStarted = false;

	var dragService = GetDragService();
	if ( !dragService )	return(false);

	var transArray = Components.classes["@mozilla.org/supports-array;1"].createInstance(Components.interfaces.nsISupportsArray);
	if ( !transArray ) return(false); 

	var selArray = tree.selectedItems;
	var count = selArray.length;
	debugDump("selArray.length = " + count + "\n");
	for ( var i = 0; i < count; ++i )
	{

		var trans = Components.classes["@mozilla.org/widget/transferable;1"].createInstance(Components.interfaces.nsITransferable);
		if ( !trans )		return(false);

		var genTextData = Components.classes["@mozilla.org/supports-wstring;1"].createInstance(Components.interfaces.nsISupportsWString);
		if (!genTextData)	return(false);

		trans.addDataFlavor(flavor);
        
		// get id (url) 
		var id = selArray[i].getAttribute("id");
		genTextData.data = id;
		debugDump("    ID #" + i + " = " + id + "\n");

		trans.setTransferData ( flavor, genTextData, id.length * 2 );  // doublebyte byte data

		// put it into the transferable as an |nsISupports|
		var genTrans = trans.QueryInterface(Components.interfaces.nsISupports);
		transArray.AppendElement(genTrans);
	}

	var nsIDragService = Components.interfaces.nsIDragService;
	dragService.invokeDragSession ( event.target, transArray, null, nsIDragService.DRAGDROP_ACTION_COPY + 
	nsIDragService.DRAGDROP_ACTION_MOVE );
    
	dragStarted = true;

	return(!dragStarted);  // don't propagate the event if a drag has begun
}

function BeginDragFolderTree(event)
{
	debugDump("BeginDragFolderTree\n");
       if (event.target.localName != "treecell" &&
           event.target.localName != "treeitem")
            return false;

	var tree = GetFolderTree();

	return BeginDragTree(event, tree, "text/nsfolder");

}


function BeginDragThreadTree(event)
{
	debugDump("BeginDragThreadTree\n");
        if (event.target.localName != "treecell" &&
            event.target.localName != "treeitem")
             return false;

	//XXX we rely on a capturer to already have determined which item the mouse was over
	//XXX and have set an attribute.
    
	// if the click is on the tree proper, ignore it. We only care about clicks on items.

	var tree = GetThreadTree();

	return BeginDragTree(event, tree, "text/nsmessage");
}

function DropOnFolderTree(event)
{
	debugDump("DropOnTree\n");
	var RDF = GetRDFService();
	if (!RDF) return(false);

	var treeRoot = GetFolderTree();
	if (!treeRoot)	return(false);
	var treeDatabase = treeRoot.database;
	if (!treeDatabase)	return(false);

	// target is the <treecell>, and "id" is on the <treeitem> two levels above
	var treeItem = event.target.parentNode.parentNode;
	if (!treeItem)	return(false);

	if (event.ctrlKey)
		ctrlKeydown = true;
	else
		ctrlKeydown = false;
	// drop action is always "on" not "before" or "after"
	// get drop hint attributes
	var dropBefore = treeItem.getAttribute("dd-droplocation");
	var dropOn = treeItem.getAttribute("dd-dropon");

	var dropAction;
	if (dropOn == "true") 
		dropAction = "on";
	else
		return(false);

	var targetID = treeItem.getAttribute("id");
	if (!targetID)	return(false);

	debugDump("***targetID = " + targetID + "\n");

	//make sure target is a folder

	var dragService = GetDragService();
	if ( !dragService )	return(false);
	
	var dragSession = dragService.getCurrentSession();
	if ( !dragSession )	return(false);

	var trans = Components.classes["@mozilla.org/widget/transferable;1"].createInstance(Components.interfaces.nsITransferable);
	if ( !trans ) return(false);

	var list = Components.classes["@mozilla.org/supports-array;1"].createInstance(Components.interfaces.nsISupportsArray);

       var dropMessage = false;  
	if (dragSession.isDataFlavorSupported("text/nsmessage"))
	{
	   dropMessage = true;
	   debugDump( "dropMessage == true \n");
	}
	 	
	var dropFolder = false;
	if (dragSession.isDataFlavorSupported("text/nsfolder"))
	{
	   dropFolder = true;
	   debugDump( "dropFolder == true \n");
	}
    
	if ( dropMessage )
	    trans.addDataFlavor("text/nsmessage");
       else if ( dropFolder )
	    trans.addDataFlavor("text/nsfolder");
	
       var listCount =0;
	for ( var i = 0; i < dragSession.numDropItems; ++i )
	{
		dragSession.getData ( trans, i );
		var dataObj = new Object();
		var bestFlavor = new Object();
		var len = new Object();
		trans.getAnyTransferData ( bestFlavor, dataObj, len );
		if ( dataObj )	dataObj = dataObj.value.QueryInterface(Components.interfaces.nsISupportsWString);
		if ( !dataObj )	continue;

		// pull the URL out of the data object
		var sourceID = dataObj.data.substring(0, len.value);
		if (!sourceID)	continue;

		debugDump("    Node #" + i + ": drop '" + sourceID + "' " + dropAction + " '" + targetID + "'");
		debugDump("\n");

		var sourceNode = RDF.GetResource(sourceID, true);
		if (!sourceNode)
			continue;

		// Prevent dropping of a node before, after, or on itself
		if (sourceNode == targetNode)	
		    continue;
	    else
		    listCount ++;

		list.AppendElement(sourceNode);
	}

       if (listCount < 1)
	      return false;

       var isSourceNews = false;
       isSourceNews = isNewsURI(sourceID);
    
	var targetNode = RDF.GetResource(targetID, true);
	if (!targetNode)	return(false);
  	var targetfolder = targetNode.QueryInterface(Components.interfaces.nsIMsgFolder);
	var targetServer = targetfolder.server;

       if (dropMessage)
	{
	    var message = sourceNode.QueryInterface(Components.interfaces.nsIMessage);
	    var folder = message.msgFolder;
	    var sourceResource = folder.QueryInterface(Components.interfaces.nsIRDFResource);
  	    var sourcefolder = sourceResource.QueryInterface(Components.interfaces.nsIMsgFolder);
	    var sourceServer = sourcefolder.server;
	    var nextMessage;
           var messageTree;

          if (isSourceNews) //news to pop or imap is always a copy
          {
             try
             {
                messenger.CopyMessages(treeDatabase,
                                       sourceResource,
                                       targetNode, list, false);
             }
             catch(e)
             {
                dump ( "Exception : CopyMessages \n");
             }
          }
          else
          {
			//temperary for single mail window, not working when supporting multiple mail windows
		if (!ctrlKeydown)
		{
			messageTree = GetThreadTree();
			nextMessage = GetNextMessageAfterDelete(messageTree.selectedItems);
			if(nextMessage)
                       gNextMessageAfterDelete = nextMessage.getAttribute('id');
			else
				gNextMessageAfterDelete = null;
		}
              try {
	         	messenger.CopyMessages(treeDatabase,
		              		   sourceResource,
						   targetNode, list, !ctrlKeydown);
                  }
              catch(e)
                  {
                      gNextMessageAfterDelete = null;
                      dump ( "Exception : CopyMessages \n");
                  }
          }
	}
	else if (dropFolder)
	{

	    sourceNode = RDF.GetResource(sourceID, true);
           folder = sourceNode.QueryInterface(Components.interfaces.nsIFolder);
	    sourceResource = folder.QueryInterface(Components.interfaces.nsIRDFResource);
  	    sourcefolder = sourceResource.QueryInterface(Components.interfaces.nsIMsgFolder);
	    sourceServer = sourcefolder.server;
		var moveFolder = false;

     	    if (sourceServer == targetServer)
		   moveFolder = true;
		
		try 
		{
		   messenger.CopyFolders(treeDatabase,targetNode,list,moveFolder);
		}
		catch(e)
		{
                  dump ("Exception : CopyFolder \n");
              }
        }

	return(false);
}

function DropOnThreadTree(event)
{
	debugDump("DropOnThreadTree\n");
    if (event.target.localName != "treecell" &&
        event.target.localName != "treeitem")
        return false;
    
	return false;
}

