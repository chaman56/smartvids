import axios from 'axios';
import FormData from 'form-data';

const apiKey = process.env.STABILITY_API_KEY;
const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`;
const cloudinaryUploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

export async function generateImage(prompt='', aspect_ratio='9:16', output_format='png') {
  try {
    console.log("Creating Image 🔃");
    const seed = 1;
    const negative_prompt='ugly, low quality, blurry'
    const model = "sd3";

    const payload = {
        prompt,
        output_format,
        seed,
        model,
        aspect_ratio,
        negative_prompt
    }

    const response = await axios.postForm(
        `https://api.stability.ai/v2beta/stable-image/generate/core`,
        axios.toFormData(payload, new FormData()),
        {
          validateStatus: undefined,
          responseType: "arraybuffer",
          headers: { 
            Authorization: `Bearer ${apiKey}`, 
            Accept: "image/*" 
          },
        },
    );
    if (response.status === 200) {
      const buffer = Buffer.from(response.data, 'binary');

      const formData = new FormData();
      formData.append('file', buffer, { filename: 'surprised'+output_format, contentType: 'image/*' });
      formData.append('upload_preset', cloudinaryUploadPreset);

      const cloudinaryResponse = await axios.post(cloudinaryUrl, formData, {
        headers: formData.getHeaders()
      });
      if (cloudinaryResponse.status === 200) {
        console.log("Success ✅ : file URL = ", cloudinaryResponse.data.secure_url);
        return {status :"success", url: cloudinaryResponse.data.secure_url};
      } else {
        throw new Error(`Cloudinary upload failed: ${cloudinaryResponse.data.error.message}`);
      }
    } else {
      throw new Error(`Image generation failed: ${response.statusText}`);
    }
  } catch (error: any) {
    console.error("Error:", error.message);
    return {status :"error", error: error.message, url:""};
  }
}
