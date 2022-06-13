package no.gata.web.service

import com.cloudinary.Cloudinary
import com.cloudinary.utils.ObjectUtils
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service

data class CloudinaryFile(
        val cloudId: String,
        val cloudUrl: String
)

@Service
class CloudinaryService {
    @Value(value = "\${cloudinary.url}")
    private lateinit var cloudinaryUrl: String

    fun uploadFile(data: String): CloudinaryFile {
        val cloudinary = Cloudinary(cloudinaryUrl)
        val result = cloudinary.uploader().upload(data, ObjectUtils.asMap("resource_type", "auto"))
        return CloudinaryFile(cloudUrl = result["secure_url"] as String, cloudId = result["public_id"] as String)
    }

    fun deleteFile(cloudId:String) {
        val cloudinary = Cloudinary(cloudinaryUrl)
        cloudinary.uploader().destroy(cloudId, null)
    }
}
