/* -*- indent-tabs-mode: nil; js-indent-level: 2 -*-
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*
 * These are helper functions to be included
 * pippki UI js files.
 */

function setText(id, value) {
  var element = document.getElementById(id);
  if (!element) return;
     if (element.hasChildNodes())
       element.removeChild(element.firstChild);
  var textNode = document.createTextNode(value);
  element.appendChild(textNode);
}

const nsICertificateDialogs = Components.interfaces.nsICertificateDialogs;
const nsCertificateDialogs = "@mozilla.org/nsCertificateDialogs;1"

function viewCertHelper(parent, cert) {
  if (!cert)
    return;

  var cd = Components.classes[nsCertificateDialogs].getService(nsICertificateDialogs);
  cd.viewCert(parent, cert);
}

function getDERString(cert)
{
  var length = {};
  var derArray = cert.getRawDER(length);
  var derString = '';
  for (var i = 0; i < derArray.length; i++) {
    derString += String.fromCharCode(derArray[i]);
  }
  return derString;
}

function getPKCS7String(cert, chainMode)
{
  var length = {};
  cert.QueryInterface(Components.interfaces.nsIX509Cert3);
  var pkcs7Array = cert.exportAsCMS(chainMode, length);
  var pkcs7String = '';
  for (var i = 0; i < pkcs7Array.length; i++) {
    pkcs7String += String.fromCharCode(pkcs7Array[i]);
  }
  return pkcs7String;
}

function getPEMString(cert)
{
  var derb64 = btoa(getDERString(cert));
  // Wrap the Base64 string into lines of 64 characters, 
  // with CRLF line breaks (as specified in RFC 1421).
  var wrapped = derb64.replace(/(\S{64}(?!$))/g, "$1\r\n");
  return "-----BEGIN CERTIFICATE-----\r\n"
         + wrapped
         + "\r\n-----END CERTIFICATE-----\r\n";
}
 
function alertPromptService(title, message)
{
  var ps = null;
  var ps = Components.classes["@mozilla.org/embedcomp/prompt-service;1"].
           getService(Components.interfaces.nsIPromptService);
  ps.alert(window, title, message);
}

function exportToFile(parent, cert)
{
  var bundle = document.getElementById("pippki_bundle");
  if (!cert)
    return;

  var nsIFilePicker = Components.interfaces.nsIFilePicker;
  var fp = Components.classes["@mozilla.org/filepicker;1"].
           createInstance(nsIFilePicker);
  fp.init(parent, bundle.getString("SaveCertAs"),
          nsIFilePicker.modeSave);
  var filename = cert.commonName;
  if (!filename.length)
    filename = cert.windowTitle;
  // remove all whitespace from the default filename
  fp.defaultString = filename.replace(/\s*/g,'');
  fp.defaultExtension = "crt";
  fp.appendFilter(bundle.getString("CertFormatBase64"), "*.crt; *.pem");
  fp.appendFilter(bundle.getString("CertFormatBase64Chain"), "*.crt; *.pem");
  fp.appendFilter(bundle.getString("CertFormatDER"), "*.der");
  fp.appendFilter(bundle.getString("CertFormatPKCS7"), "*.p7c");
  fp.appendFilter(bundle.getString("CertFormatPKCS7Chain"), "*.p7c");
  fp.appendFilters(nsIFilePicker.filterAll);
  var res = fp.show();
  if (res != nsIFilePicker.returnOK && res != nsIFilePicker.returnReplace)
    return;

  var content = '';
  switch (fp.filterIndex) {
    case 1:
      content = getPEMString(cert);
      var chain = cert.getChain();
      for (var i = 1; i < chain.length; i++)
        content += getPEMString(chain.queryElementAt(i, Components.interfaces.nsIX509Cert));
      break;
    case 2:
      content = getDERString(cert);
      break;
    case 3:
      content = getPKCS7String(cert, Components.interfaces.nsIX509Cert3.CMS_CHAIN_MODE_CertOnly);
      break;
    case 4:
      content = getPKCS7String(cert, Components.interfaces.nsIX509Cert3.CMS_CHAIN_MODE_CertChainWithRoot);
      break;
    case 0:
    default:
      content = getPEMString(cert);
      break;
  }
  var msg;
  var written = 0;
  try {
    var file = Components.classes["@mozilla.org/file/local;1"].
               createInstance(Components.interfaces.nsILocalFile);
    file.initWithPath(fp.file.path);
    var fos = Components.classes["@mozilla.org/network/file-output-stream;1"].
              createInstance(Components.interfaces.nsIFileOutputStream);
    // flags: PR_WRONLY | PR_CREATE_FILE | PR_TRUNCATE
    fos.init(file, 0x02 | 0x08 | 0x20, 00644, 0);
    written = fos.write(content, content.length);
    fos.close();
  }
  catch(e) {
    switch (e.result) {
      case Components.results.NS_ERROR_FILE_ACCESS_DENIED:
        msg = bundle.getString("writeFileAccessDenied");
        break;
      case Components.results.NS_ERROR_FILE_IS_LOCKED:
        msg = bundle.getString("writeFileIsLocked");
        break;
      case Components.results.NS_ERROR_FILE_NO_DEVICE_SPACE:
      case Components.results.NS_ERROR_FILE_DISK_FULL:
        msg = bundle.getString("writeFileNoDeviceSpace");
        break;
      default:
        msg = e.message;
        break;
    }
  }
  if (written != content.length) {
    if (!msg.length)
      msg = bundle.getString("writeFileUnknownError");
    alertPromptService(bundle.getString("writeFileFailure"),
                       bundle.getFormattedString("writeFileFailed",
                       [fp.file.path, msg]));
  }
}
