package no.gata.web.controller

import no.gata.web.models.GataReportFile
import no.gata.web.repository.GataReportFileRepository
import no.gata.web.repository.GataReportRepository
import no.gata.web.repository.GataUserRepository
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.HttpStatus
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*
import org.springframework.web.server.ResponseStatusException
import java.security.MessageDigest
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

    @PostMapping()
    @PreAuthorize("hasAuthority('member')")
    fun createReportFile(@RequestBody body: GataReportFilePayload): GataReportFile {
        val report = gataReportRepository.findById(UUID.fromString(body.reportId))
        if (report.isPresent) {
            val newFile = GataReportFile(id = null, data = body.data, report = report.get())
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
