package no.gata.web.controller

import no.gata.web.controller.dtoInn.DtoInnGataReport
import no.gata.web.controller.dtoInn.DtoInnMarkdown
import no.gata.web.controller.dtoOut.DtoOutGataReport
import no.gata.web.controller.dtoOut.DtoOutGataReportSimple
import no.gata.web.models.ReportType
import no.gata.web.models.RichTextBlock
import no.gata.web.service.EmailService
import no.gata.web.service.GataReportService
import no.gata.web.service.GataUserService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Pageable
import org.springframework.http.HttpStatus
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.server.ResponseStatusException

@RestController
@RequestMapping("api/report")
class GataReportRestController {
    @Autowired
    private lateinit var gataReportService: GataReportService

    @Autowired
    private lateinit var emailService: EmailService

    @Autowired
    private lateinit var gataUserService: GataUserService

    @GetMapping()
    @PreAuthorize("hasAuthority('member')")
    @Transactional
    fun getReports(
        @RequestParam page: Int,
        @RequestParam type: ReportType,
    ): Page<DtoOutGataReport> {
        val paging: Pageable = PageRequest.of(page, 10)
        return gataReportService.getReports(type, paging).map { DtoOutGataReport(it) }
    }

    @GetMapping("simple")
    @PreAuthorize("hasAuthority('member')")
    @Transactional
    fun getReportsSimple(
        @RequestParam page: Int,
        @RequestParam type: ReportType,
    ): Page<DtoOutGataReportSimple> {
        val paging: Pageable = PageRequest.of(page, 10)
        return gataReportService.getReports(type, paging).map { DtoOutGataReportSimple(it) }
    }

    @GetMapping("{id}/simple")
    @PreAuthorize("hasAuthority('member')")
    fun getReportSimple(
        @PathVariable id: String,
    ): DtoOutGataReportSimple {
        return DtoOutGataReportSimple(gataReportService.getReport(id))
    }

    @GetMapping("{id}")
    @PreAuthorize("hasAuthority('member')")
    fun getReport(
        @PathVariable id: String,
    ): DtoOutGataReport {
        return DtoOutGataReport(gataReportService.getReport(id))
    }

    @GetMapping("publishemails")
    @PreAuthorize("hasAuthority('member')")
    fun getEmailsToPublishReport(): List<String> {
        val members =
            gataUserService.getAllMembers()
                .filter { it.subscribe }
                .mapNotNull { it.getPrimaryUser() }
        return members.map { it.email }
    }

    @GetMapping("{id}/publish")
    @PreAuthorize("hasAuthority('member')")
    fun publishReport(
        @PathVariable id: String,
    ): List<String> {
        val siteBaseUrl = "https://gataersamla.no"
        val report = gataReportService.getReport(id)
        val emails = getEmailsToPublishReport()
        if (emails.isNotEmpty()) {
            val content =
                "<h1>Nytt fra Gata</h1><p>Det har kommet en oppdatering på $siteBaseUrl!</p><h2>${report.title}</h2>" +
                    "<p>${report.description}</p><p>" +
                    "<a href='$siteBaseUrl/reportInfo/${report.id}'>Trykk her for å lese hele saken!</a>" +
                    "</p>"
            emails.forEach { email ->
                emailService.sendTextEmail(email, "Nytt fra Gata! ${report.title}", content)
            }
        }
        return emails
    }

    @DeleteMapping("{id}")
    @PreAuthorize("hasAuthority('member')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun deleteReport(
        @PathVariable id: String,
    ) {
        gataReportService.deleteReport(id)
    }

    @PostMapping
    @PreAuthorize("hasAuthority('member')")
    fun createReport(
        @RequestBody body: DtoInnGataReport,
        authentication: JwtAuthenticationToken,
    ): DtoOutGataReportSimple {
        val user = gataUserService.getLoggedInUser(authentication)
        val isAdmin = user.getIsUserAdmin()
        if (!isAdmin && body.type == ReportType.DOCUMENT) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN, "Du har ikke tilgang til å opprette dokument!")
        }
        val report = gataReportService.createReport(user, body)
        return DtoOutGataReportSimple(report)
    }

    @PutMapping("{id}")
    @PreAuthorize("hasAuthority('member')")
    fun updateReport(
        @RequestBody body: DtoInnGataReport,
        authentication: JwtAuthenticationToken,
        @PathVariable id: String,
    ): DtoOutGataReport {
        val user = gataUserService.getLoggedInUser(authentication)
        val report = gataReportService.updateReport(id, body, user.getPrimaryUser())
        return DtoOutGataReport(report)
    }

    @PutMapping("{id}/content")
    @PreAuthorize("hasAuthority('member')")
    fun updateReportContent(
        @RequestBody body: List<RichTextBlock>,
        authentication: JwtAuthenticationToken,
        @PathVariable id: String,
    ): DtoOutGataReport {
        val user = gataUserService.getLoggedInUser(authentication)
        val report = gataReportService.updateReportContent(id, body, user.getPrimaryUser())
        return DtoOutGataReport(report)
    }

    @PutMapping("{id}/markdown")
    @PreAuthorize("hasAuthority('member')")
    fun updateReportMarkdown(
        @RequestBody body: DtoInnMarkdown,
        authentication: JwtAuthenticationToken,
        @PathVariable id: String,
    ) {
        val user = gataUserService.getLoggedInUser(authentication)
        gataReportService.updateReportMarkdown(id, body.markdown, user.getPrimaryUser())
    }
}
