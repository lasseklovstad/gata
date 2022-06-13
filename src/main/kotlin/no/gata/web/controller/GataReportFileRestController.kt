package no.gata.web.controller

import com.cloudinary.Cloudinary
import com.cloudinary.utils.ObjectUtils
import no.gata.web.models.GataReportFile
import no.gata.web.repository.GataReportFileRepository
import no.gata.web.repository.GataReportRepository
import no.gata.web.repository.GataUserRepository
import no.gata.web.service.CloudinaryService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.HttpStatus
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*
import org.springframework.web.server.ResponseStatusException
import java.util.*

data class GataReportFilePayload(
        var data: String,
        var reportId: String
)

@RestController
@RequestMapping("api/file")
class GataReportFileRestController {

    @Autowired
    private lateinit var gataReportRepository: GataReportRepository

    @Autowired
    private lateinit var gataReportFileRepository: GataReportFileRepository

    @Autowired
    private lateinit var cloudinaryService: CloudinaryService

    // Old upload
    @PostMapping()
    @PreAuthorize("hasAuthority('member')")
    fun createReportFile(@RequestBody body: GataReportFilePayload): GataReportFile {
        val report = gataReportRepository.findById(UUID.fromString(body.reportId))
        if (report.isPresent) {
            val newFile = GataReportFile(id = null, data = body.data, report = report.get(), cloudUrl = null, cloudId = null)
            return gataReportFileRepository.save(newFile)
        }
        throw ResponseStatusException(HttpStatus.NOT_FOUND, "Finner ikke referatet!");
    }

    @PostMapping("cloud")
    @PreAuthorize("hasAuthority('member')")
    fun createCloudFile(@RequestBody body: GataReportFilePayload): GataReportFile {
        val report = gataReportRepository.findById(UUID.fromString(body.reportId))
        if (report.isPresent) {
            val cloudFile = cloudinaryService.uploadFile(body.data)

            val newFile = GataReportFile(
                    id = null,
                    cloudUrl = cloudFile.cloudUrl,
                    report = report.get(),
                    cloudId = cloudFile.cloudId,
                    data = null)
            return gataReportFileRepository.save(newFile)
        }
        throw ResponseStatusException(HttpStatus.NOT_FOUND, "Finner ikke referatet!");
    }

    @GetMapping("{fileId}")
    @PreAuthorize("hasAuthority('member')")
    fun getReportFile(@PathVariable fileId: String): Optional<GataReportFile> {
        return gataReportFileRepository.findById(UUID.fromString(fileId))
    }
}
