
import { BASE_URL, PRODCUT_URL } from "@/config";

export default function uploadFile(path) {
  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url: PRODCUT_URL + "/upload/uploadFile?bucket=avatar",
      filePath: path,
      name: "file",
      success: (file) => {
        const upload = JSON.parse(file.data);
        resolve(upload.data.uploadPath[0])
      },
      fail: err => reject(err)
    })
  })
}