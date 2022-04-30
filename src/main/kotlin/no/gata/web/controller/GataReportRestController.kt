package no.gata.web.controller

import no.gata.web.models.GataReport
import no.gata.web.models.GataReportSimple
import no.gata.web.models.GataUser
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
                lastModifiedDate = Date())
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
    fun updateReportContent(@RequestBody body: String, authentication: Authentication, @PathVariable id: String): GataReport {
        val user = getLoggedInUser(authentication)
        val report = gataReportRepository.findById(UUID.fromString(id))
        if (report.isPresent) {
            val newReport = report.get()
            newReport.content = body
            newReport.lastModifiedBy = user.name
            newReport.lastModifiedDate = Date()
            return gataReportRepository.save(newReport)
        }
        throw ResponseStatusException(HttpStatus.NOT_FOUND, "Finner ikke referatet");
    }
}
