package no.gata.web.controller

import no.gata.web.controller.dtoInn.DtoInnGataReportFile
import no.gata.web.models.GataReportFile
import no.gata.web.repository.GataReportFileRepository
import no.gata.web.repository.GataReportRepository
import no.gata.web.service.CloudinaryService
import no.gata.web.service.GataReportService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.HttpStatus
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*
import org.springframework.web.server.ResponseStatusException
import java.util.*

@RestController
@RequestMapping("api/file")
class GataReportFileRestController {

    @Autowired
    private lateinit var gataReportFileRepository: GataReportFileRepository

    @Autowired
    private lateinit var cloudinaryService: CloudinaryService

    @Autowired
    private lateinit var gataReportService: GataReportService

    // Old upload
    @PostMapping()
    @PreAuthorize("hasAuthority('member')")
    fun createReportFile(@RequestBody body: DtoInnGataReportFile): GataReportFile {
        val report = gataReportService.getReport(body.reportId)
        val newFile = GataReportFile(id = null, data = body.data, report = report, cloudUrl = null, cloudId = null)
        return gataReportFileRepository.save(newFile)

    }

    @PostMapping("cloud")
    @PreAuthorize("hasAuthority('member')")
    fun createCloudFile(@RequestBody body: DtoInnGataReportFile): GataReportFile {
        val report = gataReportService.getReport(body.reportId)
        val cloudFile = cloudinaryService.uploadFile(body.data)

        val newFile = GataReportFile(
                id = null,
                cloudUrl = cloudFile.cloudUrl,
                report = report,
                cloudId = cloudFile.cloudId,
                data = null)
        return gataReportFileRepository.save(newFile)

    }

    @GetMapping("{fileId}")
    @PreAuthorize("hasAuthority('member')")
    fun getReportFile(@PathVariable fileId: String): Optional<GataReportFile> {
        return gataReportFileRepository.findById(UUID.fromString(fileId))
    }
}
