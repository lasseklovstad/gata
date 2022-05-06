package no.gata.web.controller

import com.fasterxml.jackson.databind.JsonSerializable
import com.fasterxml.jackson.databind.ObjectMapper
import no.gata.web.models.*
import no.gata.web.repository.GataReportFileRepository
import no.gata.web.repository.GataReportRepository
import no.gata.web.repository.GataUserRepository
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.HttpStatus
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.*
import org.springframework.web.server.ResponseStatusException
import java.util.*

data class GataReportPayload(
        var title: String,
        var description: String,
)

@RestController
@RequestMapping("api/report")
class GataReportRestController {

    @Autowired
    private lateinit var gataReportRepository: GataReportRepository

    @Autowired
    private lateinit var gataUserRepository: GataUserRepository

    @Autowired
    private lateinit var gataReportFileRepository: GataReportFileRepository

    @GetMapping
    @PreAuthorize("hasAuthority('member')")
    fun getReports(): List<GataReportSimple> {
        return gataReportRepository.findAllByOrderByCreatedDateAsc()
    }

    @GetMapping("{id}")
    @PreAuthorize("hasAuthority('member')")
    fun getReport(@PathVariable id: String): Optional<GataReport> {
        return gataReportRepository.findById(UUID.fromString(id))
    }

    @DeleteMapping("{id}")
    @PreAuthorize("hasAuthority('admin')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun deleteReport(@PathVariable id: String) {
        return gataReportRepository.deleteById(UUID.fromString(id))
    }

    fun getLoggedInUser(authentication: Authentication): GataUser {
        val user = gataUserRepository.findByExternalUserProviderId(authentication.name)
        if (user.isPresent) {
            return user.get()
        }
        throw ResponseStatusException(HttpStatus.NOT_FOUND, "Brukeren finnes ikke!");
    }

    @PostMapping
    @PreAuthorize("hasAuthority('admin')")
    fun createReport(@RequestBody body: GataReportPayload, authentication: Authentication): GataReport {
        val user = getLoggedInUser(authentication)
        val report = GataReport(
                id = null, title = body.title,
                description = body.description,
                content = null,
                lastModifiedBy = user.name,
                createdDate = Date(),
                lastModifiedDate = Date(),
                files = emptyList())
        return gataReportRepository.save(report)
    }

    @PutMapping("{id}")
    @PreAuthorize("hasAuthority('admin')")
    fun updateReport(@RequestBody body: GataReportPayload, authentication: Authentication, @PathVariable id: String): GataReport {
        val user = getLoggedInUser(authentication)
        val report = gataReportRepository.findById(UUID.fromString(id))
        if (report.isPresent) {
            val newReport = report.get()
            newReport.title = body.title
            newReport.description = body.description
            newReport.lastModifiedBy = user.name
            newReport.lastModifiedDate = Date()
            return gataReportRepository.save(newReport)
        }
        throw ResponseStatusException(HttpStatus.NOT_FOUND, "Finner ikke referatet");
    }

    @PutMapping("{id}/content")
    @PreAuthorize("hasAuthority('admin')")
    fun updateReportContent(@RequestBody body: List<RichTextBlock>, authentication: Authentication, @PathVariable id: String): GataReport {
        val user = getLoggedInUser(authentication)
        val report = gataReportRepository.findById(UUID.fromString(id))
        if (report.isPresent) {
            val files = body.filter { it.type == "image" }
            val newReport = report.get()
            val reportFiles = gataReportFileRepository.findAllByReport(newReport)
            val filesToDelete = reportFiles.filter { files.find { file -> file.imageId == it.id.toString() } == null }
            filesToDelete.forEach({ gataReportFileRepository.deleteById(it.id) })
            newReport.content = ObjectMapper().writeValueAsString(body)
            newReport.lastModifiedBy = user.name
            newReport.lastModifiedDate = Date()
            return gataReportRepository.save(newReport)
        }
        throw ResponseStatusException(HttpStatus.NOT_FOUND, "Finner ikke referatet");
    }
}
