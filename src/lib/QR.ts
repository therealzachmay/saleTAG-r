import QRCode from "qrcode";

export async function qrDataUrl(url: string) {
  return QRCode.toDataURL(url, { margin: 1, scale: 8, color: { dark: "#000000", light: "#FFFFFF00" }});
}